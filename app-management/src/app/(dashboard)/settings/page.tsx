'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useToast } from '@/components/molecules/Toast';

export default function SettingsPage() {
  const toast = useToast();
  const [jwtExpiry, setJwtExpiry] = useState('7d');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [isMounted, setIsMounted] = useState(false);

  // Initialize on client side
  useEffect(() => {
    setIsMounted(true);

    // Load security settings
    const savedJwtExpiry = localStorage.getItem('settings_jwtExpiry');
    if (savedJwtExpiry) {
      setJwtExpiry(savedJwtExpiry);
    }

    const savedPasswordMinLength = localStorage.getItem('settings_passwordMinLength');
    if (savedPasswordMinLength) {
      setPasswordMinLength(savedPasswordMinLength);
    }
  }, []);

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate JWT Expiry format (e.g. 7d, 24h, 60s)
    const jwtPattern = /^\d+[smhdw]$/;
    if (!jwtPattern.test(jwtExpiry)) {
      toast.error('Invalid JWT Expiry format. Please use a format like 7d, 24h, or 60s.');
      return;
    }

    // 2. Validate Password Minimum Length
    const minLength = parseInt(passwordMinLength, 10);
    if (isNaN(minLength) || minLength < 6 || minLength > 32) {
      toast.error('Password minimum length must be between 6 and 32 characters.');
      return;
    }

    localStorage.setItem('settings_jwtExpiry', jwtExpiry);
    localStorage.setItem('settings_passwordMinLength', passwordMinLength);
    toast.success('Security settings saved successfully!');
  };

  // Prevent hydration mismatch by returning null until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage application preferences, security policies, and view system information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          {/* System Info Section */}
          <div className="flex flex-col gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">System Info</h2>
            <div className="flex flex-col gap-4 rounded-lg border border-muted/10 bg-bg p-4">
              <div className="flex items-center justify-between py-2 border-b border-muted/10 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-muted">App Version</span>
                <span className="text-sm font-medium text-text">v0.1.0-alpha</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-muted/10 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-muted">Environment</span>
                <span className="text-sm font-medium text-text">
                  {process.env.NODE_ENV === 'development' ? 'Development' : 'Production'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-muted/10 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-muted">Node Version</span>
                <span className="text-sm font-medium text-text">v20.x LTS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Security Section */}
          <form
            onSubmit={handleSecuritySave}
            className="flex flex-col gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-text">Security Policies</h2>
            <div className="flex flex-col gap-5">
              <Input
                label="JWT Expiry"
                placeholder="e.g. 7d, 24h"
                value={jwtExpiry}
                onChange={(e) => setJwtExpiry(e.target.value)}
                required
              />
              <Input
                label="Password Minimum Length"
                type="number"
                min={6}
                placeholder="e.g. 8"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
                required
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="primary" type="submit">
                Save Policies
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
