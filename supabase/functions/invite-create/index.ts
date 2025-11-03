import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteCreateRequest {
  email: string
  role_id?: string
  expires_hours?: number
}

interface InviteCreateResponse {
  success: boolean
  invitation_id?: string
  invite_url?: string
  expires_at?: string
  message?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Create Supabase client with user's JWT (not service role for RLS)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body: InviteCreateRequest = await req.json()
    const { email, role_id, expires_hours = 72 } = body

    // Validate input
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user is org admin
    const { data: userOrgs, error: userOrgsError } = await supabase
      .from('user_orgs')
      .select('org_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (userOrgsError || !userOrgs || userOrgs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found in any organization' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const orgMembership = userOrgs.find(uo => uo.role === 'org_admin')
    if (!orgMembership) {
      return new Response(
        JSON.stringify({ error: 'Only org admins can create invitations' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const orgId = orgMembership.org_id

    // Check if invitation already exists for this email in this org
    const { data: existingInvite, error: existingError } = await supabase
      .from('invitations')
      .select('id, accepted_at, expires_at')
      .eq('org_id', orgId)
      .eq('email', normalizedEmail)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing invitation:', existingError)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingInvite) {
      return new Response(
        JSON.stringify({ 
          error: 'An active invitation already exists for this email',
          invitation_id: existingInvite.id,
          expires_at: existingInvite.expires_at
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate role_id if provided
    if (role_id) {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('id', role_id)
        .eq('org_id', orgId)
        .single()

      if (roleError || !role) {
        return new Response(
          JSON.stringify({ error: 'Invalid role_id for this organization' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Calculate expiry time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expires_hours)

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        org_id: orgId,
        email: normalizedEmail,
        role_id: role_id || null,
        expires_at: expiresAt.toISOString(),
        created_by: user.id
      })
      .select('id, token, expires_at')
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log audit entry
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action: 'INVITE_CREATED',
          subject: 'invitation',
          object_id: invitation.id,
          metadata: {
            email: normalizedEmail,
            role_id: role_id || null,
            expires_at: invitation.expires_at,
            expires_hours
          },
        })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
      // Don't fail the request if audit logging fails
    }

    // Generate invite URL
    const publicBaseUrl = Deno.env.get('PUBLIC_BASE_URL') || 'http://localhost:3001'
    const inviteUrl = `${publicBaseUrl}/accept-invite?token=${invitation.token}`

    // TODO: Send email if SMTP is configured
    // For now, return the URL for manual testing
    const response: InviteCreateResponse = {
      success: true,
      invitation_id: invitation.id,
      invite_url: inviteUrl,
      expires_at: invitation.expires_at,
      message: 'Invitation created successfully. Email sending not configured - use invite_url for testing.'
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})