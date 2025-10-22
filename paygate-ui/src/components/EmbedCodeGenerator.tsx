import React, { useState } from 'react';
import type { Paywall } from '../services/paywallService';

interface EmbedCodeGeneratorProps {
  paywall: Paywall;
}

const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ paywall }) => {
  const [embedType, setEmbedType] = useState<'iframe' | 'button' | 'link'>('iframe');
  const [customizations, setCustomizations] = useState({
    width: '100%',
    height: '500px',
    buttonText: 'Purchase Access',
    buttonStyle: 'primary',
  });

  const generateEmbedCode = () => {
    const baseUrl = `${window.location.origin}/p/${paywall.id}`;

    switch (embedType) {
      case 'iframe':
        return `<iframe src="${baseUrl}" width="${customizations.width}" height="${customizations.height}" frameborder="0"></iframe>`;
      case 'button':
        return `<a href="${baseUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: ${
          customizations.buttonStyle === 'primary' ? '#4f46e5' : '#6b7280'
        }; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">${customizations.buttonText}</a>`;
      case 'link':
        return `<a href="${baseUrl}" target="_blank">${customizations.buttonText}</a>`;
      default:
        return `<iframe src="${baseUrl}" width="${customizations.width}" height="${customizations.height}" frameborder="0"></iframe>`;
    }
  };

  const embedCode = generateEmbedCode();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Embed Code Generator
      </h3>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Embed Type
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setEmbedType('iframe')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              embedType === 'iframe'
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            iFrame
          </button>
          <button
            type="button"
            onClick={() => setEmbedType('button')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              embedType === 'button'
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Button
          </button>
          <button
            type="button"
            onClick={() => setEmbedType('link')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              embedType === 'link'
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Link
          </button>
        </div>
      </div>

      {embedType === 'iframe' && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="width"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Width
            </label>
            <input
              type="text"
              id="width"
              value={customizations.width}
              onChange={e => setCustomizations({ ...customizations, width: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="height"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Height
            </label>
            <input
              type="text"
              id="height"
              value={customizations.height}
              onChange={e => setCustomizations({ ...customizations, height: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      )}

      {embedType === 'button' && (
        <div className="mb-6">
          <div className="mb-4">
            <label
              htmlFor="buttonText"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Button Text
            </label>
            <input
              type="text"
              id="buttonText"
              value={customizations.buttonText}
              onChange={e => setCustomizations({ ...customizations, buttonText: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button Style
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setCustomizations({ ...customizations, buttonStyle: 'primary' })}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  customizations.buttonStyle === 'primary'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Primary
              </button>
              <button
                type="button"
                onClick={() => setCustomizations({ ...customizations, buttonStyle: 'secondary' })}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  customizations.buttonStyle === 'secondary'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Secondary
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Generated Embed Code
        </label>
        <div className="relative">
          <textarea
            readOnly
            value={embedCode}
            className="block w-full h-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute top-2 right-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Preview</h4>
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          {embedType === 'iframe' ? (
            <div
              className="border border-dashed border-gray-300 rounded-md flex items-center justify-center"
              style={{ width: customizations.width, height: customizations.height }}
            >
              <div className="text-center text-gray-500 dark:text-gray-400">
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
                <p className="mt-2">iFrame Preview</p>
                <p className="text-sm">{paywall.title}</p>
              </div>
            </div>
          ) : embedType === 'button' ? (
            <a
              href="#"
              onClick={e => e.preventDefault()}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: customizations.buttonStyle === 'primary' ? '#4f46e5' : '#6b7280',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 500,
              }}
            >
              {customizations.buttonText}
            </a>
          ) : (
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {customizations.buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeGenerator;
