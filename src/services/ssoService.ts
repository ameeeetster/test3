/**
 * SSO Provider Configuration Service
 * 
 * This service handles SSO provider configuration using Supabase Management API
 * All SSO configuration can be done from the UI without accessing Supabase Dashboard
 */

import { supabase } from '../lib/supabase';

export interface SSOProviderConfig {
  id?: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth';
  enabled: boolean;
  // SAML Configuration
  samlEntityId?: string;
  samlSSOUrl?: string;
  samlCertificate?: string;
  samlMetadataUrl?: string;
  // OIDC Configuration
  oidcIssuerUrl?: string;
  oidcClientId?: string;
  oidcClientSecret?: string;
  // OAuth Configuration
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthScopes?: string;
  // Common
  redirectUri: string;
  attributeMapping?: {
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    [key: string]: string | undefined;
  };
  // Policies
  jitProvisioning?: boolean;
  defaultRole?: string;
  allowedDomains?: string[];
}

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth';
  status: 'configured' | 'not-configured' | 'disabled';
  lastTest?: string;
  signIns?: number;
  enabled: boolean;
}

export class SSOService {
  /**
   * Configure a SAML SSO provider
   * This uses Supabase Management API to configure SSO without going to Dashboard
   */
  static async configureSAMLProvider(config: SSOProviderConfig): Promise<SSOProvider> {
    try {
      // Get Supabase project URL and service role key from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

      if (!serviceRoleKey) {
        throw new Error('Service role key not configured. Please set VITE_SUPABASE_SERVICE_ROLE_KEY');
      }

      // Use Supabase Management API to configure SAML
      // Note: This requires calling Supabase's internal API or using an edge function
      // For now, we'll use an edge function approach
      
      const { data, error } = await supabase.functions.invoke('configure-sso-provider', {
        body: {
          type: 'saml',
          name: config.name,
          enabled: config.enabled,
          saml_entity_id: config.samlEntityId,
          saml_sso_url: config.samlSSOUrl,
          saml_certificate: config.samlCertificate,
          saml_metadata_url: config.samlMetadataUrl,
          redirect_uri: config.redirectUri,
          attribute_mapping: config.attributeMapping,
          jit_provisioning: config.jitProvisioning ?? true,
          default_role: config.defaultRole,
          allowed_domains: config.allowedDomains,
        }
      });

      if (error) {
        throw new Error(`Failed to configure SAML provider: ${error.message}`);
      }

      return {
        id: data.id || crypto.randomUUID(),
        name: config.name,
        type: 'saml',
        status: config.enabled ? 'configured' : 'disabled',
        enabled: config.enabled,
      };
    } catch (error: any) {
      console.error('Error configuring SAML provider:', error);
      throw error;
    }
  }

  /**
   * Configure an OIDC SSO provider
   */
  static async configureOIDCProvider(config: SSOProviderConfig): Promise<SSOProvider> {
    try {
      const { data, error } = await supabase.functions.invoke('configure-sso-provider', {
        body: {
          type: 'oidc',
          name: config.name,
          enabled: config.enabled,
          oidc_issuer_url: config.oidcIssuerUrl,
          oidc_client_id: config.oidcClientId,
          oidc_client_secret: config.oidcClientSecret,
          redirect_uri: config.redirectUri,
          oauth_scopes: config.oauthScopes || 'openid email profile',
          attribute_mapping: config.attributeMapping,
          jit_provisioning: config.jitProvisioning ?? true,
          default_role: config.defaultRole,
          allowed_domains: config.allowedDomains,
        }
      });

      if (error) {
        throw new Error(`Failed to configure OIDC provider: ${error.message}`);
      }

      return {
        id: data.id || crypto.randomUUID(),
        name: config.name,
        type: 'oidc',
        status: config.enabled ? 'configured' : 'disabled',
        enabled: config.enabled,
      };
    } catch (error: any) {
      console.error('Error configuring OIDC provider:', error);
      throw error;
    }
  }

  /**
   * Get all configured SSO providers
   */
  static async getProviders(): Promise<SSOProvider[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-sso-providers', {});

      if (error) {
        throw new Error(`Failed to fetch SSO providers: ${error.message}`);
      }

      return data?.providers || [];
    } catch (error: any) {
      console.error('Error fetching SSO providers:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Test SSO provider configuration
   */
  static async testProvider(providerId: string, testEmail?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('test-sso-provider', {
        body: {
          provider_id: providerId,
          test_email: testEmail,
        }
      });

      if (error) {
        throw new Error(`Failed to test provider: ${error.message}`);
      }

      return {
        success: data?.success || false,
        message: data?.message || 'Test completed',
      };
    } catch (error: any) {
      console.error('Error testing SSO provider:', error);
      return {
        success: false,
        message: error.message || 'Test failed',
      };
    }
  }

  /**
   * Update SSO provider configuration
   */
  static async updateProvider(providerId: string, config: Partial<SSOProviderConfig>): Promise<SSOProvider> {
    try {
      const { data, error } = await supabase.functions.invoke('update-sso-provider', {
        body: {
          provider_id: providerId,
          ...config,
        }
      });

      if (error) {
        throw new Error(`Failed to update provider: ${error.message}`);
      }

      return data?.provider || config as SSOProvider;
    } catch (error: any) {
      console.error('Error updating SSO provider:', error);
      throw error;
    }
  }

  /**
   * Disable/Enable SSO provider
   */
  static async toggleProvider(providerId: string, enabled: boolean): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('toggle-sso-provider', {
        body: {
          provider_id: providerId,
          enabled,
        }
      });

      if (error) {
        throw new Error(`Failed to toggle provider: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error toggling SSO provider:', error);
      throw error;
    }
  }

  /**
   * Delete SSO provider
   */
  static async deleteProvider(providerId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('delete-sso-provider', {
        body: {
          provider_id: providerId,
        }
      });

      if (error) {
        throw new Error(`Failed to delete provider: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error deleting SSO provider:', error);
      throw error;
    }
  }

  /**
   * Get SSO metadata URLs for configuration
   * These are the URLs you need to provide to your IdP (Ping/Okta/AD)
   */
  static getMetadataUrls(): {
    entityId: string;
    acsUrl: string;
    metadataUrl: string;
  } {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    return {
      entityId: `${supabaseUrl}/auth/v1/saml/metadata`,
      acsUrl: `${supabaseUrl}/auth/v1/callback`,
      metadataUrl: `${supabaseUrl}/auth/v1/saml/metadata`,
    };
  }
}

