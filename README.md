# Palm Cafe Management System

A comprehensive cafe management system built with React frontend and Node.js backend, featuring menu management, invoice generation, tax/tip calculations, and Excel import/export functionality.

## Features

### 🍽️ Menu Management
- **Category-based organization**: Organize menu items into categories (Beverages, Food, Desserts, etc.)
- **Full CRUD operations**: Add, edit, delete, and view menu items
- **Sort order support**: Control the display order of categories and items
- **Excel Import/Export**: Bulk import menu items from Excel files and export current menu

### 💰 Tax & Tip System
- **Configurable tax rates**: Set and manage tax rates through the admin interface
- **Tax history tracking**: View historical tax rate changes
- **Tip selection**: Quick tip buttons (0%, 10%, 15%, 18%, 20%, 25%) or custom amounts
- **Automatic calculations**: Real-time subtotal, tax, and tip calculations

### 📄 Invoice Generation
- **Professional PDF invoices**: Generate and view invoices in new browser tabs
- **Complete breakdown**: Shows subtotal, tax, tip, and total amounts
- **Invoice history**: View and download past invoices
- **Customer information**: Store customer name and phone number

### 📊 Analytics & Reporting
- **Sales statistics**: Total revenue, orders, unique customers
- **Tax and tip tracking**: Separate tracking of tax collected and tips received
- **Invoice history**: Complete record of all transactions

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with connection pooling
- **PDFKit** for invoice generation
- **XLSX** for Excel file processing
- **Multer** for file uploads

### Frontend
- **React** with functional components and hooks
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Axios** for API communication

## Database Schema

### Tables
- `categories` - Menu categories with sort order
- `menu_items` - Menu items linked to categories
- `tax_settings` - Tax rate configuration and history
- `invoices` - Invoice records with tax/tip breakdown
- `invoice_items` - Individual items in each invoice

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd palm-cafe
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Database Configuration
Create a `.env` file in the server directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306
DB_NAME=palm_cafe
```

### 4. Database Migration
```bash
# Run the categories migration
node migrate-categories.js

# Run the invoice table migration (if needed)
node migrate-invoices-table.js
```

### 5. Frontend Setup
```bash
cd ../client
npm install
```

### 6. Start the Application
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm start
```

## Usage Guide

### Menu Management

#### Adding Categories
1. Navigate to **Categories** in the main menu
2. Click **Add New Category**
3. Enter category name, description, and sort order
4. Click **Save**

#### Adding Menu Items
1. Navigate to **Menu Management**
2. Click **Add New Item**
3. Select a category, enter item details, and set sort order
4. Click **Save**

#### Excel Import/Export
1. **Export**: Click **Export Excel** to download current menu
2. **Import**: Click **Import Excel** and select a properly formatted Excel file
3. **Template**: Use the generated `sample-menu-template.xlsx` as a reference

### Tax Settings
1. Navigate to **Tax Settings**
2. View current tax rate and history
3. Click **Edit Settings** to update tax rate and name
4. Changes apply immediately to new orders

### Creating Orders
1. Navigate to **New Order**
2. Browse menu items organized by category
3. Click items to add to cart
4. Enter customer information
5. Select tip amount (quick buttons or custom)
6. Review breakdown (subtotal, tax, tip, total)
7. Click **Generate & Open Invoice**

### Invoice History
1. Navigate to **Invoice History**
2. View all past invoices with tax/tip breakdown
3. Click download icon to view PDF invoice
4. Review sales statistics and analytics

## Excel Import Format

### Required Sheet: "Menu Items"
| Column | Required | Description |
|--------|----------|-------------|
| Category | No | Category name (will be created if doesn't exist) |
| Item Name | Yes | Name of the menu item |
| Description | No | Item description |
| Price | Yes | Item price (numeric) |
| Sort Order | No | Display order (numeric) |

### Optional Sheet: "Categories"
| Column | Description |
|--------|-------------|
| Category Name | Name of the category |
| Description | Category description |
| Sort Order | Display order (numeric) |

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/with-counts` - Get categories with item counts
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Menu Items
- `GET /api/menu` - Get all menu items
- `GET /api/menu/grouped` - Get menu items grouped by category
- `POST /api/menu` - Create new menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item
- `GET /api/menu/export` - Export menu to Excel
- `POST /api/menu/import` - Import menu from Excel

### Tax Settings
- `GET /api/tax-settings` - Get current tax settings
- `PUT /api/tax-settings` - Update tax settings
- `GET /api/tax-settings/history` - Get tax history
- `POST /api/calculate-tax` - Calculate tax for subtotal

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id/download` - Download invoice PDF
- `GET /api/statistics` - Get sales statistics

## File Structure

```
palm-cafe/
├── server/
│   ├── models/
│   │   ├── category.js
│   │   ├── menuItem.js
│   │   ├── invoice.js
│   │   └── taxSettings.js
│   ├── config/
│   │   └── database.js
│   ├── migrations/
│   │   ├── migrate-categories.js
│   │   └── migrate-invoices-table.js
│   ├── index.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderPage.js
│   │   │   ├── MenuManagement.js
│   │   │   ├── CategoryManagement.js
│   │   │   ├── InvoiceHistory.js
│   │   │   └── TaxSettings.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 