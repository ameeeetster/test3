import { supabase } from '../lib/supabase';
import type { ProvisioningJob, ProvisioningStatus } from '../types/database';

type JobStatus = ProvisioningJob['status'];

interface EnqueueJobOptions {
  requestId: string;
  organizationId?: string | null;
  targetSystem?: string | null;
  connectorId?: string | null;
  metadata?: Record<string, any>;
  autoComplete?: boolean;
}

export class ProvisioningService {
  /**
   * Enqueue a provisioning job for a given access request.
   * Optionally runs a simulated lifecycle (pending -> in_progress -> succeeded)
   * until real connector automation is wired up.
   */
  static async enqueueJob(options: EnqueueJobOptions) {
    const {
      requestId,
      organizationId,
      targetSystem,
      connectorId,
      metadata,
      autoComplete = true,
    } = options;

    const payload = {
      request_id: requestId,
      organization_id: organizationId ?? null,
      target_system: targetSystem ?? null,
      connector_id: connectorId ?? null,
      metadata: metadata ?? {},
    };

    const { data, error } = await supabase
      .from('provisioning_jobs')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to enqueue provisioning job:', error);
      throw new Error(`Failed to enqueue provisioning job: ${error.message}`);
    }

    await this.updateRequestState(requestId, {
      provisioning_status: 'pending',
      provisioning_started_at: null,
      provisioning_completed_at: null,
      provisioning_error: null,
      provisioning_metadata: metadata ?? {},
    });

    if (autoComplete) {
      try {
        await this.invokeEdgeProcessor(data.id);
      } catch (err) {
        console.warn('⚠️ Provisioning orchestrator invocation failed, using local simulation', err);
        await this.simulateLifecycle(data.id);
      }
    }

    return data.id;
  }

  /**
   * Temporary helper: simulate provisioning lifecycle immediately.
   * Once a real orchestrator exists we can remove this.
   */
  private static async simulateLifecycle(jobId: string) {
    await this.markInProgress(jobId);
    // Small delay to allow UI subscriptions to observe state transitions.
    await new Promise(resolve => setTimeout(resolve, 200));
    await this.markSucceeded(jobId);
  }

  private static async invokeEdgeProcessor(jobId: string) {
    const { error } = await supabase.functions.invoke('provisioning-orchestrator', {
      body: { jobId },
    });

    if (error) {
      throw error;
    }
  }

  static async markInProgress(jobId: string) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('provisioning_jobs')
      .update({ status: 'in_progress', started_at: now, error: null })
      .eq('id', jobId)
      .select('id, request_id')
      .single();

    if (error) {
      throw new Error(`Failed to mark provisioning job in progress: ${error.message}`);
    }

    await this.updateRequestState(data.request_id, {
      provisioning_status: 'in_progress',
      provisioning_started_at: now,
      provisioning_error: null,
    });
  }

  static async markSucceeded(jobId: string) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('provisioning_jobs')
      .update({ status: 'succeeded', completed_at: now, error: null })
      .eq('id', jobId)
      .select('id, request_id')
      .single();

    if (error) {
      throw new Error(`Failed to mark provisioning job succeeded: ${error.message}`);
    }

    await this.updateRequestState(data.request_id, {
      provisioning_status: 'succeeded',
      provisioning_completed_at: now,
      provisioning_error: null,
      completed_at: now,
    });
  }

  static async markFailed(jobId: string, errorMessage: string) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('provisioning_jobs')
      .update({ status: 'failed', completed_at: now, error: errorMessage })
      .eq('id', jobId)
      .select('id, request_id')
      .single();

    if (error) {
      throw new Error(`Failed to mark provisioning job failed: ${error.message}`);
    }

    await this.updateRequestState(data.request_id, {
      provisioning_status: 'failed',
      provisioning_completed_at: now,
      provisioning_error: errorMessage,
    });
  }

  static async markSkipped(jobId: string) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('provisioning_jobs')
      .update({ status: 'skipped', completed_at: now, error: null })
      .eq('id', jobId)
      .select('id, request_id')
      .single();

    if (error) {
      throw new Error(`Failed to mark provisioning job skipped: ${error.message}`);
    }

    await this.updateRequestState(data.request_id, {
      provisioning_status: 'skipped',
      provisioning_started_at: null,
      provisioning_completed_at: now,
      provisioning_error: null,
    });
  }

  private static async updateRequestState(
    requestId: string,
    fields: Partial<{
      provisioning_status: ProvisioningStatus;
      provisioning_started_at: string | null;
      provisioning_completed_at: string | null;
      provisioning_error: string | null;
      provisioning_metadata: Record<string, any>;
      completed_at: string | null;
    }>,
  ) {
    const { error } = await supabase
      .from('access_requests')
      .update(fields)
      .eq('id', requestId);

    if (error) {
      console.error('❌ Failed to update access request provisioning state:', error);
      throw new Error(`Failed to update provisioning state: ${error.message}`);
    }
  }
}

