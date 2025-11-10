import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import abTestService, { ABTest, ABTestVariant } from '../services/abTestService';

const ABTestManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'experiments' | 'create' | 'analytics'>('experiments');
  const [experiments, setExperiments] = useState<ABTest[]>([]);
  const [experimentName, setExperimentName] = useState('');
  const [experimentDescription, setExperimentDescription] = useState('');
  const [experimentType, setExperimentType] = useState<'pricing' | 'content' | 'design' | 'messaging'>('content');
  const [objective, setObjective] = useState<'conversion' | 'revenue' | 'engagement'>('conversion');
  const [variants, setVariants] = useState<ABTestVariant[]>([
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch experiments from API
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        setLoading(true);
        const data = await abTestService.getABTests();
        setExperiments(data);
      } catch (err) {
        console.error('Error fetching experiments:', err);
        setError('Failed to load AB tests');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  // Function to create a new AB test
  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newTest = await abTestService.createABTest({
        name: experimentName,
        description: experimentDescription,
        type: experimentType,
        objective: objective,
        variants: variants.map(v => ({
          name: v.name,
          description: v.description,
          weight: v.weight
        }))
      });
      
      // Add the new test to the list
      setExperiments([...experiments, newTest]);
      
      // Reset form
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
    } catch (error) {
      console.error('Error creating experiment:', error);
      alert('Failed to create experiment');
    }
  };

  // Function to activate an AB test
  const handleActivateTest = async (testId: string) => {
    try {
      const updatedTest = await abTestService.activateABTest(testId);
      setExperiments(experiments.map(test =>
        test.id === testId ? updatedTest : test
      ));
    } catch (error) {
      console.error('Error activating test:', error);
      alert('Failed to activate test');
    }
  };

  // Function to pause an AB test
  const handlePauseTest = async (testId: string) => {
    try {
      const updatedTest = await abTestService.pauseABTest(testId);
      setExperiments(experiments.map(test =>
        test.id === testId ? updatedTest : test
      ));
    } catch (error) {
      console.error('Error pausing test:', error);
      alert('Failed to pause test');
    }
  };

  // Function to complete an AB test
  const handleCompleteTest = async (testId: string) => {
    try {
      const updatedTest = await abTestService.completeABTest(testId);
      setExperiments(experiments.map(test =>
        test.id === testId ? updatedTest : test
      ));
    } catch (error) {
      console.error('Error completing test:', error);
      alert('Failed to complete test');
    }
  };

  // Function to delete an AB test
  const handleDeleteTest = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      try {
        await abTestService.deleteABTest(testId);
        setExperiments(experiments.filter(test => test.id !== testId));
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Failed to delete experiment');
      }
    }
  };

  // Function to add a new variant to the form
  const handleAddVariant = () => {
    const newVariant: ABTestVariant = {
      id: (variants.length + 1).toString(),
      name: `C (${String.fromCharCode(67 + variants.length - 2)})`,
      description: 'New test variant',
      weight: 1 / (variants.length + 1), // Equal distribution
      convertedCount: 0,
      totalVisitors: 0,
      conversionRate: 0,
    };
    setVariants([...variants, newVariant]);
  };

  // Function to remove a variant from the form
  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 2) return; // Keep at least 2 variants
    setVariants(variants.filter((_, i) => i !== index));
  };

  if (loading && experiments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">A/B Testing Manager</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage experiments to optimize your paywalls
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('experiments')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'experiments'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Experiments
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Create Test
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Experiments Tab */}
        {activeTab === 'experiments' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Experiments</h2>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create New Test
              </button>
            </div>

            {experiments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No experiments found. Create your first A/B test!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiments.map((experiment) => (
                  <div key={experiment.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{experiment.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{experiment.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        experiment.status === 'running' ? 'bg-green-100 text-green-800' :
                        experiment.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                        experiment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600 dark:text-gray-300">
                        <span className="block">Sample Size:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{experiment.currentSample.toLocaleString()}</span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        <span className="block">Objective:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{experiment.objective}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Completion</span>
                        <span>{Math.min(100, Math.round((experiment.currentSample / 10000) * 100))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (experiment.currentSample / 10000) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {experiment.variants && experiment.variants.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Variants</h4>
                        <div className="space-y-2">
                          {experiment.variants.map((variant) => (
                            <div key={variant.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-300">{variant.name}</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {variant.conversionRate?.toFixed(2)}% CR
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex space-x-3">
                      {experiment.status === 'draft' && (
                        <button
                          onClick={() => handleActivateTest(experiment.id)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                          Start Test
                        </button>
                      )}
                      
                      {experiment.status === 'running' && (
                        <button
                          onClick={() => handlePauseTest(experiment.id)}
                          className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
                        >
                          Pause
                        </button>
                      )}
                      
                      {(experiment.status === 'running' || experiment.status === 'paused') && (
                        <button
                          onClick={() => handleCompleteTest(experiment.id)}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                        >
                          Complete
                        </button>
                      )}
                      
                      <button
                        onClick={() => alert(`Details for experiment ${experiment.name} would be displayed here`)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                      >
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTest(experiment.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Test Tab */}
        {activeTab === 'create' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create New A/B Test</h2>
            
            <form onSubmit={handleCreateExperiment} className="space-y-6">
              <div>
                <label htmlFor="experimentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Experiment Name
                </label>
                <input
                  type="text"
                  id="experimentName"
                  value={experimentName}
                  onChange={(e) => setExperimentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. Pricing Strategy Test"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="experimentDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="experimentDescription"
                  value={experimentDescription}
                  onChange={(e) => setExperimentDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Describe the purpose of this test..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experimentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Type
                  </label>
                  <select
                    id="experimentType"
                    value={experimentType}
                    onChange={(e) => setExperimentType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="pricing">Pricing</option>
                    <option value="content">Content</option>
                    <option value="design">Design</option>
                    <option value="messaging">Messaging</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="objective" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Objective
                  </label>
                  <select
                    id="objective"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="conversion">Conversion Rate</option>
                    <option value="revenue">Revenue</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Variants</h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                  >
                    Add Variant
                  </button>
                </div>
                
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900 dark:text-white">Variant {index + 1}</h4>
                        {index >= 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].name = e.target.value;
                              setVariants(newVariants);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Traffic Weight (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={variant.weight * 100}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].weight = parseFloat(e.target.value) / 100;
                              setVariants(newVariants);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={variant.description}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].description = e.target.value;
                            setVariants(newVariants);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Experiment
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab('experiments')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Experiment Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Detailed analytics for your A/B tests will appear here.</p>
            {/* In a real implementation, this would pull analytics data for experiments */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ABTestManager;