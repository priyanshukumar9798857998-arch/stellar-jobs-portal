import React, { useState, useEffect } from 'react';
import { User, Mail, Bell, Loader2, Save, BellRing, Newspaper } from 'lucide-react';
import Header from '@/components/Header';
import { useToastContext } from '@/components/ToastContext';
import { getUser } from '@/utils/auth';
import { getUserSettings, updateUserSettings } from '@/utils/userSettings';

const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const { addToast } = useToastContext();
  const user = getUser();

  useEffect(() => {
    // Load settings from localStorage
    const settings = getUserSettings();
    setName(settings.name || user?.email?.split('@')[0] || '');
    setEmailNotifications(settings.emailNotifications);
    setWeeklyDigest(settings.weeklyDigest);
    setJobAlerts(settings.jobAlerts);
    setIsLoading(false);
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      updateUserSettings({
        name,
        emailNotifications,
        weeklyDigest,
        jobAlerts,
      });

      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your changes have been saved',
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      addToast({
        type: 'error',
        title: 'Failed to save',
        message: 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    current: boolean
  ) => {
    setter(!current);
    setHasChanges(true);
  };

  const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    label: string;
  }> = ({ checked, onChange, disabled, label }) => (
    <button
      onClick={onChange}
      disabled={disabled || isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
        checked ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-[hsl(var(--foreground))] transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen">
      <div className="space-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <Header />

      <main className="page-container">
        <div className="container-narrow">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              Profile Settings
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Manage your account and notification preferences
            </p>
          </div>

          <div className="grid gap-6">
            {/* Profile Info Card */}
            <div className="card-glass animate-slide-up">
              <h2 className="text-lg font-semibold mb-6 text-[hsl(var(--foreground))]">
                Account Information
              </h2>

              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="skeleton w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <div className="skeleton h-5 w-32" />
                      <div className="skeleton h-4 w-48" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0">
                    <User className="w-10 h-10 text-[hsl(var(--primary-foreground))]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <label htmlFor="name" className="form-label">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setHasChanges(true);
                        }}
                        className="input-glass"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[hsl(var(--muted-foreground))]">
                        Email
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <p className="text-[hsl(var(--foreground))]">
                          {user?.email || 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-[hsl(var(--muted-foreground))]">
                        Role
                      </label>
                      <div className="mt-1">
                        <span className="badge badge-primary">
                          {user?.role || 'USER'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email Preferences Card */}
            <div className="card-glass animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-lg font-semibold mb-6 text-[hsl(var(--foreground))]">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.2)] flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[hsl(var(--foreground))]">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Receive emails about your account activity
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={emailNotifications}
                    onChange={() => handleToggle(setEmailNotifications, emailNotifications)}
                    label="Toggle email notifications"
                  />
                </div>

                {/* Job Alerts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--secondary)/0.2)] flex items-center justify-center flex-shrink-0">
                      <BellRing className="w-5 h-5 text-[hsl(var(--secondary))]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[hsl(var(--foreground))]">
                        Job Alerts
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Get notified when new jobs match your interests
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={jobAlerts}
                    onChange={() => handleToggle(setJobAlerts, jobAlerts)}
                    label="Toggle job alerts"
                  />
                </div>

                {/* Weekly Digest */}
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent)/0.2)] flex items-center justify-center flex-shrink-0">
                      <Newspaper className="w-5 h-5 text-[hsl(var(--accent))]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[hsl(var(--foreground))]">
                        Weekly Digest
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Receive a weekly summary of new job postings
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={weeklyDigest}
                    onChange={() => handleToggle(setWeeklyDigest, weeklyDigest)}
                    label="Toggle weekly digest"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            {hasChanges && (
              <div className="animate-slide-up">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Danger Zone */}
            <div
              className="card-glass border border-[hsl(var(--destructive)/0.3)] animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--destructive))]">
                Danger Zone
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button 
                className="btn-danger text-sm"
                onClick={() => {
                  addToast({
                    type: 'info',
                    title: 'Demo mode',
                    message: 'Account deletion is disabled in demo',
                  });
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
