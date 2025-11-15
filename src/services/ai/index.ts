/**
 * AI Services Index
 * 
 * Intelligent rule-based AI services for IAM/IGA
 * - Risk Scoring: Calculate risk scores for users and requests
 * - Anomaly Detection: Detect suspicious patterns and behaviors
 * - Recommendations: Suggest optimal access based on peer groups
 */

export { RiskScoringService } from './riskScoringService';
export { AnomalyDetectionService } from './anomalyDetectionService';
export { RecommendationService } from './recommendationService';

export type { RiskScore, RiskFactor } from './riskScoringService';
export type { Anomaly, AnomalyType } from './anomalyDetectionService';
export type { AccessRecommendation, RecommendationType } from './recommendationService';
