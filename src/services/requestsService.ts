import { supabase } from '../lib/supabase';

export interface CreateAccessRequestInput {
  organization_id?: string | null;
  requester_id?: string | null;
  for_user_id?: string | null;
  resource_type: string;
  resource_id?: string | null;
  resource_name: string;
  priority?: string | null;
  business_justification?: string | null;
  duration_type?: string | null;
  duration_days?: number | null;
  risk_level?: string | null;
  risk_score?: number | null;
  sod_conflicts_count?: number | null;
}

export interface AccessRequestRow {
  id: string;
  request_number: string;
  status: string;
  submitted_at: string;
  resource_name: string;
  resource_type: string;
  business_justification: string | null;
}

export class RequestsService {
  static async create(input: CreateAccessRequestInput) {
    const requestNumber = `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const payload = {
      ...input,
      request_number: requestNumber,
      status: 'PENDING',
    };
    const { data, error } = await supabase.from('access_requests').insert(payload).select('*').single();
    if (error) throw error;
    return data as AccessRequestRow;
  }

  static async listPending() {
    const { data, error } = await supabase
      .from('access_requests')
      .select('id, request_number, status, submitted_at, resource_name, resource_type, business_justification')
      .eq('status', 'PENDING')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as AccessRequestRow[];
  }
}
