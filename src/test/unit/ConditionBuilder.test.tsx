import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConditionBuilder, Condition } from '../../components/lifecycle/ConditionBuilder';

describe('ConditionBuilder', () => {
  const mockOnChange = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders empty state when no conditions', () => {
    render(<ConditionBuilder conditions={[]} onChange={mockOnChange} />);
    
    expect(screen.getByText('No conditions set')).toBeInTheDocument();
    expect(screen.getByText('This rule will apply to all users')).toBeInTheDocument();
  });

  it('allows adding conditions', async () => {
    render(<ConditionBuilder conditions={[]} onChange={mockOnChange} />);
    
    const addButton = screen.getByText('Add Condition');
    await user.click(addButton);
    
    const departmentOption = screen.getByText('Department');
    await user.click(departmentOption);
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        field: 'department',
        operator: 'equals',
        value: '',
        logicalOperator: 'AND',
        negate: false,
        caseSensitive: false,
      }),
    ]);
  });

  it('supports condition grouping', async () => {
    render(<ConditionBuilder conditions={[]} onChange={mockOnChange} />);
    
    const addGroupButton = screen.getByText('Add Group');
    await user.click(addGroupButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        isGroup: true,
        children: [],
        logicalOperator: 'AND',
      }),
    ]);
  });

  it('handles different field types correctly', async () => {
    const conditions: Condition[] = [
      {
        id: 'cond-1',
        field: 'employmentType',
        operator: 'equals',
        value: 'Full-time',
        logicalOperator: 'AND',
      },
    ];
    
    render(<ConditionBuilder conditions={conditions} onChange={mockOnChange} />);
    
    // Should render enum field as select
    expect(screen.getByDisplayValue('Full-time')).toBeInTheDocument();
  });

  it('supports negation toggle', async () => {
    const conditions: Condition[] = [
      {
        id: 'cond-1',
        field: 'department',
        operator: 'equals',
        value: 'Engineering',
        logicalOperator: 'AND',
        negate: false,
      },
    ];
    
    render(<ConditionBuilder conditions={conditions} onChange={mockOnChange} />);
    
    const negateButton = screen.getByRole('button', { name: /eye/i });
    await user.click(negateButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        negate: true,
      }),
    ]);
  });

  it('validates required fields', async () => {
    render(<ConditionBuilder conditions={[]} onChange={mockOnChange} />);
    
    const addButton = screen.getByText('Add Condition');
    await user.click(addButton);
    
    const departmentOption = screen.getByText('Department');
    await user.click(departmentOption);
    
    // Check that condition has required fields
    const newCondition = mockOnChange.mock.calls[0][0][0];
    expect(newCondition).toHaveProperty('id');
    expect(newCondition).toHaveProperty('field', 'department');
    expect(newCondition).toHaveProperty('operator');
    expect(newCondition).toHaveProperty('logicalOperator', 'AND');
  });

  it('supports advanced mode toggle', async () => {
    render(<ConditionBuilder conditions={[]} onChange={mockOnChange} />);
    
    const advancedButton = screen.getByText('Advanced');
    await user.click(advancedButton);
    
    expect(screen.getByText('Simple')).toBeInTheDocument();
  });

  it('handles condition removal', async () => {
    const conditions: Condition[] = [
      {
        id: 'cond-1',
        field: 'department',
        operator: 'equals',
        value: 'Engineering',
        logicalOperator: 'AND',
      },
    ];
    
    render(<ConditionBuilder conditions={conditions} onChange={mockOnChange} />);
    
    const removeButton = screen.getByRole('button', { name: /x/i });
    await user.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
