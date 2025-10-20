// JML (Joiner/Mover/Leaver) Core Data Models
// Stack-agnostic contracts for Identity Lifecycle Management

export type JmlType = 'JOINER' | 'MOVER' | 'LEAVER';
export type JmlStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'FAILED';
export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELEGATED';
export type TaskState = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'RETRYING';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EmploymentType = 'PERMANENT' | 'CONTRACTOR' | 'INTERN' | 'VENDOR';
export type TerminationType = 'VOLUNTARY' | 'INVOLUNTARY' | 'IMMEDIATE';

// Core Entities
export interface Identity {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  managerId?: string;
  managerName?: string;
  company: string;
  division: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  riskScore: number;
  riskLevel: RiskLevel;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isBirthright: boolean;
  category: string;
  owner: string;
  createdAt: string;
}

export interface Entitlement {
  id: string;
  applicationId: string;
  applicationName: string;
  name: string;
  path: string;
  description: string;
  riskLevel: RiskLevel;
  category: string;
  owner: string;
  isPrivileged: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  name: string;
  type: string;
  owner: string;
  description: string;
  isActive: boolean;
  connectorType: string;
  createdAt: string;
}

export interface JmlRequest {
  id: string;
  type: JmlType;
  identityRef: string;
  identity: Identity;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  effectiveDate: string;
  effectiveTime?: string;
  status: JmlStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  approvals: Approval[];
  tasks: TaskRun[];
  aiHints: AiHints;
  changeSet: ChangeSet;
  comments: string;
  correlationId: string;
  slaDueDate?: string;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  step: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  state: ApprovalState;
  comments?: string;
  submittedAt?: string;
  dueDate: string;
  delegatedTo?: string;
  delegatedToName?: string;
  escalationLevel: number;
  isRequired: boolean;
  createdAt: string;
}

export interface TaskRun {
  id: string;
  connectorId: string;
  connectorName: string;
  action: string;
  target: string;
  state: TaskState;
  message?: string;
  retryCount: number;
  maxRetries: number;
  startedAt?: string;
  completedAt?: string;
  errorDetails?: string;
  correlationId: string;
  createdAt: string;
}

export interface ChangeSet {
  addedRoles: string[];
  removedRoles: string[];
  addedEntitlements: string[];
  removedEntitlements: string[];
  modifiedAttributes: Record<string, { before: any; after: any }>;
  schedule?: {
    phase: number;
    effectiveDate: string;
    effectiveTime: string;
  }[];
}

export interface AiHints {
  suggestions: AiSuggestion[];
  anomalies: AiAnomaly[];
  explanation?: string;
  confidence: number;
  generatedAt: string;
}

export interface AiSuggestion {
  id: string;
  type: 'ROLE' | 'ENTITLEMENT' | 'APPROVAL_PATH' | 'SCHEDULE';
  title: string;
  description: string;
  confidence: number;
  rationale: string;
  riskLevel: RiskLevel;
  sodConflicts?: string[];
  peerComparison?: {
    similarIdentities: number;
    averageAccess: string[];
  };
}

export interface AiAnomaly {
  id: string;
  type: 'ACCESS_RISK' | 'SCHEDULE_RISK' | 'PEER_DEVIATION' | 'POLICY_VIOLATION';
  severity: RiskLevel;
  title: string;
  description: string;
  signal: string;
  recommendation: string;
  confidence: number;
}

// Policy Models
export interface Policy {
  id: string;
  name: string;
  type: 'BIRTHRIGHT' | 'SOD' | 'RISK' | 'CERTIFICATION';
  description: string;
  rule: PolicyRule;
  isActive: boolean;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  priority: number;
}

