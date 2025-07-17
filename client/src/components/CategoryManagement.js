import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: ''
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/with-counts`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      sort_order: category.sort_order ? category.sort_order.toString() : ''
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      if (editingId) {
        const response = await fetch(`${API_BASE_URL}/categories/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            sort_order: parseInt(formData.sort_order) || 0,
            is_active: true
          }),
        });

        if (!response.ok) throw new Error('Failed to update category');
        toast.success('Category updated successfully');
      } else {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            sort_order: parseInt(formData.sort_order) || 0
          }),
        });

        if (!response.ok) throw new Error('Failed to create category');
        toast.success('Category created successfully');
      }
      
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ name: '', description: '', sort_order: '' });
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', description: '', sort_order: '' });
  };

  const handleDelete = async (id, name, itemCount) => {
    if (itemCount > 0) {
      toast.error(`Cannot delete category "${name}" - it has ${itemCount} menu items. Please move or delete the items first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete category');
        
        toast.success('Category deleted successfully');
        fetchCategories(); // Refresh the list
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-secondary-700">Category Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Category
        </button>
      </div>

      {/* Add New Category Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-700 mb-4">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Category Name *"
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

      {/* Categories List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-700 mb-4">Current Categories</h3>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No categories found</p>
            <p className="text-sm">Add your first category to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-accent-200">
              <thead className="bg-accent-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-accent-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-accent-50">
                    {editingId === category.id ? (
                      // Edit Mode
                      <>
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
                          <span className="text-sm text-gray-500">{category.item_count} items</span>
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
                          <div className="flex items-center">
                            <FolderOpen className="h-5 w-5 text-secondary-500 mr-3" />
                            <div className="text-sm font-medium text-secondary-700">{category.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{category.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.item_count > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-accent-100 text-accent-800'
                          }`}>
                            {category.item_count} items
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{category.sort_order}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id, category.name, category.item_count)}
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
        )}
      </div>
    </div>
  );
};

export default CategoryManagement; 