import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionPicker, Action } from '../../components/lifecycle/ActionPicker';

describe('ActionPicker', () => {
  const mockOnChange = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders empty state when no actions', () => {
    render(<ActionPicker actions={[]} onChange={mockOnChange} mode="joiner" />);
    
    expect(screen.getByText('No actions configured')).toBeInTheDocument();
    expect(screen.getByText('Add actions to define what happens when conditions are met')).toBeInTheDocument();
  });

  it('shows different action types for different modes', async () => {
    render(<ActionPicker actions={[]} onChange={mockOnChange} mode="joiner" />);
    
    const addButton = screen.getByText('Add Action');
    await user.click(addButton);
    
    // Should show joiner-specific actions
    expect(screen.getByText('Grant Role')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Add to Group')).toBeInTheDocument();
  });

  it('shows mover-specific actions for mover mode', async () => {
    render(<ActionPicker actions={[]} onChange={mockOnChange} mode="mover" />);
    
    const addButton = screen.getByText('Add Action');
    await user.click(addButton);
    
    expect(screen.getByText('Swap Role')).toBeInTheDocument();
    expect(screen.getByText('Conditional Action')).toBeInTheDocument();
  });

  it('shows leaver-specific actions for leaver mode', async () => {
    render(<ActionPicker actions={[]} onChange={mockOnChange} mode="leaver" />);
    
    const addButton = screen.getByText('Add Action');
    await user.click(addButton);
    
    expect(screen.getByText('Disable Account')).toBeInTheDocument();
    expect(screen.getByText('Revoke Access')).toBeInTheDocument();
    expect(screen.getByText('Rollback Action')).toBeInTheDocument();
  });

  it('adds action with correct default properties', async () => {
    render(<ActionPicker actions={[]} onChange={mockOnChange} mode="joiner" />);
    
    const addButton = screen.getByText('Add Action');
    await user.click(addButton);
    
    const grantRoleButton = screen.getByText('Grant Role');
    await user.click(grantRoleButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'grantRole',
        target: '',
        params: {},
        dependencies: [],
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          timeout: 30,
        },
        delay: 0,
        priority: 'medium',
        requiresApproval: false,
        dryRun: false,
      }),
    ]);
  });

  it('renders existing actions correctly', () => {
    const actions: Action[] = [
      {
        id: 'action-1',
        type: 'grantRole',
        target: 'Employee',
        priority: 'high',
        requiresApproval: true,
        retryPolicy: {
          maxRetries: 5,
          backoffMultiplier: 2,
          timeout: 60,
        },
      },
    ];
    
    render(<ActionPicker actions={actions} onChange={mockOnChange} mode="joiner" />);
    
    expect(screen.getByText('Grant Role')).toBeInTheDocument();
    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Requires Approval')).toBeInTheDocument();
  });

  it('supports action removal', async () => {
    const actions: Action[] = [
      {
        id: 'action-1',
        type: 'grantRole',
        target: 'Employee',
      },
    ];
    
    render(<ActionPicker actions={actions} onChange={mockOnChange} mode="joiner" />);
    
    const removeButton = screen.getByRole('button', { name: /x/i });
    await user.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('supports advanced mode with tabs', async () => {
    const actions: Action[] = [
      {
        id: 'action-1',
        type: 'grantRole',
        target: 'Employee',
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          timeout: 30,
        },
      },
    ];
    
    render(<ActionPicker actions={actions} onChange={mockOnChange} mode="joiner" />);
    
    const advancedButton = screen.getByText('Advanced');
    await user.click(advancedButton);
    
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Dependencies')).toBeInTheDocument();
  });

  it('handles priority changes', async () => {
    const actions: Action[] = [
      {
        id: 'action-1',
        type: 'grantRole',
        target: 'Employee',
        priority: 'medium',
      },
    ];
    
    render(<ActionPicker actions={actions} onChange={mockOnChange} mode="joiner" />);
    
    const advancedButton = screen.getByText('Advanced');
    await user.click(advancedButton);
    
    const prioritySelect = screen.getByDisplayValue('Medium');
    await user.click(prioritySelect);
    
    const highOption = screen.getByText('High');
    await user.click(highOption);
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        priority: 'high',
      }),
    ]);
  });

  it('validates action dependencies', async () => {
    const actions: Action[] = [
      {
        id: 'action-1',
        type: 'grantRole',
        target: 'Employee',
        priority: 'medium',
      },
      {
        id: 'action-2',
        type: 'createAccount',
        target: 'Slack',
        priority: 'high',
      },
    ];
    
    render(<ActionPicker actions={actions} onChange={mockOnChange} mode="joiner" />);
    
    const advancedButton = screen.getByText('Advanced');
    await user.click(advancedButton);
    
    const dependenciesTab = screen.getByText('Dependencies');
    await user.click(dependenciesTab);
    
    // Should show other actions as dependency options
    expect(screen.getByText('Create Account (high)')).toBeInTheDocument();
  });
});
