import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteAcceptRequest {
  token: string
  password?: string
  name?: string
}

interface InviteAcceptResponse {
  success: boolean
  user_created?: boolean
  session?: any
  message?: string
  error?: string
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
    // Parse request body
    const body: InviteAcceptRequest = await req.json()
    const { token, password, name } = body

    // Validate input
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role for multi-table writes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find and validate invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select(`
        id,
        org_id,
        email,
        role_id,
        expires_at,
        accepted_at,
        created_by,
        orgs!inner(name)
      `)
      .eq('token', token)
      .single()

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invitation token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return new Response(
        JSON.stringify({ error: 'Invitation has already been accepted' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Invitation has expired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const normalizedEmail = invitation.email.toLowerCase().trim()

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(normalizedEmail)
    
    let userId: string
    let userCreated = false

    if (userError || !existingUser.user) {
      // User doesn't exist, create new user
      if (!password) {
        return new Response(
          JSON.stringify({ error: 'Password is required for new users' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: true, // Auto-confirm email since they have invitation
        user_metadata: {
          name: name || '',
          invited: true
        }
      })

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      userId = newUser.user.id
      userCreated = true
    } else {
      // User exists
      userId = existingUser.user.id
    }

    // Upsert profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: normalizedEmail,
        full_name: name || existingUser.user?.user_metadata?.name || '',
        mfa_enabled: false
      })

    if (profileError) {
      console.error('Error upserting profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Upsert user_orgs membership
    const { error: membershipError } = await supabase
      .from('user_orgs')
      .upsert({
        user_id: userId,
        org_id: invitation.org_id,
        role: 'member',
        is_active: true
      })

    if (membershipError) {
      console.error('Error creating org membership:', membershipError)
      return new Response(
        JSON.stringify({ error: 'Failed to create organization membership' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Assign role if specified
    if (invitation.role_id) {
      const { error: roleError } = await supabase
        .from('role_assignments')
        .insert({
          role_id: invitation.role_id,
          permission_id: (await supabase.from('permissions').select('id').limit(1).single()).data?.id
        })
        .select()

      if (roleError) {
        console.error('Error assigning role:', roleError)
        // Don't fail the entire process if role assignment fails
      }
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from('invitations')
      .update({ accepted_at: now.toISOString() })
      .eq('id', invitation.id)

    if (acceptError) {
      console.error('Error marking invitation as accepted:', acceptError)
      return new Response(
        JSON.stringify({ error: 'Failed to complete invitation acceptance' }),
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
          action: 'INVITE_ACCEPTED',
          subject: 'invitation',
          object_id: invitation.id,
          metadata: {
            email: normalizedEmail,
            org_id: invitation.org_id,
            role_id: invitation.role_id,
            user_created: userCreated
          },
        })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
      // Don't fail the request if audit logging fails
    }

    // Create session for new user
    let session = null
    if (userCreated && password) {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password
        })
        
        if (!sessionError && sessionData.session) {
          session = sessionData.session
        }
      } catch (sessionError) {
        console.error('Error creating session:', sessionError)
        // Don't fail the request if session creation fails
      }
    }

    const response: InviteAcceptResponse = {
      success: true,
      user_created: userCreated,
      session: session,
      message: userCreated 
        ? 'Account created and invitation accepted successfully'
        : 'Invitation accepted successfully. Please log in with your existing credentials.'
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