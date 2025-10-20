// Attribute-Driven JML Trigger Engine
// Core engine for evaluating attribute changes and creating JML requests

import {
  JMLTriggerRule, TriggerCondition, TriggerEvaluationResult, TriggerContext,
  AttributeDelta, JMLActionSpec, IdentitySystemOfRecord, MastershipInfo,
  SoDResult, RiskScore, BirthrightResult, AccessSuggestion
} from '../types/isr';
import { Identity, JmlRequest, JmlType, JmlStatus, RiskLevel } from '../types/jml';
import { isrService } from './isrService';

export class JMLTriggerEngine {
  private triggerRules: JMLTriggerRule[] = [];
  private isrs: IdentitySystemOfRecord[] = [];
  private attributeDeltas: AttributeDelta[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // Initialize with the default trigger rules from the ISR service
    this.loadTriggerRules();
  }

  async loadTriggerRules(): Promise<void> {
    this.triggerRules = await isrService.listTriggerRules();
  }

  async loadISRs(): Promise<void> {
    this.isrs = await isrService.listISRs();
  }

  // Main trigger evaluation method
  async evaluateAttributeChange(
    identityId: string,
    attribute: string,
    beforeValue: any,
    afterValue: any,
    sourceISR: string,
    correlationId: string
  ): Promise<TriggerEvaluationResult> {
    
    // Create attribute delta
    const delta: AttributeDelta = {
      identityId,
      attribute,
      before: beforeValue,
      after: afterValue,
      source: sourceISR,
      timestamp: new Date().toISOString(),
      correlationId
    };

    // Store the delta
    this.attributeDeltas.push(delta);

    // Create trigger context
    const context: TriggerContext = {
      identityId,
      delta,
      isrId: sourceISR,
      correlationId,
      timestamp: delta.timestamp
    };

    // Evaluate all active trigger rules
    return await this.evaluateTriggerRules(context);
  }

  private async evaluateTriggerRules(context: TriggerContext): Promise<TriggerEvaluationResult> {
    const triggeredRules: JMLTriggerRule[] = [];
    const suppressedRules: JMLTriggerRule[] = [];
    const jmlActions: JMLActionSpec[] = [];

    // Sort rules by priority (lower number = higher priority)
    const sortedRules = [...this.triggerRules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (!rule.isActive) {
        suppressedRules.push(rule);
        continue;
      }

      const isTriggered = await this.evaluateRule(rule, context);
      
      if (isTriggered) {
        triggeredRules.push(rule);
        jmlActions.push(rule.outputs);
        
        // Update trigger count
        rule.triggerCount++;
        rule.lastTriggered = new Date().toISOString();
        
        // Update the rule in the service
        await isrService.updateTriggerRule(rule.id, rule);
      } else {
        suppressedRules.push(rule);
      }
    }

    return {
      triggeredRules,
      suppressedRules,
      jmlActions,
      correlationId: context.correlationId
    };
  }

