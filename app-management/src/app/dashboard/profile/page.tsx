'use client';

import React, { useState } from 'react';

import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { PasswordInput } from '@/components/atoms/PasswordInput';

export default function AdminProfilePage() {
  const [name, setName] = useState('Alice Smith');
  const [email, setEmail] = useState('alice@example.com');
  const [phone, setPhone] = useState('+1 234 567 8900');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [avatarUrl, setAvatarUrl] = useState('https://i.pravatar.cc/150?u=alice');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving profile info:', { name, email, phone });
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    console.log('Changing password for user');
  };

  const handleAvatarChangeClick = () => {
    console.log('Open file picker for avatar');
    // Simulated UI action
    setAvatarUrl('https://i.pravatar.cc/150?u=newalice');
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your personal information and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <div className="relative group">
              <Avatar
                src={avatarUrl}
                alt={name}
                name={name}
                size="lg"
                className="h-28 w-28 text-3xl"
              />
              <button
                onClick={handleAvatarChangeClick}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Change Avatar"
              >
                <Icon name="Pencil" size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-text">{name}</h2>
              <p className="text-sm text-muted">{email}</p>
            </div>

            <div className="mt-2 flex flex-col items-center gap-2">
              <Badge label="ADMIN" variant="error" />
              <p className="text-xs text-muted">{phone}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="flex flex-col gap-8 md:col-span-2">
          {/* Edit Profile Form */}
          <form
            onSubmit={handleProfileSave}
            className="flex flex-col gap-6 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-lg font-semibold text-text">Edit Profile</h2>
            <div className="flex flex-col gap-5">
              <Input
                label="Full Name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handlePasswordSave}
            className="flex flex-col gap-6 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-lg font-semibold text-text">Change Password</h2>
            <div className="flex flex-col gap-5">
              <PasswordInput
                label="Current Password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <PasswordInput
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="primary" type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
