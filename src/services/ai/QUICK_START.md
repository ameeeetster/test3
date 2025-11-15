# Quick Start: Integrating AI Services

This guide will help you integrate the AI services into your IAM application in **15 minutes**.

## ✅ Step 1: Import the Services (30 seconds)

```typescript
// In any component or service file
import { 
  RiskScoringService, 
  AnomalyDetectionService, 
  RecommendationEngine 
} from '@/services/ai';
```

---

## ✅ Step 2: Add Risk Badges to User Lists (2 minutes)

**File:** `src/pages/EnhancedIdentitiesPage.tsx`

```typescript
// Add this to your user table/list component
import { RiskScoringService } from '@/services/ai';
import { useState, useEffect } from 'react';

function UserRow({ user }) {
  const [riskScore, setRiskScore] = useState(null);
  
  useEffect(() => {
    RiskScoringService.calculateUserRiskScore(user.id)
      .then(setRiskScore)
      .catch(console.error);
  }, [user.id]);
  
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        {riskScore && (
          <Badge 
            variant={
              riskScore.level === 'Critical' ? 'destructive' :
              riskScore.level === 'High' ? 'warning' :
              riskScore.level === 'Medium' ? 'default' : 'success'
            }
          >
            {riskScore.level} ({riskScore.score})
          </Badge>
        )}
      </td>
    </tr>
  );
}
```

---

## ✅ Step 3: Update Dashboard with AI Insights (5 minutes)

**File:** `src/pages/HomePage.tsx`

Replace the mock `aiSuggestions` data with real AI insights:

```typescript
import { AnomalyDetectionService, RecommendationEngine } from '@/services/ai';

export function HomePage() {
  const { user } = useUser();
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAIInsights() {
      try {
        setLoading(true);
        
        // Get anomalies (critical and high only)
        const anomalies = await AnomalyDetectionService.detectUserAnomalies(user.id);
        const criticalAnomalies = anomalies.filter(
          a => a.severity === 'critical' || a.severity === 'high'
        );
        
        // Get recommendations (high priority only)
        const recommendations = await RecommendationEngine.getAccessRecommendations(user.id);
        const highPriorityRecs = recommendations.filter(
          r => r.priority === 'high' || r.priority === 'critical'
        );
        
        // Combine into AI insights
        const insights = [
          ...criticalAnomalies.slice(0, 3).map(anomaly => ({
            type: 'alert' as const,
            title: anomaly.title,
            description: anomaly.description,
            action: 'Investigate',
            severity: anomaly.severity
          })),
          ...highPriorityRecs.slice(0, 2).map(rec => ({
            type: 'recommendation' as const,
            title: rec.title,
            description: rec.reason,
            action: 'Review',
            confidence: rec.confidence
          }))
        ];
        
        setAiInsights(insights);
      } catch (error) {
        console.error('Error loading AI insights:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAIInsights();
  }, [user.id]);

  return (
    <div className="p-6">
      {/* ... existing dashboard content ... */}
      
      {/* Replace mock AIPanel with real data */}
      <div className="lg:col-span-1">
        {loading ? (
          <Card className="p-6">
            <div className="animate-pulse">Loading AI insights...</div>
          </Card>
        ) : (
          <AIPanel suggestions={aiInsights} />
        )}
      </div>
    </div>
  );
}
```

---

## ✅ Step 4: Add Risk Scoring to Access Requests (3 minutes)

**File:** `src/services/requestsService.ts`

Update the `create` method to calculate risk automatically:

```typescript
import { RiskScoringService } from './ai';

export class RequestsService {
  static async create(input: CreateAccessRequestInput) {
    // ... existing code ...
    
    // Calculate risk score automatically
    const tempRequest = {
      id: 'temp',
      resource_type: input.resource_type,
      resource_name: input.resource_name,
      priority: input.priority,
      business_justification: input.business_justification,
      sod_conflicts_count: input.sod_conflicts_count || 0,
      submitted_at: new Date().toISOString(),
      requester_id: userId
    };
    
    const riskScore = await RiskScoringService.calculateRequestRiskScore(tempRequest);
    
    // Add risk score to payload
    const payload = {
      ...existingPayload,
      risk_score: riskScore.score,
      risk_level: riskScore.level
    };
    
    // ... rest of create logic ...
  }
}
```

---

## ✅ Step 5: Add Anomaly Alerts (3 minutes)

**File:** Create `src/hooks/useAnomalyMonitoring.ts`

```typescript
import { useEffect, useState } from 'react';
import { AnomalyDetectionService } from '@/services/ai';
import { toast } from 'sonner';

export function useAnomalyMonitoring(userId: string, enabled = true) {
  const [anomalies, setAnomalies] = useState([]);
  
  useEffect(() => {
    if (!enabled || !userId) return;
    
    // Check for anomalies every 5 minutes
    const checkAnomalies = async () => {
      try {
        const detected = await AnomalyDetectionService.detectUserAnomalies(userId);
        const critical = detected.filter(a => a.severity === 'critical');
        
        // Show toast for new critical anomalies
        critical.forEach(anomaly => {
          toast.error(anomaly.title, {
            description: anomaly.description,
            action: {
              label: 'View Details',
              onClick: () => console.log('Navigate to anomaly details', anomaly)
            }
          });
        });
        
        setAnomalies(detected);
      } catch (error) {
        console.error('Anomaly detection error:', error);
      }
    };
    
    // Check immediately
    checkAnomalies();
    
    // Then check every 5 minutes
    const interval = setInterval(checkAnomalies, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userId, enabled]);
  
  return { anomalies };
}
```

