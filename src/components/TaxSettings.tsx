import React, { useState } from 'react';

export interface TaxSettingsData {
  taxEnabled: boolean;
  taxRate: number;
  taxLocation: string;
  collectTax: boolean;
  taxNumber: string;
  taxExemptCustomers: boolean;
}

interface TaxSettingsProps {
  onSave: (settings: TaxSettingsData) => void;
  initialSettings?: TaxSettingsData;
}

const TaxSettings: React.FC<TaxSettingsProps> = ({ onSave, initialSettings }) => {
  const [taxEnabled, setTaxEnabled] = useState(initialSettings?.taxEnabled || false);
  const [taxRate, setTaxRate] = useState(initialSettings?.taxRate || 0);
  const [taxLocation, setTaxLocation] = useState(initialSettings?.taxLocation || 'US');
  const [collectTax, setCollectTax] = useState(initialSettings?.collectTax || false);
  const [taxNumber, setTaxNumber] = useState(initialSettings?.taxNumber || '');
  const [taxExemptCustomers, setTaxExemptCustomers] = useState(
    initialSettings?.taxExemptCustomers || false
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      taxEnabled,
      taxRate,
      taxLocation,
      collectTax,
      taxNumber,
      taxExemptCustomers,
    };
    onSave(settings);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Tax Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure tax collection for your sales.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Enable Tax Collection
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Collect taxes on sales based on customer location
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTaxEnabled(!taxEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                taxEnabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={taxEnabled}
            >
              <span className="sr-only">Enable tax collection</span>
              <span
                className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  taxEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {taxEnabled && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="taxLocation"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tax Location
                </label>
                <select
                  id="taxLocation"
                  name="taxLocation"
                  value={taxLocation}
                  onChange={e => setTaxLocation(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="US">United States</option>
                  <option value="EU">European Union</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="Global">Global (multiple jurisdictions)</option>
                </select>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Select the primary location where you collect sales tax
                </p>
              </div>

              <div>
                <label
                  htmlFor="taxRate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Default Tax Rate (%)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.01"
                    className="block w-full pr-12 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  The default tax rate applied to sales in your primary location
                </p>
              </div>

              <div>
                <label
                  htmlFor="taxNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tax Registration Number
                </label>
                <input
                  type="text"
                  id="taxNumber"
                  name="taxNumber"
                  value={taxNumber}
                  onChange={e => setTaxNumber(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., VAT number, GST number, etc."
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Your official tax registration number for reporting purposes
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Automatic Tax Calculation
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically calculate taxes based on customer location
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCollectTax(!collectTax)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    collectTax ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={collectTax}
                >
                  <span className="sr-only">Enable automatic tax calculation</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      collectTax ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {collectTax && (
                <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Automatic Tax Calculation Enabled
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>With automatic tax calculation enabled, the system will:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Detect customer location from IP address</li>
                          <li>Apply the correct tax rate for that jurisdiction</li>
                          <li>Handle exemption certificates for tax-exempt customers</li>
                          <li>Generate tax reports for filing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Tax-Exempt Customers
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow certain customers to be exempt from tax collection
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTaxExemptCustomers(!taxExemptCustomers)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    taxExemptCustomers ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={taxExemptCustomers}
                >
                  <span className="sr-only">Enable tax-exempt customers</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      taxExemptCustomers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Tax Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxSettings;
