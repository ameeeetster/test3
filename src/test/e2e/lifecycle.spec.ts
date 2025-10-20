import { test, expect } from '@playwright/test';

test.describe('Lifecycle Automation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lifecycle');
  });

  test('should display lifecycle dashboard with analytics', async ({ page }) => {
    // Should show overview section by default
    await expect(page.getByText('Overview & Analytics')).toBeVisible();
    
    // Should show key metrics
    await expect(page.getByText('Success Rate')).toBeVisible();
    await expect(page.getByText('Executions Today')).toBeVisible();
    await expect(page.getByText('Compliance Score')).toBeVisible();
    
    // Should show live monitoring badge
    await expect(page.getByText('Live Monitoring')).toBeVisible();
  });

  test('should navigate between lifecycle sections', async ({ page }) => {
    // Test navigation to Joiner section
    await page.getByText('Joiner Automation').click();
    await expect(page.getByText('Joiner Automation')).toBeVisible();
    await expect(page.getByText('12 rules')).toBeVisible();
    
    // Test navigation to Mover section
    await page.getByText('Mover Automation').click();
    await expect(page.getByText('Mover Automation')).toBeVisible();
    await expect(page.getByText('8 rules')).toBeVisible();
    
    // Test navigation to Leaver section
    await page.getByText('Leaver Automation').click();
    await expect(page.getByText('Leaver Automation')).toBeVisible();
    await expect(page.getByText('5 rules')).toBeVisible();
  });

  test('should open simulation drawer and run test', async ({ page }) => {
    // Click Run Simulation button
    await page.getByText('Run Simulation').click();
    
    // Should open simulation drawer
    await expect(page.getByText('Workflow Simulation & Testing')).toBeVisible();
    
    // Should show test scenarios tab
    await expect(page.getByText('Test Scenarios')).toBeVisible();
    
    // Select a test scenario
    await page.getByText('Standard Engineering Hire').click();
    
    // Should show scenario details
    await expect(page.getByText('Typical software engineer onboarding')).toBeVisible();
    await expect(page.getByText('Engineering')).toBeVisible();
    await expect(page.getByText('Software Engineer')).toBeVisible();
    
    // Run simulation
    await page.getByText('Run Simulation').click();
    
    // Should show progress
    await expect(page.getByText('Running Simulation...')).toBeVisible();
    
    // Wait for results (simulated)
    await page.waitForTimeout(3000);
    
    // Should show results
    await expect(page.getByText('Simulation Results')).toBeVisible();
  });

  test('should display joiner rules with detailed information', async ({ page }) => {
    await page.getByText('Joiner Automation').click();
    
    // Should show joiner rules
    await expect(page.getByText('Engineering New Hires')).toBeVisible();
    await expect(page.getByText('Standard Employee Onboarding')).toBeVisible();
    
    // Should show rule metrics
    await expect(page.getByText('Conditions')).toBeVisible();
    await expect(page.getByText('Actions')).toBeVisible();
    await expect(page.getByText('Executions')).toBeVisible();
    await expect(page.getByText('Success Rate')).toBeVisible();
    
    // Should show risk levels and tags
    await expect(page.getByText('high risk')).toBeVisible();
    await expect(page.getByText('Requires Approval')).toBeVisible();
  });

  test('should show compliance and risk section', async ({ page }) => {
    await page.getByText('Compliance & Risk').click();
    
    // Should show compliance metrics
    await expect(page.getByText('Compliance Score')).toBeVisible();
    await expect(page.getByText('SoD Violations')).toBeVisible();
    await expect(page.getByText('Active Exceptions')).toBeVisible();
    
    // Should show SoD controls
    await expect(page.getByText('Separation of Duties (SoD) Controls')).toBeVisible();
    
    // Should show risk exceptions
    await expect(page.getByText('Risk Exceptions')).toBeVisible();
  });

  test('should display monitoring dashboard', async ({ page }) => {
    await page.getByText('Monitoring & Alerts').click();
    
    // Should show monitoring metrics
    await expect(page.getByText('Active Workflows')).toBeVisible();
    await expect(page.getByText('Queue Depth')).toBeVisible();
    await expect(page.getByText('Error Rate')).toBeVisible();
    
    // Should show performance metrics
    await expect(page.getByText('CPU Usage')).toBeVisible();
    await expect(page.getByText('Memory Usage')).toBeVisible();
    
    // Should show active alerts
    await expect(page.getByText('Active Alerts')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should show mobile navigation
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Click mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Should show navigation items
    await expect(page.getByText('Overview & Analytics')).toBeVisible();
    await expect(page.getByText('Joiner Automation')).toBeVisible();
  });
});

