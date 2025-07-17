const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { initializeDatabase, testConnection } = require('./config/database');
const MenuItem = require('./models/menuItem');
const Category = require('./models/category');
const Invoice = require('./models/invoice');
const TaxSettings = require('./models/taxSettings');
const CurrencySettings = require('./models/currencySettings');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Generate PDF invoice
const generatePDF = async (invoice) => {
  // Get current currency settings
  let currencySymbol = '$'; // Default fallback
  try {
    const currencySettings = await CurrencySettings.getCurrent();
    currencySymbol = currencySettings.currency_symbol || '$';
  } catch (error) {
    console.error('Error fetching currency settings for PDF:', error);
    // Use default $ if currency settings fail
  }

  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      resolve(result.toString('base64'));
    });

    // Add the actual Palm Cafe logo
    const logoX = 50;
    const logoY = 50;
    const logoSize = 40;
    
    try {
      // Add the PNG logo to the PDF
      doc.image('./public/images/palm-cafe-logo.png', logoX, logoY, { width: logoSize, height: logoSize });
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      // Fallback to drawn logo if image fails to load
      doc.save();
      doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2);
      doc.fill('#153059');
      doc.restore();
      
      doc.save();
      doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2);
      doc.strokeColor('#f4e1ba');
      doc.lineWidth(1);
      doc.stroke();
      doc.restore();
      
      doc.save();
      doc.rect(logoX + 15, logoY + 25, 10, 15);
      doc.fill('#f4e1ba');
      doc.restore();
      
      doc.save();
      doc.moveTo(logoX + 20, logoY + 25);
      doc.lineTo(logoX + 10, logoY + 15);
      doc.lineTo(logoX + 30, logoY + 15);
      doc.closePath();
      doc.fill('#f4e1ba');
      doc.restore();
      
      doc.save();
      doc.fontSize(8).font('Helvetica-Bold').fill('#f4e1ba');
      doc.text('THE PALM', logoX + logoSize/2, logoY + logoSize + 5, { align: 'center' });
      doc.fontSize(6).font('Helvetica');
      doc.text('CAFE', logoX + logoSize/2, logoY + logoSize + 15, { align: 'center' });
      doc.restore();
    }

    // Header with logo
    doc.fontSize(24).font('Helvetica-Bold').fill('#153059').text('PALM CAFE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').fill('#75826b').text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Invoice details
    doc.fontSize(12).font('Helvetica-Bold').fill('#153059').text(`Invoice #: ${invoice.invoice_number || invoice.invoiceNumber}`);
    doc.fontSize(10).font('Helvetica').fill('#153059').text(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
    doc.fontSize(10).font('Helvetica').fill('#153059').text(`Time: ${new Date(invoice.date).toLocaleTimeString()}`);
    doc.moveDown();

    // Customer info
    doc.fontSize(12).font('Helvetica-Bold').fill('#153059').text('Customer Information:');
    doc.fontSize(10).font('Helvetica').fill('#153059').text(`Name: ${invoice.customerName || invoice.customer_name || ''}`);
    if (invoice.customerPhone || invoice.customer_phone) {
      doc.fontSize(10).font('Helvetica').fill('#153059').text(`Phone: ${invoice.customerPhone || invoice.customer_phone}`);
    }
    doc.moveDown();

    // Items table
    doc.fontSize(12).font('Helvetica-Bold').fill('#153059').text('Items:');
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').fill('#75826b');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 250, tableTop);
    doc.text('Price', 300, tableTop);
    doc.text('Total', 380, tableTop);

    // Table content
    let yPosition = tableTop + 20;
    doc.fontSize(10).font('Helvetica').fill('#153059');
    
    (invoice.items || []).forEach((item, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      doc.text(item.name || item.item_name, 50, yPosition);
      doc.text(item.quantity.toString(), 250, yPosition);
      doc.text(`${String(currencySymbol)}${parseFloat(item.price).toFixed(2)}`, 300, yPosition);
      doc.text(`${String(currencySymbol)}${parseFloat(item.total).toFixed(2)}`, 380, yPosition);
      yPosition += 20;
    });

    // Totals section
    doc.moveDown();
    const totalsY = doc.y;
    doc.fontSize(10).font('Helvetica').fill('#153059');
    doc.text('Subtotal:', 300, totalsY);
    doc.text(`${String(currencySymbol)}${parseFloat(invoice.subtotal).toFixed(2)}`, 380, totalsY);
    
    if (parseFloat(invoice.tax_amount) > 0) {
      doc.text('Tax:', 300, totalsY + 20);
      doc.text(`${String(currencySymbol)}${parseFloat(invoice.tax_amount).toFixed(2)}`, 380, totalsY + 20);
    }
    
    if (parseFloat(invoice.tip_amount) > 0) {
      doc.text('Tip:', 300, totalsY + 40);
      doc.text(`${String(currencySymbol)}${parseFloat(invoice.tip_amount).toFixed(2)}`, 380, totalsY + 40);
    }
    
    doc.fontSize(12).font('Helvetica-Bold').fill('#75826b');
    doc.text('Total:', 300, totalsY + 60);
    doc.text(`${String(currencySymbol)}${parseFloat(invoice.total).toFixed(2)}`, 380, totalsY + 60);
    
    // Footer with logo
    doc.moveDown(2);
    
    // Footer logo (smaller version)
    const footerLogoX = 50;
    const footerLogoY = doc.y;
    const footerLogoSize = 20;
    
    try {
      // Add the PNG logo to the footer
      doc.image('./public/images/palm-cafe-logo.png', footerLogoX, footerLogoY, { width: footerLogoSize, height: footerLogoSize });
    } catch (error) {
      console.error('Error adding footer logo to PDF:', error);
      // Fallback to drawn logo if image fails to load
      doc.save();
      doc.circle(footerLogoX + footerLogoSize/2, footerLogoY + footerLogoSize/2, footerLogoSize/2);
      doc.fill('#153059');
      doc.restore();
      
      doc.save();
      doc.circle(footerLogoX + footerLogoSize/2, footerLogoY + footerLogoSize/2, footerLogoSize/2);
      doc.strokeColor('#f4e1ba');
      doc.lineWidth(0.5);
      doc.stroke();
      doc.restore();
      
      doc.save();
      doc.rect(footerLogoX + 7, footerLogoY + 12, 6, 8);
      doc.fill('#f4e1ba');
      doc.restore();
      
      doc.save();
      doc.moveTo(footerLogoX + 10, footerLogoY + 12);
      doc.lineTo(footerLogoX + 5, footerLogoY + 7);
      doc.lineTo(footerLogoX + 15, footerLogoY + 7);
      doc.closePath();
      doc.fill('#f4e1ba');
      doc.restore();
    }
    
    // Footer text
    doc.save();
    doc.fontSize(10).font('Helvetica').fill('#153059');
    doc.text('Thank you for visiting Palm Cafe!', { align: 'center' });
    doc.fontSize(8).font('Helvetica');
    doc.text('Generated by Palm Cafe Management System', { align: 'center' });
    doc.restore();

    doc.end();
  });
};

