// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions';

export async function handler(req: Request): Promise<Response> {
  try {
    const { token } = await req.json();
    if (!token) return new Response('Bad Request', { status: 400 });
    const client = (globalThis as any).supabase as any;
    const { data: inv, error } = await client
      .from('invitations')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .single();
    if (error || !inv) return new Response('Invalid or expired', { status: 400 });

    const userId = client.auth.getUser()?.id;
    if (!userId) return new Response('Unauthorized', { status: 401 });

    await client.from('user_orgs').upsert({ user_id: userId, org_id: inv.org_id, role: inv.role, is_active: true });
    await client.from('invitations').update({ accepted_at: new Date().toISOString() }).eq('id', inv.id);
    return Response.json({ ok: true, org_id: inv.org_id });
  } catch (e: any) {
    return new Response(e?.message || 'Server Error', { status: 500 });
  }
}