  private async evaluateRule(rule: JMLTriggerRule, context: TriggerContext): Promise<boolean> {
    // Evaluate all conditions in the rule
    let result = true;
    let logicalOperator: 'AND' | 'OR' = 'AND';

    for (let i = 0; i < rule.conditions.length; i++) {
      const condition = rule.conditions[i];
      const conditionResult = await this.evaluateCondition(condition, context);
      
      if (i === 0) {
        result = conditionResult;
      } else {
        if (logicalOperator === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }

      // Update logical operator for next iteration
      if (condition.logicalOperator) {
        logicalOperator = condition.logicalOperator;
      }
    }

    return result;
  }

  private async evaluateCondition(condition: TriggerCondition, context: TriggerContext): Promise<boolean> {
    const { delta } = context;

    // Check if this condition applies to the changed attribute
    if (condition.attribute !== delta.attribute) {
      return false;
    }

    switch (condition.operator) {
      case 'EQUALS':
        return delta.after === condition.value;

      case 'NOT_EQUALS':
        return delta.after !== condition.value;

      case 'TRANSITION':
        if (condition.beforeValue !== undefined && condition.afterValue !== undefined) {
          return delta.before === condition.beforeValue && delta.after === condition.afterValue;
        } else if (condition.afterValue !== undefined) {
          return delta.after === condition.afterValue;
        }
        return false;

      case 'WITHIN_WINDOW':
        if (condition.windowDays && delta.attribute === 'startDate') {
          const startDate = new Date(delta.after);
          const now = new Date();
          const diffDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= condition.windowDays;
        }
        return false;

      case 'BEFORE':
        if (condition.value === 'today') {
          const date = new Date(delta.after);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today;
        }
        return false;

      case 'AFTER':
        if (condition.value === 'today') {
          const date = new Date(delta.after);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date > today;
        }
        return false;

      case 'REGEX':
        if (condition.pattern) {
          const regex = new RegExp(condition.pattern);
          return regex.test(String(delta.after));
        }
        return false;

      case 'IN_LIST':
        if (condition.list) {
          return condition.list.includes(delta.after);
        }
        return false;

      case 'CUSTOM':
        // For custom predicates, we would evaluate the expression
        // This is a simplified implementation
        return await this.evaluateCustomPredicate(condition.customPredicate || '', context);

      default:
        return false;
    }
  }

  private async evaluateCustomPredicate(predicate: string, context: TriggerContext): Promise<boolean> {
    // In a real implementation, this would use a safe expression evaluator
    // For now, we'll implement some common patterns
    
    const { delta } = context;
    
    try {
      // Simple expression evaluation (in production, use a proper expression parser)
      if (predicate.includes('contains')) {
        const match = predicate.match(/contains\("([^"]+)"\)/);
        if (match) {
          return String(delta.after).toLowerCase().includes(match[1].toLowerCase());
        }
      }
      
      if (predicate.includes('startsWith')) {
        const match = predicate.match(/startsWith\("([^"]+)"\)/);
        if (match) {
          return String(delta.after).startsWith(match[1]);
        }
      }
      
      if (predicate.includes('endsWith')) {
        const match = predicate.match(/endsWith\("([^"]+)"\)/);
        if (match) {
          return String(delta.after).endsWith(match[1]);
        }
      }
      
      // Date comparisons
      if (predicate.includes('dateDiff')) {
        const match = predicate.match(/dateDiff\("([^"]+)",\s*(\d+)\)/);
        if (match) {
          const field = match[1];
          const days = parseInt(match[2]);
          const date = new Date(delta.after);
          const now = new Date();
          const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return Math.abs(diffDays) <= days;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error evaluating custom predicate:', error);
      return false;
    }
  }

  // Create JML request from trigger
  async createJMLFromTrigger(
    ruleId: string,
    spec: JMLActionSpec,
    context: TriggerContext,
    identity: Partial<Identity>
  ): Promise<JmlRequest> {
    
    // Generate effective date
    let effectiveDate = new Date();
    if (spec.effectiveDate) {
      if (spec.effectiveDate === 'startDate' && context.delta.attribute === 'startDate') {
        effectiveDate = new Date(context.delta.after);
      } else if (spec.effectiveDate === 'next_business_day') {
        effectiveDate = this.getNextBusinessDay();
        if (spec.effectiveTime) {
          const [hours, minutes] = spec.effectiveTime.split(':').map(Number);
          effectiveDate.setHours(hours, minutes, 0, 0);
        }
      } else {
        effectiveDate = new Date(spec.effectiveDate);
      }
    }

    // Calculate risk score
    const riskScore = await this.calculateRiskScore(spec, context, identity);

    // Evaluate birthright and SoD
    const birthrightResult = await this.evaluateBirthright(identity);
    const accessPlan = this.buildAccessPlan(birthrightResult);
    const sodResult = await this.evaluateSoD(accessPlan);

    // Create the JML request
    const jmlRequest: JmlRequest = {
      id: `jml-trigger-${Date.now()}`,
      type: spec.type,
      identityRef: context.identityId,
      submittedBy: 'system',
      submittedAt: new Date().toISOString(),
      effectiveDate: effectiveDate.toISOString(),
      status: spec.autoSubmit ? 'PENDING_APPROVAL' : 'DRAFT',
      riskScore: riskScore.score,
      approvals: this.buildApprovalChain(spec),
      tasks: this.buildTaskList(spec),
      aiHints: {
        suggestions: birthrightResult.roles.map(role => ({
          type: 'ROLE' as const,
          id: role.id,
          name: role.name,
          confidence: birthrightResult.confidence,
          rationale: birthrightResult.reasoning,
          sodRisk: sodResult.violations.some(v => v.conflictingItems.includes(role.id))
        })),
        anomalies: [],
        explanation: await this.generateTriggerExplanation(context, ruleId),
        summary: `Auto-generated ${spec.type} request from ISR trigger: ${ruleId}`
      },
      changeSet: {
        addedRoles: birthrightResult.roles.map(r => r.id),
        addedEntitlements: birthrightResult.entitlements.map(e => e.id),
        attributeChanges: {
          [context.delta.attribute]: {
            oldValue: context.delta.before,
            newValue: context.delta.after
          }
        }
      },
      justification: `Automatically triggered by ISR rule: ${ruleId}. ${spec.notes || ''}`,
      correlationId: context.correlationId
    };

    return jmlRequest;
  }

  private getNextBusinessDay(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    
    // Skip weekends
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  }

  private async calculateRiskScore(
    spec: JMLActionSpec,
    context: TriggerContext,
    identity: Partial<Identity>
  ): Promise<RiskScore> {
    let score = 0;
    const factors: RiskFactor[] = [];

    // Base risk by JML type
    const typeRisk = {
      'JOINER': 20,
      'MOVER': 40,
      'LEAVER': 10
    };
    score += typeRisk[spec.type] || 0;
    factors.push({
      factor: 'JML Type',
      weight: 0.3,
      value: typeRisk[spec.type] || 0,
      contribution: typeRisk[spec.type] || 0
    });

    // Risk by attribute change
    const attributeRisk = this.getAttributeRiskLevel(context.delta.attribute);
    score += attributeRisk;
    factors.push({
      factor: 'Attribute Change',
      weight: 0.2,
      value: attributeRisk,
      contribution: attributeRisk
    });

    // Risk by identity level
    if (identity.riskLevel) {
      const identityRisk = {
        'LOW': 0,
        'MEDIUM': 20,
        'HIGH': 40,
        'CRITICAL': 60
      };
      score += identityRisk[identity.riskLevel] || 0;
      factors.push({
        factor: 'Identity Risk Level',
        weight: 0.3,
        value: identityRisk[identity.riskLevel] || 0,
        contribution: identityRisk[identity.riskLevel] || 0
      });
    }

    // Risk by SoD violations
    const accessPlan = this.buildAccessPlan(await this.evaluateBirthright(identity));
    const sodResult = await this.evaluateSoD(accessPlan);
    if (sodResult.violations.length > 0) {
      const sodRisk = sodResult.violations.length * 15;
      score += sodRisk;
      factors.push({
        factor: 'SoD Violations',
        weight: 0.2,
        value: sodRisk,
        contribution: sodRisk
      });
    }

    // Normalize score to 0-100
    score = Math.min(100, Math.max(0, score));

    return {
      score,
      level: this.calculateRiskLevel(score),
      factors,
      recommendations: this.generateRiskRecommendations(score, factors)
    };
  }

  private getAttributeRiskLevel(attribute: string): number {
    const riskLevels: Record<string, number> = {
      'employmentStatus': 30,
      'department': 25,
      'location': 20,
      'managerId': 35,
      'title': 15,
      'company': 40,
      'division': 30,
      'grade': 25,
      'costCenter': 20,
      'startDate': 10,
      'endDate': 15
    };
    return riskLevels[attribute] || 10;
  }

  private calculateRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private generateRiskRecommendations(score: number, factors: RiskFactor[]): string[] {
    const recommendations: string[] = [];

    if (score >= 60) {
      recommendations.push('Require additional approval from IAM Admin');
      recommendations.push('Schedule manual review before execution');
    }

    if (factors.some(f => f.factor === 'SoD Violations' && f.value > 0)) {
      recommendations.push('Review and resolve SoD violations before proceeding');
    }

    if (score >= 40) {
      recommendations.push('Consider phased rollout for high-risk changes');
    }

    return recommendations;
  }

  private async evaluateBirthright(identity: Partial<Identity>): Promise<BirthrightResult> {
    // Mock birthright evaluation - in production this would be more sophisticated
    const roles: Role[] = [];
    const entitlements: Entitlement[] = [];

    // Basic role assignment based on department
    if (identity.department) {
      switch (identity.department.toLowerCase()) {
        case 'engineering':
          roles.push({
            id: 'role-engineer',
            name: 'Software Engineer',
            description: 'Standard engineering role',
            permissions: ['read:code', 'write:code', 'deploy:staging']
          });
          break;
        case 'sales':
          roles.push({
            id: 'role-sales',
            name: 'Sales Representative',
            description: 'Sales team member',
            permissions: ['read:crm', 'write:crm', 'view:reports']
          });
          break;
        case 'finance':
          roles.push({
            id: 'role-finance',
            name: 'Finance Analyst',
            description: 'Finance team member',
            permissions: ['read:financials', 'write:budgets', 'view:reports']
          });
          break;
      }
    }

    // Add basic entitlements
    entitlements.push({
      id: 'ent-basic-access',
      name: 'Basic System Access',
      description: 'Standard system access',
      type: 'APPLICATION',
      applicationId: 'app-basic',
      permissions: ['read:profile', 'update:profile']
    });

    return {
      roles,
      entitlements,
      confidence: 0.8,
      reasoning: `Assigned roles based on department: ${identity.department}`
    };
  }

  private buildAccessPlan(birthrightResult: BirthrightResult): AccessPlan {
    return {
      addedRoles: birthrightResult.roles.map(r => r.id),
      removedRoles: [],
      addedEntitlements: birthrightResult.entitlements.map(e => e.id),
      removedEntitlements: [],
      existingRoles: [],
      existingEntitlements: []
    };
  }

  private async evaluateSoD(accessPlan: AccessPlan): Promise<SoDResult> {
    // Mock SoD evaluation
    const violations: SoDViolation[] = [];

    // Check for common SoD violations
    const hasFinanceRole = accessPlan.addedRoles.includes('role-finance');
    const hasAccountingRole = accessPlan.addedRoles.includes('role-accounting');
    
    if (hasFinanceRole && hasAccountingRole) {
      violations.push({
        id: 'sod-finance-accounting',
        description: 'Finance and Accounting roles cannot be assigned to the same person',
        conflictingItems: ['role-finance', 'role-accounting'],
        severity: 'HIGH',
        mitigationOptions: [
          'Remove one of the conflicting roles',
          'Add compensating controls',
          'Require additional approval'
        ]
      });
    }

    return {
      violations,
      severity: violations.length > 0 ? 'HIGH' : 'LOW',
      recommendations: violations.length > 0 ? 
        ['Review and resolve SoD violations'] : 
        ['No SoD violations detected']
    };
  }

  private buildApprovalChain(spec: JMLActionSpec): any[] {
    const approvals: any[] = [];

    if (spec.requireManagerApproval) {
      approvals.push({
        step: 1,
        approverRole: 'MANAGER',
        approverType: 'MANAGER',
        isRequired: true,
        dueDays: 3,
        status: 'PENDING'
      });
    }

    if (spec.approvalsChain) {
      spec.approvalsChain.forEach(approval => {
        approvals.push({
          step: approval.step,
          approverRole: approval.approverRole,
          approverType: approval.approverType,
          isRequired: approval.isRequired,
          dueDays: approval.dueDays,
          status: 'PENDING'
        });
      });
    }

    return approvals;
  }

  private buildTaskList(spec: JMLActionSpec): any[] {
    const tasks: any[] = [];

    switch (spec.type) {
      case 'JOINER':
        tasks.push({
          id: 'task-create-accounts',
          name: 'Create User Accounts',
          description: 'Create accounts in target systems',
          status: 'PENDING',
          priority: 'HIGH'
        });
        tasks.push({
          id: 'task-assign-roles',
          name: 'Assign Birthright Roles',
          description: 'Assign default roles and permissions',
          status: 'PENDING',
          priority: 'HIGH'
        });
        break;
      case 'MOVER':
        tasks.push({
          id: 'task-update-access',
          name: 'Update Access Rights',
          description: 'Modify access based on new role/department',
          status: 'PENDING',
          priority: 'MEDIUM'
        });
        break;
      case 'LEAVER':
        tasks.push({
          id: 'task-disable-accounts',
          name: 'Disable User Accounts',
          description: 'Disable all user accounts',
          status: 'PENDING',
          priority: 'HIGH'
        });
        tasks.push({
          id: 'task-revoke-access',
          name: 'Revoke All Access',
          description: 'Remove all roles and permissions',
          status: 'PENDING',
          priority: 'HIGH'
        });
        break;
    }

    return tasks;
  }

  private async generateTriggerExplanation(context: TriggerContext, ruleId: string): Promise<string> {
    const { delta, isrId } = context;
    
    return `This ${ruleId} was triggered because the ${delta.attribute} attribute changed from "${delta.before}" to "${delta.after}" at ${delta.timestamp}. This change was detected by ISR ${isrId} and matched the trigger conditions for automatic JML request creation.`;
  }

  // Public methods for managing trigger rules
  async createTriggerRule(rule: Partial<JMLTriggerRule>): Promise<JMLTriggerRule> {
    const newRule = await isrService.createTriggerRule(rule);
    this.triggerRules.push(newRule);
    return newRule;
  }

  async updateTriggerRule(id: string, updates: Partial<JMLTriggerRule>): Promise<JMLTriggerRule> {
    const updatedRule = await isrService.updateTriggerRule(id, updates);
    const index = this.triggerRules.findIndex(r => r.id === id);
    if (index !== -1) {
      this.triggerRules[index] = updatedRule;
    }
    return updatedRule;
  }

  async deleteTriggerRule(id: string): Promise<void> {
    // This would be implemented in the ISR service
    this.triggerRules = this.triggerRules.filter(r => r.id !== id);
  }

  getTriggerRules(): JMLTriggerRule[] {
    return [...this.triggerRules];
  }

  getAttributeDeltas(): AttributeDelta[] {
    return [...this.attributeDeltas];
  }
}

// Export singleton instance
export const jmlTriggerEngine = new JMLTriggerEngine();
