import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  User, 
  Shield, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { AnomalyAlerts } from '../components/AnomalyAlerts';
import { 
  RiskScoringService, 
  AnomalyDetectionService,
  RecommendationService,
  type AccessRecommendation 
} from '../services/ai';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface UserDetail {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  job_title: string;
  last_login_at: string | null;
}

/**
 * Enhanced User Detail Page with AI-Powered Insights
 */
export function EnhancedUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [recommendations, setRecommendations] = useState<AccessRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserData();
      loadRecommendations();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!userId) return;
    
    try {
      const recs = await RecommendationService.getRecommendationsForUser(userId);
      setRecommendations(recs.slice(0, 5)); // Top 5
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleRequestAccess = async (recommendation: AccessRecommendation) => {
    // TODO: Implement access request creation
    toast.success(`Requesting ${recommendation.resourceName}...`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">User Not Found</h3>
          <p className="text-muted-foreground">The requested user could not be found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Risk Badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{user.department}</Badge>
              <Badge variant="outline">{user.job_title}</Badge>
              {userId && <RiskBadge userId={userId} size="md" />}
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Insights Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="risk">
            <Shield className="w-4 h-4 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <TrendingUp className="w-4 h-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="text-lg font-semibold">{user.department}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Job Title</p>
                  <p className="text-lg font-semibold">{user.job_title}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="text-lg font-semibold">
                    {user.last_login_at 
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          {userId && <RiskBadge userId={userId} showDetails={true} />}
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-6">
          {userId && <AnomalyAlerts userId={userId} limit={10} />}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">AI-Powered Access Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Based on peer analysis and role patterns
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                AI-Powered
              </Badge>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No recommendations available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back later for AI-generated access suggestions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{rec.resourceName}</h4>
                          <Badge 
                            variant="outline"
                            className={
                              rec.priority === 'high' 
                                ? 'border-green-500 text-green-600'
                                : rec.priority === 'medium'
                                ? 'border-yellow-500 text-yellow-600'
                                : 'border-gray-500 text-gray-600'
                            }
                          >
                            {Math.round(rec.confidence * 100)}% Match
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rec.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.reason}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Priority: {rec.priority}</span>
                          <span>Type: {rec.resourceType}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRequestAccess(rec)}
                        className="ml-4"
                      >
                        Request Access
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
