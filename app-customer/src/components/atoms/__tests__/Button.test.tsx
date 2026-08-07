import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from '@/components/atoms/Button';

describe('Button Component', () => {
  it('renders default button', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const { rerender } = render(<Button variant="primary">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');

    rerender(<Button variant="secondary">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-surface');

    rerender(<Button variant="outline">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('border border-muted');

    rerender(<Button variant="ghost">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');

    rerender(<Button variant="danger">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-error');

    rerender(<Button variant="success">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-cta');
  });

  it('fires onClick event', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows spinner in loading state and is disabled', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('disabled state blocks click', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
