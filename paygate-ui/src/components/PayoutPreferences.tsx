import React, { useState } from 'react';

interface BankAccountDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  iban: string;
}

export interface PayoutSettings {
  payoutMethod: 'bank' | 'paypal' | 'stripe';
  bankAccount: BankAccountDetails | null;
  paypalEmail: string | null;
  payoutSchedule: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  minimumPayout: number;
  taxId: string;
}

interface PayoutPreferencesProps {
  onSave: (preferences: PayoutSettings) => void;
  initialPreferences?: PayoutSettings;
}

const PayoutPreferences: React.FC<PayoutPreferencesProps> = ({ onSave, initialPreferences }) => {
  const [payoutMethod, setPayoutMethod] = useState(initialPreferences?.payoutMethod || 'bank');
  const [bankAccount, setBankAccount] = useState({
    accountHolderName: initialPreferences?.bankAccount?.accountHolderName || '',
    bankName: initialPreferences?.bankAccount?.bankName || '',
    accountNumber: initialPreferences?.bankAccount?.accountNumber || '',
    routingNumber: initialPreferences?.bankAccount?.routingNumber || '',
    swiftCode: initialPreferences?.bankAccount?.swiftCode || '',
    iban: initialPreferences?.bankAccount?.iban || '',
  });
  const [paypalEmail, setPaypalEmail] = useState(initialPreferences?.paypalEmail || '');
  const [payoutSchedule, setPayoutSchedule] = useState(
    initialPreferences?.payoutSchedule || 'monthly'
  );
  const [minimumPayout, setMinimumPayout] = useState(initialPreferences?.minimumPayout || 100);
  const [taxId, setTaxId] = useState(initialPreferences?.taxId || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const preferences = {
      payoutMethod,
      bankAccount: payoutMethod === 'bank' ? bankAccount : null,
      paypalEmail: payoutMethod === 'paypal' ? paypalEmail : null,
      payoutSchedule,
      minimumPayout,
      taxId,
    };
    onSave(preferences);
  };

  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankAccount(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Payout Preferences
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure how and when you receive payments for your sales.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div>
            <fieldset>
              <legend className="text-base font-medium text-gray-900 dark:text-white">
                Payout Method
              </legend>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="payout-bank"
                    name="payout-method"
                    type="radio"
                    checked={payoutMethod === 'bank'}
                    onChange={() => setPayoutMethod('bank')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="payout-bank"
                    className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Bank Transfer
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="payout-paypal"
                    name="payout-method"
                    type="radio"
                    checked={payoutMethod === 'paypal'}
                    onChange={() => setPayoutMethod('paypal')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="payout-paypal"
                    className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    PayPal
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="payout-stripe"
                    name="payout-method"
                    type="radio"
                    checked={payoutMethod === 'stripe'}
                    onChange={() => setPayoutMethod('stripe')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="payout-stripe"
                    className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Stripe Connect
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          {payoutMethod === 'bank' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Bank Account Details
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="accountHolderName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    id="accountHolderName"
                    name="accountHolderName"
                    value={bankAccount.accountHolderName}
                    onChange={handleBankAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bankName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={bankAccount.bankName}
                    onChange={handleBankAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="accountNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={bankAccount.accountNumber}
                    onChange={handleBankAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="routingNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Routing Number
                  </label>
                  <input
                    type="text"
                    id="routingNumber"
                    name="routingNumber"
                    value={bankAccount.routingNumber}
                    onChange={handleBankAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="swiftCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    SWIFT/BIC Code
                  </label>
                  <input
                    type="text"
                    id="swiftCode"
                    name="swiftCode"
                    value={bankAccount.swiftCode}
                    onChange={handleBankAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="iban"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    IBAN (if applicable)
                  </label>
                  <input
                    type="text"
                    id="iban"
                    name="iban"
                    value={bankAccount.iban}
                    onChange={handleBankAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {payoutMethod === 'paypal' && (
            <div>
              <label
                htmlFor="paypalEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                PayPal Email Address
              </label>
              <input
                type="email"
                id="paypalEmail"
                name="paypalEmail"
                value={paypalEmail}
                onChange={e => setPaypalEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="payoutSchedule"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Payout Schedule
              </label>
              <select
                id="payoutSchedule"
                name="payoutSchedule"
                value={payoutSchedule}
                onChange={e =>
                  setPayoutSchedule(e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly')
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="minimumPayout"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Minimum Payout Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="minimumPayout"
                  name="minimumPayout"
                  value={minimumPayout}
                  onChange={e => setMinimumPayout(Number(e.target.value))}
                  className="block w-full pl-7 pr-12 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                  min="0"
                  step="1"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="taxId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tax ID (for tax reporting)
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., EIN, VAT number, etc."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Payout Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutPreferences;
