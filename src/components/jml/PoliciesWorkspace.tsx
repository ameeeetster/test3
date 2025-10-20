// Policies Workspace - Birthright Rules, SoD Matrix, and Policy Testing
// Comprehensive policy management with AI-powered testing and validation

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Shield, Zap, AlertTriangle, CheckCircle, XCircle, Plus, 
  Edit, Trash2, Eye, Play, Download, Upload, Search, Filter,
  Users, Building, MapPin, Calendar, Mail, Phone, User,
  Target, Info, HelpCircle, Sparkles, ArrowRight, ArrowUp, ArrowDown,
  MoreHorizontal
} from 'lucide-react';
import { 
  Policy, SodConflict, RiskLevel, PolicyRule, PolicyCondition, PolicyAction,
  Identity, Role, Entitlement 
} from '../../types/jml';
import { mockDataService } from '../../services/mockDataService';
import { createAiService } from '../../services/aiService';

export function PoliciesWorkspace() {
  const [activeTab, setActiveTab] = useState('birthright');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => createAiService());

  // Get data from services
  const policies = mockDataService.getPolicies();
  const sodConflicts = mockDataService.getSodConflicts();
  const identities = mockDataService.getIdentities();
  const roles = mockDataService.getRoles();
  const entitlements = mockDataService.getEntitlements();

  const getRiskColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'BIRTHRIGHT': return 'text-blue-600 bg-blue-100';
      case 'SOD': return 'text-red-600 bg-red-100';
      case 'RISK': return 'text-orange-600 bg-orange-100';
      case 'CERTIFICATION': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const testPolicy = async (policy: Policy, testData: any) => {
    setIsLoading(true);
    
    // Simulate policy testing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = {
      id: `test-${Date.now()}`,
      policyId: policy.id,
      policyName: policy.name,
      testData,
      matches: Math.random() > 0.3, // Simulate test result
      matchedConditions: policy.rule.conditions.slice(0, Math.floor(Math.random() * policy.rule.conditions.length) + 1),
      recommendedActions: policy.rule.actions,
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [result, ...prev]);
    setIsLoading(false);
  };

  const BirthrightRulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Birthright Rules</h3>
          <p className="text-sm text-muted-foreground">
            Attribute-driven access mapping for new hires
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1" />
          New Birthright Rule
        </Button>
      </div>

      {/* Birthright Policies */}
      <div className="space-y-4">
        {policies.filter(p => p.type === 'BIRTHRIGHT').map(policy => (
          <Card key={policy.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getPolicyTypeColor(policy.type)}`}>
                    {policy.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Priority {policy.rule.priority}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Conditions */}
                <div>
                  <h4 className="font-medium mb-2">Conditions</h4>
                  <div className="space-y-2">
                    {policy.rule.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded border bg-card">
                        <span className="font-medium">{condition.field}</span>
                        <span className="text-muted-foreground">{condition.operator}</span>
                        <Badge variant="outline" className="text-xs">
                          {Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
                        </Badge>
                        {condition.logicalOperator && (
                          <Badge variant="secondary" className="text-xs">
                            {condition.logicalOperator}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="space-y-2">
                    {policy.rule.actions.map((action, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded border bg-card">
                        <Badge variant="outline" className="text-xs">
                          {action.type.replace('_', ' ')}
                        </Badge>
                        <span className="font-medium">{action.target}</span>
                        {action.parameters && (
                          <span className="text-xs text-muted-foreground">
                            {JSON.stringify(action.parameters)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Policy Tester */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Sparkles className="w-5 h-5" />
            Policy Tester
          </CardTitle>
          <CardDescription className="text-blue-700">
            Test birthright policies with sample identity attributes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERMANENT">Permanent</SelectItem>
                    <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                    <SelectItem value="INTERN">Intern</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="San Francisco">San Francisco</SelectItem>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="Chicago">Chicago</SelectItem>
                    <SelectItem value="London">London</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input placeholder="Enter company" defaultValue="ACME Corp" />
              </div>
            </div>
            <Button onClick={() => testPolicy(policies[0], { department: 'Engineering', employmentType: 'PERMANENT' })}>
              <Play className="w-4 h-4 mr-1" />
              Test Policies
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Policy evaluation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map(result => (
                <div key={result.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.policyName}</span>
                      <Badge variant="outline" className={`text-xs ${result.matches ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                        {result.matches ? 'MATCH' : 'NO MATCH'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {result.matchedConditions.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Matched conditions: {result.matchedConditions.length}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const SoDMatrixTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Separation of Duties Matrix</h3>
          <p className="text-sm text-muted-foreground">
            Conflicting roles and entitlements with severity levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-1" />
            Import Matrix
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            New SoD Rule
          </Button>
        </div>
      </div>

      {/* SoD Conflicts */}
      <div className="space-y-4">
        {sodConflicts.map(conflict => (
          <Card key={conflict.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <CardTitle className="text-lg">{conflict.ruleName}</CardTitle>
                    <CardDescription>{conflict.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getRiskColor(conflict.severity)}`}>
                    {conflict.severity}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {conflict.conflictingRoles.length + conflict.conflictingEntitlements.length} conflicts
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Conflicting Roles */}
                {conflict.conflictingRoles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Conflicting Roles</h4>
                    <div className="flex flex-wrap gap-1">
                      {conflict.conflictingRoles.map(roleId => {
                        const role = roles.find(r => r.id === roleId);
                        return role ? (
                          <Badge key={roleId} variant="outline" className="text-xs">
                            {role.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Conflicting Entitlements */}
                {conflict.conflictingEntitlements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Conflicting Entitlements</h4>
                    <div className="flex flex-wrap gap-1">
                      {conflict.conflictingEntitlements.map(entId => {
                        const entitlement = entitlements.find(e => e.id === entId);
                        return entitlement ? (
                          <Badge key={entId} variant="outline" className="text-xs">
                            {entitlement.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Mitigation Options */}
                <div>
                  <h4 className="font-medium mb-2">Mitigation Options</h4>
                  <div className="space-y-1">
                    {conflict.mitigationOptions.map((option, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {option}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Test Conflict
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What-if Tester */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Target className="w-5 h-5" />
            What-if Access Checker
          </CardTitle>
          <CardDescription className="text-orange-700">
            Test access combinations for SoD conflicts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Roles</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roles" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proposed Roles</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select additional roles" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button>
              <Play className="w-4 h-4 mr-1" />
              Check for Conflicts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const RiskPolicyTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Risk Policies</h3>
          <p className="text-sm text-muted-foreground">
            Risk scoring weights and thresholds
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1" />
          New Risk Policy
        </Button>
      </div>

      {/* Risk Policies */}
      <div className="space-y-4">
        {policies.filter(p => p.type === 'RISK').map(policy => (
          <Card key={policy.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <div>
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getPolicyTypeColor(policy.type)}`}>
                    {policy.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Priority {policy.rule.priority}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Risk Weights */}
                <div>
                  <h4 className="font-medium mb-2">Risk Weights</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Identity Risk</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Entitlement Risk</span>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SoD Presence</span>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Peer Deviation</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Geo/Time Anomalies</span>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Thresholds */}
                <div>
                  <h4 className="font-medium mb-2">Risk Thresholds</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-2 rounded border bg-green-50">
                      <div className="text-sm font-medium text-green-800">Low</div>
                      <div className="text-xs text-green-600">0-25</div>
                    </div>
                    <div className="text-center p-2 rounded border bg-yellow-50">
                      <div className="text-sm font-medium text-yellow-800">Medium</div>
                      <div className="text-xs text-yellow-600">26-50</div>
                    </div>
                    <div className="text-center p-2 rounded border bg-orange-50">
                      <div className="text-sm font-medium text-orange-800">High</div>
                      <div className="text-xs text-orange-600">51-75</div>
                    </div>
                    <div className="text-center p-2 rounded border bg-red-50">
                      <div className="text-sm font-medium text-red-800">Critical</div>
                      <div className="text-xs text-red-600">76-100</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Test Scoring
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Calculator */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Zap className="w-5 h-5" />
            Risk Calculator
          </CardTitle>
          <CardDescription className="text-purple-700">
            Calculate risk score for specific access combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Identity Risk Score</Label>
                <Input type="number" placeholder="0-100" />
              </div>
              <div className="space-y-2">
                <Label>Entitlement Risk Score</Label>
                <Input type="number" placeholder="0-100" />
              </div>
              <div className="space-y-2">
                <Label>SoD Conflicts</Label>
                <Input type="number" placeholder="Number of conflicts" />
              </div>
              <div className="space-y-2">
                <Label>Peer Deviation</Label>
                <Input type="number" placeholder="Deviation percentage" />
              </div>
            </div>
            <Button>
              <Zap className="w-4 h-4 mr-1" />
              Calculate Risk Score
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-background border-b">
        <div className="p-6 max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold">Policies Workspace</h1>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Policy Management
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Birthright rules, SoD matrix, risk policies, and policy testing
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export Policies
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Import Policies
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Policy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1800px] mx-auto w-full flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="birthright">Birthright Rules</TabsTrigger>
            <TabsTrigger value="sod">SoD Matrix</TabsTrigger>
            <TabsTrigger value="risk">Risk Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="birthright" className="space-y-6">
            <BirthrightRulesTab />
          </TabsContent>

          <TabsContent value="sod" className="space-y-6">
            <SoDMatrixTab />
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <RiskPolicyTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
