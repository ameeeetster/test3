// AI Service Implementation with Deterministic Mocks
// Provides AI capabilities for JML processes with stable demo responses

import { 
  AiService, 
  IdentityContext, 
  DecisionContext, 
  JmlRequestDraft,
  AiSuggestion,
  AiAnomaly,
  JmlRequest,
  AuditEvent,
  RiskLevel,
  JmlType
} from '../types/jml';

// Deterministic AI Service Implementation
export class MockAiService implements AiService {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  // TODO: Replace with real AI model integration
  async suggestAccess(identityContext: IdentityContext): Promise<AiSuggestion[]> {
    // Deterministic suggestions based on identity context
    const suggestions: AiSuggestion[] = [];
    
    // Role suggestions based on department and employment type
    if (identityContext.identity.department === 'Engineering') {
      suggestions.push({
        id: 'suggest-1',
        type: 'ROLE',
        title: 'Software Engineer Role',
        description: 'Standard engineering access with development tools',
        confidence: 0.95,
        rationale: 'High confidence based on department and peer patterns',
        riskLevel: 'LOW',
        peerComparison: {
          similarIdentities: 45,
          averageAccess: ['GitHub', 'Jira', 'AWS Dev', 'Docker']
        }
      });

      if (identityContext.identity.employmentType === 'PERMANENT') {
        suggestions.push({
          id: 'suggest-2',
          type: 'ENTITLEMENT',
          title: 'Production Access',
          description: 'Limited production environment access',
          confidence: 0.78,
          rationale: 'Permanent employees typically get production access after 30 days',
          riskLevel: 'MEDIUM',
          sodConflicts: ['Production Admin + Security Auditor']
        });
      }
    }

    if (identityContext.identity.department === 'Finance') {
      suggestions.push({
        id: 'suggest-3',
        type: 'ROLE',
        title: 'Finance Analyst Role',
        description: 'Financial systems and reporting access',
        confidence: 0.92,
        rationale: 'Standard finance department role with appropriate controls',
        riskLevel: 'MEDIUM',
        sodConflicts: ['Finance Approver + Payment Processor']
      });
    }

    if (identityContext.identity.department === 'Sales') {
      suggestions.push({
        id: 'suggest-4',
        type: 'ENTITLEMENT',
        title: 'CRM Access',
        description: 'Salesforce and customer management tools',
        confidence: 0.88,
        rationale: 'Essential for sales team productivity',
        riskLevel: 'LOW',
        peerComparison: {
          similarIdentities: 23,
          averageAccess: ['Salesforce', 'HubSpot', 'Zoom']
        }
      });
    }

    // Manager-specific suggestions
    if (identityContext.identity.managerId) {
      suggestions.push({
        id: 'suggest-5',
        type: 'ENTITLEMENT',
        title: 'Manager Dashboard',
        description: 'Team management and reporting tools',
        confidence: 0.85,
        rationale: 'Manager-level access for team oversight',
        riskLevel: 'MEDIUM'
      });
    }

    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  }

