// ISR Demo Page - Showcase Identity System of Record capabilities
// Demonstrates attribute-driven JML triggers and ISR management

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, Zap, Activity, Database, Users, ArrowRight, 
  CheckCircle, AlertTriangle, Clock, Play, Eye, Settings,
  RefreshCw, Download, FileText, BarChart3, TrendingUp
} from 'lucide-react';
import {
  IdentitySystemOfRecord, JMLTriggerRule, AttributeDelta, TriggerContext,
  ValidationResult, MappingSuggestion, ConflictDetection, RiskScore
} from '../types/isr';
import { JmlRequest } from '../types/jml';
import { isrService } from '../services/isrService';
import { jmlTriggerEngine } from '../services/jmlTriggerEngine';
import {
  sampleISRConfigurations, sampleTriggerRules, sampleAttributeDeltas,
  sampleTriggeredJMLRequests, demoScenarios, generateSampleData
} from '../data/isrFixtures';

export function ISRDemoPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isrs, setIsrs] = useState<IdentitySystemOfRecord[]>([]);
  const [triggerRules, setTriggerRules] = useState<JMLTriggerRule[]>([]);
  const [attributeDeltas, setAttributeDeltas] = useState<AttributeDelta[]>([]);
  const [triggeredRequests, setTriggeredRequests] = useState<JmlRequest[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const isrList = await isrService.listISRs();
    const rules = await isrService.listTriggerRules();
    setIsrs(isrList);
    setTriggerRules(rules);
    setAttributeDeltas(sampleAttributeDeltas);
    setTriggeredRequests(sampleTriggeredJMLRequests as JmlRequest[]);
  };

  const simulateTrigger = async (scenario: 'joiner' | 'mover' | 'leaver') => {
    setIsSimulating(true);
    
    try {
      const sampleData = generateSampleData(scenario);
      if (!sampleData) return;

      const { delta, jmlRequest, riskScore } = sampleData;
      
      // Simulate trigger evaluation
      const result = await jmlTriggerEngine.evaluateAttributeChange(
        delta.identityId,
        delta.attribute,
        delta.before,
        delta.after,
        delta.source,
        delta.correlationId
      );

      const simulationResult = {
        scenario,
        delta,
        triggerResult: result,
        jmlRequest,
        riskScore,
        timestamp: new Date().toISOString()
      };

      setSimulationResults(prev => [simulationResult, ...prev]);
      
      // Add to triggered requests
      setTriggeredRequests(prev => [jmlRequest as JmlRequest, ...prev]);
      
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active ISRs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isrs.length}</div>
            <p className="text-xs text-muted-foreground">
              Identity Systems of Record
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trigger Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggerRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Active trigger rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Generated Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggeredRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Demo Scenarios
          </CardTitle>
          <CardDescription>
            Test the ISR trigger engine with realistic scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(demoScenarios).map(([key, scenario]) => (
              <Card key={key} className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">{scenario.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {scenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => simulateTrigger(key as any)}
                    disabled={isSimulating}
                    className="w-full"
                    variant="outline"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Demo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {simulationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Simulations
            </CardTitle>
            <CardDescription>
              Results from recent trigger simulations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {simulationResults.slice(0, 5).map((result, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {result.scenario.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${
                        result.riskScore.level === 'LOW' ? 'text-green-600 bg-green-100' :
                        result.riskScore.level === 'MEDIUM' ? 'text-yellow-600 bg-yellow-100' :
                        result.riskScore.level === 'HIGH' ? 'text-orange-600 bg-orange-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {result.riskScore.level} RISK
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Attribute Change:</span>
                      <Badge variant="outline" className="text-xs">
                        {result.delta.attribute}
                      </Badge>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-sm">
                        "{result.delta.before}" → "{result.delta.after}"
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Triggered Rules:</span>
                      <span className="text-sm text-muted-foreground">
                        {result.triggerResult.triggeredRules.length} rules matched
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">JML Actions:</span>
                      <span className="text-sm text-muted-foreground">
                        {result.triggerResult.jmlActions.length} actions generated
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const ISRsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Identity Systems of Record</h3>
          <p className="text-sm text-muted-foreground">
            Configured ISRs and their attribute mastership
          </p>
        </div>
        <Button>
          <Shield className="w-4 h-4 mr-2" />
          Add ISR
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isrs.map((isr) => (
          <Card key={isr.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{isr.name}</CardTitle>
                  <CardDescription>{isr.description}</CardDescription>
                </div>
                <Badge variant={isr.isActive ? 'default' : 'secondary'}>
                  {isr.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Mastered Attributes</h4>
                  <div className="flex flex-wrap gap-1">
                    {isr.scope.masteredAttributes.slice(0, 6).map((attr) => (
                      <Badge key={attr} variant="outline" className="text-xs">
                        {attr}
                      </Badge>
                    ))}
                    {isr.scope.masteredAttributes.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{isr.scope.masteredAttributes.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Ingestion Mode</h4>
                  <Badge variant="outline" className="text-xs">
                    {isr.ingestionMode.type}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Change Detection</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${
                      isr.changeDetection.enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                    }`}>
                      {isr.changeDetection.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {isr.changeDetection.realTimeProcessing && (
                      <Badge variant="outline" className="text-xs text-blue-600 bg-blue-100">
                        Real-time
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TriggerRulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trigger Rules</h3>
          <p className="text-sm text-muted-foreground">
            Rules that automatically create JML requests based on attribute changes
          </p>
        </div>
        <Button>
          <Zap className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {triggerRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{rule.name}</CardTitle>
                  <CardDescription>{rule.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Priority {rule.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Trigger Conditions</h4>
                  <div className="space-y-2">
                    {rule.conditions.map((condition, index) => (
                      <div key={condition.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {condition.attribute}
                        </Badge>
                        <span className="text-muted-foreground">
                          {condition.operator.replace('_', ' ').toLowerCase()}
                        </span>
                        {condition.beforeValue && (
                          <span className="text-muted-foreground">
                            "{condition.beforeValue}" →
                          </span>
                        )}
                        {condition.afterValue && (
                          <span className="text-muted-foreground">
                            "{condition.afterValue}"
                          </span>
                        )}
                        {condition.value && (
                          <span className="text-muted-foreground">
                            "{condition.value}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">JML Action</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {rule.outputs.type}
                    </Badge>
                    {rule.outputs.autoSubmit && (
                      <Badge variant="outline" className="text-xs text-green-600 bg-green-100">
                        Auto-submit
                      </Badge>
                    )}
                    {rule.outputs.sodPreCheck && (
                      <Badge variant="outline" className="text-xs text-blue-600 bg-blue-100">
                        SoD Check
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Triggered {rule.triggerCount} times</span>
                  {rule.lastTriggered && (
                    <span>Last: {new Date(rule.lastTriggered).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ActivityTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trigger Activity</h3>
          <p className="text-sm text-muted-foreground">
            Recent attribute changes and triggered JML requests
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {attributeDeltas.map((delta, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {delta.source}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {delta.attribute}
                    </Badge>
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-sm">
                      "{delta.before}" → "{delta.after}"
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Identity: {delta.identityId} • {new Date(delta.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {delta.correlationId}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generated JML Requests
          </CardTitle>
          <CardDescription>
            Requests automatically created by trigger rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggeredRequests.map((request) => (
              <div key={request.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {request.type}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${
                      request.status === 'COMPLETED' ? 'text-green-600 bg-green-100' :
                      request.status === 'PENDING_APPROVAL' ? 'text-yellow-600 bg-yellow-100' :
                      request.status === 'IN_PROGRESS' ? 'text-blue-600 bg-blue-100' :
                      'text-gray-600 bg-gray-100'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${
                      request.riskLevel === 'LOW' ? 'text-green-600 bg-green-100' :
                      request.riskLevel === 'MEDIUM' ? 'text-yellow-600 bg-yellow-100' :
                      request.riskLevel === 'HIGH' ? 'text-orange-600 bg-orange-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {request.riskLevel} RISK
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(request.submittedAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Identity:</span> {request.identityRef}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Justification:</span> {request.justification}
                  </div>
                  {request.correlationId && (
                    <div className="text-xs text-muted-foreground">
                      Correlation ID: {request.correlationId}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ISR Demo</h1>
          <p className="text-muted-foreground">
            Identity System of Record - Attribute-driven JML triggers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="isrs">ISRs</TabsTrigger>
          <TabsTrigger value="rules">Trigger Rules</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="isrs">
          <ISRsTab />
        </TabsContent>

        <TabsContent value="rules">
          <TriggerRulesTab />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
