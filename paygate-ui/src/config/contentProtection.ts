export const DRM_SETTINGS = {
  enableDrm: false,
  drmProvider: 'widevine',
  licenseServer: '',
  encryptionKey: '',
};

export const WATERMARK_SETTINGS = {
  enableWatermark: false,
  watermarkType: 'text',
  watermarkText: 'Confidential',
  watermarkImage: '',
  position: 'bottom-right',
  opacity: 50,
};

export const ACCESS_CONTROLS = {
  ipRestrictions: false,
  allowedIps: [''],
  geographicBlocking: false,
  blockedCountries: [],
  deviceLimit: false,
  maxDevices: 3,
  sessionTimeout: false,
  timeoutMinutes: 60,
};
