// ISR Service Implementation with Deterministic Mocks
// Stack-agnostic service layer for Identity System of Record management

import {
  IdentitySystemOfRecord, ISRScope, AttributeMastership, PrecedenceStrategy,
  AttributeValidator, DataQualityRule, IngestionMode, ChangeDetectionConfig,
  AISuggestion, JMLTriggerRule, TriggerCondition, TriggerScope, TriggerSchedule,
  JMLActionSpec, ApprovalTemplate, ValidationResult, ValidationError, ValidationWarning,
  SampleValidationResult, IngestionResult, ReconciliationResult, AttributeConflict,
  MappingPreviewResult, AttributeMapping, MastershipInfo, TriggerEvaluationResult,
  TriggerContext, AttributeDelta, BirthrightResult, SoDResult, AccessPlan,
  SoDViolation, RiskScore, RiskFactor, MappingSuggestion, ConflictDetection,
  AccessSuggestion, TriggerRuleSuggestion, RiskLevel
} from '../types/isr';
import { Identity, Role, Entitlement, JmlRequest } from '../types/jml';

// Mock ISR Service Implementation
export class MockISRService {
  private isrs: IdentitySystemOfRecord[] = [];
  private triggerRules: JMLTriggerRule[] = [];
  private attributeDeltas: AttributeDelta[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with sample ISR configurations
    this.isrs = [
      {
        id: 'isr-hris',
        name: 'Workday HRIS',
        description: 'Primary HR system for employee data',
        applicationId: 'app-workday',
        isActive: true,
        enabledAt: '2024-01-01T00:00:00Z',
        scope: {
          masteredAttributes: [
            'employmentStatus', 'startDate', 'endDate', 'company', 'division',
            'department', 'location', 'managerId', 'title', 'email', 'employeeId'
          ],
          organizationalScope: {
            companies: ['ACME Corp'],
            divisions: ['Product', 'Sales', 'Finance', 'HR', 'IT']
          },
          populationTypes: ['PERMANENT', 'CONTRACTOR'],
          environments: ['PROD']
        },
        attributeMastership: [
          {
            attribute: 'employmentStatus',
            sourceField: 'emp_status',
            mastershipType: 'EXCLUSIVE_MASTER',
            precedence: 1,
            trustLevel: 95,
            nullPolicy: 'REJECT'
          },
          {
            attribute: 'startDate',
            sourceField: 'start_date',
            mastershipType: 'EXCLUSIVE_MASTER',
            precedence: 1,
            trustLevel: 95,
            nullPolicy: 'REJECT'
          },
          {
            attribute: 'department',
            sourceField: 'dept_code',
            mastershipType: 'PREFERRED_MASTER',
            precedence: 1,
            trustLevel: 90,
            nullPolicy: 'ACCEPT'
          }
        ],
        precedenceStrategy: {
          type: 'PRIORITY_NUMBER',
          config: { defaultPriority: 100 },
          conflictResolution: 'HIGHEST_PRIORITY'
        },
        validators: [
          {
            attribute: 'employmentStatus',
            validatorType: 'ENUM',
            config: { enum: ['ACTIVE', 'INACTIVE', 'TERMINATED', 'PENDING'] },
            errorMessage: 'Invalid employment status',
            severity: 'ERROR'
          },
          {
            attribute: 'startDate',
            validatorType: 'DATE_LOGIC',
            config: { before: 'endDate' },
            errorMessage: 'Start date must be before end date',
            severity: 'ERROR'
          }
        ],
        dataQualityRules: [
          {
            id: 'dq-001',
            name: 'Manager Reference Check',
            description: 'Ensure manager exists in system',
            condition: 'managerId != null && managerExists(managerId)',
            action: 'FLAG',
            config: { severity: 'WARNING' }
          }
        ],
        ingestionMode: {
          type: 'POLLING',
          config: {
            interval: 3600, // 1 hour
            watermark: 'last_updated',
            deduplicationKey: 'employeeId',
            idempotencyToken: 'batch_id'
          }
        },
        changeDetection: {
          enabled: true,
          deltaDetection: true,
          batchProcessing: true,
          realTimeProcessing: false,
          correlationIdField: 'batch_id',
          timestampField: 'last_updated'
        },
        aiAssistEnabled: true,
        aiSuggestions: [],
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-01-01T00:00:00Z',
        updatedBy: 'system',
        correlationId: 'init-isr-hris'
      }
    ];

    // Initialize trigger rules
    this.triggerRules = [
      {
        id: 'trigger-joiner-hire',
        name: 'Joiner - Employee Hire',
        description: 'Triggered when employment status changes to ACTIVE',
        isActive: true,
        priority: 1,
        conditions: [
          {
            id: 'cond-1',
            attribute: 'employmentStatus',
            operator: 'TRANSITION',
            beforeValue: 'PENDING',
            afterValue: 'ACTIVE',
            logicalOperator: 'AND'
          },
          {
            id: 'cond-2',
            attribute: 'startDate',
            operator: 'WITHIN_WINDOW',
            windowDays: 14
          }
        ],
        outputs: {
          type: 'JOINER',
          effectiveDate: 'startDate',
          autoSubmit: false,
          requireManagerApproval: true,
          sodPreCheck: true,
          notes: 'New employee onboarding triggered by HRIS status change'
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-01-01T00:00:00Z',
        triggerCount: 0
      },
      {
        id: 'trigger-mover-org-change',
        name: 'Mover - Organizational Change',
        description: 'Triggered when department or location changes',
        isActive: true,
        priority: 2,
        conditions: [
          {
            id: 'cond-1',
            attribute: 'department',
            operator: 'TRANSITION',
            logicalOperator: 'OR'
          },
          {
            id: 'cond-2',
            attribute: 'location',
            operator: 'TRANSITION',
            logicalOperator: 'OR'
          }
        ],
        outputs: {
          type: 'MOVER',
          effectiveDate: 'next_business_day',
          effectiveTime: '08:30',
          autoSubmit: false,
          requireManagerApproval: true,
          sodPreCheck: true,
          notes: 'Organizational change detected - access review required'
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-01-01T00:00:00Z',
        triggerCount: 0
      },
      {
        id: 'trigger-leaver-termination',
        name: 'Leaver - Termination',
        description: 'Triggered when employment status changes to TERMINATED',
        isActive: true,
        priority: 1,
        conditions: [
          {
            id: 'cond-1',
            attribute: 'employmentStatus',
            operator: 'TRANSITION',
            afterValue: 'TERMINATED',
            logicalOperator: 'OR'
          },
          {
            id: 'cond-2',
            attribute: 'endDate',
            operator: 'BEFORE',
            value: 'today'
          }
        ],
        outputs: {
          type: 'LEAVER',
          immediate: true,
          autoSubmit: true,
          requireManagerApproval: false,
          retentionPeriod: 30,
          notes: 'Employee termination - immediate access revocation'
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-01-01T00:00:00Z',
        triggerCount: 0
      }
    ];
  }

  // ISR Service Methods
  async createISR(config: Partial<IdentitySystemOfRecord>): Promise<IdentitySystemOfRecord> {
    const isr: IdentitySystemOfRecord = {
      id: `isr-${Date.now()}`,
      name: config.name || 'New ISR',
      description: config.description || '',
      applicationId: config.applicationId || '',
      isActive: false,
      scope: config.scope || { masteredAttributes: [] },
      attributeMastership: config.attributeMastership || [],
      precedenceStrategy: config.precedenceStrategy || {
        type: 'PRIORITY_NUMBER',
        config: {},
        conflictResolution: 'HIGHEST_PRIORITY'
      },
      validators: config.validators || [],
      dataQualityRules: config.dataQualityRules || [],
      ingestionMode: config.ingestionMode || {
        type: 'POLLING',
        config: {}
      },
      changeDetection: config.changeDetection || {
        enabled: true,
        deltaDetection: true,
        batchProcessing: true,
        realTimeProcessing: false
      },
      aiAssistEnabled: config.aiAssistEnabled || false,
      aiSuggestions: config.aiSuggestions || [],
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
      correlationId: `create-${Date.now()}`
    };

    this.isrs.push(isr);
    return isr;
  }

  async validateISR(config: Partial<IdentitySystemOfRecord>, sample: any[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const sampleResults: SampleValidationResult[] = [];

    // Validate configuration
    if (!config.name) {
      errors.push({
        field: 'name',
        message: 'ISR name is required',
        severity: 'ERROR'
      });
    }

    if (!config.scope?.masteredAttributes?.length) {
      errors.push({
        field: 'masteredAttributes',
        message: 'At least one attribute must be mastered',
        severity: 'ERROR'
      });
    }

    // Validate sample data
    sample.forEach((row, index) => {
      const rowErrors: ValidationError[] = [];
      const rowWarnings: ValidationWarning[] = [];

      // Check required fields
      config.scope?.masteredAttributes?.forEach(attr => {
        const mastership = config.attributeMastership?.find(m => m.attribute === attr);
        if (mastership?.nullPolicy === 'REJECT' && !row[mastership.sourceField]) {
          rowErrors.push({
            field: mastership.sourceField,
            message: `${attr} is required`,
            severity: 'ERROR',
            row: index
          });
        }
      });

      sampleResults.push({
        row: index,
        data: row,
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        warnings: rowWarnings
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sampleResults
    };
  }

  async enableISR(id: string): Promise<IdentitySystemOfRecord> {
    const isr = this.isrs.find(i => i.id === id);
    if (!isr) throw new Error('ISR not found');

    isr.isActive = true;
    isr.enabledAt = new Date().toISOString();
    isr.updatedAt = new Date().toISOString();
    isr.updatedBy = 'current-user';

    return isr;
  }

  async disableISR(id: string): Promise<IdentitySystemOfRecord> {
    const isr = this.isrs.find(i => i.id === id);
    if (!isr) throw new Error('ISR not found');

    isr.isActive = false;
    isr.disabledAt = new Date().toISOString();
    isr.updatedAt = new Date().toISOString();
    isr.updatedBy = 'current-user';

    return isr;
  }

  async listISRs(): Promise<IdentitySystemOfRecord[]> {
    return [...this.isrs];
  }

  async getISR(id: string): Promise<IdentitySystemOfRecord | null> {
    return this.isrs.find(i => i.id === id) || null;
  }

  async updateISR(id: string, updates: Partial<IdentitySystemOfRecord>): Promise<IdentitySystemOfRecord> {
    const isr = this.isrs.find(i => i.id === id);
    if (!isr) throw new Error('ISR not found');

    Object.assign(isr, updates);
    isr.updatedAt = new Date().toISOString();
    isr.updatedBy = 'current-user';

    return isr;
  }

  // Trigger Service Methods
  async evaluateDelta(identityId: string, delta: AttributeDelta): Promise<TriggerEvaluationResult> {
    const triggeredRules: JMLTriggerRule[] = [];
    const suppressedRules: JMLTriggerRule[] = [];
    const jmlActions: JMLActionSpec[] = [];

    // Store the delta
    this.attributeDeltas.push(delta);

    // Evaluate each trigger rule
    for (const rule of this.triggerRules.filter(r => r.isActive)) {
      if (this.evaluateTriggerRule(rule, delta)) {
        triggeredRules.push(rule);
        jmlActions.push(rule.outputs);
        
        // Update trigger count
        rule.triggerCount++;
        rule.lastTriggered = new Date().toISOString();
      } else {
        suppressedRules.push(rule);
      }
    }

    return {
      triggeredRules,
      suppressedRules,
      jmlActions,
      correlationId: delta.correlationId
    };
  }

  private evaluateTriggerRule(rule: JMLTriggerRule, delta: AttributeDelta): boolean {
    // Simple rule evaluation - in production this would be more sophisticated
    for (const condition of rule.conditions) {
      if (condition.attribute === delta.attribute) {
        switch (condition.operator) {
          case 'TRANSITION':
            if (condition.beforeValue && condition.afterValue) {
              return delta.before === condition.beforeValue && delta.after === condition.afterValue;
            }
            break;
          case 'EQUALS':
            return delta.after === condition.value;
          case 'NOT_EQUALS':
            return delta.after !== condition.value;
          // Add more operators as needed
        }
      }
    }
    return false;
  }

  async createJmlFromTrigger(ruleId: string, spec: JMLActionSpec, context: TriggerContext): Promise<JmlRequest> {
    // This would integrate with the existing JML service
    const mockJmlRequest: JmlRequest = {
      id: `jml-trigger-${Date.now()}`,
      type: spec.type,
      identityRef: context.identityId,
      submittedBy: 'system',
      submittedAt: new Date().toISOString(),
      effectiveDate: spec.effectiveDate || new Date().toISOString(),
      status: spec.autoSubmit ? 'PENDING_APPROVAL' : 'DRAFT',
      riskScore: 0, // Would be calculated
      approvals: [],
      tasks: [],
      aiHints: {
        suggestions: [],
        anomalies: [],
        explanation: `Triggered by ${ruleId}: ${spec.notes}`,
        summary: `Auto-generated ${spec.type} request from ISR trigger`
      },
      changeSet: {
        addedRoles: [],
        addedEntitlements: [],
        attributeChanges: {
          [context.delta.attribute]: {
            oldValue: context.delta.before,
            newValue: context.delta.after
          }
        }
      },
      justification: `Automatically triggered by ISR rule: ${ruleId}`,
      correlationId: context.correlationId
    };

    return mockJmlRequest;
  }

  async listTriggerRules(): Promise<JMLTriggerRule[]> {
    return [...this.triggerRules];
  }

  async createTriggerRule(rule: Partial<JMLTriggerRule>): Promise<JMLTriggerRule> {
    const newRule: JMLTriggerRule = {
      id: `trigger-${Date.now()}`,
      name: rule.name || 'New Trigger Rule',
      description: rule.description || '',
      isActive: rule.isActive || false,
      priority: rule.priority || 100,
      conditions: rule.conditions || [],
      outputs: rule.outputs || {
        type: 'JOINER',
        autoSubmit: false
      },
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedAt: new Date().toISOString(),
      triggerCount: 0
    };

    this.triggerRules.push(newRule);
    return newRule;
  }

  async updateTriggerRule(id: string, updates: Partial<JMLTriggerRule>): Promise<JMLTriggerRule> {
    const rule = this.triggerRules.find(r => r.id === id);
    if (!rule) throw new Error('Trigger rule not found');

    Object.assign(rule, updates);
    rule.updatedAt = new Date().toISOString();

    return rule;
  }

  // AI Service Methods
  async suggestMappings(sample: any[]): Promise<MappingSuggestion[]> {
    // Deterministic mock suggestions
    return [
      {
        sourceField: 'emp_id',
        targetAttribute: 'employeeId',
        confidence: 0.95,
        rationale: 'Field name and format match employee ID pattern',
        transform: {
          type: 'DIRECT',
          config: {}
        }
      },
      {
        sourceField: 'dept_name',
        targetAttribute: 'department',
        confidence: 0.85,
        rationale: 'Department name field maps to department attribute',
        transform: {
          type: 'LOOKUP',
          config: { lookupTable: 'departments' }
        }
      }
    ];
  }

  async detectConflicts(isrConfig: Partial<IdentitySystemOfRecord>): Promise<ConflictDetection[]> {
    const conflicts: ConflictDetection[] = [];

    // Check for attribute conflicts with existing ISRs
    const existingISRs = this.isrs.filter(isr => isr.id !== isrConfig.id);
    
    isrConfig.scope?.masteredAttributes?.forEach(attr => {
      const existingMaster = existingISRs.find(isr => 
        isr.scope.masteredAttributes.includes(attr)
      );
      
      if (existingMaster) {
        conflicts.push({
          type: 'ATTRIBUTE_CONFLICT',
          description: `Attribute ${attr} is already mastered by ${existingMaster.name}`,
          severity: 'HIGH',
          resolution: 'Consider precedence rules or exclusive mastership'
        });
      }
    });

    return conflicts;
  }

  async explainMastership(attribute: string, mastership: AttributeMastership): Promise<string> {
    return `Attribute ${attribute} is mastered by ${mastership.mastershipType} with precedence ${mastership.precedence} and trust level ${mastership.trustLevel}%. This means ${mastership.mastershipType === 'EXCLUSIVE_MASTER' ? 'only this ISR can provide values' : 'this ISR is preferred but others may override'}.`;
  }

  async explainTrigger(context: TriggerContext): Promise<string> {
    return `Triggered because ${context.delta.attribute} changed from "${context.delta.before}" to "${context.delta.after}" at ${context.timestamp}. This change was detected by ISR ${context.isrId} and matched trigger conditions.`;
  }
}

// Export singleton instance
export const isrService = new MockISRService();



















