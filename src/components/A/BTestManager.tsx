import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  type: 'pricing' | 'content' | 'design' | 'messaging';
  objective: 'conversion' | 'revenue' | 'engagement';
  startDate: string;
  endDate: string;
  currentSample: number;
  isWinnerDetermined: boolean;
  winnerVariantId?: string;
  variants: Variant[];
}

interface Variant {
  id: string;
  name: string;
  description: string;
  weight: number;
  convertedCount: number;
  totalVisitors: number;
  conversionRate: number;
}

const ABTestManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'experiments' | 'create' | 'analytics'>('experiments');
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [experimentName, setExperimentName] = useState('');
  const [experimentDescription, setExperimentDescription] = useState('');
  const [experimentType, setExperimentType] = useState<
    'pricing' | 'content' | 'design' | 'messaging'
  >('content');
  const [objective, setObjective] = useState<'conversion' | 'revenue' | 'engagement'>('conversion');
  const [variants, setVariants] = useState<Variant[]>([
    {
      id: '1',
      name: 'A (Control)',
      description: 'Original version',
      weight: 0.5,
      convertedCount: 0,
      totalVisitors: 0,
      conversionRate: 0,
    },
    {
      id: '2',
      name: 'B (Test)',
      description: 'Modified version',
      weight: 0.5,
      convertedCount: 0,
      totalVisitors: 0,
      conversionRate: 0,
    },
  ]);

  // Mock data for demonstration
  useEffect(() => {
    const mockExperiments: Experiment[] = [
      {
        id: '1',
        name: 'Pricing Strategy Test',
        description: 'Testing higher price point vs current price',
        status: 'running',
        type: 'pricing',
        objective: 'conversion',
        startDate: '2023-06-15',
        endDate: '2023-07-15',
        currentSample: 2450,
        isWinnerDetermined: false,
        variants: [
          {
            id: '1',
            name: 'A (Control)',
            description: '$49.99 per month',
            weight: 0.5,
            convertedCount: 120,
            totalVisitors: 1200,
            conversionRate: 10.0,
          },
          {
            id: '2',
            name: 'B (Test)',
            description: '$59.99 per month',
            weight: 0.5,
            convertedCount: 110,
            totalVisitors: 1250,
            conversionRate: 8.8,
          },
        ],
      },
      {
        id: '2',
        name: 'CTA Button Color',
        description: 'Testing red vs blue CTA buttons',
        status: 'completed',
        type: 'design',
        objective: 'conversion',
        startDate: '2023-05-01',
        endDate: '2023-05-30',
        currentSample: 4200,
        isWinnerDetermined: true,
        winnerVariantId: '1',
        variants: [
          {
            id: '1',
            name: 'A (Red)',
            description: 'Red button',
            weight: 0.5,
            convertedCount: 180,
            totalVisitors: 2100,
            conversionRate: 8.57,
          },
          {
            id: '2',
            name: 'B (Blue)',
            description: 'Blue button',
            weight: 0.5,
            convertedCount: 150,
            totalVisitors: 2100,
            conversionRate: 7.14,
          },
        ],
      },
      {
        id: '3',
        name: 'Headline Optimization',
        description: 'Testing different headline approaches',
        status: 'draft',
        type: 'messaging',
        objective: 'engagement',
        startDate: '2023-07-20',
        endDate: '2023-08-20',
        currentSample: 0,
        isWinnerDetermined: false,
        variants: [
          {
            id: '1',
            name: 'A (Control)',
            description: 'Original headline',
            weight: 0.5,
            convertedCount: 0,
            totalVisitors: 0,
            conversionRate: 0,
          },
          {
            id: '2',
            name: 'B (Test)',
            description: 'New headline',
            weight: 0.5,
            convertedCount: 0,
            totalVisitors: 0,
            conversionRate: 0,
          },
        ],
      },
    ];

    setExperiments(mockExperiments);
  }, []);

  const handleCreateExperiment = () => {
    if (!experimentName) {
      alert('Please enter an experiment name');
      return;
    }

    const newExperiment: Experiment = {
      id: (experiments.length + 1).toString(),
      name: experimentName,
      description: experimentDescription,
      status: 'draft',
      type: experimentType,
      objective: objective,
      startDate: new Date().toISOString().split('T')[0] || new Date().toISOString(),
      endDate:
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      currentSample: 0,
      isWinnerDetermined: false,
      variants: variants,
    };

    setExperiments([...experiments, newExperiment]);
    setExperimentName('');
    setExperimentDescription('');
    setVariants([
      {
        id: '1',
        name: 'A (Control)',
        description: 'Original version',
        weight: 0.5,
        convertedCount: 0,
        totalVisitors: 0,
        conversionRate: 0,
      },
      {
        id: '2',
        name: 'B (Test)',
        description: 'Modified version',
        weight: 0.5,
        convertedCount: 0,
        totalVisitors: 0,
        conversionRate: 0,
      },
    ]);
    setActiveTab('experiments');
  };

  const startExperiment = (id: string) => {
    setExperiments(experiments.map(exp => (exp.id === id ? { ...exp, status: 'running' } : exp)));
  };

  const pauseExperiment = (id: string) => {
    setExperiments(experiments.map(exp => (exp.id === id ? { ...exp, status: 'paused' } : exp)));
  };

  const deleteExperiment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      setExperiments(experiments.filter(exp => exp.id !== id));
    }
  };

  const getVariantColor = (conversionRate: number, maxRate: number) => {
    if (maxRate === 0) return 'bg-gray-200';
    const percentage = (conversionRate / maxRate) * 100;

    if (percentage >= 95) return 'bg-green-500';
    if (percentage >= 85) return 'bg-green-400';
    if (percentage >= 70) return 'bg-yellow-400';
    if (percentage >= 50) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">A/B Testing</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'experiments'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Experiments
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'create'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Create Test
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'analytics'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'experiments' && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Active Experiments
              </h4>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Sample Size
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Best Performing
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {experiments.map(experiment => {
                    // Calculate max conversion rate for color coding
                    const maxRate = Math.max(...experiment.variants.map(v => v.conversionRate));

                    return (
                      <tr key={experiment.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                          {experiment.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              experiment.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : experiment.status === 'running'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : experiment.status === 'paused'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {experiment.type.charAt(0).toUpperCase() + experiment.type.slice(1)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {experiment.currentSample.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {experiment.variants.map(variant => (
                            <div key={variant.id} className="flex items-center mb-1">
                              <span
                                className={`inline-block w-3 h-3 rounded-full mr-2 ${getVariantColor(variant.conversionRate, maxRate)}`}
                              ></span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {variant.name}:{' '}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white ml-1">
                                {variant.conversionRate.toFixed(2)}%
                              </span>
                            </div>
                          ))}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/experiment/${experiment.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              View
                            </button>
                            {experiment.status === 'draft' && (
                              <button
                                onClick={() => startExperiment(experiment.id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Start
                              </button>
                            )}
                            {experiment.status === 'running' && (
                              <button
                                onClick={() => pauseExperiment(experiment.id)}
                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                              >
                                Pause
                              </button>
                            )}
                            <button
                              onClick={() => deleteExperiment(experiment.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-900">
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
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  A/B Testing Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Test one variable at a time for clear results</li>
                    <li>Ensure adequate sample size for statistical significance</li>
                    <li>Run tests for a full business cycle to capture variations</li>
                    <li>Set a minimum detectable effect before starting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
            Create New Experiment
          </h4>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="experiment-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Experiment Name
              </label>
              <input
                type="text"
                id="experiment-name"
                value={experimentName}
                onChange={e => setExperimentName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter experiment name"
              />
            </div>

            <div>
              <label
                htmlFor="experiment-description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="experiment-description"
                rows={3}
                value={experimentDescription}
                onChange={e => setExperimentDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe what you're testing and your hypothesis"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="experiment-type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Test Type
                </label>
                <select
                  id="experiment-type"
                  value={experimentType}
                  onChange={e =>
                    setExperimentType(
                      e.target.value as 'pricing' | 'content' | 'design' | 'messaging'
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="pricing">Pricing</option>
                  <option value="content">Content</option>
                  <option value="design">Design</option>
                  <option value="messaging">Messaging</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="experiment-objective"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Objective
                </label>
                <select
                  id="experiment-objective"
                  value={objective}
                  onChange={e =>
                    setObjective(e.target.value as 'conversion' | 'revenue' | 'engagement')
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="conversion">Conversion Rate</option>
                  <option value="revenue">Revenue</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Variants
              </label>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="border border-gray-200 rounded-lg p-4 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Variant {String.fromCharCode(65 + index)}
                      </h5>
                      {index >= 2 && (
                        <button
                          type="button"
                          onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={e => {
                            const updatedVariants = [...variants];
                            updatedVariants[index] = {
                              id: updatedVariants[index].id || (index + 1).toString(),
                              name: e.target.value,
                              description: updatedVariants[index].description || '',
                              weight: updatedVariants[index].weight || 0.5,
                              convertedCount: updatedVariants[index].convertedCount || 0,
                              totalVisitors: updatedVariants[index].totalVisitors || 0,
                              conversionRate: updatedVariants[index].conversionRate || 0,
                            };
                            setVariants(updatedVariants);
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="e.g., A (Control), B (Test)"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={variant.description}
                          onChange={e => {
                            const updatedVariants = [...variants];
                            updatedVariants[index] = {
                              id: updatedVariants[index].id || (index + 1).toString(),
                              name: updatedVariants[index].name || '',
                              description: e.target.value,
                              weight: updatedVariants[index].weight || 0.5,
                              convertedCount: updatedVariants[index].convertedCount || 0,
                              totalVisitors: updatedVariants[index].totalVisitors || 0,
                              conversionRate: updatedVariants[index].conversionRate || 0,
                            };
                            setVariants(updatedVariants);
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Describe this variant"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Traffic Allocation ({Math.round(variant.weight * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={variant.weight * 100}
                          onChange={e => {
                            const newWeight = parseInt(e.target.value) / 100;
                            const updatedVariants = [...variants];
                            updatedVariants[index] = {
                              id: updatedVariants[index].id || (index + 1).toString(),
                              name: updatedVariants[index].name || '',
                              description: updatedVariants[index].description || '',
                              weight: newWeight,
                              convertedCount: updatedVariants[index].convertedCount || 0,
                              totalVisitors: updatedVariants[index].totalVisitors || 0,
                              conversionRate: updatedVariants[index].conversionRate || 0,
                            };
                            setVariants(updatedVariants);
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newVariantId = (variants.length + 1).toString();
                    setVariants([
                      ...variants,
                      {
                        id: newVariantId,
                        name: String.fromCharCode(65 + variants.length) + ' (New)',
                        description: `Variant ${variants.length + 1}`,
                        weight: 0.25, // Default to 25% if we have up to 4 variants
                        convertedCount: 0,
                        totalVisitors: 0,
                        conversionRate: 0,
                      },
                    ]);
                  }}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  + Add Another Variant
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCreateExperiment}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Experiment
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">Test Analytics</h4>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Statistical Significance
              </h5>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '87%' }}></div>
                </div>
                <div className="ml-4 text-sm text-gray-700 dark:text-gray-300">87% confidence</div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Result is statistically significant with 95% confidence
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4,250</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">9.2%</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Lift</p>
                <p className="text-2xl font-bold text-green-600">+12.4%</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Performance by Variant
            </h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Variant
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Visitors
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Conversions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Conversion Rate
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Lift vs Control
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {experiments
                    .filter(e => e.status !== 'draft')
                    .flatMap(exp =>
                      exp.variants.map(variant => {
                        const isControl = variant.id === '1'; // Assuming first variant is control
                        const controlRate = exp.variants[0]?.conversionRate || 0;
                        const lift = isControl
                          ? 0
                          : ((variant.conversionRate - controlRate) / controlRate) * 100;

                        return (
                          <tr key={`${exp.id}-${variant.id}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {variant.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {variant.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {variant.totalVisitors.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {variant.convertedCount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                              {variant.conversionRate.toFixed(2)}%
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                lift > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {isControl ? '-' : (lift > 0 ? '+' : '') + lift.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                                  <div
                                    className={`h-full ${
                                      Math.abs(lift) > 10 ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.abs(lift) * 5)}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                  {Math.min(99, Math.abs(lift) * 2).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTestManager;
