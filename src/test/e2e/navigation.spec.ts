import { test, expect } from '@playwright/test';

test.describe('Navigation and Layout E2E', () => {
  test('should navigate between all main pages', async ({ page }) => {
    await page.goto('/');
    
    // Test Home page
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Navigate to Requests
    await page.getByText('Requests').click();
    await expect(page.getByText('Access Requests')).toBeVisible();
    
    // Navigate to Identities
    await page.getByText('Identities').click();
    await expect(page.getByText('Identity Management')).toBeVisible();
    
    // Navigate to Access
    await page.getByText('Access').click();
    await expect(page.getByText('Role Management')).toBeVisible();
    
    // Navigate to Lifecycle
    await page.getByText('Lifecycle').click();
    await expect(page.getByText('Lifecycle Automation')).toBeVisible();
    
    // Navigate to Risk
    await page.getByText('Risk').click();
    await expect(page.getByText('Risk Management')).toBeVisible();
    
    // Navigate to Reports
    await page.getByText('Reports').click();
    await expect(page.getByText('Reports & Analytics')).toBeVisible();
    
    // Navigate to Integrations
    await page.getByText('Integrations').click();
    await expect(page.getByText('Integration Management')).toBeVisible();
    
    // Navigate to Settings
    await page.getByText('Settings').click();
    await expect(page.getByText('System Settings')).toBeVisible();
  });

  test('should show active navigation state', async ({ page }) => {
    await page.goto('/lifecycle');
    
    // Lifecycle should be active in sidebar
    const lifecycleNav = page.getByText('Lifecycle').locator('..');
    await expect(lifecycleNav).toHaveClass(/bg-accent/);
    
    // Other nav items should not be active
    const homeNav = page.getByText('Home').locator('..');
    await expect(homeNav).not.toHaveClass(/bg-accent/);
  });

  test('should handle role-based navigation', async ({ page }) => {
    await page.goto('/');
    
    // Should show role switcher
    await expect(page.getByText('Administrator')).toBeVisible();
    
    // Switch to End User role
    await page.getByText('Administrator').click();
    await page.getByText('End User').click();
    
    // Should show limited navigation
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Requests')).toBeVisible();
    
    // Should hide admin-only items
    await expect(page.getByText('Settings')).not.toBeVisible();
    await expect(page.getByText('Integrations')).not.toBeVisible();
  });

  test('should be responsive across different screen sizes', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Should show full sidebar
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Requests')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Should show collapsed sidebar
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Should show mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.getByText('Home')).toBeVisible();
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    await page.goto('/access/roles');
    
    // Should show breadcrumbs
    await expect(page.getByText('Access')).toBeVisible();
    await expect(page.getByText('Roles')).toBeVisible();
    
    // Click breadcrumb to go back
    await page.getByText('Access').click();
    await expect(page.getByText('Role Management')).toBeVisible();
  });

  test('should maintain state across navigation', async ({ page }) => {
    await page.goto('/requests');
    
    // Add item to cart
    const slackCard = page.getByText('Slack').locator('..').first();
    await slackCard.getByText('Add to Cart').click();
    
    // Navigate away and back
    await page.getByText('Home').click();
    await page.getByText('Requests').click();
    
    // Cart should still have item
    await expect(page.getByText('Request Cart')).toBeVisible();
    await expect(page.getByText('Slack')).toBeVisible();
  });

  test('should handle deep linking', async ({ page }) => {
    // Direct navigation to specific page
    await page.goto('/lifecycle');
    
    // Should load correct page
    await expect(page.getByText('Lifecycle Automation')).toBeVisible();
    
    // Should show correct active nav
    const lifecycleNav = page.getByText('Lifecycle').locator('..');
    await expect(lifecycleNav).toHaveClass(/bg-accent/);
  });

  test('should handle 404 and redirect to home', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page');
    
    // Should redirect to home
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});















