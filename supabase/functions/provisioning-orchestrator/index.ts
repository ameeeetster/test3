import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.42.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-provisioning-secret',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const JOB_SECRET = Deno.env.get('PROVISIONING_JOB_SECRET') ?? ''

interface ProvisioningJob {
  id: string
  request_id: string
  organization_id: string | null
  status: string
  attempts: number | null
  metadata: Record<string, unknown> | null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const authHeader = req.headers.get('Authorization')
    const provisionSecret = req.headers.get('x-provisioning-secret')

    // Allow bypass for development/testing (when PROVISIONING_JOB_SECRET is not set)
    const isDevelopment = !JOB_SECRET || JOB_SECRET === ''
    const isSystemCall = Boolean(provisionSecret && JOB_SECRET && provisionSecret === JOB_SECRET)
    let allowedOrgIds: string[] | null = []

    if (isSystemCall || isDevelopment) {
      // System call or dev mode: process all jobs regardless of org
      allowedOrgIds = null
    } else {
      if (!authHeader) {
        return unauthorized('Missing authorization header')
      }

      const token = authHeader.replace('Bearer ', '')
      const {
        data: { user },
        error: userError,
      } = await supabaseAdmin.auth.getUser(token)

      if (userError || !user) {
        return unauthorized('Invalid token')
      }

      const { data: memberships, error: membershipError } = await supabaseAdmin
        .from('user_orgs')
        .select('org_id')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (membershipError) {
        throw membershipError
      }

      allowedOrgIds = memberships?.map((m) => m.org_id).filter((id): id is string => Boolean(id)) ?? []

      if (!allowedOrgIds.length) {
        return forbidden('No organization access')
      }
    }

    const body = req.method === 'POST' ? await safeJson(req) : {}
    const jobId = typeof body.jobId === 'string' ? body.jobId : undefined
    const maxJobsRaw = typeof body.maxJobs === 'number' ? body.maxJobs : 5
    const maxJobs = Math.min(Math.max(maxJobsRaw, 1), 25)
    const simulateFailure = Boolean(body.simulateFailure)

    let jobsQuery = supabaseAdmin
      .from('provisioning_jobs')
      .select('id, request_id, organization_id, status, attempts, metadata')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (jobId) {
      jobsQuery = jobsQuery.eq('id', jobId)
    } else {
      jobsQuery = jobsQuery.limit(maxJobs)
    }

    if (allowedOrgIds) {
      if (!allowedOrgIds.length) {
        return forbidden('No organization access')
      }
      jobsQuery = jobsQuery.in('organization_id', allowedOrgIds)
    }

    const { data: jobs, error: jobsError } = await jobsQuery

    if (jobsError) {
      throw jobsError
    }

    if (!jobs || jobs.length === 0) {
      return jsonResponse({ processed: 0, jobs: [] })
    }

    const results = []
    for (const job of jobs) {
      const result = await processJob(
        supabaseAdmin,
        job as ProvisioningJob,
        simulateFailure || Boolean(job.metadata && job.metadata['simulateFailure'])
      )
      results.push(result)
    }

    return jsonResponse({ processed: results.length, jobs: results })
  } catch (error) {
    console.error('Provisioning orchestrator failed:', error)
    return new Response(
      JSON.stringify({
        error: 'Orchestrator error',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processJob(
  supabaseAdmin: SupabaseClient,
  job: ProvisioningJob,
  shouldFail: boolean
) {
  const startTime = new Date().toISOString()

  const { error: startError } = await supabaseAdmin
    .from('provisioning_jobs')
    .update({
      status: 'in_progress',
      started_at: startTime,
      attempts: (job.attempts ?? 0) + 1,
      error: null,
    })
    .eq('id', job.id)

  if (startError) {
    throw startError
  }

  await supabaseAdmin
    .from('access_requests')
    .update({
      provisioning_status: 'in_progress',
      provisioning_started_at: startTime,
      provisioning_error: null,
    })
    .eq('id', job.request_id)

  // Simulate connector work
  await wait(200)

  const finishedAt = new Date().toISOString()

  if (shouldFail) {
    const failureMessage =
      (job.metadata && typeof job.metadata['failureMessage'] === 'string'
        ? (job.metadata['failureMessage'] as string)
        : 'Connector failed to provision access')

    await supabaseAdmin
      .from('provisioning_jobs')
      .update({
        status: 'failed',
        completed_at: finishedAt,
        error: failureMessage,
      })
      .eq('id', job.id)

    await supabaseAdmin
      .from('access_requests')
      .update({
        provisioning_status: 'failed',
        provisioning_completed_at: finishedAt,
        provisioning_error: failureMessage,
      })
      .eq('id', job.request_id)

    return { id: job.id, status: 'failed', error: failureMessage }
  }

  await supabaseAdmin
    .from('provisioning_jobs')
    .update({
      status: 'succeeded',
      completed_at: finishedAt,
      error: null,
    })
    .eq('id', job.id)

  await supabaseAdmin
    .from('access_requests')
    .update({
      provisioning_status: 'succeeded',
      provisioning_completed_at: finishedAt,
      provisioning_error: null,
      completed_at: finishedAt,
    })
    .eq('id', job.request_id)

  return { id: job.id, status: 'succeeded' }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function safeJson(req: Request) {
  try {
    return await req.json()
  } catch {
    return {}
  }
}

function unauthorized(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function forbidden(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function jsonResponse(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}