export interface PolicyCondition {
  field: string;
  operator: 'EQUALS' | 'CONTAINS' | 'IN' | 'NOT_IN' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface PolicyAction {
  type: 'GRANT_ROLE' | 'GRANT_ENTITLEMENT' | 'DENY_ACCESS' | 'REQUIRE_APPROVAL';
  target: string;
  parameters?: Record<string, any>;
}

export interface SodConflict {
  id: string;
  ruleId: string;
  ruleName: string;
  conflictingRoles: string[];
  conflictingEntitlements: string[];
  severity: RiskLevel;
  description: string;
  mitigationOptions: string[];
  isActive: boolean;
}

// Audit Models
export interface AuditEvent {
  id: string;
  correlationId: string;
  actor: string;
  actorName: string;
  action: string;
  subject: string;
  object: string;
  timestamp: string;
  before?: any;
  after?: any;
  justification?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
}

// Analytics Models
export interface JmlMetrics {
  totalRequests: number;
  pendingApprovals: number;
  inProgressTasks: number;
  averageCycleTime: number;
  openFailures: number;
  highRiskJoiners: number;
  slaBreaches: number;
  sodViolations: number;
}

export interface TrendData {
  date: string;
  joiners: number;
  movers: number;
  leavers: number;
  riskDistribution: Record<RiskLevel, number>;
  slaBreaches: number;
}

// AI Service Contracts
export interface AiService {
  suggestAccess(identityContext: IdentityContext): Promise<AiSuggestion[]>;
  detectAnomalies(jmlPayload: JmlRequest): Promise<AiAnomaly[]>;
  explain(decisionContext: DecisionContext): Promise<string>;
  parseNl(commandText: string): Promise<JmlRequestDraft>;
  summarize(events: AuditEvent[]): Promise<string>;
}

export interface IdentityContext {
  identity: Identity;
  peerGroup: Identity[];
  historicalPatterns: any[];
  organizationalContext: any;
}

export interface DecisionContext {
  request: JmlRequest;
  policies: Policy[];
  historicalDecisions: any[];
  riskFactors: any[];
}

export interface JmlRequestDraft {
  type: JmlType;
  identityRef?: string;
  effectiveDate?: string;
  changeSet?: Partial<ChangeSet>;
  comments?: string;
  confidence: number;
  extractedEntities: Record<string, any>;
}

// Service Interfaces (Stack-agnostic contracts)
export interface JmlService {
  listJmlRequests(filters: JmlRequestFilters): Promise<JmlRequest[]>;
  createJmlRequest(payload: CreateJmlRequestPayload): Promise<JmlRequest>;
  getJmlRequest(id: string): Promise<JmlRequest>;
  updateJmlRequest(id: string, updates: Partial<JmlRequest>): Promise<JmlRequest>;
  cancelJmlRequest(id: string, reason: string): Promise<void>;
}

export interface ApprovalService {
  actOnApproval(id: string, action: 'APPROVE' | 'REJECT' | 'DELEGATE', comment: string, delegateId?: string): Promise<void>;
  getPendingApprovals(userId: string): Promise<Approval[]>;
  escalateApproval(id: string, reason: string): Promise<void>;
}

export interface TaskService {
  retryTask(id: string): Promise<void>;
  bulkRetryTasks(ids: string[]): Promise<void>;
  getTaskQueue(): Promise<TaskRun[]>;
  getConnectorHealth(): Promise<ConnectorHealth[]>;
}

export interface PolicyService {
  evaluateBirthright(identityAttributes: Record<string, any>): Promise<PolicyEvaluation>;
  evaluateSoD(accessPlan: ChangeSet): Promise<SodEvaluation>;
  getPolicies(type?: string): Promise<Policy[]>;
  testPolicy(policyId: string, testData: any): Promise<PolicyTestResult>;
}

export interface AuditService {
  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void>;
  getAuditTrail(filters: AuditFilters): Promise<AuditEvent[]>;
  exportEvidence(requestId: string, format: 'PDF' | 'CSV' | 'JSON'): Promise<Blob>;
}

// Filter and Payload Types
export interface JmlRequestFilters {
  type?: JmlType;
  status?: JmlStatus;
  riskLevel?: RiskLevel;
  applicationId?: string;
  dateFrom?: string;
  dateTo?: string;
  submittedBy?: string;
  department?: string;
  location?: string;
  search?: string;
}

export interface CreateJmlRequestPayload {
  type: JmlType;
  identityRef: string;
  effectiveDate: string;
  effectiveTime?: string;
  changeSet: ChangeSet;
  comments?: string;
  schedule?: ChangeSet['schedule'];
}

export interface AuditFilters {
  correlationId?: string;
  actor?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  subject?: string;
}

// Additional Types
export interface ConnectorHealth {
  id: string;
  name: string;
  type: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  lastSuccessfulRun?: string;
  errorRate: number;
  queueDepth: number;
}

export interface PolicyEvaluation {
  applicablePolicies: Policy[];
  recommendedRoles: string[];
  recommendedEntitlements: string[];
  requiresApproval: boolean;
  riskScore: number;
}

export interface SodEvaluation {
  conflicts: SodConflict[];
  riskScore: number;
  canProceed: boolean;
  mitigationRequired: boolean;
}

export interface PolicyTestResult {
  matches: boolean;
  matchedConditions: PolicyCondition[];
  recommendedActions: PolicyAction[];
  testData: any;
}

// Role-based Access Control
export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  description: string;
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface UserContext {
  userId: string;
  userName: string;
  roles: UserRole[];
  permissions: Permission[];
  department?: string;
  location?: string;
}

