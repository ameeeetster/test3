/**
 * Database Types
 * 
 * TypeScript types for the Supabase database schema.
 * These types match the PostgreSQL schema you created.
 */

// Base types
export type UUID = string;
export type Timestamp = string;

// Enum types
export type EmploymentType = 'PERMANENT' | 'CONTRACTOR' | 'INTERN' | 'VENDOR';
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'PENDING';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type JmlType = 'JOINER' | 'MOVER' | 'LEAVER';
export type JmlStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'FAILED';
export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELEGATED';
export type TaskState = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'RETRYING';

// Organization
export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  parent_organization_id?: UUID;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// User (Identity)
export interface User {
  id: UUID;
  auth_user_id?: UUID;
  employee_id?: string;
  email: string;
  username?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  organization_id?: UUID;
  division_id?: UUID;
  department_id?: UUID;
  location_id?: UUID;
  manager_id?: UUID;
  employment_type?: EmploymentType;
  employment_status: EmploymentStatus;
  start_date?: string;
  end_date?: string;
  job_title?: string;
  status: string;
  risk_score?: number;
  risk_level?: RiskLevel;
  last_login_at?: Timestamp;
  last_activity_at?: Timestamp;
  password_changed_at?: Timestamp;
  mfa_enabled: boolean;
  attributes: Record<string, any>;
  deleted_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// Application
export interface Application {
  id: UUID;
  organization_id: UUID;
  integration_instance_id?: UUID;
  name: string;
  slug: string;
  description?: string;
  app_type?: string;
  category?: string;
  icon?: string;
  url?: string;
  owner_id?: UUID;
  criticality?: string;
  is_active: boolean;
  supports_provisioning: boolean;
  supports_sso: boolean;
  vendor?: string;
  version?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// Role
export interface Role {
  id: UUID;
  organization_id: UUID;
  name: string;
  slug: string;
  description?: string;
  purpose?: string;
  role_type?: string;
  category?: string;
  owner_id?: UUID;
  criticality?: string;
  risk_level?: RiskLevel;
  is_birthright: boolean;
  is_active: boolean;
  members_count: number;
  entitlements_count: number;
  last_reviewed_at?: Timestamp;
  review_cadence_days?: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// Entitlement
export interface Entitlement {
  id: UUID;
  organization_id: UUID;
  application_id: UUID;
  name: string;
  slug: string;
  description?: string;
  entitlement_type?: string;
  path?: string;
  scope?: string;
  category?: string;
  owner_id?: UUID;
  risk_level?: RiskLevel;
  is_privileged: boolean;
  is_active: boolean;
  data_access_types?: string[];
  assigned_count: number;
  last_used_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// Access Request
export interface AccessRequest {
  id: UUID;
  organization_id: UUID;
  request_number: string;
  requester_id: UUID;
  for_user_id: UUID;
  resource_type: string;
  resource_id: UUID;
  resource_name: string;
  status: string;
  priority?: string;
  business_justification?: string;
  duration_type?: string;
  duration_days?: number;
  risk_level?: RiskLevel;
  risk_score?: number;
  sod_conflicts_count: number;
  sla_due_date?: Timestamp;
  sla_breached: boolean;
  submitted_at: Timestamp;
  approved_at?: Timestamp;
  rejected_at?: Timestamp;
  completed_at?: Timestamp;
  cancelled_at?: Timestamp;
  correlation_id?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// JML Request
export interface JmlRequest {
  id: UUID;
  organization_id: UUID;
  request_number: string;
  jml_type: JmlType;
  identity_id: UUID;
  submitted_by_id: UUID;
  submitted_at: Timestamp;
  effective_date: string;
  effective_time?: string;
  status: JmlStatus;
  priority?: string;
  risk_score?: number;
  risk_level?: RiskLevel;
  added_roles?: string[];
  removed_roles?: string[];
  added_entitlements?: string[];
  removed_entitlements?: string[];
  modified_attributes?: Record<string, any>;
  schedule?: any;
  ai_suggestions?: any[];
  ai_anomalies?: any[];
  ai_explanation?: string;
  ai_confidence?: number;
  comments?: string;
  justification?: string;
  sla_due_date?: Timestamp;
  sla_breached: boolean;
  approved_at?: Timestamp;
  rejected_at?: Timestamp;
  completed_at?: Timestamp;
  cancelled_at?: Timestamp;
  correlation_id?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// Certification Campaign
export interface CertificationCampaign {
  id: UUID;
  organization_id: UUID;
  name: string;
  campaign_type: string;
  scope: string;
  status: string;
  scope_filter?: Record<string, any>;
  items_count: number;
  reviewers_count: number;
  progress_percentage: number;
  items_approved: number;
  items_revoked: number;
  items_pending: number;
  risk_items_count: number;
  start_date?: string;
  due_date?: string;
  completed_at?: Timestamp;
  reminder_schedule?: any;
  last_reminder_sent_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// Audit Event
export interface AuditEvent {
  id: UUID;
  organization_id?: UUID;
  correlation_id?: UUID;
  actor_id?: UUID;
  actor_name?: string;
  actor_type?: string;
  action: string;
  subject?: string;
  object_id?: UUID;
  object_name?: string;
  before_value?: any;
  after_value?: any;
  diff?: any;
  justification?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  metadata?: Record<string, any>;
  occurred_at: Timestamp;
  created_at: Timestamp;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Application, 'id' | 'created_at'>>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Role, 'id' | 'created_at'>>;
      };
      entitlements: {
        Row: Entitlement;
        Insert: Omit<Entitlement, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Entitlement, 'id' | 'created_at'>>;
      };
      access_requests: {
        Row: AccessRequest;
        Insert: Omit<AccessRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AccessRequest, 'id' | 'created_at'>>;
      };
      jml_requests: {
        Row: JmlRequest;
        Insert: Omit<JmlRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<JmlRequest, 'id' | 'created_at'>>;
      };
      certification_campaigns: {
        Row: CertificationCampaign;
        Insert: Omit<CertificationCampaign, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CertificationCampaign, 'id' | 'created_at'>>;
      };
      audit_events: {
        Row: AuditEvent;
        Insert: Omit<AuditEvent, 'id' | 'created_at'>;
        Update: never; // Audit events are immutable
      };
    };
  };
}

