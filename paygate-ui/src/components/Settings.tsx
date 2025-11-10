import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import AffiliateManager from './AffiliateManager';
import BillingInformation from './BillingInformation';
import Notification from './Notifications';
import { useTheme } from '../contexts';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import userPreferencesService from '../services/userPreferencesService';
import avatarService from '../services/avatarService';
import PayoutPreferences, { PayoutSettings } from './PayoutPreferences';
import TaxSettings, { TaxSettingsData } from './TaxSettings';
import BrandCustomization, { BrandSettings } from './BrandCustomization';
import NotificationPreferences, { NotificationSettings } from './NotificationPreferences';
import SecuritySettings, { SecuritySettingsData } from './SecuritySettings';
import Integrations, { IntegrationSettings } from './Integrations';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface ProfileState {
  name: string;
  email: string;
  bio: string | null;
}

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AvatarState {
  file: File | null;
  previewUrl: string | null;
  uploading: boolean;
}

interface PaymentState {
  paystackKey: string | null;
  paypalEmail: string | null;
  currency: string | null;
  country: string | null;
  // other payment settings
}

interface NotificationsState {
  emailNotifications: boolean;
  salesAlerts: boolean;
  weeklyReports: boolean;
}

interface SettingsHistoryState {
  profile: ProfileState;
  payment: PaymentState;
  notifications: NotificationsState;
  timestamp: number;
}

