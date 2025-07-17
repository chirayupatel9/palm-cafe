import React, { useState, useEffect } from 'react';

const TaxSettings = () => {
  const [currentSettings, setCurrentSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    tax_rate: '',
    tax_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCurrentSettings();
    fetchHistory();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tax-settings`);
      if (!response.ok) throw new Error('Failed to fetch tax settings');
      const data = await response.json();
      setCurrentSettings(data);
    } catch (error) {
      setError('Failed to load tax settings');
      console.error('Error fetching tax settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tax-settings/history`);
      if (!response.ok) throw new Error('Failed to fetch tax history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching tax history:', error);
    }
  };

  const handleEdit = () => {
    setFormData({
      tax_rate: currentSettings.tax_rate.toString(),
      tax_name: currentSettings.tax_name
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ tax_rate: '', tax_name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tax_rate || !formData.tax_name) {
      setError('Please fill in all fields');
      return;
    }

    const taxRate = parseFloat(formData.tax_rate);
    if (isNaN(taxRate) || taxRate < 0) {
      setError('Tax rate must be a valid positive number');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tax-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tax_rate: taxRate,
          tax_name: formData.tax_name.trim()
        }),
      });

      if (!response.ok) throw new Error('Failed to update tax settings');
      
      const updatedSettings = await response.json();
      setCurrentSettings(updatedSettings);
      setIsEditing(false);
      setFormData({ tax_rate: '', tax_name: '' });
      setError('');
      
      // Refresh history
      fetchHistory();
    } catch (error) {
      setError('Failed to update tax settings');
      console.error('Error updating tax settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && !currentSettings) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Settings</h1>
          <p className="text-gray-600">Manage tax rates and settings for your cafe</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Current Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Tax Settings</h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Edit Settings
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Name
                </label>
                <input
                  type="text"
                  name="tax_name"
                  value={formData.tax_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Sales Tax, VAT"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 8.5"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tax Name</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {currentSettings?.tax_name || 'Not set'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tax Rate</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {currentSettings?.tax_rate ? `${currentSettings.tax_rate}%` : '0%'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tax History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax History</h2>
          
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tax history available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((setting) => (
                    <tr key={setting.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(setting.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {setting.tax_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {setting.tax_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          setting.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {setting.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxSettings; 