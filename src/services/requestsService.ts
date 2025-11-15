import { supabase } from '../lib/supabase';
import { ProvisioningService } from './provisioningService';

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

export interface UpdateAccessRequestInput {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority?: string | null;
  risk_level?: string | null;
  risk_score?: number | null;
  business_justification?: string | null;
  duration_days?: number | null;
  [key: string]: any; // Allow other fields
}

export interface AccessRequestRow {
  id: string;
  request_number: string;
  status: string;
  submitted_at: string;
  resource_name: string;
  resource_type: string;
  business_justification: string | null;
  organization_id: string | null;
  requester_id: string | null;
  for_user_id: string | null;
  resource_id: string | null;
  priority: string | null;
  risk_level: string | null;
  risk_score: number | null;
  duration_days: number | null;
  duration_type: string | null;
  sod_conflicts_count: number;
  approved_at: string | null;
  rejected_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  provisioning_status: 'not_started' | 'pending' | 'in_progress' | 'succeeded' | 'failed' | 'skipped';
  provisioning_started_at: string | null;
  provisioning_completed_at: string | null;
  provisioning_error: string | null;
  provisioning_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export class RequestsService {
  static async create(input: CreateAccessRequestInput) {
    // Get current user session for authentication and metadata
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required to create requests');
    }

    // Auto-populate fields from session
    const userId = session.user.id;
    const orgId = session.user.app_metadata?.organization_id || null;

    // Generate unique request number
    const requestNumber = `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    
    // Calculate risk score if risk_level is provided but risk_score is not
    let riskScore = input.risk_score;
    if (!riskScore && input.risk_level) {
      const riskScoreMap: Record<string, number> = {
        'Low': 25,
        'Medium': 50,
        'High': 75,
        'Critical': 100
      };
      riskScore = riskScoreMap[input.risk_level] || null;
    }

    // Determine priority if not provided (based on risk level)
    let priority = input.priority;
    if (!priority && input.risk_level) {
      if (input.risk_level === 'Critical' || input.risk_level === 'High') {
        priority = 'High';
      } else if (input.risk_level === 'Medium') {
        priority = 'Medium';
      } else {
        priority = 'Low';
      }
    }

    // Build complete payload with all fields
    const payload: any = {
      // Required fields
      request_number: requestNumber,
      resource_type: input.resource_type,
      resource_name: input.resource_name,
      status: 'PENDING',
      
      // Auto-populated from session
      organization_id: input.organization_id ?? orgId,
      requester_id: input.requester_id ?? userId,
      created_by: userId, // Track who created the request
      
      // Optional fields from input
      for_user_id: input.for_user_id ?? null,
      resource_id: input.resource_id ?? null,
      priority: priority ?? null,
      business_justification: input.business_justification ?? null,
      duration_type: input.duration_type ?? null,
      duration_days: input.duration_days ?? null,
      risk_level: input.risk_level ?? null,
      risk_score: riskScore ?? null,
      sod_conflicts_count: input.sod_conflicts_count ?? 0,
    };

    // Remove undefined values to avoid issues
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    console.log('📝 Creating access request with complete payload:', {
      request_number: payload.request_number,
      resource_name: payload.resource_name,
      status: payload.status,
      organization_id: payload.organization_id,
      requester_id: payload.requester_id,
      created_by: payload.created_by,
      risk_level: payload.risk_level,
      risk_score: payload.risk_score,
      priority: payload.priority,
      business_justification: payload.business_justification?.substring(0, 50) + '...'
    });

    const { data, error } = await supabase
      .from('access_requests')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      console.error('❌ Failed payload:', payload);
      throw new Error(`Failed to create request: ${error.message}`);
    }

    console.log('✅ Request created successfully in database:', {
      id: data.id,
      request_number: data.request_number,
      status: data.status
    });
    return data as AccessRequestRow;
  }

  static async listPending() {
    const { data, error } = await supabase
      .from('access_requests')
      .select(`
        id,
        request_number,
        status,
        submitted_at,
        resource_name,
        resource_type,
        business_justification,
        organization_id,
        requester_id,
        for_user_id,
        priority,
        risk_level,
        risk_score,
        duration_days,
        duration_type,
        sod_conflicts_count,
        approved_at,
        rejected_at,
        completed_at,
        provisioning_status,
        provisioning_started_at,
        provisioning_completed_at,
        provisioning_error,
        provisioning_metadata,
        created_at,
        updated_at,
        created_by,
        updated_by
      `)
      .eq('status', 'PENDING')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as AccessRequestRow[];
  }

  static async listAll(limit: number = 100) {
    const { data, error } = await supabase
      .from('access_requests')
      .select(`
        id, 
        request_number, 
        status, 
        submitted_at, 
        resource_name, 
        resource_type, 
        business_justification,
        organization_id,
        requester_id,
        for_user_id,
        priority,
        risk_level,
        risk_score,
        duration_days,
        sod_conflicts_count,
        approved_at,
        rejected_at,
        completed_at,
        provisioning_status,
        provisioning_started_at,
        provisioning_completed_at,
        provisioning_error,
        provisioning_metadata,
        created_at,
        updated_at,
        created_by,
        updated_by
      `)
      .order('submitted_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('❌ Error listing access requests:', error);
      throw error;
    }
    return (data ?? []) as AccessRequestRow[];
  }

  static async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    // Get current user for updated_by tracking
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    const updateData: any = { 
      status,
      updated_by: userId, // Track who updated the request
    };
    
    // Set appropriate timestamp based on status
    const now = new Date().toISOString();
    if (status === 'APPROVED') {
      updateData.approved_at = now;
      updateData.rejected_at = null;
      updateData.completed_at = null;
      updateData.provisioning_status = 'pending';
      updateData.provisioning_started_at = null;
      updateData.provisioning_completed_at = null;
      updateData.provisioning_error = null;
    } else if (status === 'REJECTED') {
      updateData.rejected_at = now;
      updateData.completed_at = now;
      updateData.approved_at = null;
      updateData.provisioning_status = 'skipped';
      updateData.provisioning_started_at = null;
      updateData.provisioning_completed_at = now;
      updateData.provisioning_error = null;
    } else if (status === 'PENDING') {
      updateData.approved_at = null;
      updateData.rejected_at = null;
      updateData.completed_at = null;
      updateData.provisioning_status = 'not_started';
      updateData.provisioning_started_at = null;
      updateData.provisioning_completed_at = null;
      updateData.provisioning_error = null;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('📝 Updating request status with complete data:', { id, status, updateData });

    // Check if id is a friendly request_number (starts with REQ-) or UUID
    const isRequestNumber = id.startsWith('REQ-');
    
    // Build query based on ID type
    let query;
    if (isRequestNumber) {
      query = supabase
        .from('access_requests')
        .update(updateData)
        .eq('request_number', id);
    } else {
      query = supabase
        .from('access_requests')
        .update(updateData)
        .eq('id', id);
    }
    
    // Select all important fields to verify update
    const { data, error } = await query.select(`
      id, 
      request_number, 
      organization_id,
      resource_name,
      resource_type,
      status, 
      approved_at, 
      rejected_at, 
      completed_at,
      provisioning_status,
      provisioning_started_at,
      provisioning_completed_at,
      updated_at,
      updated_by
    `).single();
    
    if (error) {
      console.error('❌ Error updating request status:', error);
      console.error('❌ Query details:', { id, isRequestNumber, status, updateData });
      throw new Error(`Failed to update status: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`No request found with ${isRequestNumber ? 'request_number' : 'id'}: ${id}`);
    }
    
    console.log('✅ Status updated successfully in database:', { 
      id: data.id, 
      request_number: data.request_number, 
      status: data.status,
      approved_at: data.approved_at,
      rejected_at: data.rejected_at,
      completed_at: data.completed_at,
      provisioning_status: data.provisioning_status,
      updated_at: data.updated_at,
      updated_by: data.updated_by
    });

    if (status === 'APPROVED') {
      await ProvisioningService.enqueueJob({
        requestId: data.id,
        organizationId: data.organization_id,
        targetSystem: data.resource_type,
        metadata: { resourceName: data.resource_name },
      });
    }

    return data as { id: string; status: string };
  }

  /**
   * General update method for updating any fields on an access request
   */
  static async update(id: string, updates: UpdateAccessRequestInput) {
    // Get current user for updated_by tracking
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    const updateData: any = {
      ...updates,
      updated_by: userId,
    };

    // Handle status-specific timestamps if status is being updated
    if (updates.status) {
      const now = new Date().toISOString();
      if (updates.status === 'APPROVED') {
        updateData.approved_at = now;
        updateData.completed_at = null;
        updateData.rejected_at = null;
        updateData.provisioning_status = 'pending';
        updateData.provisioning_started_at = null;
        updateData.provisioning_completed_at = null;
        updateData.provisioning_error = null;
      } else if (updates.status === 'REJECTED') {
        updateData.rejected_at = now;
        updateData.completed_at = now;
        updateData.approved_at = null;
        updateData.provisioning_status = 'skipped';
        updateData.provisioning_started_at = null;
        updateData.provisioning_completed_at = now;
        updateData.provisioning_error = null;
      } else if (updates.status === 'PENDING') {
        updateData.approved_at = null;
        updateData.rejected_at = null;
        updateData.completed_at = null;
        updateData.provisioning_status = 'not_started';
        updateData.provisioning_started_at = null;
        updateData.provisioning_completed_at = null;
        updateData.provisioning_error = null;
      }
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('📝 Updating access request:', { id, updates: updateData });

    const isRequestNumber = id.startsWith('REQ-');
    let query;
    if (isRequestNumber) {
      query = supabase
        .from('access_requests')
        .update(updateData)
        .eq('request_number', id);
    } else {
      query = supabase
        .from('access_requests')
        .update(updateData)
        .eq('id', id);
    }

    const { data, error } = await query.select('*').single();

    if (error) {
      console.error('❌ Error updating access request:', error);
      throw new Error(`Failed to update request: ${error.message}`);
    }

    console.log('✅ Request updated successfully:', { id: data.id, request_number: data.request_number });

    if (updates.status === 'APPROVED') {
      await ProvisioningService.enqueueJob({
        requestId: data.id,
        organizationId: data.organization_id,
        targetSystem: data.resource_type,
        metadata: { resourceName: data.resource_name },
      });
    }

    return data as AccessRequestRow;
  }
}
