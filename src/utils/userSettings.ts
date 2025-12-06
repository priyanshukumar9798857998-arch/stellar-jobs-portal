// User settings service using localStorage
const SETTINGS_KEY = 'job_portal_user_settings';

interface UserSettings {
  name: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  jobAlerts: boolean;
}

const defaultSettings: UserSettings = {
  name: '',
  emailNotifications: true,
  weeklyDigest: false,
  jobAlerts: true,
};

export const getUserSettings = (): UserSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return { ...defaultSettings, ...JSON.parse(stored) };
  }
  return defaultSettings;
};

export const updateUserSettings = (updates: Partial<UserSettings>): UserSettings => {
  const current = getUserSettings();
  const updated = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

export const resetUserSettings = (): UserSettings => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
};
