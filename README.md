# Palm Cafe - Cafe Management System

A modern, full-stack cafe management application with invoice generation capabilities. Built with React frontend and Node.js backend with MySQL database.

## Features

### 🛒 Order Management
- Add items to cart with quantity controls
- Real-time total calculation
- Customer information collection
- Professional PDF invoice generation

### 📋 Menu Management
- Add, edit, and delete menu items
- Update pricing in real-time
- Item descriptions and categorization
- Intuitive table interface

### 📊 Invoice History
- View all past invoices
- Download invoices as PDF
- Revenue and order statistics
- Customer tracking

### 🎨 Modern UI
- Responsive design for all devices
- Beautiful Tailwind CSS styling
- Intuitive navigation
- Toast notifications for user feedback

### 🗄️ Database
- MySQL database for data persistence
- Relational data structure
- Transaction support for invoices
- Automatic database initialization

## Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - MySQL database driver
- **PDFKit** - PDF generation
- **UUID** - Unique ID generation
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Database Setup

### 1. Install MySQL Server

**Windows:**
- Download and install MySQL from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Or use XAMPP/WAMP which includes MySQL

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Create Database

1. **Access MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Run the setup script:**
   ```bash
   mysql -u root -p < server/setup-database.sql
   ```

   Or manually create the database:
   ```sql
   CREATE DATABASE palm_cafe;
   USE palm_cafe;
   ```

### 3. Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp server/env.example server/.env
   ```

2. **Edit the `.env` file with your database credentials:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=palm_cafe
   DB_PORT=3306
   PORT=5000
   NODE_ENV=development
   ```

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd palm-cafe
```

### 2. Install all dependencies
```bash
npm run install-all
```

### 3. Start the development servers
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Manual Installation

If you prefer to install dependencies separately:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## Usage

### Starting the Application

1. **Development mode** (recommended for development):
   ```bash
   npm run dev
   ```

2. **Production mode**:
   ```bash
   # Build the frontend
   npm run build
   
   # Start the backend server
   npm run server
   ```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Database Schema

### Tables

1. **menu_items**
   - `id` (VARCHAR(36)) - Primary key
   - `name` (VARCHAR(255)) - Item name
   - `description` (TEXT) - Item description
   - `price` (DECIMAL(10,2)) - Item price
   - `created_at` (TIMESTAMP) - Creation timestamp
   - `updated_at` (TIMESTAMP) - Last update timestamp

2. **invoices**
   - `invoice_number` (VARCHAR(20)) - Primary key
   - `customer_name` (VARCHAR(255)) - Customer name
   - `customer_phone` (VARCHAR(50)) - Customer phone
   - `total` (DECIMAL(10,2)) - Invoice total
   - `date` (TIMESTAMP) - Invoice date
   - `created_at` (TIMESTAMP) - Creation timestamp

3. **invoice_items**
   - `id` (INT) - Auto-increment primary key
   - `invoice_number` (VARCHAR(20)) - Foreign key to invoices
   - `menu_item_id` (VARCHAR(36)) - Menu item reference
   - `item_name` (VARCHAR(255)) - Item name at time of purchase
   - `price` (DECIMAL(10,2)) - Price at time of purchase
   - `quantity` (INT) - Quantity ordered
   - `total` (DECIMAL(10,2)) - Line item total

## API Endpoints

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Add new menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Invoice Management
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:invoiceNumber/download` - Download invoice PDF

### Statistics
- `GET /api/statistics` - Get revenue and order statistics

### Health Check
- `GET /api/health` - Server and database health status

## Project Structure

```
palm-cafe/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── OrderPage.js
│   │   │   ├── MenuManagement.js
│   │   │   └── InvoiceHistory.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   │   └── database.js
│   ├── models/            # Database models
│   │   ├── menuItem.js
│   │   └── invoice.js
│   ├── setup-database.sql # Database setup script
│   ├── env.example        # Environment variables example
│   ├── index.js           # Main server file
│   └── package.json
├── package.json
└── README.md
```

## Features in Detail

### Order Page
- Browse menu items in a grid layout
- Add items to cart with one click
- Adjust quantities with +/- buttons
- Remove items from cart
- Enter customer information
- Generate and download PDF invoices

### Menu Management
- Add new menu items with name, description, and price
- Edit existing items inline
- Delete items with confirmation
- Real-time validation
- Responsive table design

### Invoice History
- View all generated invoices
- Download PDF invoices
- Revenue statistics
- Customer analytics
- Order tracking

## Troubleshooting

### Database Connection Issues

1. **Check MySQL service is running:**
   ```bash
   # Windows
   net start mysql
   
   # macOS
   brew services start mysql
   
   # Linux
   sudo systemctl start mysql
   ```

2. **Verify database credentials in `.env` file**

3. **Test database connection:**
   ```bash
   mysql -u root -p -h localhost
   ```

4. **Check if database exists:**
   ```sql
   SHOW DATABASES;
   USE palm_cafe;
   SHOW TABLES;
   ```

### Common Issues

1. **"Access denied" error:**
   - Check username and password in `.env`
   - Ensure MySQL user has proper permissions

2. **"Database not found" error:**
   - Run the setup script: `mysql -u root -p < server/setup-database.sql`

3. **Port already in use:**
   - Change PORT in `.env` file
   - Or kill the process using the port

## Customization

### Styling
The app uses Tailwind CSS with a custom color scheme. You can modify colors in `client/tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#fef7ee',
    100: '#fdedd6',
    // ... customize your brand colors
  }
}
```

### Database Configuration
Edit the database settings in `server/.env`:

```env
DB_HOST=your_host
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
```

### PDF Template
Customize the invoice PDF template in the `generatePDF` function in `server/index.js`.

## Deployment

### Frontend (React)
- Build the app: `npm run build`
- Deploy the `build` folder to your hosting service
- Update the API base URL in `client/src/App.js` if needed

### Backend (Node.js)
- Deploy to platforms like Heroku, Vercel, or AWS
- Set environment variables for database connection
- Ensure proper CORS configuration for production

### Database (MySQL)
- Use a managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
- Or set up a MySQL server on your hosting provider
- Update the database connection settings in production

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

---

**Palm Cafe** - Professional cafe management made simple! ☕ 