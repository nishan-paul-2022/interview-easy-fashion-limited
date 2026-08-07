import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { ToastProvider, useToast } from '@/components/molecules/Toast';

const TestComponent = () => {
  const { success, error } = useToast();
  return (
    <div>
      <button onClick={() => success('Success message!')}>Show Success</button>
      <button onClick={() => error('Error message!')}>Show Error</button>
    </div>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders success and error variants', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Error message!')).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });
  });

  it('auto-dismisses after 4s', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message!')).toBeInTheDocument();

    // Advance 4s for dismiss timer
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // Advance 300ms for exit animation
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Success message!')).not.toBeInTheDocument();
  });
});
