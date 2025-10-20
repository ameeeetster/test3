// Identity System of Record (ISR) - Core Data Models and Contracts
// Stack-agnostic interfaces for ISR management and attribute-driven JML triggers

export interface IdentitySystemOfRecord {
  id: string;
  name: string;
  description: string;
  applicationId: string; // Links to existing Application
  isActive: boolean;
  enabledAt?: string;
  disabledAt?: string;
  
  // Scope and Configuration
  scope: ISRScope;
  attributeMastership: AttributeMastership[];
  precedenceStrategy: PrecedenceStrategy;
  
  // Data Quality & Validation
  validators: AttributeValidator[];
  dataQualityRules: DataQualityRule[];
  
  // Change Detection
  ingestionMode: IngestionMode;
  changeDetection: ChangeDetectionConfig;
  
  // AI Configuration
  aiAssistEnabled: boolean;
  aiSuggestions: AISuggestion[];
  
  // Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  correlationId: string;
}

export interface ISRScope {
  // Attribute Scope
  masteredAttributes: string[]; // List of attribute names this ISR masters
  
  // Organizational Scope
  organizationalScope?: {
    companies?: string[];
    divisions?: string[];
    departments?: string[];
    locations?: string[];
  };
  
  // Population Scope
  populationTypes?: ('PERMANENT' | 'CONTRACTOR' | 'INTERN' | 'VENDOR')[];
  
  // Environment Scope
  environments?: ('PROD' | 'UAT' | 'DEV')[];
}

export interface AttributeMastership {
  attribute: string;
  sourceField: string;
  transform?: AttributeTransform;
  mastershipType: 'EXCLUSIVE_MASTER' | 'PREFERRED_MASTER' | 'FALLBACK';
  precedence: number; // Lower = higher priority
  trustLevel: number; // 0-100
  effectiveFrom?: string;
  effectiveTo?: string;
  nullPolicy: 'REJECT' | 'ACCEPT' | 'DEFAULT';
  defaultValue?: any;
}

export interface AttributeTransform {
  type: 'DIRECT' | 'FORMAT' | 'LOOKUP' | 'CALCULATED' | 'CUSTOM';
  config: Record<string, any>;
  validation?: {
    required: boolean;
    pattern?: string;
    enum?: string[];
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface PrecedenceStrategy {
  type: 'PRIORITY_NUMBER' | 'TIMESTAMP_FRESHNESS' | 'TRUST_SCORE' | 'CUSTOM_RULE';
  config: Record<string, any>;
  conflictResolution: 'HIGHEST_PRIORITY' | 'MOST_RECENT' | 'HIGHEST_TRUST' | 'CUSTOM';
}

export interface AttributeValidator {
  attribute: string;
  validatorType: 'NON_EMPTY' | 'REGEX' | 'ENUM' | 'REFERENTIAL_INTEGRITY' | 'DATE_LOGIC' | 'CUSTOM';
  config: Record<string, any>;
  errorMessage: string;
  severity: 'ERROR' | 'WARNING';
}

export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  condition: string; // Expression to evaluate
  action: 'REJECT' | 'FLAG' | 'TRANSFORM' | 'LOG';
  config: Record<string, any>;
}

export interface IngestionMode {
  type: 'POLLING' | 'WEBHOOK' | 'FILE_DROP' | 'API_PUSH';
  config: {
    interval?: number; // For polling
    watermark?: string; // For polling
    endpoint?: string; // For webhook
    filePattern?: string; // For file drop
    deduplicationKey?: string;
    idempotencyToken?: string;
  };
}

export interface ChangeDetectionConfig {
  enabled: boolean;
  deltaDetection: boolean;
  batchProcessing: boolean;
  realTimeProcessing: boolean;
  correlationIdField?: string;
  timestampField?: string;
}

export interface AISuggestion {
  type: 'MAPPING' | 'CONFLICT_DETECTION' | 'MASTERSHIP_EXPLANATION' | 'RULE_SUGGESTION';
  confidence: number;
  suggestion: string;
  rationale: string;
  applied: boolean;
}

// JML Trigger Engine Types
export interface JMLTriggerRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  
  // Trigger Conditions
  conditions: TriggerCondition[];
  scope?: TriggerScope;
  schedule?: TriggerSchedule;
  
