import React, { useState, useEffect } from 'react';
import { Calculator, Edit, Save, X, Calendar } from 'lucide-react';
import axios from 'axios';

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

  useEffect(() => {
    fetchCurrentSettings();
    fetchHistory();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await axios.get('/tax-settings');
      setCurrentSettings(response.data);
    } catch (error) {
      setError('Failed to load tax settings');
      console.error('Error fetching tax settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/tax-settings/history');
      setHistory(response.data);
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
      const response = await axios.put('/tax-settings', {
        tax_rate: taxRate,
        tax_name: formData.tax_name.trim()
      });
      
      setCurrentSettings(response.data);
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-700 flex items-center">
            <Calculator className="h-6 w-6 mr-2" />
            Tax Settings
          </h2>
          <p className="text-sm text-gray-600">Manage tax rates and settings for your cafe</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Settings */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-lg font-semibold text-secondary-700">Current Tax Settings</h3>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="btn-primary flex items-center justify-center text-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Settings
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tax Name
              </label>
              <input
                type="text"
                name="tax_name"
                value={formData.tax_name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Sales Tax, VAT"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
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
                className="input-field"
                placeholder="e.g., 8.5"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
              <h4 className="text-sm font-medium text-secondary-600 mb-1">Tax Name</h4>
              <p className="text-lg font-semibold text-secondary-700">
                {currentSettings?.tax_name || 'Not set'}
              </p>
            </div>
            <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
              <h4 className="text-sm font-medium text-secondary-600 mb-1">Tax Rate</h4>
              <p className="text-lg font-semibold text-secondary-700">
                {currentSettings?.tax_rate ? `${currentSettings.tax_rate}%` : '0%'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tax History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-700 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Tax History
        </h3>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tax history available</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-accent-200">
                <thead className="bg-accent-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      Tax Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      Tax Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-accent-200">
                  {history.map((setting) => (
                    <tr key={setting.id} className="hover:bg-accent-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                        {new Date(setting.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                        {setting.tax_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                        {setting.tax_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          setting.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-accent-100 text-accent-800'
                        }`}>
                          {setting.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {history.map((setting) => (
                <div key={setting.id} className="border border-accent-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-secondary-500 mr-2" />
                      <div>
                        <h4 className="font-medium text-secondary-700">{setting.tax_name}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(setting.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      setting.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-accent-100 text-accent-800'
                    }`}>
                      {setting.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary-600 font-medium">
                      Tax Rate: {setting.tax_rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaxSettings; 