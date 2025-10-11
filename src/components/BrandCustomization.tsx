import React, { useState, useRef } from 'react';

export interface BrandSettings {
  logo: File | string | null;
  logoPreview: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain: string;
  domainVerified: boolean;
  brandName: string;
  brandTagline: string;
}

interface BrandCustomizationProps {
  onSave: (settings: BrandSettings) => void;
  initialSettings?: BrandSettings;
}

const BrandCustomization: React.FC<BrandCustomizationProps> = ({ onSave, initialSettings }) => {
  const [logo, setLogo] = useState<File | string | null>(initialSettings?.logo || null);
  const [logoPreview, setLogoPreview] = useState(initialSettings?.logoPreview || null);
  const [primaryColor, setPrimaryColor] = useState(initialSettings?.primaryColor || '#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState(
    initialSettings?.secondaryColor || '#f9fafb'
  );
  const [accentColor, setAccentColor] = useState(initialSettings?.accentColor || '#10b981');
  const [customDomain, setCustomDomain] = useState(initialSettings?.customDomain || '');
  const [domainVerified, setDomainVerified] = useState(initialSettings?.domainVerified || false);
  const [brandName, setBrandName] = useState(initialSettings?.brandName || '');
  const [brandTagline, setBrandTagline] = useState(initialSettings?.brandTagline || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      logo,
      logoPreview,
      primaryColor,
      secondaryColor,
      accentColor,
      customDomain,
      domainVerified,
      brandName,
      brandTagline,
    };
    onSave(settings);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // In a real app, you would upload the file to your server
    // For now, we'll just store the file object
    setLogo(file as File);
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const verifyDomain = () => {
    // In a real app, this would call your backend to verify the domain
    // For now, we'll just simulate verification
    alert(
      `To verify your domain "${customDomain}", please add the following DNS TXT record:\n\nName: @\nType: TXT\nValue: paygate-verification=abc123xyz\n\nAfter adding the record, click "Verify Domain" again.`
    );
    setDomainVerified(false);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Brand Customization
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize your brand identity and appearance.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-8">
          {/* Brand Identity */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Brand Identity
            </h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="brandName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Brand Name
                </label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Your brand name"
                />
              </div>
              <div>
                <label
                  htmlFor="brandTagline"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tagline/Slogan
                </label>
                <input
                  type="text"
                  id="brandTagline"
                  name="brandTagline"
                  value={brandTagline}
                  onChange={e => setBrandTagline(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Your tagline or slogan"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Logo</h4>
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <img
                    className="h-16 w-16 rounded-md object-contain"
                    src={logoPreview ?? ''}
                    alt="Logo preview"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-md w-16 h-16 flex items-center justify-center dark:bg-gray-700">
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
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleLogoChange}
                    ref={fileInputRef}
                  />
                </label>
                <div className="mt-2 flex space-x-2">
                  {logo && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, or SVG up to 5MB. Recommended size: 200x200 pixels.
            </p>
          </div>

          {/* Color Scheme */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Color Scheme</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="primaryColor"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Primary Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 border border-gray-300 rounded-md cursor-pointer dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {primaryColor}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Main brand color used for buttons and highlights
                </p>
              </div>
              <div>
                <label
                  htmlFor="secondaryColor"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Secondary Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="h-10 w-10 border border-gray-300 rounded-md cursor-pointer dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {secondaryColor}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Background and subtle UI elements
                </p>
              </div>
              <div>
                <label
                  htmlFor="accentColor"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Accent Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="accentColor"
                    name="accentColor"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="h-10 w-10 border border-gray-300 rounded-md cursor-pointer dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {accentColor}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Links and interactive elements
                </p>
              </div>
            </div>
          </div>

          {/* Custom Domain */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Custom Domain
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="customDomain"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Custom Domain
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                    https://
                  </span>
                  <input
                    type="text"
                    id="customDomain"
                    name="customDomain"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="yourbrand.com"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Use your own domain for paywall URLs (requires DNS configuration)
                </p>
              </div>

              {customDomain && (
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md dark:bg-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Domain Status
                      </p>
                      <p
                        className={`text-sm ${domainVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}
                      >
                        {domainVerified ? 'Verified' : 'Verification Required'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={verifyDomain}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500"
                    >
                      {domainVerified ? 'Re-verify' : 'Verify Domain'}
                    </button>
                  </div>

                  {!domainVerified && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-md dark:bg-blue-900/20">
                      <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        DNS Configuration Required
                      </h5>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                        To verify your domain, add the following DNS TXT record:
                      </p>
                      <div className="mt-2 p-3 bg-white rounded-md dark:bg-gray-600">
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          Name: @<br />
                          Type: TXT
                          <br />
                          Value: paygate-verification=abc123xyz
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        After adding the record, click "Verify Domain" above.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Brand Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandCustomization;