const Settings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { showNotification } = useNotifications();
  const { user } = useAuth(); // Get user from auth context
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileState>({
    name: user?.full_name || user?.name || user?.email?.split('@')[0] || '',
    email: user?.email || 'john@example.com',
    bio: user?.bio || 'Content creator and educator',
  });

  const [password, setPassword] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatar, setAvatar] = useState<AvatarState>({
    file: null,
    previewUrl: null,
    uploading: false,
  });

  const [history, setHistory] = useState<SettingsHistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [payment, setPayment] = useState<PaymentState>({
    paystackKey: 'pk_test_*****************************',
    paypalEmail: '',
    currency: null, // Now properly typed as string | null
    country: 'NG',
    // other payment settings
  });

  const [notifications, setNotifications] = useState<NotificationsState>({
    emailNotifications: true,
    salesAlerts: true,
    weeklyReports: true,
  });

  // New state variables for additional settings
  const [payoutPreferences, setPayoutPreferences] = useState<PayoutSettings>({
    payoutMethod: 'bank',
    bankAccount: null,
    paypalEmail: null,
    payoutSchedule: 'monthly',
    minimumPayout: 100,
    taxId: '',
  });
  const [taxSettings, setTaxSettings] = useState<TaxSettingsData>({
    taxEnabled: false,
    taxRate: 0,
    taxLocation: 'US',
    collectTax: false,
    taxNumber: '',
    taxExemptCustomers: false,
  });
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    logo: null,
    logoPreview: null,
    primaryColor: '#4f46e5',
    secondaryColor: '#f9fafb',
    accentColor: '#10b981',
    customDomain: '',
    domainVerified: false,
    brandName: '',
    brandTagline: '',
  });
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationSettings>({
    emailAlerts: {
      sales: true,
      customerIssues: true,
      systemUpdates: true,
      marketingTips: true,
      weeklyReports: true,
      monthlyReports: true,
    },
    inAppAlerts: {
      sales: true,
      customerIssues: true,
      systemUpdates: true,
      marketingTips: true,
    },
    notificationFrequency: 'immediate',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsData>({
    twoFactorEnabled: false,
    twoFactorMethod: 'authenticator',
    backupCodes: [],
    emailLoginAlerts: false,
    smsLoginAlerts: false,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
    sessionTimeout: 30,
    failedLoginAttempts: 0,
    accountLockoutDuration: 0,
    dataEncryptionEnabled: false,
    auditLogRetention: 0,
    securityNotifications: false,
    apiAccessEnabled: false,
    apiKeys: [],
    webhookSecurityEnabled: false,
    webhookSecret: '',
    securityQuestionsEnabled: false,
    securityQuestions: [],
    deviceManagementEnabled: false,
    trustedDevices: [],
    geoBlockingEnabled: false,
    blockedCountries: [],
    passwordPolicy: {
      minLength: 8,
      requireSymbols: true,
      requireNumbers: true,
      requireUppercase: true,
      requireLowercase: true,
    },
    accessLogs: [],
  });
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    connectedIntegrations: [],
    webhookUrl: '',
  });

  // Handler functions for new settings
  const handlePayoutPreferencesSave = async (preferences: PayoutSettings) => {
    try {
      setPayoutPreferences(preferences);
      // In a real app, this would call your backend API
      // await userPreferencesService.updatePayoutPreferences(preferences);
      showNotification('Payout preferences saved successfully!', 'success');
    } catch (err: unknown) {
      console.error('Error saving payout preferences:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to save payout preferences';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleTaxSettingsSave = async (settings: TaxSettingsData) => {
    try {
      setTaxSettings(settings);
      // In a real app, this would call your backend API
      // await userPreferencesService.updateTaxSettings(settings);
      showNotification('Tax settings saved successfully!', 'success');
    } catch (err: unknown) {
      console.error('Error saving tax settings:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to save tax settings';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleBrandSettingsSave = async (settings: BrandSettings) => {
    try {
      setBrandSettings(settings);
      // In a real app, this would call your backend API
      // await userPreferencesService.updateBrandSettings(settings);
      showNotification('Brand settings saved successfully!', 'success');
    } catch (err: unknown) {
      console.error('Error saving brand settings:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to save brand settings';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleNotificationPreferencesSave = async (preferences: NotificationSettings) => {
    try {
      setNotificationPreferences(preferences);
      // In a real app, this would call your backend API
      // await userPreferencesService.updateNotificationPreferences(preferences);
      showNotification('Notification preferences saved successfully!', 'success');
    } catch (err: unknown) {
      console.error('Error saving notification preferences:', err);
      const errorMessage = isAxiosError(err)
        ? err.message
        : 'Failed to save notification preferences';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleSecuritySettingsSave = async (settings: SecuritySettingsData) => {
    try {
      setSecuritySettings(settings);
      // In a real app, this would call your backend API
      // await userPreferencesService.updateSecuritySettings(settings);
      showNotification('Security settings saved successfully!', 'success');
    } catch (err: unknown) {
      console.error('Error saving security settings:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to save security settings';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleIntegrationSettingsSave = async (settings: IntegrationSettings) => {
    try {
      setIntegrationSettings(settings);
      // In a real app, this would call your backend API
      // await userPreferencesService.updateIntegrationSettings(settings);
      showNotification('Integration settings saved successfully!', 'success');
    } catch (err: unknown) {
      console.error('Error saving integration settings:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to save integration settings';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = {
      profile: { ...profile },
      payment: { ...payment },
      notifications: { ...notifications },
      timestamp: Date.now(),
    };

    // Check if the current state is the same as the last history state
    const lastHistoryState = history[history.length - 1];
    if (lastHistoryState) {
      const isSameProfile =
        JSON.stringify(lastHistoryState.profile) === JSON.stringify(currentState.profile);
      const isSamePayment =
        JSON.stringify(lastHistoryState.payment) === JSON.stringify(currentState.payment);
      const isSameNotifications =
        JSON.stringify(lastHistoryState.notifications) ===
        JSON.stringify(currentState.notifications);

      if (isSameProfile && isSamePayment && isSameNotifications) {
        // No changes, don't save to history
        return;
      }
    }

    // If we're in the middle of history, truncate future states
    const newHistory = historyIndex >= 0 ? history.slice(0, historyIndex + 1) : [...history];
    newHistory.push(currentState);

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [profile, payment, notifications, history, historyIndex]);

  // Undo last change
  const handleUndo = () => {
    if (historyIndex < 0 || history.length === 0) {
      showNotification('Nothing to undo', 'info');
      return;
    }

    const prevStateIndex = historyIndex - 1;
    if (prevStateIndex < 0) {
      showNotification('Nothing more to undo', 'info');
      return;
    }

    const prevState = history[prevStateIndex];
    if (prevState) {
      setProfile(prevState.profile);
      setPayment(prevState.payment);
      setNotifications(prevState.notifications);
    }
    setHistoryIndex(prevStateIndex);

    showNotification('Changes undone', 'success');
  };

  // Redo last undone change
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) {
      showNotification('Nothing to redo', 'info');
      return;
    }

    const nextStateIndex = historyIndex + 1;
    const nextState = history[nextStateIndex];
    if (nextState) {
      setProfile(nextState.profile);
      setPayment(nextState.payment);
      setNotifications(nextState.notifications);
    }
    setHistoryIndex(nextStateIndex);

    showNotification('Changes redone', 'success');
  };

  // Save to history when state changes
  useEffect(() => {
    saveToHistory();
  }, [
    JSON.stringify(profile),
    JSON.stringify(payment),
    JSON.stringify(notifications),
    saveToHistory,
  ]);

  const handleSaveAuto = async () => {
    try {
      // Validate forms based on active tab
      let validationError = null;
      if (activeTab === 'profile') {
        validationError = validateProfileForm();
      } else if (activeTab === 'payment') {
        validationError = validatePaymentForm();
      }

      if (validationError) {
        // Don't show validation errors for auto-save, just skip
        return;
      }

      const response = await userPreferencesService.updatePreferences({
        currency: payment.currency ?? '',
        country: payment.country ?? '',
      });

      if (response.success) {
        setLastSaved(new Date());
        // Only show notification for manual saves, not auto-saves
        // showNotification('Settings auto-saved', 'success');
      }
    } catch (err: unknown) {
      console.error('Error auto-saving settings:', err);
      // Don't show errors for auto-save to avoid annoying users
    }
  };

  // Form validation functions
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateProfileForm = (): string | null => {
    if (!profile.name.trim()) {
      return 'Name is required';
    }
    if (!profile.email.trim()) {
      return 'Email is required';
    }
    if (!validateEmail(profile.email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePaymentForm = (): string | null => {
    if (payment.paystackKey && payment.paystackKey.length < 10) {
      return 'Paystack key must be at least 10 characters';
    }
    if (payment.paypalEmail && !validateEmail(payment.paypalEmail)) {
      return 'Please enter a valid PayPal email address';
    }
    return null;
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, tab: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  const handleExportData = () => {
    // Create a data object with all user settings
    const exportData = {
      profile,
      payment,
      notifications,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    // Convert to JSON
    const dataStr = JSON.stringify(exportData, null, 2);

    // Create blob and download
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paygate-settings-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Settings exported successfully!', 'success');
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  // Form change handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate forms based on active tab
    let validationError = null;
    if (activeTab === 'profile') {
      validationError = validateProfileForm();
    } else if (activeTab === 'payment') {
      validationError = validatePaymentForm();
    }

    if (validationError) {
      setError(validationError);
      showNotification(validationError, 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesService.updatePreferences({
        currency: payment.currency ?? '',
        country: payment.country ?? '',
      });

      if (response.success) {
        showNotification('Settings saved successfully!', 'success');
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (err: unknown) {
      console.error('Error saving settings:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to save settings';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Avatar handling functions
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB', 'error');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);

    setAvatar({
      file,
      previewUrl,
      uploading: false,
    });
  };

  const handleUploadAvatar = async () => {
    if (!avatar.file) {
      showNotification('Please select an image first', 'error');
      return;
    }

    try {
      setAvatar(prev => ({ ...prev, uploading: true }));

      // Upload avatar file
      const uploadResult = await avatarService.uploadAvatar(avatar.file);

      if (uploadResult.success && uploadResult.avatarUrl) {
        // Update user preferences with new avatar URL
        const updateResult = await userPreferencesService.updatePreferences({
          avatarUrl: uploadResult.avatarUrl,
        });

        if (updateResult.success) {
          showNotification('Profile picture updated successfully!', 'success');

          // Clean up preview URL
          if (avatar.previewUrl) {
            URL.revokeObjectURL(avatar.previewUrl);
          }

          setAvatar({
            file: null,
            previewUrl: null,
            uploading: false,
          });
        } else {
          throw new Error(updateResult.message || 'Failed to update profile with new avatar');
        }
      } else {
        throw new Error(uploadResult.message || 'Failed to upload avatar');
      }
    } catch (err: unknown) {
      console.error('Error uploading avatar:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to upload profile picture';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setAvatar(prev => ({ ...prev, uploading: false }));
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      // Update user preferences with null avatar URL
      const updateResult = await userPreferencesService.updatePreferences({
        avatarUrl: undefined,
      });

      if (updateResult.success) {
        if (avatar.previewUrl) {
          URL.revokeObjectURL(avatar.previewUrl);
        }

        setAvatar({
          file: null,
          previewUrl: null,
          uploading: false,
        });

        showNotification('Profile picture removed', 'success');
      } else {
        throw new Error(updateResult.message || 'Failed to remove profile picture');
      }
    } catch (err: unknown) {
      console.error('Error removing avatar:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to remove profile picture';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!password.currentPassword) {
      showNotification('Please enter your current password', 'error');
      return;
    }

    if (password.newPassword.length < 8) {
      showNotification('New password must be at least 8 characters', 'error');
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call your backend API
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('Password updated successfully!', 'success');

      // Clear password fields
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: unknown) {
      console.error('Error updating password:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to update password';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPreferences = async () => {
    try {
      setLoading(true);

      // In a real implementation, this would sync with a backend service
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('Preferences synced across devices!', 'success');
    } catch (err: unknown) {
      console.error('Error syncing preferences:', err);
      const errorMessage = isAxiosError(err) ? err.message : 'Failed to sync preferences';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Settings" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Settings tabs">
                <button
                  onClick={() => setActiveTab('profile')}
                  onKeyDown={e => handleTabKeyDown(e, 'profile')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'profile'}
                  role="tab"
                  tabIndex={0}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  onKeyDown={e => handleTabKeyDown(e, 'payment')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payment'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'payment'}
                  role="tab"
                  tabIndex={0}
                >
                  Payment
                </button>
                <button
                  onClick={() => setActiveTab('payout')}
                  onKeyDown={e => handleTabKeyDown(e, 'payout')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payout'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'payout'}
                  role="tab"
                  tabIndex={0}
                >
                  Payout
                </button>
                <button
                  onClick={() => setActiveTab('tax')}
                  onKeyDown={e => handleTabKeyDown(e, 'tax')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tax'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'tax'}
                  role="tab"
                  tabIndex={0}
                >
                  Tax
                </button>
                <button
                  onClick={() => setActiveTab('brand')}
                  onKeyDown={e => handleTabKeyDown(e, 'brand')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'brand'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'brand'}
                  role="tab"
                  tabIndex={0}
                >
                  Brand
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  onKeyDown={e => handleTabKeyDown(e, 'notifications')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'notifications'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'notifications'}
                  role="tab"
                  tabIndex={0}
                >
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  onKeyDown={e => handleTabKeyDown(e, 'security')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'security'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'security'}
                  role="tab"
                  tabIndex={0}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('integrations')}
                  onKeyDown={e => handleTabKeyDown(e, 'integrations')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'integrations'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'integrations'}
                  role="tab"
                  tabIndex={0}
                >
                  Integrations
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  onKeyDown={e => handleTabKeyDown(e, 'billing')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'billing'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === 'billing'}
                  role="tab"
                  tabIndex={0}
                >
                  Billing & Subscription
                </button>
              </nav>
            </div>

            {activeTab === 'profile' && (
              <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Profile Information
                  </h3>
                  <div className="mt-5 space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        {avatar.previewUrl ? (
                          <img
                            className="h-16 w-16 rounded-full object-cover"
                            src={avatar.previewUrl}
                            alt="Preview"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16 flex items-center justify-center dark:bg-gray-700">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <label className="relative cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                          <span>Choose Image</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </label>
                        <div className="mt-2 flex space-x-2">
                          {avatar.file && (
                            <button
                              type="button"
                              onClick={handleUploadAvatar}
                              disabled={avatar.uploading}
                              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                avatar.uploading
                                  ? 'bg-indigo-400 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-700'
                              }`}
                            >
                              {avatar.uploading ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Uploading...
                                </>
                              ) : (
                                'Upload'
                              )}
                            </button>
                          )}
                          {(avatar.previewUrl || avatar.file) && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={profile.bio ?? ''}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    {/* Password Change Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Change Password
                      </h3>
                      <div className="mt-5 space-y-6">
                        <div>
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={password.currentPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={password.newPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Password must be at least 8 characters and contain uppercase, lowercase,
                            and number
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={password.confirmPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={handleUpdatePassword}
                            disabled={loading}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                          >
                            {loading ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Appearance
                      </h3>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Dark Mode
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {darkMode
                              ? 'Dark mode is currently enabled'
                              : 'Switch to dark mode for reduced eye strain'}
                          </p>
                        </div>
                        <button
                          onClick={toggleDarkMode}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                          }`}
                          role="switch"
                          aria-checked={darkMode}
                        >
                          <span className="sr-only">Use dark mode</span>
                          <span
                            className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              darkMode ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          >
                            <span
                              className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                                darkMode
                                  ? 'opacity-0 duration-100 ease-out'
                                  : 'opacity-100 duration-200 ease-in'
                              }`}
                              aria-hidden="true"
                            >
                              <svg
                                className="h-3 w-3 text-gray-400"
                                fill="none"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            <span
                              className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                                darkMode
                                  ? 'opacity-100 duration-200 ease-in'
                                  : 'opacity-0 duration-100 ease-out'
                              }`}
                              aria-hidden="true"
                            >
                              <svg
                                className="h-3 w-3 text-indigo-600"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-4.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                              </svg>
                            </span>
                          </span>
                        </button>
                      </div>

                      {/* Auto-save Toggle */}
                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Auto-save Settings
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Automatically save your changes as you type
                          </p>
                        </div>
                        <button
                          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            autoSaveEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                          }`}
                          role="switch"
                          aria-checked={autoSaveEnabled}
                        >
                          <span className="sr-only">Toggle auto-save</span>
                          <span
                            className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          >
                            <span
                              className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                                autoSaveEnabled
                                  ? 'opacity-0 duration-100 ease-out'
                                  : 'opacity-100 duration-200 ease-in'
                              }`}
                              aria-hidden="true"
                            >
                              <svg
                                className="h-3 w-3 text-gray-400"
                                fill="none"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            <span
                              className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                                autoSaveEnabled
                                  ? 'opacity-100 duration-200 ease-in'
                                  : 'opacity-0 duration-100 ease-out'
                              }`}
                              aria-hidden="true"
                            >
                              <svg
                                className="h-3 w-3 text-indigo-600"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-4.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                              </svg>
                            </span>
                          </span>
                        </button>
                      </div>

                      {lastSaved && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Last saved: {lastSaved.toLocaleTimeString()}
                        </div>
                      )}
                    </div>

                    {/* Data Export Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Data Export
                      </h3>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Export your settings and preferences to a JSON file. This can be used for
                          backup or to transfer your settings to another device.
                        </p>
                        <button
                          onClick={handleExportData}
                          className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                          <svg
                            className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Export Settings
                        </button>
                      </div>
                    </div>

                    {/* Sync Preferences Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Sync Preferences
                      </h3>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sync your preferences across all your devices. This ensures a consistent
                          experience no matter which device you use.
                        </p>
                        <button
                          onClick={handleSyncPreferences}
                          disabled={loading}
                          className={`mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            loading
                              ? 'bg-indigo-400 cursor-not-allowed text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                          }`}
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Syncing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Sync Across Devices
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Payment Settings
                  </h3>
                  <div className="mt-5 space-y-6">
                    <div>
                      <label
                        htmlFor="paystackKey"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Paystack Public Key
                      </label>
                      <input
                        type="text"
                        id="paystackKey"
                        name="paystackKey"
                        value={payment.paystackKey ?? ''}
                        onChange={handlePaymentChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Your Paystack public key for processing payments
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="paypalEmail"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        PayPal Email
                      </label>
                      <input
                        type="email"
                        id="paypalEmail"
                        name="paypalEmail"
                        value={payment.paypalEmail ?? ''}
                        onChange={handlePaymentChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Your PayPal email for receiving payments
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="currency"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Preferred Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={payment.currency ?? ''}
                        onChange={handlePaymentChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                        <option value="GHS">Ghanaian Cedi (GH₵)</option>
                        <option value="ZAR">South African Rand (R)</option>
                      </select>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Select your preferred currency for transactions
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={payment.country ?? ''}
                        onChange={handlePaymentChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="NG">Nigeria</option>
                        <option value="GH">Ghana</option>
                        <option value="ZA">South Africa</option>
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                      </select>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Select your country for regional payment processing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payout' && (
              <PayoutPreferences
                onSave={handlePayoutPreferencesSave}
                initialPreferences={payoutPreferences}
              />
            )}

            {activeTab === 'tax' && (
              <TaxSettings onSave={handleTaxSettingsSave} initialSettings={taxSettings} />
            )}

            {activeTab === 'brand' && (
              <BrandCustomization
                onSave={handleBrandSettingsSave}
                initialSettings={brandSettings}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationPreferences
                onSave={handleNotificationPreferencesSave}
                initialPreferences={notificationPreferences}
              />
            )}

            {activeTab === 'security' && (
              <SecuritySettings
                onSave={handleSecuritySettingsSave}
                initialSettings={securitySettings}
              />
            )}

            {activeTab === 'integrations' && (
              <Integrations
                onSave={handleIntegrationSettingsSave}
                initialSettings={integrationSettings}
              />
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Current Subscription
                    </h3>
                    <div className="mt-5 bg-gray-50 rounded-lg p-6 dark:bg-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            Free Plan
                          </h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                            No monthly fee
                          </p>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                            Transaction fees: 10% platform fee + 2.9% + $0.30 payment processor
                          </p>
                          <div className="mt-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Active
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Next billing date
                          </p>
                          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                            N/A
                          </p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Link to="/subscription">
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500">
                            Manage Subscription
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <BillingInformation />

                <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Pay-Per-Use Benefits
                    </h3>
                    <div className="mt-5 bg-blue-50 rounded-lg p-6 dark:bg-blue-900/20">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            No Monthly Commitment
                          </h4>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <p>
                              You're currently on our Free plan with no monthly subscription fee.
                              You only pay when you make a sale:
                            </p>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                              <li className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                                <svg
                                  className="h-4 w-4 text-green-500 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                10% platform fee (vs. 2.9% on paid plans)
                              </li>
                              <li className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                                <svg
                                  className="h-4 w-4 text-green-500 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Standard payment processor fees (2.9% + $0.30)
                              </li>
                            </ul>
                            <div className="mt-3">
                              <Link
                                to="/pricing"
                                className="font-medium text-blue-800 underline hover:text-blue-700 dark:text-blue-200 dark:hover:text-blue-300"
                              >
                                Upgrade to a paid plan to reduce your fees
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Plan Comparison
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 dark:bg-gray-700">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">Free</h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                          No monthly fee
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                          10% + 2.9% + $0.30 per transaction
                        </p>
                        <ul className="mt-2 space-y-1">
                          <li className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                            <svg
                              className="h-4 w-4 text-green-500 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Up to 3 paywalls
                          </li>
                          <li className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                            <svg
                              className="h-4 w-4 text-green-500 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Basic analytics
                          </li>
                        </ul>
                        <div className="mt-4">
                          <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500">
                            Current Plan
                          </button>
                        </div>
                      </div>

                      <div className="border-2 border-indigo-500 rounded-lg p-4 relative dark:border-indigo-400 dark:bg-gray-700">
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-bl-lg rounded-tr-lg dark:bg-indigo-400 dark:text-gray-900">
                          Recommended
                        </div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">
                          Starter
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">$5/month</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                          2.9% + $0.30 per transaction
                        </p>
                        <ul className="mt-2 space-y-1">
                          <li className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                            <svg
                              className="h-4 w-4 text-green-500 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Up to 10 paywalls
                          </li>
                          <li className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                            <svg
                              className="h-4 w-4 text-green-500 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Basic analytics
                          </li>
                        </ul>
                        <div className="mt-4">
                          <button className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                            Upgrade
                          </button>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 dark:bg-gray-700">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">Pro</h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">$15/month</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                          2.5% + $0.30 per transaction
                        </p>
                        <ul className="mt-2 space-y-1">
                          <li className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                            <svg
                              className="h-4 w-4 text-green-500 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Unlimited paywalls
                          </li>
                          <li className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                            <svg
                              className="h-4 w-4 text-green-500 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Advanced analytics
                          </li>
                          <li className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                            <svg
                              className="h-4 w-4 text-green-500 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Custom branding
                          </li>
                        </ul>
                        <div className="mt-4">
                          <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500">
                            Upgrade
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'profile' ||
              activeTab === 'payment' ||
              activeTab === 'notifications') && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      historyIndex <= 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                    }`}
                  >
                    <svg
                      className="-ml-1 mr-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      historyIndex >= history.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                    }`}
                  >
                    <svg
                      className="-mr-1 ml-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a7 7 0 00-7 7v2a1 1 0 11-2 0v-2a9 9 0 019-9h5.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Redo
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      loading
                        ? 'bg-indigo-400 cursor-not-allowed dark:bg-indigo-500'
                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
