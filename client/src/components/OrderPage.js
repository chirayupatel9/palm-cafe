import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Receipt, ShoppingCart, FolderOpen } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrderPage = ({ menuItems }) => {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [taxInfo, setTaxInfo] = useState({ taxRate: 0, taxName: 'Tax', taxAmount: 0 });
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [groupedMenuItems, setGroupedMenuItems] = useState({});

  const API_BASE_URL = 'http://localhost:5000/api';

  // Helper function to ensure price is a number
  const ensureNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Group menu items by category
  useEffect(() => {
    const grouped = menuItems.reduce((groups, item) => {
      const categoryName = item.category_name || 'Uncategorized';
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(item);
      return groups;
    }, {});
    setGroupedMenuItems(grouped);
  }, [menuItems]);

  // Calculate subtotal
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (ensureNumber(item.price) * item.quantity), 0);
  };

  // Calculate total with tax and tip
  const getTotal = () => {
    const subtotal = getSubtotal();
    return subtotal + taxInfo.taxAmount + tipAmount;
  };

  // Fetch tax settings and calculate tax
  const calculateTax = async (subtotal) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calculate-tax`, { subtotal });
      setTaxInfo(response.data);
    } catch (error) {
      console.error('Error calculating tax:', error);
      setTaxInfo({ taxRate: 0, taxName: 'Tax', taxAmount: 0 });
    }
  };

  // Update tax calculation when cart changes
  useEffect(() => {
    const subtotal = getSubtotal();
    if (subtotal > 0) {
      calculateTax(subtotal);
    } else {
      setTaxInfo({ taxRate: 0, taxName: 'Tax', taxAmount: 0 });
    }
  }, [cart]);

  // Handle tip percentage change
  const handleTipPercentageChange = (percentage) => {
    setTipPercentage(percentage);
    const subtotal = getSubtotal();
    const newTipAmount = (subtotal * percentage) / 100;
    setTipAmount(newTipAmount);
  };

  // Handle custom tip amount
  const handleTipAmountChange = (amount) => {
    const newAmount = ensureNumber(amount);
    setTipAmount(newAmount);
    
    const subtotal = getSubtotal();
    if (subtotal > 0) {
      const newPercentage = (newAmount / subtotal) * 100;
      setTipPercentage(newPercentage);
    } else {
      setTipPercentage(0);
    }
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const generateInvoice = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to cart first');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: ensureNumber(item.price),
          quantity: item.quantity,
          total: ensureNumber(item.price) * item.quantity
        })),
        tipAmount: tipAmount,
        date: new Date().toISOString()
      };

      const response = await axios.post(`${API_BASE_URL}/invoices`, orderData);
      
      // Create blob and open PDF in new tab
      const pdfBlob = new Blob([Uint8Array.from(atob(response.data.pdf), c => c.charCodeAt(0))], {
        type: 'application/pdf'
      });
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      // Clean up the URL object after a delay
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);

      // Clear cart and form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setTipAmount(0);
      setTipPercentage(0);
      
      toast.success('Invoice generated and opened!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setTipAmount(0);
    setTipPercentage(0);
    toast.success('Cart cleared');
  };

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Items */}
      <div className="lg:col-span-2">
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-700 mb-4">Menu Items</h2>
          
          {Object.keys(groupedMenuItems).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No menu items available</p>
              <p className="text-sm">Add items in Menu Management</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMenuItems).map(([categoryName, items]) => (
                <div key={categoryName} className="border border-accent-200 rounded-lg p-4 bg-accent-50">
                  <h3 className="text-lg font-semibold text-secondary-700 mb-4 flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2 text-secondary-500" />
                    {categoryName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border border-accent-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => addToCart(item)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-secondary-700">{item.name}</h4>
                          <span className="text-lg font-semibold text-secondary-600">
                            ${ensureNumber(item.price).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <button
                          className="btn-primary w-full flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="lg:col-span-1">
        <div className="card sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-700 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Clear
              </button>
            )}
          </div>

          {/* Customer Info */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add items from the menu</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-accent-50 rounded-lg border border-accent-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-700">{item.name}</h4>
                    <p className="text-sm text-gray-600">${ensureNumber(item.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tip Selection */}
          {cart.length > 0 && (
            <div className="border-t border-accent-200 pt-4 mb-4">
              <h3 className="font-medium text-secondary-700 mb-3">Tip</h3>
              
              {/* Quick tip buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[0, 10, 15, 18, 20, 25].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => handleTipPercentageChange(percentage)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                      tipPercentage === percentage
                        ? 'bg-secondary-500 text-white border-secondary-500'
                        : 'bg-white text-secondary-700 border-accent-300 hover:bg-accent-50'
                    }`}
                  >
                    {percentage === 0 ? 'No Tip' : `${percentage}%`}
                  </button>
                ))}
              </div>
              
              {/* Custom tip amount */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Custom:</span>
                <input
                  type="number"
                  value={tipAmount.toFixed(2)}
                  onChange={(e) => handleTipAmountChange(e.target.value)}
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-accent-300 rounded-lg text-sm focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {/* Totals */}
          {cart.length > 0 && (
            <div className="border-t border-accent-200 pt-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {taxInfo.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{taxInfo.taxName} ({taxInfo.taxRate}%):</span>
                  <span>${taxInfo.taxAmount.toFixed(2)}</span>
                </div>
              )}
              
              {tipAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tip:</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg font-semibold border-t border-accent-200 pt-2">
                <span>Total:</span>
                <span className="text-secondary-600">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Generate Invoice Button */}
          <button
            onClick={generateInvoice}
            disabled={cart.length === 0 || loading}
            className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Receipt className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate & Open Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage; 