  // Output Configuration
  outputs: JMLActionSpec;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface TriggerCondition {
  id: string;
  attribute: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'TRANSITION' | 'WITHIN_WINDOW' | 'BEFORE' | 'AFTER' | 'REGEX' | 'IN_LIST' | 'CUSTOM';
  value?: any;
  beforeValue?: any;
  afterValue?: any;
  windowDays?: number;
  pattern?: string;
  list?: any[];
  customPredicate?: string;
  logicalOperator?: 'AND' | 'OR';
}

export interface TriggerScope {
  organizationalScope?: {
    companies?: string[];
    divisions?: string[];
    departments?: string[];
    locations?: string[];
  };
  populationTypes?: ('PERMANENT' | 'CONTRACTOR' | 'INTERN' | 'VENDOR')[];
  riskLevels?: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
}

export interface TriggerSchedule {
  enabled: boolean;
  effectiveDays?: number[]; // 0-6 (Sunday-Saturday)
  effectiveHours?: { start: number; end: number };
  blackoutWindows?: BlackoutWindow[];
  timezone?: string;
}

export interface BlackoutWindow {
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface JMLActionSpec {
  type: 'JOINER' | 'MOVER' | 'LEAVER';
  effectiveDate?: string;
  effectiveTime?: string;
  immediate?: boolean;
  
  // Approval Configuration
  approvalsChain?: ApprovalTemplate[];
  autoSubmit?: boolean;
  requireManagerApproval?: boolean;
  
  // Risk and SoD
  riskHints?: string[];
  sodPreCheck?: boolean;
  riskThreshold?: number;
  
  // Additional Configuration
  notes?: string;
  tags?: string[];
  retentionPeriod?: number; // For leavers
  gracePeriod?: number; // For movers/leavers
}

export interface ApprovalTemplate {
  step: number;
  approverRole: string;
  approverType: 'ROLE' | 'MANAGER' | 'CUSTOM';
  isRequired: boolean;
  dueDays: number;
  escalationDays?: number;
}

// Service Contracts
export interface ISRService {
  createISR(config: Partial<IdentitySystemOfRecord>): Promise<IdentitySystemOfRecord>;
  validateISR(config: Partial<IdentitySystemOfRecord>, sample: any[]): Promise<ValidationResult>;
  enableISR(id: string): Promise<IdentitySystemOfRecord>;
  disableISR(id: string): Promise<IdentitySystemOfRecord>;
  listISRs(): Promise<IdentitySystemOfRecord[]>;
  getISR(id: string): Promise<IdentitySystemOfRecord | null>;
  updateISR(id: string, updates: Partial<IdentitySystemOfRecord>): Promise<IdentitySystemOfRecord>;
}

export interface IngestionService {
  ingestFromISR(isrId: string, batch: any[]): Promise<IngestionResult>;
  reconcileIdentity(identityId: string): Promise<ReconciliationResult>;
  previewMapping(isrConfig: Partial<IdentitySystemOfRecord>, sample: any[]): Promise<MappingPreviewResult>;
}

export interface MastershipService {
  getMastership(attribute: string): Promise<MastershipInfo>;
  resolveConflict(attribute: string, candidates: AttributeMastership[]): Promise<AttributeMastership>;
  updateMastership(attribute: string, mastership: AttributeMastership): Promise<void>;
}

export interface TriggerService {
  evaluateDelta(identityId: string, delta: AttributeDelta): Promise<TriggerEvaluationResult>;
  createJmlFromTrigger(ruleId: string, spec: JMLActionSpec, context: TriggerContext): Promise<JmlRequest>;
  listTriggerRules(): Promise<JMLTriggerRule[]>;
  createTriggerRule(rule: Partial<JMLTriggerRule>): Promise<JMLTriggerRule>;
  updateTriggerRule(id: string, updates: Partial<JMLTriggerRule>): Promise<JMLTriggerRule>;
}

export interface PolicyService {
  evaluateBirthright(identityContext: Partial<Identity>): Promise<BirthrightResult>;
  evaluateSoD(accessPlan: AccessPlan): Promise<SoDResult>;
}

export interface RiskService {
  score(jmlPayload: Partial<JmlRequest>): Promise<RiskScore>;
  calculateRiskLevel(score: number): RiskLevel;
}

export interface AIService {
  suggestMappings(sample: any[]): Promise<MappingSuggestion[]>;
  detectConflicts(isrConfig: Partial<IdentitySystemOfRecord>): Promise<ConflictDetection[]>;
  explainMastership(attribute: string, mastership: AttributeMastership): Promise<string>;
  suggestAccess(identityContext: Partial<Identity>): Promise<AccessSuggestion[]>;
  explainTrigger(context: TriggerContext): Promise<string>;
  suggestTriggerRules(historicalDeltas: AttributeDelta[]): Promise<TriggerRuleSuggestion[]>;
}

// Supporting Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  sampleResults: SampleValidationResult[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
  row?: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
  row?: number;
}

export interface SampleValidationResult {
  row: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface IngestionResult {
  accepted: number;
  rejected: number;
  errors: ValidationError[];
  correlationId: string;
  processedAt: string;
}

export interface ReconciliationResult {
  identityId: string;
  before: Record<string, any>;
  after: Record<string, any>;
  winningSourceByAttribute: Record<string, string>;
  conflicts: AttributeConflict[];
  correlationId: string;
}

export interface AttributeConflict {
  attribute: string;
  candidates: AttributeMastership[];
  resolution: AttributeMastership;
  reason: string;
}

export interface MappingPreviewResult {
  mappings: AttributeMapping[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
  sampleResults: SampleValidationResult[];
}

export interface AttributeMapping {
  sourceField: string;
  targetAttribute: string;
  transform?: AttributeTransform;
  confidence: number;
  sampleValues: any[];
}

export interface MastershipInfo {
  attribute: string;
  masters: AttributeMastership[];
  currentMaster?: AttributeMastership;
  conflicts: AttributeConflict[];
}

export interface TriggerEvaluationResult {
  triggeredRules: JMLTriggerRule[];
  suppressedRules: JMLTriggerRule[];
  jmlActions: JMLActionSpec[];
  correlationId: string;
}

export interface TriggerContext {
  identityId: string;
  delta: AttributeDelta;
  isrId: string;
  correlationId: string;
  timestamp: string;
}

export interface AttributeDelta {
  identityId: string;
  attribute: string;
  before: any;
  after: any;
  source: string;
  timestamp: string;
  correlationId: string;
}

export interface BirthrightResult {
  roles: Role[];
  entitlements: Entitlement[];
  confidence: number;
  reasoning: string;
}

export interface SoDResult {
  violations: SoDViolation[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
}

export interface SoDViolation {
  id: string;
  description: string;
  conflictingItems: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigationOptions: string[];
}

export interface AccessPlan {
  addedRoles: string[];
  removedRoles: string[];
  addedEntitlements: string[];
  removedEntitlements: string[];
  existingRoles: string[];
  existingEntitlements: string[];
}

export interface RiskScore {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  factor: string;
  weight: number;
  value: number;
  contribution: number;
}

export interface MappingSuggestion {
  sourceField: string;
  targetAttribute: string;
  confidence: number;
  rationale: string;
  transform?: AttributeTransform;
}

export interface ConflictDetection {
  type: 'ATTRIBUTE_CONFLICT' | 'MASTERSHIP_CONFLICT' | 'PRECEDENCE_CONFLICT';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolution: string;
}

export interface AccessSuggestion {
  type: 'ROLE' | 'ENTITLEMENT';
  id: string;
  name: string;
  confidence: number;
  rationale: string;
  sodRisk: boolean;
}

export interface TriggerRuleSuggestion {
  name: string;
  description: string;
  conditions: TriggerCondition[];
  outputs: JMLActionSpec;
  confidence: number;
  rationale: string;
}

// Re-export existing types for convenience
export type { Identity, Role, Entitlement, JmlRequest, RiskLevel } from './jml';






