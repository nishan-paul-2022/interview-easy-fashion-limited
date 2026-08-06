import React from 'react';
import { Button } from '@/components/atoms/Button';
import { Icon, IconName } from '@/components/atoms/Icon';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-xl border border-muted/20 bg-surface p-8 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/10 text-muted">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="mb-2 text-xl font-bold text-text">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
