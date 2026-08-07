import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';

describe('DeleteConfirmationModal Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('calls onConfirm and onCancel correctly', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    render(
      <DeleteConfirmationModal
        isOpen={true}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    // Fast-forward 10ms to make the modal visible
    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });

    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
