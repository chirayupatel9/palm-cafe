import React, { useState, useEffect } from 'react';
import { DollarSign, Edit, Save, X, Calendar, Globe } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencySettings = () => {
  const [currentSettings, setCurrentSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    currency_code: '',
    currency_symbol: '',
    currency_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchCurrencySettings } = useCurrency();

  useEffect(() => {
    fetchCurrentSettings();
    fetchHistory();
    fetchAvailableCurrencies();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await axios.get('/currency-settings');
      setCurrentSettings(response.data);
    } catch (error) {
      setError('Failed to load currency settings');
      console.error('Error fetching currency settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/currency-settings/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching currency history:', error);
    }
  };

  const fetchAvailableCurrencies = async () => {
    try {
      const response = await axios.get('/currency-settings/available');
      setAvailableCurrencies(response.data);
    } catch (error) {
      console.error('Error fetching available currencies:', error);
    }
  };

  const handleEdit = () => {
    setFormData({
      currency_code: currentSettings.currency_code,
      currency_symbol: currentSettings.currency_symbol,
      currency_name: currentSettings.currency_name
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ currency_code: '', currency_symbol: '', currency_name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.currency_code || !formData.currency_symbol || !formData.currency_name) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put('/currency-settings', {
        currency_code: formData.currency_code,
        currency_symbol: formData.currency_symbol,
        currency_name: formData.currency_name
      });
      
      setCurrentSettings(response.data);
      setIsEditing(false);
      setFormData({ currency_code: '', currency_symbol: '', currency_name: '' });
      setError('');
      fetchCurrencySettings(); // update context and UI everywhere
      fetchHistory();
    } catch (error) {
      setError('Failed to update currency settings');
      console.error('Error updating currency settings:', error);
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

  const handleCurrencySelect = (currency) => {
    setFormData({
      currency_code: currency.code,
      currency_symbol: currency.symbol,
      currency_name: currency.name
    });
  };

  if (loading && !currentSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <img 
          src="/images/palm-cafe-logo.png" 
          alt="Palm Cafe Logo" 
          className="h-12 w-12 mb-3"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
        <p className="mt-3 text-sm text-secondary-600">Loading currency settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <img 
            src="/images/palm-cafe-logo.png" 
            alt="Palm Cafe Logo" 
            className="h-10 w-10 mr-3"
          />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-700 flex items-center">
              <Globe className="h-6 w-6 mr-2" />
              Currency Settings
            </h2>
            <p className="text-sm text-gray-600">Manage currency for your cafe</p>
          </div>
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
          <h3 className="text-lg font-semibold text-secondary-700">Current Currency Settings</h3>
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
                Select Currency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                {availableCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleCurrencySelect(currency)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      formData.currency_code === currency.code
                        ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                        : 'border-accent-200 hover:border-secondary-300 text-gray-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{currency.symbol}</div>
                    <div className="font-semibold">{currency.code}</div>
                    <div className="text-xs text-gray-500">{currency.name}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Currency Code
                </label>
                <input
                  type="text"
                  name="currency_code"
                  value={formData.currency_code}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., USD"
                  maxLength="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  name="currency_symbol"
                  value={formData.currency_symbol}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., $"
                  maxLength="5"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Currency Name
                </label>
                <input
                  type="text"
                  name="currency_name"
                  value={formData.currency_name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., US Dollar"
                  required
                />
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
              <h4 className="text-sm font-medium text-secondary-600 mb-1">Currency Code</h4>
              <p className="text-lg font-semibold text-secondary-700">
                {currentSettings?.currency_code || 'USD'}
              </p>
            </div>
            <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
              <h4 className="text-sm font-medium text-secondary-600 mb-1">Currency Symbol</h4>
              <p className="text-lg font-semibold text-secondary-700">
                {currentSettings?.currency_symbol || '$'}
              </p>
            </div>
            <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
              <h4 className="text-sm font-medium text-secondary-600 mb-1">Currency Name</h4>
              <p className="text-lg font-semibold text-secondary-700">
                {currentSettings?.currency_name || 'US Dollar'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Currency History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-700 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Currency History
        </h3>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <img 
              src="/images/palm-cafe-logo.png" 
              alt="Palm Cafe Logo" 
              className="h-12 w-12 mx-auto mb-3 opacity-50"
            />
            <p>No currency history available</p>
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
                      Currency Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      Currency Name
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
                        {setting.currency_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                        {setting.currency_symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                        {setting.currency_name}
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
                        <h4 className="font-medium text-secondary-700">{setting.currency_name}</h4>
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
                      {setting.currency_code} ({setting.currency_symbol})
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

export default CurrencySettings; 