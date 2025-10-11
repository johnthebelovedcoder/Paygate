import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import billingService from '../services/billingService';
import type { PaymentMethod, Invoice } from '../services/billingService';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';

interface BillingInformationProps {
  onBillingUpdate?: () => void;
}

const BillingInformation: React.FC<BillingInformationProps> = ({ onBillingUpdate }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'payment-methods' | 'invoices' | 'address'>(
    'payment-methods'
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment method form state
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const [methods, invs] = await Promise.all([
          billingService.getPaymentMethods(),
          billingService.getInvoices(),
        ]);
        setPaymentMethods(methods);
        setInvoices(invs);
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching billing data:', error);
        setError(error.message || 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Format currency
  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  // Format card number
  const formatCardNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    const match = cleanNumber.match(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (!match) return '';
    return (
      match[1] +
      (match[2] ? ' ' + match[2] : '') +
      (match[3] ? ' ' + match[3] : '') +
      (match[4] ? ' ' + match[4] : '')
    );
  };

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
    }
    return cleanValue;
  };

  // Handle expiry date change
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  // Handle add payment method
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      const errorMessage = 'Please fill in all fields';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      return;
    }

    // Validate card number (simple validation)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (
      cleanCardNumber.length < 13 ||
      cleanCardNumber.length > 19 ||
      !/^\d+$/.test(cleanCardNumber)
    ) {
      const errorMessage = 'Please enter a valid card number';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      return;
    }

    // Validate expiry date
    const [month, year] = expiryDate.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (
      !month ||
      !year ||
      month < 1 ||
      month > 12 ||
      year < currentYear ||
      (year === currentYear && month < currentMonth)
    ) {
      const errorMessage = 'Please enter a valid expiry date';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      return;
    }

    // Validate CVV
    if (cvv.length < 3 || cvv.length > 4 || !/^\d+$/.test(cvv)) {
      const errorMessage = 'Please enter a valid CVV';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newMethod = await billingService.addPaymentMethod({
        cardNumber: cleanCardNumber,
        expiryDate,
        cvv,
        cardHolderName,
      });

      setPaymentMethods([...paymentMethods, newMethod]);
      showNotification('Payment method added successfully', 'success');

      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardHolderName('');
      setIsAddingPaymentMethod(false);

      // Notify parent component if needed
      if (onBillingUpdate) {
        onBillingUpdate();
      }
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || 'Failed to add payment method';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = async (id: string) => {
    const confirmation = confirm(
      'Are you sure you want to remove this payment method? This action cannot be undone.'
    );
    if (!confirmation) {
      return;
    }

    try {
      setLoading(true);
      await billingService.deletePaymentMethod(id);
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
      showNotification('Payment method removed successfully', 'success');
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || 'Failed to remove payment method';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle set default payment method
  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      setLoading(true);
      await billingService.setDefaultPaymentMethod(id);
      setPaymentMethods(
        paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === id,
        }))
      );
      showNotification('Default payment method updated successfully', 'success');
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || 'Failed to update default payment method';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle update billing address
  const handleUpdateBillingAddress = () => {
    alert('Redirect to profile to update billing address');
  };

  if (loading && paymentMethods.length === 0 && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6 dark:bg-red-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payment-methods'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Payment Methods
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'address'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Billing Address
            </button>
          </nav>
        </div>

        {/* Payment Methods Tab */}
        {activeTab === 'payment-methods' && (
          <div>
            {isAddingPaymentMethod ? (
              <form onSubmit={handleAddPaymentMethod} className="space-y-6">
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cvv"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cardHolderName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardHolderName"
                    value={cardHolderName}
                    onChange={e => setCardHolderName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPaymentMethod(false);
                      setError(null);
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? 'Adding...' : 'Add Card'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Payment Methods
                  </h3>
                  <button
                    onClick={() => setIsAddingPaymentMethod(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    Add Payment Method
                  </button>
                </div>

                {paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map(method => (
                      <div
                        key={method.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          method.isDefault
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center dark:bg-gray-700">
                            {method.brand === 'visa' ? (
                              <svg
                                className="h-6 w-6 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M22.7 4H1.3A1.3 1.3 0 000 5.3v13.4A1.3 1.3 0 001.3 20h21.4a1.3 1.3 0 001.3-1.3V5.3A1.3 1.3 0 0022.7 4zM1.3 5.6h21.4c.1 0 .2.1.2.2v1.6H1.1V5.8c0-.1.1-.2.2-.2zm21.4 13.8H1.3c-.1 0-.2-.1-.2-.2v-8.3h21.8v8.3c0 .1-.1.2-.2.2zM2.8 8.6h2.3v6.3H2.8zm3.7 0H10v1.5h-2.1v1.1H9.9v1.5H6.5zm4.8 0h3.7v.9h-2.7v1.2h2.6v.9h-2.6v1.3h2.8v.9h-3.8zm8.1 0h.9l-1.7 6.3h-.8l-.4-1.6h-1.6l-.5 1.6h-.7l1.8-6.3zm-1.5 3.8l-.4-1.5c-.1-.3-.2-.6-.3-.9h-.1l-.3.9-.4 1.5h.9z" />
                              </svg>
                            ) : method.brand === 'mastercard' ? (
                              <svg
                                className="h-6 w-6 text-orange-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 24C5.4 24 0 18.6 0 12S5.4 0 12 0s12 5.4 12 12-5.4 12-12 12zm0-22.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5z" />
                                <path d="M12 18.8c-3.5 0-6.3-2.8-6.3-6.3s2.8-6.3 6.3-6.3 6.3 2.8 6.3 6.3-2.8 6.3-6.3 6.3z" />
                                <path d="M12 16.5c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
                              </svg>
                            ) : (
                              <svg
                                className="h-6 w-6 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ending
                              in ****{method.last4}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Expires **/**{method.expiryYear.toString().slice(-2)}
                            </p>
                            {method.isDefault && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1 dark:bg-indigo-900/30 dark:text-indigo-400">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!method.isDefault && (
                            <button
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No payment methods
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by adding a new payment method.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setIsAddingPaymentMethod(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      >
                        <svg
                          className="-ml-1 mr-2 h-5 w-5"
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
                        Add Payment Method
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Invoice History
            </h3>
            {invoices.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg dark:ring-gray-700">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-white"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {invoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs dark:text-gray-400">
                          <div className="truncate">{invoice.description}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : invoice.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No invoices
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You don't have any invoices yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Billing Address Tab */}
        {activeTab === 'address' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Billing Address
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.name || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.email || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.country
                    ? user.country === 'NG'
                      ? 'Nigeria'
                      : user.country === 'GH'
                        ? 'Ghana'
                        : user.country === 'ZA'
                          ? 'South Africa'
                          : user.country === 'GB'
                            ? 'United Kingdom'
                            : user.country === 'US'
                              ? 'United States'
                              : user.country
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.currency
                    ? user.currency === 'NGN'
                      ? 'Nigerian Naira (₦)'
                      : user.currency === 'USD'
                        ? 'US Dollar ($)'
                        : user.currency === 'EUR'
                          ? 'Euro (€)'
                          : user.currency === 'GBP'
                            ? 'British Pound (£)'
                            : user.currency === 'GHS'
                              ? 'Ghanaian Cedi (GH₵)'
                              : user.currency === 'ZAR'
                                ? 'South African Rand (R)'
                                : user.currency
                    : 'USD'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleUpdateBillingAddress}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                Update Billing Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingInformation;
