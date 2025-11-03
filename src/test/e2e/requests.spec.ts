import { test, expect } from '@playwright/test';

test.describe('Access Request Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/requests');
  });

  test('should display requests page with catalog', async ({ page }) => {
    // Should show requests page
    await expect(page.getByText('Access Requests')).toBeVisible();
    
    // Should show request catalog
    await expect(page.getByText('Request Catalog')).toBeVisible();
    
    // Should show categories
    await expect(page.getByText('Applications')).toBeVisible();
    await expect(page.getByText('Roles')).toBeVisible();
    await expect(page.getByText('Groups')).toBeVisible();
  });

  test('should allow searching and filtering requests', async ({ page }) => {
    // Test search functionality
    const searchInput = page.getByPlaceholder('Search applications, roles, or groups...');
    await searchInput.fill('Slack');
    
    // Should filter results
    await expect(page.getByText('Slack')).toBeVisible();
    
    // Test category filter
    await page.getByText('Applications').click();
    
    // Should show only applications
    await expect(page.getByText('Slack')).toBeVisible();
    await expect(page.getByText('GitHub')).toBeVisible();
  });

  test('should add items to request cart', async ({ page }) => {
    // Add Slack to cart
    const slackCard = page.getByText('Slack').locator('..').first();
    await slackCard.getByText('Add to Cart').click();
    
    // Should show in cart
    await expect(page.getByText('Request Cart')).toBeVisible();
    await expect(page.getByText('Slack')).toBeVisible();
    
    // Should show cart count
    await expect(page.getByText('1 item')).toBeVisible();
  });

  test('should handle request submission workflow', async ({ page }) => {
    // Add item to cart
    const slackCard = page.getByText('Slack').locator('..').first();
    await slackCard.getByText('Add to Cart').click();
    
    // Submit request
    await page.getByText('Submit Request').click();
    
    // Should show submission form
    await expect(page.getByText('Request Details')).toBeVisible();
    
    // Fill business justification
    await page.getByPlaceholder('Explain why you need this access...').fill('Need access for team collaboration');
    
    // Submit
    await page.getByText('Submit Request').click();
    
    // Should show success message
    await expect(page.getByText('Request submitted successfully')).toBeVisible();
  });

  test('should show approval workflow for high-risk requests', async ({ page }) => {
    // Add high-risk application
    const salesforceCard = page.getByText('Salesforce').locator('..').first();
    await salesforceCard.getByText('Add to Cart').click();
    
    // Should show approval warning
    await expect(page.getByText('Approval Required')).toBeVisible();
    await expect(page.getByText('This request requires manager approval')).toBeVisible();
  });

  test('should display request status and history', async ({ page }) => {
    // Navigate to requests tab
    await page.getByText('My Requests').click();
    
    // Should show request history
    await expect(page.getByText('Request History')).toBeVisible();
    
    // Should show different statuses
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('Approved')).toBeVisible();
    await expect(page.getByText('Rejected')).toBeVisible();
  });

  test('should handle SoD conflict detection', async ({ page }) => {
    // Add conflicting roles
    const adminRole = page.getByText('Administrator').locator('..').first();
    await adminRole.getByText('Add to Cart').click();
    
    const financeRole = page.getByText('Finance Approver').locator('..').first();
    await financeRole.getByText('Add to Cart').click();
    
    // Should show SoD conflict warning
    await expect(page.getByText('SoD Conflict Detected')).toBeVisible();
    await expect(page.getByText('These roles create a separation of duties violation')).toBeVisible();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should focus on search input
    const searchInput = page.getByPlaceholder('Search applications, roles, or groups...');
    await expect(searchInput).toBeFocused();
    
    // Type search term
    await page.keyboard.type('Slack');
    await page.keyboard.press('Enter');
    
    // Should filter results
    await expect(page.getByText('Slack')).toBeVisible();
  });
});















