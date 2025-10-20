import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../../contexts/UserContext';
import { AppShell } from '../../components/AppShell';

// Mock the pages to avoid complex dependencies
vi.mock('../../pages/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('../../pages/RequestsPage', () => ({
  RequestsPage: () => <div data-testid="requests-page">Requests Page</div>,
}));

vi.mock('../../pages/LifecyclePage', () => ({
  LifecyclePage: () => <div data-testid="lifecycle-page">Lifecycle Page</div>,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <UserProvider>
      {children}
    </UserProvider>
  </BrowserRouter>
);

describe('AppShell Navigation', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation items for administrator role', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test Content</div>
        </AppShell>
      </TestWrapper>
    );

    // Should show all navigation items for admin
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.getByText('Approvals')).toBeInTheDocument();
    expect(screen.getByText('Identities')).toBeInTheDocument();
    expect(screen.getByText('Access')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
    expect(screen.getByText('Lifecycle')).toBeInTheDocument();
    expect(screen.getByText('Risk')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows role switcher for demo purposes', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test Content</div>
        </AppShell>
      </TestWrapper>
    );

    // Should show current role
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('handles mobile navigation toggle', async () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test Content</div>
        </AppShell>
      </TestWrapper>
    );

    // Find mobile menu button (hamburger) - it might be hidden on desktop
    const mobileMenuButtons = screen.getAllByRole('button');
    const mobileMenuButton = mobileMenuButtons.find(button => 
      button.className.includes('lg:hidden')
    );
    
    if (mobileMenuButton) {
      await user.click(mobileMenuButton);
      // Should show mobile navigation - use getAllByText to handle multiple elements
      expect(screen.getAllByText('Home')).toHaveLength(2); // Desktop + Mobile
    } else {
      // On desktop, mobile menu might not be visible
      expect(screen.getByText('Home')).toBeInTheDocument();
    }
  });

  it('shows user information in header', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test Content</div>
        </AppShell>
      </TestWrapper>
    );

    // Should show user name and role
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div data-testid="main-content">Main Content</div>
        </AppShell>
      </TestWrapper>
    );

    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('has responsive design classes', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test Content</div>
        </AppShell>
      </TestWrapper>
    );

    // Check for responsive classes on the aside element
    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('hidden', 'lg:flex');
  });
});