  // TODO: Replace with real anomaly detection model
  async detectAnomalies(jmlPayload: JmlRequest): Promise<AiAnomaly[]> {
    const anomalies: AiAnomaly[] = [];

    // Check for high-privilege access for interns
    if (jmlPayload.identity.employmentType === 'INTERN' && 
        jmlPayload.changeSet.addedEntitlements.some(e => e.includes('Admin'))) {
      anomalies.push({
        id: 'anomaly-1',
        type: 'ACCESS_RISK',
        severity: 'HIGH',
        title: 'High-privilege access for intern',
        description: 'Intern requesting administrative access typically reserved for permanent employees',
        signal: 'Employment type vs. requested access mismatch',
        recommendation: 'Review access requirements and consider intern-specific roles',
        confidence: 0.92
      });
    }

    // Check for immediate start with high-risk access
    const effectiveDate = new Date(jmlPayload.effectiveDate);
    const today = new Date();
    const daysDiff = Math.ceil((effectiveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 1 && jmlPayload.riskLevel === 'HIGH') {
      anomalies.push({
        id: 'anomaly-2',
        type: 'SCHEDULE_RISK',
        severity: 'MEDIUM',
        title: 'Immediate high-risk access',
        description: 'High-risk access requested for immediate implementation',
        signal: 'Short notice period for high-risk provisioning',
        recommendation: 'Consider phased rollout or additional approval steps',
        confidence: 0.78
      });
    }

    // Check for unusual department transfers
    if (jmlPayload.type === 'MOVER' && 
        jmlPayload.changeSet.modifiedAttributes.department) {
      const fromDept = jmlPayload.changeSet.modifiedAttributes.department.before;
      const toDept = jmlPayload.changeSet.modifiedAttributes.department.after;
      
      if ((fromDept === 'Finance' && toDept === 'Engineering') || 
          (fromDept === 'Engineering' && toDept === 'Finance')) {
        anomalies.push({
          id: 'anomaly-3',
          type: 'PEER_DEVIATION',
          severity: 'MEDIUM',
          title: 'Cross-functional department transfer',
          description: 'Unusual transfer between Finance and Engineering departments',
          signal: 'Departments with different access patterns and controls',
          recommendation: 'Verify transfer legitimacy and review access requirements',
          confidence: 0.65
        });
      }
    }

    // Check for weekend/holiday terminations
    if (jmlPayload.type === 'LEAVER') {
      const effectiveDate = new Date(jmlPayload.effectiveDate);
      const dayOfWeek = effectiveDate.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
        anomalies.push({
          id: 'anomaly-4',
          type: 'SCHEDULE_RISK',
          severity: 'LOW',
          title: 'Weekend termination',
          description: 'Termination scheduled for weekend',
          signal: 'Non-standard business day termination',
          recommendation: 'Consider business day termination for better support coverage',
          confidence: 0.60
        });
      }
    }

    return anomalies;
  }

  // TODO: Replace with real explanation model
  async explain(decisionContext: DecisionContext): Promise<string> {
    const { request, policies } = decisionContext;
    
    let explanation = `Access decision for ${request.identity.displayName}:\n\n`;
    
    // Explain birthright access
    const birthrightPolicies = policies.filter(p => p.type === 'BIRTHRIGHT');
    if (birthrightPolicies.length > 0) {
      explanation += `Birthright Access:\n`;
      birthrightPolicies.forEach(policy => {
        explanation += `• ${policy.name}: ${policy.description}\n`;
      });
      explanation += '\n';
    }

    // Explain risk factors
    explanation += `Risk Assessment:\n`;
    explanation += `• Identity Risk Score: ${request.riskScore}/100\n`;
    explanation += `• Risk Level: ${request.riskLevel}\n`;
    explanation += `• Employment Type: ${request.identity.employmentType}\n`;
    explanation += `• Department: ${request.identity.department}\n\n`;

    // Explain SoD considerations
    const sodPolicies = policies.filter(p => p.type === 'SOD');
    if (sodPolicies.length > 0) {
      explanation += `Separation of Duties:\n`;
      sodPolicies.forEach(policy => {
        explanation += `• ${policy.name}: ${policy.description}\n`;
      });
      explanation += '\n';
    }

    // Explain peer comparison
    explanation += `Peer Analysis:\n`;
    explanation += `• Similar roles in ${request.identity.department} typically receive standard access\n`;
    explanation += `• Manager approval required for elevated privileges\n`;
    explanation += `• Standard onboarding timeline: 2-3 business days\n\n`;

    explanation += `Recommendation: ${request.riskLevel === 'LOW' ? 'Approve with standard access' : 'Review additional controls'}`;

    return explanation;
  }