// API Routes

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get categories with item counts
app.get('/api/categories/with-counts', async (req, res) => {
  try {
    const categories = await Category.getWithItemCounts();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories with counts:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add new category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, sort_order } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = {
      id: uuidv4(),
      name: name.trim(),
      description: description ? description.trim() : '',
      sort_order: sort_order || 0
    };

    const createdCategory = await Category.create(newCategory);
    res.status(201).json(createdCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const updatedCategory = await Category.update(id, {
      name: name.trim(),
      description: description ? description.trim() : '',
      sort_order: sort_order || 0,
      is_active: is_active !== undefined ? is_active : true
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.getAll();
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get menu items grouped by category
app.get('/api/menu/grouped', async (req, res) => {
  try {
    const menuItems = await MenuItem.getGroupedByCategory();
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items grouped:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Add new menu item
app.post('/api/menu', async (req, res) => {
  try {
    const { category_id, name, description, price, sort_order } = req.body;
    
    if (!category_id || !name || !price) {
      return res.status(400).json({ error: 'Category, name and price are required' });
    }

    const newItem = {
      id: uuidv4(),
      category_id,
      name: name.trim(),
      description: description ? description.trim() : '',
      price: parseFloat(price),
      sort_order: sort_order || 0
    };

    const createdItem = await MenuItem.create(newItem);
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, sort_order, is_active } = req.body;
    
    if (!category_id || !name || !price) {
      return res.status(400).json({ error: 'Category, name and price are required' });
    }

    const updatedItem = await MenuItem.update(id, {
      category_id,
      name: name.trim(),
      description: description ? description.trim() : '',
      price: parseFloat(price),
      sort_order: sort_order || 0,
      is_active: is_active !== undefined ? is_active : true
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MenuItem.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Export menu to Excel
app.get('/api/menu/export', async (req, res) => {
  try {
    const menuItems = await MenuItem.getAll();
    const categories = await Category.getAll();
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Menu items worksheet
    const menuData = menuItems.map(item => ({
      'Category': item.category_name || 'Uncategorized',
      'Item Name': item.name,
      'Description': item.description || '',
      'Price': item.price,
      'Sort Order': item.sort_order
    }));
    
    const menuWorksheet = XLSX.utils.json_to_sheet(menuData);
    XLSX.utils.book_append_sheet(workbook, menuWorksheet, 'Menu Items');
    
    // Categories worksheet
    const categoryData = categories.map(cat => ({
      'Category Name': cat.name,
      'Description': cat.description || '',
      'Sort Order': cat.sort_order
    }));
    
    const categoryWorksheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categoryWorksheet, 'Categories');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=palm-cafe-menu.xlsx');
    
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting menu:', error);
    res.status(500).json({ error: 'Failed to export menu' });
  }
});

// Import menu from Excel
app.post('/api/menu/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const menuSheet = workbook.Sheets['Menu Items'];
    
    if (!menuSheet) {
      return res.status(400).json({ error: 'Menu Items sheet not found in Excel file' });
    }

    // Convert to JSON
    const menuData = XLSX.utils.sheet_to_json(menuSheet);
    
    if (menuData.length === 0) {
      return res.status(400).json({ error: 'No data found in Menu Items sheet' });
    }

    // Get existing categories for mapping
    const categories = await Category.getAll();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    // Process menu items
    const itemsToImport = [];
    const errors = [];

    for (let i = 0; i < menuData.length; i++) {
      const row = menuData[i];
      const rowNumber = i + 2; // Excel rows start at 1, but we have header

      try {
        // Validate required fields
        if (!row['Item Name'] || !row['Price']) {
          errors.push(`Row ${rowNumber}: Item Name and Price are required`);
          continue;
        }

        // Find or create category
        let categoryId = null;
        if (row['Category']) {
          const categoryName = row['Category'].toString().trim();
          categoryId = categoryMap[categoryName.toLowerCase()];
          
          if (!categoryId) {
            // Create new category
            const newCategory = {
              id: uuidv4(),
              name: categoryName,
              description: '',
              sort_order: categories.length + 1
            };
            
            const createdCategory = await Category.create(newCategory);
            categoryId = createdCategory.id;
            categoryMap[categoryName.toLowerCase()] = categoryId;
            categories.push(createdCategory);
          }
        }

        // Create menu item
        const menuItem = {
          id: uuidv4(),
          category_id: categoryId,
          name: row['Item Name'].toString().trim(),
          description: row['Description'] ? row['Description'].toString().trim() : '',
          price: parseFloat(row['Price']),
          sort_order: row['Sort Order'] ? parseInt(row['Sort Order']) : 0
        };

        itemsToImport.push(menuItem);
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    // Import items
    const importResults = await MenuItem.bulkImport(itemsToImport);
    
    const successCount = importResults.filter(r => r.success).length;
    const failureCount = importResults.filter(r => !r.success).length;

    res.json({
      message: `Import completed. ${successCount} items imported successfully, ${failureCount} failed.`,
      successCount,
      failureCount,
      errors: errors.concat(importResults.filter(r => !r.success).map(r => r.error))
    });

  } catch (error) {
    console.error('Error importing menu:', error);
    res.status(500).json({ error: 'Failed to import menu' });
  }
});

// Get current tax settings
app.get('/api/tax-settings', async (req, res) => {
  try {
    const taxSettings = await TaxSettings.getCurrent();
    res.json(taxSettings);
  } catch (error) {
    console.error('Error fetching tax settings:', error);
    res.status(500).json({ error: 'Failed to fetch tax settings' });
  }
});

// Update tax settings
app.put('/api/tax-settings', async (req, res) => {
  try {
    const { tax_rate, tax_name } = req.body;
    
    if (tax_rate === undefined || !tax_name) {
      return res.status(400).json({ error: 'Tax rate and tax name are required' });
    }

    const updatedSettings = await TaxSettings.update({
      tax_rate: parseFloat(tax_rate),
      tax_name: tax_name.trim()
    });

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating tax settings:', error);
    res.status(500).json({ error: 'Failed to update tax settings' });
  }
});

// Get tax history
app.get('/api/tax-settings/history', async (req, res) => {
  try {
    const history = await TaxSettings.getHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching tax history:', error);
    res.status(500).json({ error: 'Failed to fetch tax history' });
  }
});

// Calculate tax for a given subtotal
app.post('/api/calculate-tax', async (req, res) => {
  try {
    const { subtotal } = req.body;
    
    if (subtotal === undefined) {
      return res.status(400).json({ error: 'Subtotal is required' });
    }

    const taxCalculation = await TaxSettings.calculateTax(parseFloat(subtotal));
    res.json(taxCalculation);
  } catch (error) {
    console.error('Error calculating tax:', error);
    res.status(500).json({ error: 'Failed to calculate tax' });
  }
});

// Get current currency settings
app.get('/api/currency-settings', async (req, res) => {
  try {
    const currencySettings = await CurrencySettings.getCurrent();
    res.json(currencySettings);
  } catch (error) {
    console.error('Error fetching currency settings:', error);
    res.status(500).json({ error: 'Failed to fetch currency settings' });
  }
});

// Update currency settings
app.put('/api/currency-settings', async (req, res) => {
  try {
    const { currency_code, currency_symbol, currency_name } = req.body;
    
    if (!currency_code || !currency_symbol || !currency_name) {
      return res.status(400).json({ error: 'Currency code, symbol, and name are required' });
    }

    const updatedSettings = await CurrencySettings.update({
      currency_code: currency_code.trim(),
      currency_symbol: currency_symbol.trim(),
      currency_name: currency_name.trim()
    });

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating currency settings:', error);
    res.status(500).json({ error: 'Failed to update currency settings' });
  }
});

// Get currency history
app.get('/api/currency-settings/history', async (req, res) => {
  try {
    const history = await CurrencySettings.getHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching currency history:', error);
    res.status(500).json({ error: 'Failed to fetch currency history' });
  }
});

// Get available currencies
app.get('/api/currency-settings/available', async (req, res) => {
  try {
    const currencies = await CurrencySettings.getAvailableCurrencies();
    res.json(currencies);
  } catch (error) {
    console.error('Error fetching available currencies:', error);
    res.status(500).json({ error: 'Failed to fetch available currencies' });
  }
});

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.getAll();
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create new invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const { customerName, customerPhone, items, tipAmount, date } = req.body;
    
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer name and items are required' });
    }

    const invoiceNumber = await Invoice.getNextInvoiceNumber();

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    
    // Calculate tax
    const taxCalculation = await TaxSettings.calculateTax(subtotal);
    
    // Calculate total
    const tipAmountNum = parseFloat(tipAmount) || 0;
    const total = subtotal + taxCalculation.taxAmount + tipAmountNum;

    const invoiceData = {
      invoiceNumber,
      customerName,
      customerPhone,
      items,
      subtotal,
      taxAmount: taxCalculation.taxAmount,
      tipAmount: tipAmountNum,
      total,
      date
    };

    const createdInvoice = await Invoice.create(invoiceData);

    try {
      const pdfBase64 = await generatePDF(createdInvoice);
      res.json({
        invoiceNumber,
        pdf: pdfBase64,
        taxInfo: {
          taxRate: taxCalculation.taxRate,
          taxName: taxCalculation.taxName,
          taxAmount: taxCalculation.taxAmount
        }
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Download invoice
app.get('/api/invoices/:invoiceNumber/download', async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    
    const invoice = await Invoice.getByNumber(invoiceNumber);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    try {
      const pdfBase64 = await generatePDF(invoice);
      res.json({ pdf: pdfBase64 });
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

// Get invoice statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const statistics = await Invoice.getStatistics();
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      error: error.message 
    });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your database configuration.');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`Palm Cafe server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log('Database connected and initialized successfully');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 