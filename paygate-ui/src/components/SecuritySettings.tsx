import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface PasswordPolicy {
  minLength: number;
  requireSymbols: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  requireLowercase: boolean;
}

export interface SecuritySettingsData {
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  backupCodes: string[];
  emailLoginAlerts: boolean;
  smsLoginAlerts: boolean;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string[];
  sessionTimeout: number;
  failedLoginAttempts: number;
  accountLockoutDuration: number;
  dataEncryptionEnabled: boolean;
  auditLogRetention: number;
  securityNotifications: boolean;
  apiAccessEnabled: boolean;
  apiKeys: ApiKey[];
  webhookSecurityEnabled: boolean;
  webhookSecret: string;
  securityQuestionsEnabled: boolean;
  securityQuestions: { question: string; answer: string }[];
  deviceManagementEnabled: boolean;
  trustedDevices: { id: string; name: string; lastLogin: string }[];
  geoBlockingEnabled: boolean;
  blockedCountries: string[];
  passwordPolicy: PasswordPolicy;
  accessLogs: AccessLog[];
}

interface AccessLog {
  timestamp: string;
  ipAddress: string;
  location: string;
  action: string;
}

interface SecuritySettingsProps {
  onSave: (settings: SecuritySettingsData) => void;
  initialSettings?: SecuritySettingsData;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onSave, initialSettings }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    initialSettings?.twoFactorEnabled || false
  );
  const [twoFactorMethod, setTwoFactorMethod] = useState(
    initialSettings?.twoFactorMethod || 'authenticator'
  );
  const [backupCodes, setBackupCodes] = useState(initialSettings?.backupCodes || []);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialSettings?.apiKeys || []);
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: ['read'] });
  const [accessLogs, setAccessLogs] = useState(initialSettings?.accessLogs || []);
  const [sessionTimeout, setSessionTimeout] = useState(initialSettings?.sessionTimeout || 30);
  const [ipWhitelist, setIpWhitelist] = useState(initialSettings?.ipWhitelist || []);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settings: SecuritySettingsData = {
        twoFactorEnabled,
        twoFactorMethod,
        backupCodes,
        apiKeys,
        accessLogs,
        sessionTimeout,
        ipWhitelist,
        emailLoginAlerts: initialSettings?.emailLoginAlerts || false,
        smsLoginAlerts: initialSettings?.smsLoginAlerts || false,
        ipWhitelistEnabled: initialSettings?.ipWhitelistEnabled || false,
        failedLoginAttempts: initialSettings?.failedLoginAttempts || 0,
        accountLockoutDuration: initialSettings?.accountLockoutDuration || 0,
        dataEncryptionEnabled: initialSettings?.dataEncryptionEnabled || false,
        auditLogRetention: initialSettings?.auditLogRetention || 0,
        securityNotifications: initialSettings?.securityNotifications || false,
        apiAccessEnabled: initialSettings?.apiAccessEnabled || false,
        webhookSecurityEnabled: initialSettings?.webhookSecurityEnabled || false,
        webhookSecret: initialSettings?.webhookSecret || '',
        securityQuestionsEnabled: initialSettings?.securityQuestionsEnabled || false,
        securityQuestions: initialSettings?.securityQuestions || [],
        deviceManagementEnabled: initialSettings?.deviceManagementEnabled || false,
        trustedDevices: initialSettings?.trustedDevices || [],
        geoBlockingEnabled: initialSettings?.geoBlockingEnabled || false,
        blockedCountries: initialSettings?.blockedCountries || [],
        passwordPolicy: initialSettings?.passwordPolicy || {
          minLength: 8,
          requireSymbols: true,
          requireNumbers: true,
          requireUppercase: true,
          requireLowercase: true,
        },
      };
      await onSave(settings);
    } catch (err: unknown) {
      console.error('Error saving security settings:', err);
      if (isAxiosError(err)) {
        setError(err.message || 'Failed to save security settings');
      } else {
        setError('Failed to save security settings');
      }
    }
  };

  const generateBackupCodes = () => {
    // In a real app, this would generate actual backup codes
    const codes = Array.from({ length: 10 }, (_, i) =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    setShowBackupCodes(true);
  };

  const addApiKey = () => {
    if (!newApiKey.name.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    const apiKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      key: `pk_${Math.random().toString(36).substring(2, 12)}`,
      permissions: newApiKey.permissions,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setApiKeys([...apiKeys, apiKey]);
    setNewApiKey({ name: '', permissions: ['read'] });
  };

  const revokeApiKey = (id: string) => {
    if (window.confirm('Are you sure you want to revoke this API key?')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  const addIpToWhitelist = (ip: string) => {
    if (!ip.trim()) {
      alert('Please enter a valid IP address');
      return;
    }

    // Simple IP validation (in a real app, you'd want more robust validation)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(ip)) {
      alert('Please enter a valid IP address (e.g., 192.168.1.1 or 192.168.1.0/24)');
      return;
    }

    if (!ipWhitelist.includes(ip)) {
      setIpWhitelist([...ipWhitelist, ip]);
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter((item: string) => item !== ip));
  };

  return (
    <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Security Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account security and access controls.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-8">
          {/* Two-Factor Authentication */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Two-Factor Authentication
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">Enable 2FA</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={twoFactorEnabled}
              >
                <span className="sr-only">Enable two-factor authentication</span>
                <span
                  className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {twoFactorEnabled && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    2FA Method
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="authenticator"
                        name="two-factor-method"
                        type="radio"
                        checked={twoFactorMethod === 'authenticator'}
                        onChange={() => setTwoFactorMethod('authenticator')}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="authenticator"
                        className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Authenticator App
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="sms"
                        name="two-factor-method"
                        type="radio"
                        checked={twoFactorMethod === 'sms'}
                        onChange={() => setTwoFactorMethod('sms')}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="sms"
                        className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        SMS Text Message
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="email"
                        name="two-factor-method"
                        type="radio"
                        checked={twoFactorMethod === 'email'}
                        onChange={() => setTwoFactorMethod('email')}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="email"
                        className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email
                      </label>
                    </div>
                  </div>
                </div>

                {backupCodes.length === 0 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={generateBackupCodes}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      Generate Backup Codes
                    </button>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Backup codes can be used if you lose access to your 2FA device
                    </p>
                  </div>
                )}

                {backupCodes.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Backup Codes
                      </h5>
                      <button
                        type="button"
                        onClick={() => setShowBackupCodes(!showBackupCodes)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {showBackupCodes ? 'Hide' : 'Show'} Codes
                      </button>
                    </div>
                    {showBackupCodes && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {backupCodes.map((code: string, index: number) => (
                          <div
                            key={index}
                            className="text-sm font-mono bg-gray-100 p-2 rounded dark:bg-gray-700"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Store these codes in a secure location. Each code can only be used once.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Session Management */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Session Management
            </h4>
            <div>
              <label
                htmlFor="sessionTimeout"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Session Timeout (minutes)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  id="sessionTimeout"
                  value={sessionTimeout}
                  onChange={e => setSessionTimeout(Number(e.target.value))}
                  min="1"
                  max="1440"
                  className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Users will be automatically logged out after this period of inactivity
              </p>
            </div>
          </div>

          {/* IP Whitelist */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">IP Whitelist</h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="ipAddress"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Add IP Address
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="ipAddress"
                    placeholder="e.g., 192.168.1.1 or 192.168.1.0/24"
                    className="block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Only allow access from these IP addresses (leave empty to allow all IPs)
                </p>
              </div>

              {ipWhitelist.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Whitelisted IPs
                  </h5>
                  <ul className="mt-2 divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                    {ipWhitelist.map((ip: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                      >
                        <div className="flex w-0 flex-1 items-center">
                          <span className="font-mono">{ip}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                            onClick={() => removeIpFromWhitelist(ip)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* API Keys */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">API Keys</h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="apiKeyName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Create New API Key
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="apiKeyName"
                    value={newApiKey.name}
                    onChange={e => setNewApiKey({ ...newApiKey, name: e.target.value })}
                    placeholder="e.g., Mobile App, Analytics Dashboard"
                    className="block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addApiKey}
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permissions
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="permission-read"
                      name="permissions"
                      type="checkbox"
                      checked={newApiKey.permissions.includes('read')}
                      onChange={e => {
                        if (e.target.checked) {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: [...newApiKey.permissions, 'read'],
                          });
                        } else {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: newApiKey.permissions.filter(p => p !== 'read'),
                          });
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="permission-read"
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Read (view data)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="permission-write"
                      name="permissions"
                      type="checkbox"
                      checked={newApiKey.permissions.includes('write')}
                      onChange={e => {
                        if (e.target.checked) {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: [...newApiKey.permissions, 'write'],
                          });
                        } else {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: newApiKey.permissions.filter(p => p !== 'write'),
                          });
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="permission-write"
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Write (modify data)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="permission-admin"
                      name="permissions"
                      type="checkbox"
                      checked={newApiKey.permissions.includes('admin')}
                      onChange={e => {
                        if (e.target.checked) {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: [...newApiKey.permissions, 'admin'],
                          });
                        } else {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: newApiKey.permissions.filter(p => p !== 'admin'),
                          });
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="permission-admin"
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Admin (full access)
                    </label>
                  </div>
                </div>
              </div>

              {apiKeys.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Existing API Keys
                  </h5>
                  <ul className="mt-2 divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                    {apiKeys.map((key: ApiKey) => (
                      <li
                        key={key.id}
                        className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                      >
                        <div className="flex w-0 flex-1 items-center">
                          <span className="font-medium">{key.name}</span>
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            {key.permissions.join(', ')}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                          {key.lastUsed && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                              Last used: {new Date(key.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                          <button
                            type="button"
                            className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => revokeApiKey(key.id)}
                          >
                            Revoke
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Access Logs */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Access Logs</h4>
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View All Logs
              </button>
            </div>
            <div className="mt-4">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        IP Address
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {accessLogs.slice(0, 5).map((log: AccessLog, index: number) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {log.ipAddress}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {log.location}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {log.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Recent access attempts to your account
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Security Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;
