import React from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Modal } from '@/components/molecules/Modal';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
}) => {
  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Confirm Delete
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onCancel} footer={footer}>
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
          <Icon name="AlertTriangle" size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-text">{title}</h3>
        <div className="text-muted max-w-sm">{description}</div>
      </div>
    </Modal>
  );
};
