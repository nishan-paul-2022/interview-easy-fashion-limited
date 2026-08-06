'use client';

import React from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { PasswordInput } from '@/components/atoms/PasswordInput';

export default function ManagementLoginPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authentication logic will be wired up in Phase 12
  };

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-bg flex items-center justify-center shadow-inner border border-muted/10">
          <Icon name="Shield" size={28} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">Admin Login</h1>
          <p className="text-muted text-sm mt-1">Access the Management Dashboard</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input label="Email" type="email" placeholder="admin@example.com" required />

        <PasswordInput label="Password" placeholder="Enter your password" required />

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
          Login
        </Button>
      </form>
    </div>
  );
}