  // TODO: Replace with real NLP model
  async parseNl(commandText: string): Promise<JmlRequestDraft> {
    const text = commandText.toLowerCase();
    
    // Extract entities using simple pattern matching
    const entities: Record<string, any> = {};
    
    // Extract names (simple pattern)
    const nameMatch = text.match(/(?:for|create|move|terminate)\s+([a-z\s]+?)(?:\s+starting|\s+to|\s+today)/i);
    if (nameMatch) {
      entities.name = nameMatch[1].trim();
    }

    // Extract dates
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|next monday|today|tomorrow)/i);
    if (dateMatch) {
      entities.date = dateMatch[1];
    }

    // Extract departments
    const deptMatch = text.match(/(?:in|to)\s+(engineering|finance|sales|hr|marketing|it)/i);
    if (deptMatch) {
      entities.department = deptMatch[1];
    }

    // Extract managers
    const managerMatch = text.match(/manager\s+([a-z\s]+)/i);
    if (managerMatch) {
      entities.manager = managerMatch[1].trim();
    }

    // Determine JML type
    let type: JmlType = 'JOINER';
    if (text.includes('move') || text.includes('transfer')) {
      type = 'MOVER';
    } else if (text.includes('terminate') || text.includes('offboard') || text.includes('leaver')) {
      type = 'LEAVER';
    }

    // Generate confidence based on extracted entities
    const confidence = Object.keys(entities).length / 4;

    return {
      type,
      effectiveDate: entities.date || new Date().toISOString().split('T')[0],
      extractedEntities: entities,
      confidence,
      comments: `AI-generated from: "${commandText}"`
    };
  }

  // TODO: Replace with real summarization model
  async summarize(events: AuditEvent[]): Promise<string> {
    if (events.length === 0) return 'No events to summarize';

    const summary = events.map(event => {
      const timestamp = new Date(event.timestamp).toLocaleString();
      return `${timestamp}: ${event.actorName} ${event.action} ${event.object}`;
    }).join('\n');

    return `Activity Summary:\n${summary}`;
  }
}

// AI Service Factory
export function createAiService(seed?: number): AiService {
  return new MockAiService(seed);
}

// Example AI responses for demo purposes
export const DEMO_AI_RESPONSES = {
  suggestAccess: {
    engineering: [
      {
        id: 'demo-1',
        type: 'ROLE' as const,
        title: 'Software Engineer Role',
        description: 'Standard engineering access with development tools',
        confidence: 0.95,
        rationale: 'High confidence based on department and peer patterns',
        riskLevel: 'LOW' as RiskLevel,
        peerComparison: {
          similarIdentities: 45,
          averageAccess: ['GitHub', 'Jira', 'AWS Dev', 'Docker']
        }
      }
    ],
    finance: [
      {
        id: 'demo-2',
        type: 'ROLE' as const,
        title: 'Finance Analyst Role',
        description: 'Financial systems and reporting access',
        confidence: 0.92,
        rationale: 'Standard finance department role with appropriate controls',
        riskLevel: 'MEDIUM' as RiskLevel,
        sodConflicts: ['Finance Approver + Payment Processor']
      }
    ]
  },
  
  anomalies: [
    {
      id: 'demo-anomaly-1',
      type: 'ACCESS_RISK' as const,
      severity: 'HIGH' as RiskLevel,
      title: 'High-privilege access for intern',
      description: 'Intern requesting administrative access typically reserved for permanent employees',
      signal: 'Employment type vs. requested access mismatch',
      recommendation: 'Review access requirements and consider intern-specific roles',
      confidence: 0.92
    }
  ],

  explanations: {
    joiner: 'Access decision for new hire: Birthright policies apply based on department and role. Standard onboarding includes basic system access with manager approval for elevated privileges.',
    mover: 'Role change analysis: Department transfer requires access review. Previous access will be removed and new department-specific access will be provisioned.',
    leaver: 'Termination process: Immediate account disable, phased access removal over 7 days, data retention per policy, manager notification for data handover.'
  },

  nlCommands: [
    'Create joiner for Ava Patel starting 2025-01-15 in Finance, London, manager EMP00123',
    'Move EMP00987 to Engineering (DevOps) next Monday 09:00; propose access',
    'Terminate EMP00421 today 17:00; immediate disable; mailbox retain 30 days; manager data access',
    'Explain why Salesforce Admin was suggested for EMP00777; show SoD risks'
  ]
};

