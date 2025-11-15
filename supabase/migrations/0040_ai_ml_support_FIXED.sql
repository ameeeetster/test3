-- AI/ML Support Tables (FIXED VERSION)
-- Migration for anomaly detection and ML predictions

-- Drop existing tables if they exist (to ensure clean state)
DROP TABLE IF EXISTS public.ml_predictions CASCADE;
DROP TABLE IF EXISTS public.ml_models CASCADE;
DROP TABLE IF EXISTS public.access_recommendations CASCADE;
DROP TABLE IF EXISTS public.risk_scores_history CASCADE;
DROP TABLE IF EXISTS public.anomalies CASCADE;

-- Anomalies Table
CREATE TABLE public.anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  user_id uuid REFERENCES auth.users(id),
  anomaly_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  metadata jsonb,
  detected_at timestamptz NOT NULL DEFAULT now(),
  reviewed boolean DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  false_positive boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for anomalies
CREATE INDEX idx_anomalies_user_detected 
  ON public.anomalies(user_id, detected_at DESC);

CREATE INDEX idx_anomalies_org_unreviewed 
  ON public.anomalies(organization_id, reviewed) 
  WHERE reviewed = false;

CREATE INDEX idx_anomalies_severity 
  ON public.anomalies(severity, detected_at DESC);

CREATE INDEX idx_anomalies_type 
  ON public.anomalies(anomaly_type, detected_at DESC);

-- ML Models Table (for future ML model tracking)
CREATE TABLE public.ml_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  model_type text NOT NULL, -- 'anomaly', 'risk', 'recommendation'
  model_name text NOT NULL,
  version text NOT NULL,
  algorithm text, -- 'rule_based', 'random_forest', 'neural_network', etc.
  training_data_summary jsonb,
  accuracy_metrics jsonb, -- precision, recall, f1_score, etc.
  deployed_at timestamptz,
  is_active boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ml_models_org_active 
  ON public.ml_models(organization_id, is_active);

-- ML Predictions Table (for tracking predictions and feedback)
CREATE TABLE public.ml_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES public.ml_models(id),
  organization_id uuid REFERENCES public.organizations(id),
  entity_type text NOT NULL, -- 'user', 'request', 'role', etc.
  entity_id uuid NOT NULL,
  prediction_type text NOT NULL,
  prediction_value jsonb NOT NULL, -- The actual prediction
  confidence_score float CHECK (confidence_score >= 0 AND confidence_score <= 1),
  actual_outcome jsonb, -- For tracking accuracy
  feedback text, -- User feedback on prediction
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ml_predictions_entity 
  ON public.ml_predictions(entity_type, entity_id, created_at DESC);

CREATE INDEX idx_ml_predictions_model 
  ON public.ml_predictions(model_id, created_at DESC);

-- Access Recommendations Table
CREATE TABLE public.access_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  user_id uuid REFERENCES auth.users(id),
  recommendation_type text NOT NULL,
  resource_type text NOT NULL, -- 'role', 'entitlement', 'application'
  resource_id uuid NOT NULL,
  resource_name text NOT NULL,
  confidence float CHECK (confidence >= 0 AND confidence <= 1),
  reason text NOT NULL,
  priority text CHECK (priority IN ('low', 'medium', 'high')),
  metadata jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  accepted_at timestamptz,
  rejected_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendations_user_pending 
  ON public.access_recommendations(user_id, status) 
  WHERE status = 'pending';

CREATE INDEX idx_recommendations_org_status 
  ON public.access_recommendations(organization_id, status, created_at DESC);

-- Risk Scores History (for tracking risk over time)
CREATE TABLE public.risk_scores_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  entity_type text NOT NULL, -- 'user', 'request', 'role'
  entity_id uuid NOT NULL,
  risk_score int CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  risk_factors jsonb, -- Array of factors contributing to score
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_history_entity 
  ON public.risk_scores_history(entity_type, entity_id, calculated_at DESC);

CREATE INDEX idx_risk_history_org_level 
  ON public.risk_scores_history(organization_id, risk_level, calculated_at DESC);

-- Row Level Security
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anomalies
CREATE POLICY anomalies_org_isolation ON public.anomalies
  FOR ALL
  USING (
    organization_id = current_setting('app.current_org_id', true)::uuid
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = anomalies.user_id 
      AND users.organization_id = current_setting('app.current_org_id', true)::uuid
    )
  );

-- RLS Policies for ml_models
CREATE POLICY ml_models_org_isolation ON public.ml_models
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- RLS Policies for ml_predictions
CREATE POLICY ml_predictions_org_isolation ON public.ml_predictions
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- RLS Policies for access_recommendations
CREATE POLICY recommendations_user_access ON public.access_recommendations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY recommendations_org_manage ON public.access_recommendations
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- RLS Policies for risk_scores_history
CREATE POLICY risk_history_org_isolation ON public.risk_scores_history
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- Helper function to store risk score in history
CREATE OR REPLACE FUNCTION store_risk_score_history(
  p_org_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_risk_score int,
  p_risk_level text,
  p_risk_factors jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_history_id uuid;
BEGIN
  INSERT INTO public.risk_scores_history (
    organization_id,
    entity_type,
    entity_id,
    risk_score,
    risk_level,
    risk_factors,
    calculated_at
  ) VALUES (
    p_org_id,
    p_entity_type,
    p_entity_id,
    p_risk_score,
    p_risk_level,
    p_risk_factors,
    now()
  ) RETURNING id INTO v_history_id;

  RETURN v_history_id;
END;
$$;

-- Function to clean up old predictions and history (data retention)
CREATE OR REPLACE FUNCTION cleanup_ml_data(retention_days int DEFAULT 90)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up old predictions
  DELETE FROM public.ml_predictions
  WHERE created_at < now() - (retention_days || ' days')::interval;

  -- Clean up old risk scores (keep 1 per day per entity)
  DELETE FROM public.risk_scores_history rsh1
  WHERE EXISTS (
    SELECT 1 FROM public.risk_scores_history rsh2
    WHERE rsh2.entity_type = rsh1.entity_type
    AND rsh2.entity_id = rsh1.entity_id
    AND rsh2.calculated_at::date = rsh1.calculated_at::date
    AND rsh2.calculated_at > rsh1.calculated_at
  )
  AND calculated_at < now() - (retention_days || ' days')::interval;

  -- Clean up old anomalies that have been reviewed
  DELETE FROM public.anomalies
  WHERE reviewed = true
  AND reviewed_at < now() - (retention_days || ' days')::interval;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.anomalies TO authenticated;
GRANT SELECT ON public.ml_models TO authenticated;
GRANT SELECT, INSERT ON public.ml_predictions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.access_recommendations TO authenticated;
GRANT SELECT, INSERT ON public.risk_scores_history TO authenticated;
