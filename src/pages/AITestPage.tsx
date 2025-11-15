import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RiskScoringService } from '../services/ai/riskScoringService';
import { AnomalyDetectionService } from '../services/ai/anomalyDetectionService';
import { RecommendationService } from '../services/ai/recommendationService';
import { RiskBadge } from '../components/RiskBadge';
import { AnomalyAlerts } from '../components/AnomalyAlerts';
import type { UserRiskScore, Anomaly, AccessRecommendation } from '../services/ai/types';

export function AITestPage() {
  const [userId, setUserId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Test functions
  const testUserRisk = async () => {
    setLoading(true);
    try {
      const risk = await RiskScoringService.calculateUserRiskScore(userId);
      setResult(risk);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testRequestRisk = async () => {
    setLoading(true);
    try {
      const risk = await RiskScoringService.calculateRequestRiskScore(requestId);
      setResult(risk);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAnomalies = async () => {
    setLoading(true);
    try {
      const anomalies = await AnomalyDetectionService.detectAnomalies(userId);
      setResult(anomalies);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testRecommendations = async () => {
    setLoading(true);
    try {
      const recommendations = await RecommendationService.getAccessRecommendations(
        userId,
        searchTerm || undefined
      );
      setResult(recommendations);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testOrgStats = async () => {
    setLoading(true);
    try {
      const stats = await RiskScoringService.getOrganizationRiskStats(orgId);
      setResult(stats);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Services Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Test the AI/ML services with real data
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user UUID"
              />
            </div>
            <div>
              <Label htmlFor="requestId">Request ID</Label>
              <Input
                id="requestId"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                placeholder="Enter request UUID"
              />
            </div>
            <div>
              <Label htmlFor="orgId">Organization ID</Label>
              <Input
                id="orgId"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                placeholder="Enter organization UUID"
              />
            </div>
            <div>
              <Label htmlFor="searchTerm">Search Term (for recommendations)</Label>
              <Input
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., 'admin' or 'access'"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={testUserRisk} 
              disabled={!userId || loading}
              variant="default"
            >
              {loading ? 'Testing...' : 'Test User Risk'}
            </Button>
            <Button 
              onClick={testRequestRisk} 
              disabled={!requestId || loading}
              variant="default"
            >
              {loading ? 'Testing...' : 'Test Request Risk'}
            </Button>
            <Button 
              onClick={testAnomalies} 
              disabled={!userId || loading}
              variant="default"
            >
              {loading ? 'Testing...' : 'Test Anomalies'}
            </Button>
            <Button 
              onClick={testRecommendations} 
              disabled={!userId || loading}
              variant="default"
            >
              {loading ? 'Testing...' : 'Test Recommendations'}
            </Button>
            <Button 
              onClick={testOrgStats} 
              disabled={!orgId || loading}
              variant="default"
            >
              {loading ? 'Testing...' : 'Test Org Stats'}
            </Button>
            <Button 
              onClick={() => setResult(null)} 
              variant="outline"
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Component Tests */}
      {userId && (
        <Card>
          <CardHeader>
            <CardTitle>Component Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Risk Badge Component</Label>
              <div className="mt-2">
                <RiskBadge 
                  score={45} 
                  level="Medium" 
                  size="lg"
                  showScore={true}
                />
              </div>
            </div>
            <div>
              <Label>Anomaly Alerts Component</Label>
              <div className="mt-2">
                <AnomalyAlerts userId={userId} limit={5} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Getting Test IDs</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Run these queries in Supabase SQL Editor:
            </p>
            <pre className="bg-muted p-3 rounded text-xs">
{`-- Get a User ID
SELECT id, email FROM users LIMIT 1;

-- Get a Request ID  
SELECT id, request_number FROM access_requests LIMIT 1;

-- Get Organization ID
SELECT id, name FROM organizations LIMIT 1;`}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Test Scenarios</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>User Risk:</strong> Calculate risk score (0-100) for a user</li>
              <li><strong>Request Risk:</strong> Calculate risk for an access request</li>
              <li><strong>Anomalies:</strong> Detect security threats for a user</li>
              <li><strong>Recommendations:</strong> Get AI-suggested access</li>
              <li><strong>Org Stats:</strong> View risk distribution across organization</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
