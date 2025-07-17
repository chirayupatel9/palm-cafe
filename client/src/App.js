import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Coffee, Receipt, Settings, Plus, Calculator, FolderOpen } from 'lucide-react';
import axios from 'axios';
import OrderPage from './components/OrderPage';
import MenuManagement from './components/MenuManagement';
import CategoryManagement from './components/CategoryManagement';
import InvoiceHistory from './components/InvoiceHistory';
import TaxSettings from './components/TaxSettings';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (id, updatedItem) => {
    try {
      await axios.put(`/api/menu/${id}`, updatedItem);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const addMenuItem = async (newItem) => {
    try {
      await axios.post('/api/menu', newItem);
      fetchMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      await axios.delete(`/api/menu/${id}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'order':
        return <OrderPage menuItems={menuItems} />;
      case 'menu':
        return (
          <MenuManagement
            menuItems={menuItems}
            onUpdate={updateMenuItem}
            onAdd={addMenuItem}
            onDelete={deleteMenuItem}
          />
        );
      case 'categories':
        return <CategoryManagement />;
      case 'history':
        return <InvoiceHistory />;
      case 'tax':
        return <TaxSettings />;
      default:
        return <OrderPage menuItems={menuItems} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-accent-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Coffee className="h-8 w-8 text-secondary-500 mr-3" />
              <h1 className="text-2xl font-bold text-secondary-700">Palm Cafe</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-accent-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentPage('order')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentPage === 'order'
                  ? 'nav-active'
                  : 'nav-inactive'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </button>
            <button
              onClick={() => setCurrentPage('categories')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentPage === 'categories'
                  ? 'nav-active'
                  : 'nav-inactive'
              }`}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Categories
            </button>
            <button
              onClick={() => setCurrentPage('menu')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentPage === 'menu'
                  ? 'nav-active'
                  : 'nav-inactive'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Menu Management
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentPage === 'history'
                  ? 'nav-active'
                  : 'nav-inactive'
              }`}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Invoice History
            </button>
            <button
              onClick={() => setCurrentPage('tax')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentPage === 'tax'
                  ? 'nav-active'
                  : 'nav-inactive'
              }`}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Tax Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App; 