**Usage in AppShell or ProtectedLayout:**

```typescript
import { useAnomalyMonitoring } from '@/hooks/useAnomalyMonitoring';

export function ProtectedLayout() {
  const { user } = useUser();
  
  // Enable anomaly monitoring for all authenticated users
  useAnomalyMonitoring(user?.id, true);
  
  return (
    // ... your layout
  );
}
```

---

## ✅ Step 6: Add Recommendations Panel (2 minutes)

**File:** Create `src/components/RecommendationsPanel.tsx`

```typescript
import { useEffect, useState } from 'react';
import { RecommendationEngine, Recommendation } from '@/services/ai';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function RecommendationsPanel({ userId }: { userId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    RecommendationEngine.getAccessRecommendations(userId)
      .then(recs => setRecommendations(recs.slice(0, 5))) // Top 5
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);
  
  if (loading) return <div>Loading recommendations...</div>;
  if (recommendations.length === 0) return null;
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Recommended Access</h3>
      
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div key={i} className="p-3 border rounded">
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-sm">{rec.resourceName}</div>
              <Badge variant="outline">
                {Math.round(rec.confidence * 100)}%
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {rec.reason}
            </p>
            
            <div className="flex gap-2">
              <Button size="sm" onClick={() => console.log('Request access', rec)}>
                Request
              </Button>
              <Button size="sm" variant="ghost">
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

**Add to user profile page:**

```typescript
// In IdentityDetailDrawer or user profile
<RecommendationsPanel userId={user.id} />
```

---

## 🎯 Testing Your Integration

### 1. Test Risk Scoring

Open your browser console and run:

```javascript
// In browser console (after importing services)
const userId = 'your-user-uuid';
RiskScoringService.calculateUserRiskScore(userId).then(console.log);
```

**Expected output:**
```javascript
{
  score: 45,
  level: "Medium",
  factors: [
    {
      category: "Privileged Roles",
      description: "Has 2 administrative roles: Admin, Manager",
      points: 20,
      severity: "warning"
    }
    // ... more factors
  ],
  confidence: 0.8
}
```

### 2. Test Anomaly Detection

```javascript
AnomalyDetectionService.detectUserAnomalies(userId).then(console.log);
```

### 3. Test Recommendations

```javascript
RecommendationEngine.getAccessRecommendations(userId).then(console.log);
```

---

## 📊 See Results Immediately

After completing these steps, you should see:

1. ✅ **Risk badges** on user lists (Low/Medium/High/Critical)
2. ✅ **AI insights** on dashboard (anomalies + recommendations)
3. ✅ **Automatic risk scoring** on access requests
4. ✅ **Real-time anomaly alerts** (toast notifications)
5. ✅ **Recommendation panel** on user profiles

---

## 🚀 Next Steps

### Week 2: Enhanced Features

1. **Add Risk Details Modal**
   - Show full risk factors breakdown
   - Display risk score history/trends
   - Add "Recalculate" button

2. **Anomaly Investigation Page**
   - List all detected anomalies
   - Filter by severity/type
   - Mark as false positive
   - Add investigation notes

3. **Smart Approval Routing**
   - Auto-approve low-risk requests
   - Route high-risk to senior approvers
   - Add approval recommendations

4. **Recommendation Actions**
   - One-click request from recommendations
   - Bulk accept recommendations
   - Dismiss and give feedback

### Week 3: Admin Features

1. **Risk Dashboard**
   - Organization-wide risk stats
   - Risk trends over time
   - Top risk users
   - Risk by department

2. **Anomaly Dashboard**
   - Real-time anomaly feed
   - Anomaly statistics
   - False positive rate tracking
   - Investigation queue

3. **Recommendation Settings**
   - Configure birthright rules
   - Adjust confidence thresholds
   - Customize peer group logic

---

## 🐛 Common Issues

### Issue: "Cannot find module '@/services/ai'"

**Solution:** The `@/` alias should be configured in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Issue: Services return empty results

**Solution:** Check that your database has:
- Users with role assignments
- Audit logs table (for anomaly detection)
- Access requests history (for recommendations)

### Issue: Performance is slow

**Solution:** 
1. Implement caching (see README.md)
2. Use batch methods for multiple users
3. Run heavy computations in background jobs

---

## 📞 Need Help?

- Check the full documentation: `src/services/ai/README.md`
- Review code examples in each service file
- Look at TypeScript types for API reference

---

**Time to Complete:** 15 minutes  
**Difficulty:** Easy ⭐  
**Result:** Production-ready AI features! 🎉
