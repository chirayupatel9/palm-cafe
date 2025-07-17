import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Download, Upload, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const MenuManagement = ({ menuItems, onUpdate, onAdd, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    sort_order: ''
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
      
      // Set default category for new items
      if (data.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Helper function to ensure price is a number
  const ensureNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      category_id: item.category_id || '',
      name: item.name,
      description: item.description,
      price: ensureNumber(item.price).toString(),
      sort_order: item.sort_order ? item.sort_order.toString() : ''
    });
  };

  const handleSave = async () => {
    if (!formData.category_id || !formData.name.trim() || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = ensureNumber(formData.price);
    if (price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      if (editingId) {
        await onUpdate(editingId, {
          category_id: formData.category_id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: price,
          sort_order: parseInt(formData.sort_order) || 0
        });
        toast.success('Menu item updated successfully');
      } else {
        await onAdd({
          category_id: formData.category_id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: price,
          sort_order: parseInt(formData.sort_order) || 0
        });
        toast.success('Menu item added successfully');
      }
      
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ 
        category_id: categories.length > 0 ? categories[0].id : '',
        name: '', 
        description: '', 
        price: '',
        sort_order: ''
      });
    } catch (error) {
      toast.error('Failed to save menu item');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ 
      category_id: categories.length > 0 ? categories[0].id : '',
      name: '', 
      description: '', 
      price: '',
      sort_order: ''
    });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await onDelete(id);
        toast.success('Menu item deleted successfully');
      } catch (error) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/menu/export`);
      if (!response.ok) throw new Error('Failed to export menu');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'palm-cafe-menu.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Menu exported successfully');
    } catch (error) {
      console.error('Error exporting menu:', error);
      toast.error('Failed to export menu');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/menu/import`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to import menu');
      
      const result = await response.json();
      toast.success(result.message);
      
      // Refresh the menu items
      window.location.reload();
    } catch (error) {
      console.error('Error importing menu:', error);
      toast.error('Failed to import menu');
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  // Filter menu items by category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === selectedCategory);

  // Group menu items by category for display
  const groupedMenuItems = menuItems.reduce((groups, item) => {
    const categoryName = item.category_name || 'Uncategorized';
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(item);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <div className="flex space-x-3">
          <label className="btn-secondary flex items-center cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
              disabled={loading}
            />
          </label>
          <button
            onClick={handleExport}
            disabled={loading}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Menu Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select Category *</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Item Name *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Price *"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              min="0"
              placeholder="Sort Order"
              value={formData.sort_order}
              onChange={(e) => handleInputChange('sort_order', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button onClick={handleCancel} className="btn-secondary flex items-center">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Menu Items by Category */}
      {Object.keys(groupedMenuItems).length === 0 ? (
        <div className="card">
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No menu items found</p>
            <p className="text-sm">Add your first menu item to get started</p>
          </div>
        </div>
      ) : (
        Object.entries(groupedMenuItems).map(([categoryName, items]) => (
          <div key={categoryName} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              {categoryName} ({items.length} items)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sort Order
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {editingId === item.id ? (
                        // Edit Mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={formData.category_id}
                              onChange={(e) => handleInputChange('category_id', e.target.value)}
                              className="input-field"
                            >
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="input-field"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              className="input-field"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.price}
                              onChange={(e) => handleInputChange('price', e.target.value)}
                              className="input-field"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={formData.sort_order}
                              onChange={(e) => handleInputChange('sort_order', e.target.value)}
                              className="input-field"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button onClick={handleSave} className="text-green-600 hover:text-green-900">
                                <Save className="h-4 w-4" />
                              </button>
                              <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-primary-600">
                              ${ensureNumber(item.price).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{item.sort_order || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.name)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MenuManagement; 