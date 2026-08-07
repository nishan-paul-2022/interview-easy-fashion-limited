import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { Modal } from '@/components/molecules/Modal';

describe('Modal Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders children and title', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Title">
        <div>Test Content</div>
      </Modal>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('closes on Escape key when visible', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Test Content</div>
      </Modal>,
    );

    // Fast-forward 10ms to make it visible
    act(() => {
      jest.advanceTimersByTime(10);
    });

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click but NOT on content click', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div data-testid="modal-content">Test Content</div>
      </Modal>,
    );

    // Fast-forward 10ms to make it visible
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Click the content
    fireEvent.click(screen.getByTestId('modal-content'));
    expect(handleClose).not.toHaveBeenCalled();

    // Click the backdrop (it is an aria-hidden element with fixed inset-0)
    // We can find it by getting the element that has the onClick={onClose}
    // and aria-hidden="true"
    const backdrop = document.querySelector('.bg-black\\/50') as HTMLElement;
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
