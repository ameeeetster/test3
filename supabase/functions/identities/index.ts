import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QueryParams {
  search?: string
  filters?: string
  sort?: string
  page?: string
  pageSize?: string
}

interface FilterOptions {
  department?: string
  status?: string
  risk?: string
  dormant?: boolean
}

interface Identity {
  id: string
  name: string
  email: string
  department: string
  manager_name: string | null
  status: string
  risk_level: string
  risk_score: number
  role_count: number
  last_login_at: string | null
  flags_count: number
  has_dormant: boolean
}

interface PageInfo {
  page: number
  pageSize: number
  total: number
  hasNextPage: boolean
}

interface ResponseData {
  data: Identity[]
  pageInfo: PageInfo
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // Parse query parameters
    const url = new URL(req.url)
    const params: QueryParams = {
      search: url.searchParams.get('search') || undefined,
      filters: url.searchParams.get('filters') || undefined,
      sort: url.searchParams.get('sort') || 'name:asc',
      page: url.searchParams.get('page') || '1',
      pageSize: url.searchParams.get('pageSize') || '25',
    }

    // Parse filters
    let filters: FilterOptions = {}
    if (params.filters) {
      try {
        filters = JSON.parse(params.filters)
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'Invalid filters JSON' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Validate pagination
    const page = Math.max(1, parseInt(params.page!) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(params.pageSize!) || 25))
    const offset = (page - 1) * pageSize

    // Validate sort parameter (whitelist allowed columns)
    const allowedSortColumns = ['name', 'email', 'department', 'status', 'risk_level', 'last_login_at', 'role_count']
    const sortParts = params.sort!.split(':')
    const sortColumn = sortParts[0]
    const sortDirection = sortParts[1] || 'asc'
    
    if (!allowedSortColumns.includes(sortColumn) || !['asc', 'desc'].includes(sortDirection)) {
      return new Response(
        JSON.stringify({ error: 'Invalid sort parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build query
    let query = supabase
      .from('v_identities')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (params.search) {
      const searchTerm = `%${params.search.toLowerCase()}%`
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},department.ilike.${searchTerm}`)
    }

    // Apply filters
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.risk) {
      query = query.eq('risk_level', filters.risk)
    }
    if (filters.dormant !== undefined) {
      query = query.eq('dormant', filters.dormant)
    }

    // Apply sorting
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format response
    const identities: Identity[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      department: row.department,
      manager_name: row.manager_name,
      status: row.status,
      risk_level: row.risk_level,
      risk_score: row.risk_score,
      role_count: row.role_count,
      last_login_at: row.last_login_at,
      flags_count: row.flags_count,
      has_dormant: row.has_dormant,
    }))

    const total = count || 0
    const hasNextPage = offset + pageSize < total

    const response: ResponseData = {
      data: identities,
      pageInfo: {
        page,
        pageSize,
        total,
        hasNextPage,
      },
    }

    // Log audit entry
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action: 'identities_list_read',
          subject: 'identities',
          metadata: {
            search: params.search,
            filters,
            sort: params.sort,
            page,
            pageSize,
            resultCount: identities.length,
          },
        })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
      // Don't fail the request if audit logging fails
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
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