import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import paywallService, { type CreatePaywallData } from '../services/paywallService';
import { useAppData } from '../contexts/AppDataContext';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

const QuickCreatePaywall: React.FC = () => {
  const navigate = useNavigate();
  const { paywalls } = useAppData();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    type: 'file' as 'file' | 'url',
    contentId: '',
    url: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const paywallData: CreatePaywallData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        currency: formData.currency,
        type: formData.type,
        tags: formData.tags,
        pricingModel: 'one-time',
      };

      if (formData.type === 'file') {
        paywallData.contentId = formData.contentId;
      } else {
        paywallData.url = formData.url;
      }

      const newPaywall = await paywallService.createPaywall(paywallData);
      paywalls.refreshPaywalls();
      navigate(`/paywall/${newPaywall.id}`);
    } catch (err: unknown) {
      console.error('Error creating paywall:', err);
      if (isAxiosError(err)) {
        setError(err.message || 'Failed to create paywall');
      } else {
        setError('Failed to create paywall');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Paywall Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Paywall Type
        </label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'file' }))}
            className={`relative rounded-lg border px-6 py-4 flex items-center justify-center cursor-pointer focus:outline-none ${
              formData.type === 'file'
                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-400'
                : 'border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                File Upload
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'url' }))}
            className={`relative rounded-lg border px-6 py-4 flex items-center justify-center cursor-pointer focus:outline-none ${
              formData.type === 'url'
                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-400'
                : 'border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL Link
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Price
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm dark:text-gray-400">
              {CURRENCY_SYMBOLS[formData.currency] || '$'}
            </span>
          </div>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm dark:text-gray-400"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="NGN">NGN</option>
              <option value="GHS">GHS</option>
              <option value="ZAR">ZAR</option>
            </select>
          </div>
        </div>
      </div>

      {formData.type === 'file' ? (
        <div>
          <label
            htmlFor="contentId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Content ID
          </label>
          <input
            type="text"
            name="contentId"
            id="contentId"
            value={formData.contentId}
            onChange={handleChange}
            placeholder="Enter content ID"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      ) : (
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            URL
          </label>
          <input
            type="url"
            name="url"
            id="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com/content"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tags
        </label>
        <div className="mt-1 flex">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag"
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-500"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white dark:text-indigo-300 dark:hover:bg-indigo-800 dark:hover:text-indigo-200"
              >
                <span className="sr-only">Remove</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Review Your Paywall</h3>
        <div className="mt-4 space-y-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</span>
            <span className="text-sm text-gray-900 dark:text-white">{formData.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Description
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formData.description || 'No description'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formData.type === 'file' ? 'File Upload' : 'URL Link'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {CURRENCY_SYMBOLS[formData.currency] || '$'}
              {formData.price.toFixed(2)}
            </span>
          </div>
          {formData.type === 'file' && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Content ID
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {formData.contentId || 'Not set'}
              </span>
            </div>
          )}
          {formData.type === 'url' && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {formData.url || 'Not set'}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formData.tags.length > 0 ? formData.tags.join(', ') : 'No tags'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Quick Create Paywall" subtitle="Create a new paywall in just a few steps" />
      <main>
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                {/* Progress Steps */}
                <nav aria-label="Progress">
                  <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
                    {[1, 2, 3].map(stepNum => (
                      <li key={stepNum} className="md:flex-1">
                        {stepNum < step ? (
                          <button
                            onClick={() => setStep(stepNum)}
                            className="group pl-4 py-2 flex flex-col border-l-4 border-indigo-600 hover:border-indigo-800 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                          >
                            <span className="text-xs font-semibold tracking-wide uppercase text-indigo-600 group-hover:text-indigo-800 dark:text-indigo-400 dark:group-hover:text-indigo-300">
                              Step {stepNum}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Completed
                            </span>
                          </button>
                        ) : stepNum === step ? (
                          <button
                            onClick={() => setStep(stepNum)}
                            className="pl-4 py-2 flex flex-col border-l-4 border-indigo-600 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                            aria-current="step"
                          >
                            <span className="text-xs font-semibold tracking-wide uppercase text-indigo-600 dark:text-indigo-400">
                              Step {stepNum}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Current
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setStep(stepNum)}
                            className="group pl-4 py-2 flex flex-col border-l-4 border-gray-200 hover:border-gray-300 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4 dark:border-gray-700 dark:hover:border-gray-600"
                          >
                            <span className="text-xs font-semibold tracking-wide uppercase text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                              Step {stepNum}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Upcoming
                            </span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-4 py-5 sm:p-6">
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-900">
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
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                            Error
                          </h3>
                          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={step === 1}
                      className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        step === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      } dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`}
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Back
                    </button>

                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      >
                        Next
                        <svg
                          className="ml-2 -mr-1 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          loading
                            ? 'bg-indigo-400 cursor-not-allowed dark:bg-indigo-600'
                            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
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
                            Creating...
                          </>
                        ) : (
                          'Create Paywall'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuickCreatePaywall;
