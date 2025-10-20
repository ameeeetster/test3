// JML Request Details Drawer
// Comprehensive view of individual JML requests with timeline, approvals, tasks, and AI insights

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { 
  X, UserPlus, UserCog, UserMinus, CheckCircle, XCircle, Clock, 
  AlertCircle, RefreshCw, Eye, Edit, Copy, Download, MoreHorizontal,
  Calendar, User, Building, Shield, Zap, Activity, FileText, 
  ArrowRight, ArrowUp, ArrowDown, Play, Pause, RotateCcw
} from 'lucide-react';
import { 
  JmlRequest, JmlType, JmlStatus, RiskLevel, ApprovalState, TaskState,
  Approval, TaskRun, AiSuggestion, AiAnomaly 
} from '../../types/jml';
import { AttributeDelta, TriggerContext } from '../../types/isr';
import { mockDataService } from '../../services/mockDataService';

interface JmlRequestDetailsProps {
  request: JmlRequest;
  onClose: () => void;
  onUpdate: (request: JmlRequest) => void;
}

export function JmlRequestDetails({ request, onClose, onUpdate }: JmlRequestDetailsProps) {
  const [activeTab, setActiveTab] = useState('timeline');
  const [isLoading, setIsLoading] = useState(false);
  const [triggerSource, setTriggerSource] = useState<{
    isrId: string;
    attribute: string;
    beforeValue: any;
    afterValue: any;
    timestamp: string;
    correlationId: string;
    explanation: string;
  } | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  useEffect(() => {
    // Load trigger source information if this request was auto-generated
    if (request.correlationId && request.justification?.includes('triggered by ISR')) {
      loadTriggerSource();
    }
  }, [request.correlationId]);

  const loadTriggerSource = async () => {
    // Mock trigger source data - in production this would come from the audit service
    const mockTriggerSource = {
      isrId: 'isr-hris',
      attribute: 'employmentStatus',
      beforeValue: 'PENDING',
      afterValue: 'ACTIVE',
      timestamp: request.submittedAt,
      correlationId: request.correlationId,
      explanation: `This request was automatically triggered when the ${request.changeSet?.attributeChanges ? Object.keys(request.changeSet.attributeChanges)[0] : 'employmentStatus'} attribute changed in the HRIS system.`
    };
    setTriggerSource(mockTriggerSource);
  };

  const getStatusColor = (status: JmlStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'text-yellow-600 bg-yellow-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getApprovalStateColor = (state: ApprovalState) => {
    switch (state) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'DELEGATED': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStateColor = (state: TaskState) => {
    switch (state) {
      case 'PENDING': return 'text-gray-600 bg-gray-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'RETRYING': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: JmlType) => {
    switch (type) {
      case 'JOINER': return <UserPlus className="w-5 h-5 text-green-600" />;
      case 'MOVER': return <UserCog className="w-5 h-5 text-blue-600" />;
      case 'LEAVER': return <UserMinus className="w-5 h-5 text-red-600" />;
      default: return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleApproval = async (approvalId: string, action: 'APPROVE' | 'REJECT') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedRequest = {
      ...request,
      approvals: request.approvals.map(approval => 
        approval.id === approvalId 
          ? { ...approval, state: action, comments: approvalComment, submittedAt: new Date().toISOString() }
          : approval
      ),
      status: action === 'APPROVE' ? 'IN_PROGRESS' : 'REJECTED' as JmlStatus
    };
    
    onUpdate(updatedRequest);
    setApprovalComment('');
    setIsLoading(false);
  };

  const handleRetryTask = async (taskId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedRequest = {
      ...request,
      tasks: request.tasks.map(task => 
        task.id === taskId 
          ? { ...task, state: 'RETRYING' as TaskState, retryCount: task.retryCount + 1 }
          : task
      )
    };
    
    onUpdate(updatedRequest);
    setIsLoading(false);
  };

  const handleBulkRetry = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedRequest = {
      ...request,
      tasks: request.tasks.map(task => 
        task.state === 'FAILED'
          ? { ...task, state: 'RETRYING' as TaskState, retryCount: task.retryCount + 1 }
          : task
      )
    };
    
    onUpdate(updatedRequest);
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProgressPercentage = () => {
    const totalTasks = request.tasks.length;
    const completedTasks = request.tasks.filter(t => t.state === 'COMPLETED').length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTypeIcon(request.type)}
              <div>
                <h2 className="text-xl font-semibold">{request.identity.displayName}</h2>
                <p className="text-sm text-muted-foreground">
                  {request.type} Request • {request.identity.department} • {formatDate(request.submittedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${getStatusColor(request.status)}`}>
                {request.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getRiskColor(request.riskLevel)}`}>
                {request.riskLevel} RISK
              </Badge>
              {request.slaBreached && (
                <Badge variant="destructive" className="text-xs">
                  SLA Breached
                </Badge>
              )}
              <Button variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="access">Access Plan</TabsTrigger>
              <TabsTrigger value="ai">AI Insights</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Request Timeline
                  </CardTitle>
                  <CardDescription>Complete audit trail of request activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Request Created */}
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Request Created</span>
                          <Badge variant="outline" className="text-xs">SYSTEM</Badge>
                          {triggerSource && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              <Zap className="w-3 h-3 mr-1" />
                              Auto-Generated
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.type} request created by {request.submittedByName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(request.createdAt)} • Correlation ID: {request.correlationId}
                        </p>
                      </div>
                    </div>

                    {/* Trigger Source Information */}
                    {triggerSource && (
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-blue-50 border-blue-200">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-blue-800">ISR Trigger Source</span>
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              {triggerSource.isrId}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-blue-700">Attribute Change:</span>
                              <Badge variant="outline" className="text-xs bg-white">
                                {triggerSource.attribute}
                              </Badge>
                              <ArrowRight className="w-3 h-3 text-blue-600" />
                              <span className="text-sm text-blue-700">
                                "{triggerSource.beforeValue}" → "{triggerSource.afterValue}"
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">
                              {triggerSource.explanation}
                            </p>
                            <p className="text-xs text-blue-600">
                              Detected at: {new Date(triggerSource.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Approvals */}
                    {request.approvals.map(approval => (
                      <div key={approval.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          approval.state === 'APPROVED' ? 'bg-green-500' :
                          approval.state === 'REJECTED' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {approval.state === 'APPROVED' ? 'Approved' : 
                               approval.state === 'REJECTED' ? 'Rejected' : 'Pending Approval'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {approval.approverRole}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {approval.approverName} {approval.state === 'PENDING' ? 'needs to approve' : 
                             approval.state === 'APPROVED' ? 'approved' : 'rejected'} this request
                          </p>
                          {approval.comments && (
                            <p className="text-sm mt-1 italic">"{approval.comments}"</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {approval.submittedAt ? formatDate(approval.submittedAt) : `Due: ${formatDate(approval.dueDate)}`}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Task Executions */}
                    {request.tasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          task.state === 'COMPLETED' ? 'bg-green-500' :
                          task.state === 'FAILED' ? 'bg-red-500' :
                          task.state === 'IN_PROGRESS' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{task.action}</span>
                            <Badge variant="outline" className="text-xs">
                              {task.connectorName}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getTaskStateColor(task.state)}`}>
                              {task.state}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Target: {task.target}
                          </p>
                          {task.message && (
                            <p className="text-sm mt-1">{task.message}</p>
                          )}
                          {task.errorDetails && (
                            <p className="text-sm mt-1 text-red-600">{task.errorDetails}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.startedAt ? `Started: ${formatDate(task.startedAt)}` : 'Not started'}
                            {task.completedAt && ` • Completed: ${formatDate(task.completedAt)}`}
                            {task.retryCount > 0 && ` • Retries: ${task.retryCount}`}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Status Changes */}
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Status Updated</span>
                          <Badge variant="outline" className="text-xs">SYSTEM</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Request status changed to {request.status}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(request.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Approval Workflow
                  </CardTitle>
                  <CardDescription>Current approval status and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {request.approvals.map(approval => (
                      <div key={approval.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              approval.state === 'APPROVED' ? 'bg-green-500' :
                              approval.state === 'REJECTED' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                            <div>
                              <h4 className="font-medium">{approval.approverName}</h4>
                              <p className="text-sm text-muted-foreground">{approval.approverRole}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getApprovalStateColor(approval.state)}`}>
                              {approval.state}
                            </Badge>
                            {approval.isRequired && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Due Date:</span>
                            <span className={approval.state === 'PENDING' && new Date(approval.dueDate) < new Date() ? 'text-red-600' : ''}>
                              {formatDate(approval.dueDate)}
                            </span>
                          </div>
                          {approval.submittedAt && (
                            <div className="flex items-center justify-between text-sm">
                              <span>Submitted:</span>
                              <span>{formatDate(approval.submittedAt)}</span>
                            </div>
                          )}
                          {approval.comments && (
                            <div className="mt-2 p-2 rounded bg-muted">
                              <p className="text-sm italic">"{approval.comments}"</p>
                            </div>
                          )}
                        </div>

                        {/* Approval Actions */}
                        {approval.state === 'PENDING' && (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              placeholder="Add approval comments..."
                              value={approvalComment}
                              onChange={e => setApprovalComment(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproval(approval.id, 'APPROVE')}
                                disabled={isLoading}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApproval(approval.id, 'REJECT')}
                                disabled={isLoading}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Task Execution
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkRetry}
                        disabled={isLoading || !request.tasks.some(t => t.state === 'FAILED')}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Retry Failed
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Connector execution status and retry options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Overview */}
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {request.tasks.filter(t => t.state === 'COMPLETED').length} / {request.tasks.length} completed
                        </span>
                      </div>
                      <Progress value={getProgressPercentage()} className="h-2" />
                    </div>

                    {/* Task List */}
                    {request.tasks.map(task => (
                      <div key={task.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              task.state === 'COMPLETED' ? 'bg-green-500' :
                              task.state === 'FAILED' ? 'bg-red-500' :
                              task.state === 'IN_PROGRESS' ? 'bg-blue-500' :
                              task.state === 'RETRYING' ? 'bg-orange-500' :
                              'bg-gray-500'
                            }`} />
                            <div>
                              <h4 className="font-medium">{task.action}</h4>
                              <p className="text-sm text-muted-foreground">{task.connectorName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getTaskStateColor(task.state)}`}>
                              {task.state}
                            </Badge>
                            {task.state === 'FAILED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRetryTask(task.id)}
                                disabled={isLoading || task.retryCount >= task.maxRetries}
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Target:</span>
                            <span className="font-mono text-xs">{task.target}</span>
                          </div>
                          {task.message && (
                            <div className="text-sm text-muted-foreground">
                              {task.message}
                            </div>
                          )}
                          {task.errorDetails && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              {task.errorDetails}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Retries: {task.retryCount}/{task.maxRetries}</span>
                            <span>Correlation: {task.correlationId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Access Plan Tab */}
            <TabsContent value="access" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Access Plan
                  </CardTitle>
                  <CardDescription>Roles and entitlements to be modified</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Roles */}
                    <div>
                      <h4 className="font-medium mb-3">Role Changes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {request.changeSet.addedRoles.length > 0 && (
                          <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowUp className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-800">Adding Roles</span>
                            </div>
                            <div className="space-y-1">
                              {request.changeSet.addedRoles.map(roleId => {
                                const role = mockDataService.getRole(roleId);
                                return role ? (
                                  <Badge key={roleId} variant="outline" className="text-xs mr-1">
                                    {role.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        
                        {request.changeSet.removedRoles.length > 0 && (
                          <div className="p-3 rounded-lg border bg-red-50 border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowDown className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-red-800">Removing Roles</span>
                            </div>
                            <div className="space-y-1">
                              {request.changeSet.removedRoles.map(roleId => {
                                const role = mockDataService.getRole(roleId);
                                return role ? (
                                  <Badge key={roleId} variant="outline" className="text-xs mr-1">
                                    {role.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Entitlements */}
                    <div>
                      <h4 className="font-medium mb-3">Entitlement Changes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {request.changeSet.addedEntitlements.length > 0 && (
                          <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowUp className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-800">Adding Entitlements</span>
                            </div>
                            <div className="space-y-1">
                              {request.changeSet.addedEntitlements.map(entId => {
                                const entitlement = mockDataService.getEntitlement(entId);
                                return entitlement ? (
                                  <div key={entId} className="text-xs">
                                    <span className="font-medium">{entitlement.name}</span>
                                    <span className="text-muted-foreground ml-1">({entitlement.applicationName})</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        
                        {request.changeSet.removedEntitlements.length > 0 && (
                          <div className="p-3 rounded-lg border bg-red-50 border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowDown className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-red-800">Removing Entitlements</span>
                            </div>
                            <div className="space-y-1">
                              {request.changeSet.removedEntitlements.map(entId => {
                                const entitlement = mockDataService.getEntitlement(entId);
                                return entitlement ? (
                                  <div key={entId} className="text-xs">
                                    <span className="font-medium">{entitlement.name}</span>
                                    <span className="text-muted-foreground ml-1">({entitlement.applicationName})</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attribute Changes */}
                    {Object.keys(request.changeSet.modifiedAttributes).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Attribute Changes</h4>
                        <div className="space-y-2">
                          {Object.entries(request.changeSet.modifiedAttributes).map(([key, change]) => (
                            <div key={key} className="flex items-center gap-2 p-2 rounded border bg-card">
                              <span className="font-medium capitalize">{key}:</span>
                              <span className="text-muted-foreground">{change.before}</span>
                              <ArrowRight className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{change.after}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Insights
                  </CardTitle>
                  <CardDescription>AI-generated suggestions, anomalies, and explanations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* AI Suggestions */}
                    {request.aiHints.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">AI Suggestions</h4>
                        <div className="space-y-3">
                          {request.aiHints.suggestions.map(suggestion => (
                            <div key={suggestion.id} className="p-3 rounded-lg border bg-card">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.type}
                                  </Badge>
                                  <span className="font-medium">{suggestion.title}</span>
                                  <Badge variant="outline" className={`text-xs ${getRiskColor(suggestion.riskLevel)}`}>
                                    {suggestion.riskLevel}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(suggestion.confidence * 100)}% confidence
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                              <p className="text-xs text-blue-600">{suggestion.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Anomalies */}
                    {request.aiHints.anomalies.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">AI Detected Anomalies</h4>
                        <div className="space-y-3">
                          {request.aiHints.anomalies.map(anomaly => (
                            <Alert key={anomaly.id} className="border-orange-200 bg-orange-50">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-orange-800">
                                <div className="font-medium">{anomaly.title}</div>
                                <p className="text-sm mt-1">{anomaly.description}</p>
                                <p className="text-xs mt-2 italic">Recommendation: {anomaly.recommendation}</p>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Explanation */}
                    {request.aiHints.explanation && (
                      <div>
                        <h4 className="font-medium mb-3">AI Explanation</h4>
                        <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                          <p className="text-sm text-blue-800">{request.aiHints.explanation}</p>
                        </div>
                      </div>
                    )}

                    {/* AI Confidence */}
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">AI Confidence</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(request.aiHints.confidence * 100)}%
                        </span>
                      </div>
                      <Progress value={request.aiHints.confidence * 100} className="h-2 mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Generated: {formatDate(request.aiHints.generatedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Request Notes
                  </CardTitle>
                  <CardDescription>Comments and additional context</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Request Comments</Label>
                      <div className="p-3 rounded-lg border bg-card mt-1">
                        <p className="text-sm">{request.comments || 'No comments provided'}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Additional Notes</Label>
                      <Textarea
                        placeholder="Add additional notes or context..."
                        className="min-h-[100px] mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Add Note
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export Notes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-1" />
                Copy Request
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export Evidence
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {request.status === 'PENDING_APPROVAL' && (
                <Button variant="destructive">
                  Cancel Request
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
