import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

const ContentProtection: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    drm: {
      enableDrm: false,
      drmProvider: "widevine",
      licenseServer: "",
      encryptionKey: ""
    },
    watermark: {
      enableWatermark: false,
      watermarkType: "text",
      watermarkText: "Confidential",
      position: "bottom-right",
      opacity: 50
    },
    accessControls: {
      ipRestrictions: false,
      allowedIps: [],
      geographicBlocking: false,
      blockedCountries: [],
      deviceLimit: false,
      maxDevices: 3,
      sessionTimeout: false,
      timeoutMinutes: 60
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProtectionSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getContentProtectionSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching content protection settings:', err);
        setError('Failed to load protection settings');
      } finally {
        setLoading(false);
      }
    };

    fetchProtectionSettings();
  }, []);

  const handleDrmChange = (field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      drm: {
        ...prev.drm,
        [field]: value
      }
    }));
  };

  const handleWatermarkChange = (field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      watermark: {
        ...prev.watermark,
        [field]: value
      }
    }));
  };

  const handleAccessControlChange = (
    field: string,
    value: string | boolean | number | string[]
  ) => {
    setSettings(prev => ({
      ...prev,
      accessControls: {
        ...prev.accessControls,
        [field]: value
      }
    }));
  };

  const addAllowedIp = () => {
    setSettings(prev => ({
      ...prev,
      accessControls: {
        ...prev.accessControls,
        allowedIps: [...prev.accessControls.allowedIps, '']
      }
    }));
  };

  const updateAllowedIp = (index: number, value: string) => {
    setSettings(prev => {
      const newIps = [...prev.accessControls.allowedIps];
      newIps[index] = value;
      return {
        ...prev,
        accessControls: {
          ...prev.accessControls,
          allowedIps: newIps
        }
      };
    });
  };

  const removeAllowedIp = (index: number) => {
    if (settings.accessControls.allowedIps.length > 1) {
      setSettings(prev => ({
        ...prev,
        accessControls: {
          ...prev.accessControls,
          allowedIps: prev.accessControls.allowedIps.filter((_: any, i: number) => i !== index)
        }
      }));
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      await analyticsService.updateContentProtectionSettings(settings);
      alert('Protection settings saved successfully!');
    } catch (err) {
      console.error('Error saving protection settings:', err);
      setError('Failed to save protection settings');
      alert('Error saving protection settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && settings.drm.enableDrm === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading protection settings</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">DRM Settings</h3>

        <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Digital Rights Management
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Protect your content with industry-standard DRM
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.drm.enableDrm}
                onChange={e => handleDrmChange('enableDrm', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {settings.drm.enableDrm && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  DRM Provider
                </label>
                <select
                  value={settings.drm.drmProvider}
                  onChange={e => handleDrmChange('drmProvider', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="widevine">Widevine (Chrome, Firefox)</option>
                  <option value="playready">PlayReady (Edge, Internet Explorer)</option>
                  <option value="fairplay">FairPlay (Safari)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  License Server URL
                </label>
                <input
                  type="url"
                  value={settings.drm.licenseServer}
                  onChange={e => handleDrmChange('licenseServer', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="https://your-license-server.com/license"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Encryption Key
                </label>
                <input
                  type="password"
                  value={settings.drm.encryptionKey}
                  onChange={e => handleDrmChange('encryptionKey', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter your encryption key"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Watermarking</h3>

        <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Content Watermarking
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add watermarks to deter unauthorized sharing
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.watermark.enableWatermark}
                onChange={e => handleWatermarkChange('enableWatermark', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {settings.watermark.enableWatermark && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Watermark Type
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="watermark-text"
                      name="watermark-type"
                      checked={settings.watermark.watermarkType === 'text'}
                      onChange={() => handleWatermarkChange('watermarkType', 'text')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="watermark-text"
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Text Watermark
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="watermark-image"
                      name="watermark-type"
                      checked={settings.watermark.watermarkType === 'image'}
                      onChange={() => handleWatermarkChange('watermarkType', 'image')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="watermark-image"
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Image Watermark
                    </label>
                  </div>
                </div>
              </div>

              {settings.watermark.watermarkType === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={settings.watermark.watermarkText}
                    onChange={e => handleWatermarkChange('watermarkText', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Confidential"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Watermark Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-gray-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="image/*" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Position
                </label>
                <select
                  value={settings.watermark.position}
                  onChange={e => handleWatermarkChange('position', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="center">Center</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Opacity: {settings.watermark.opacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.watermark.opacity}
                  onChange={e => handleWatermarkChange('opacity', parseInt(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Access Controls</h3>

        <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="space-y-6">
            {/* IP Restrictions */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    IP Address Restrictions
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Limit access to specific IP addresses
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.accessControls.ipRestrictions}
                    onChange={e => handleAccessControlChange('ipRestrictions', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {settings.accessControls.ipRestrictions && (
                <div className="mt-4 space-y-3">
                  {settings.accessControls.allowedIps.map((ip: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={ip}
                        onChange={e => updateAllowedIp(index, e.target.value)}
                        placeholder="Enter IP address (e.g., 192.168.1.1)"
                        className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                      {settings.accessControls.allowedIps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAllowedIp(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAllowedIp}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    <svg
                      className="-ml-0.5 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add IP Address
                  </button>
                </div>
              )}
            </div>

            {/* Geographic Blocking */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Geographic Blocking
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Restrict access by country
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.accessControls.geographicBlocking}
                    onChange={e =>
                      handleAccessControlChange('geographicBlocking', e.target.checked)
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {settings.accessControls.geographicBlocking && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Blocked Countries
                  </label>
                  <select
                    multiple
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    size={5}
                  >
                    <option value="CN">China</option>
                    <option value="RU">Russia</option>
                    <option value="KP">North Korea</option>
                    <option value="IR">Iran</option>
                    <option value="SY">Syria</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Hold Ctrl/Cmd to select multiple countries
                  </p>
                </div>
              )}
            </div>

            {/* Device Limit */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Device Limit
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Limit simultaneous device access
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.accessControls.deviceLimit}
                    onChange={e => handleAccessControlChange('deviceLimit', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {settings.accessControls.deviceLimit && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maximum Devices: {settings.accessControls.maxDevices}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.accessControls.maxDevices}
                    onChange={e =>
                      handleAccessControlChange('maxDevices', parseInt(e.target.value))
                    }
                    className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              )}
            </div>

            {/* Session Timeout */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Session Timeout
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically end inactive sessions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.accessControls.sessionTimeout}
                    onChange={e => handleAccessControlChange('sessionTimeout', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {settings.accessControls.sessionTimeout && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timeout Duration: {settings.accessControls.timeoutMinutes} minutes
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={settings.accessControls.timeoutMinutes}
                    onChange={e =>
                      handleAccessControlChange('timeoutMinutes', parseInt(e.target.value))
                    }
                    className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveSettings}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Protection Settings'
          )}
        </button>
      </div>
    </div>
  );
};

export default ContentProtection;