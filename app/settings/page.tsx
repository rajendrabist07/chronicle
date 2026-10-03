"use client";

import { useState, useEffect } from "react";
import RequireAuth from "../components/auth/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { getAccessToken, changePassword, resendVerificationEmail } from "../lib/auth";
import { updateProfile } from "../lib/users";
import PasswordStrengthMeter from "../components/auth/PasswordStrengthMeter";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import { useToast } from "../components/ui/Toast";
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Mail,
  Copy,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

function SettingsContent() {
  const { user, setUser } = useAuth();
  const { success, error, info } = useToast();

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Account State
  const [resendingEmail, setResendingEmail] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
    }
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    if (!name.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }
    if (bio.length > 200) {
      setProfileError("Bio must be 200 characters or fewer");
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    try {
      setProfileSaving(true);
      const updatedUser = await updateProfile({ name: name.trim(), bio: bio.trim() }, token);
      setUser(updatedUser);
      success("Profile updated successfully");
    } catch (err: any) {
      const msg = err.message || "Failed to update profile";
      setProfileError(msg);
      error(msg);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSecurityError(null);

    if (!oldPassword) {
      setSecurityError("Please enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match");
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    try {
      setSecuritySaving(true);
      await changePassword(oldPassword, newPassword, token);
      success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err.message || "Failed to change password";
      setSecurityError(msg);
      error(msg);
    } finally {
      setSecuritySaving(false);
    }
  }

  async function handleResendVerification() {
    if (!user?.email) return;
    try {
      setResendingEmail(true);
      await resendVerificationEmail(user.email);
      success("Verification link sent to your email");
    } catch (err: any) {
      error(err.message || "Failed to send verification email");
    } finally {
      setResendingEmail(false);
    }
  }

  function handleCopyId() {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    info("User ID copied to clipboard");
  }

  const profileContent = (
    <Card className="p-6">
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Public Profile
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            This information will be displayed on your public author page.
          </p>
        </div>

        {profileError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {profileError}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />

          <div className="space-y-1.5">
            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a brief introduction about yourself..."
              rows={4}
            />
            <div className="flex justify-end">
              <span
                className={`text-xs ${
                  bio.length > 200
                    ? "font-semibold text-red-500"
                    : "text-slate-400"
                }`}
              >
                {bio.length}/200 characters
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={profileSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );

  const securityContent = (
    <Card className="p-6">
      <form onSubmit={handleChangePassword} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Password & Security
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Ensure your account uses a long, unique password.
          </p>
        </div>

        {securityError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {securityError}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="space-y-2">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={securitySaving}>
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );

  const accountContent = (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Account Overview
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Details about your authentication and role.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Mail className="h-4 w-4" />
            Email Address
          </div>
          <p className="mt-2 text-base font-medium text-slate-900 dark:text-white">
            {user?.email}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {user?.emailVerified ? (
              <Badge variant="success">
                <CheckCircle2 className="mr-1 h-3 w-3 inline" />
                Verified
              </Badge>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning">
                  <AlertCircle className="mr-1 h-3 w-3 inline" />
                  Unverified
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendVerification}
                  loading={resendingEmail}
                  className="h-7 text-xs"
                >
                  Resend Link
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Shield className="h-4 w-4" />
            Role & Permissions
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="primary">{user?.role || "MEMBER"}</Badge>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60">
            <span className="text-xs text-slate-500">User ID</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1 text-xs font-mono text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              <span>{user?.id ? `${user.id.slice(0, 8)}...` : ""}</span>
              {copiedId ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );

  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" />, content: profileContent },
    { id: "security", label: "Security", icon: <KeyRound className="h-4 w-4" />, content: securityContent },
    { id: "account", label: "Account", icon: <Shield className="h-4 w-4" />, content: accountContent },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your personal details, login credentials, and account preferences.
        </p>
      </div>

      <Tabs tabs={tabs} defaultTabId="profile" />
    </div>
  );
}
