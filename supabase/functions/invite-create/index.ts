// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions';

export async function handler(req: Request): Promise<Response> {
  try {
    const { email, role, org_id, ttl_minutes = 60 } = await req.json();
    if (!email || !role || !org_id) return new Response('Bad Request', { status: 400 });
    const token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + ttl_minutes * 60_000).toISOString();

    const client = (globalThis as any).supabase as any;
    const { data: membership } = await client
      .from('user_orgs')
      .select('*')
      .eq('user_id', client.auth.getUser()?.id)
      .eq('org_id', org_id)
      .eq('role', 'org_admin')
      .maybeSingle();
    if (!membership) return new Response('Forbidden', { status: 403 });

    const { error } = await client.from('invitations').insert({ email, role, org_id, token, expires_at });
    if (error) return new Response(error.message, { status: 500 });

    // TODO: send email via linked provider; return token for dev
    return Response.json({ token });
  } catch (e: any) {
    return new Response(e?.message || 'Server Error', { status: 500 });
  }
}


