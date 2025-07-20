# Palm Cafe Management System

A modern, full-stack cafe management system built with React, Node.js, and MySQL. Features order management, menu management, tax and currency settings, PDF invoice generation, and more.

## 🌟 Features

### Core Features
- **Order Management**: Create, track, and manage customer orders
- **Menu Management**: Organize menu items by categories with Excel import/export
- **Tax & Tips**: Configurable tax rates and user-selectable tips
- **Currency Support**: Multi-currency support (USD, INR, EUR, etc.)
- **PDF Invoices**: Professional invoice generation with logo
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Friendly**: Responsive design for all devices

### Technical Features
- **Real-time Updates**: Live order status updates
- **Excel Integration**: Import/export menu data
- **Network Access**: Accessible from other devices on the network
- **Database Management**: Complete database setup and migration
- **Error Handling**: Comprehensive error handling and user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd palm-cafe
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy environment file
   cd ../server
   cp env.example .env
   ```

   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_PORT=3306
   DB_NAME=palm_cafe
   PORT=5000
   ```

4. **Setup database**
   ```bash
   cd server
   node setup-database.js
   ```

5. **Start the application**
   ```bash
   # Option 1: Use the network startup script (recommended)
   cd ..
   ./start-network.bat

   # Option 2: Start manually
   # Terminal 1 - Start backend
   cd server
   npm start

   # Terminal 2 - Start frontend
   cd client
   npm start
   ```

6. **Access the application**
   - Local: http://localhost:3000
   - Network: http://your-ip-address:3000

## 📁 Project Structure

```
palm-cafe/
├── client/                 # React frontend
│   ├── public/
│   │   └── images/
│   │       └── palm-cafe-logo.png
│   └── src/
│       ├── components/     # React components
│       ├── contexts/       # React contexts
│       └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── models/            # Database models
│   ├── public/            # Static files
│   ├── setup-database.js  # Database setup script
│   └── index.js           # Main server file
├── start-network.bat      # Network startup script
└── README.md
```

## 🗄️ Database Schema

### Tables
- **categories**: Menu categories
- **menu_items**: Menu items with prices
- **orders**: Customer orders
- **order_items**: Individual items in orders
- **invoices**: Generated invoices
- **tax_settings**: Tax configuration
- **tax_settings_history**: Tax change history
- **currency_settings**: Currency configuration
- **currency_settings_history**: Currency change history

## 🎨 Customization

### Brand Colors
The system uses a custom color scheme:
- Primary: `#75826b` (Olive Green)
- Secondary: `#153059` (Navy Blue)
- Accent: `#f4e1ba` (Cream)

### Logo
Replace `/client/public/images/palm-cafe-logo.png` with your logo.

### Currency
Add new currencies in the Currency Settings page or modify the backend currency list.

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Configuration

### Tax Settings
- Navigate to Tax Settings tab
- Set tax rate and name
- Changes apply immediately to new orders

### Currency Settings
- Navigate to Currency Settings tab
- Select from available currencies
- Changes apply to UI and PDF invoices

### Menu Management
- Add/edit/delete categories
- Import menu from Excel file
- Export menu to Excel file
- Organize items by categories

## 📄 PDF Invoice Features

- Professional layout with logo
- Customer information
- Itemized order details
- Tax and tip calculations
- Multiple currency support
- Single-page design

## 🌙 Dark Mode

Toggle dark mode using the button in the top navigation. All components support both light and dark themes.

## 🔌 Network Access

The application is configured for network access:
- Backend runs on `0.0.0.0:5000`
- Frontend accessible via IP address
- Use `start-network.bat` for easy startup

## 🛠️ Development

### Adding New Features
1. Backend: Add routes in `server/index.js`
2. Frontend: Create components in `client/src/components/`
3. Database: Update schema in `server/setup-database.js`

### Testing
- Test database connection: `node server/test-connection.js`
- Test PDF generation: Check generated invoices
- Test network access: Use different devices on same network

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify credentials in `.env`
   - Run `node setup-database.js`

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing processes

3. **Network Access Issues**
   - Check firewall settings
   - Verify IP address
   - Use `start-network.bat`

4. **PDF Generation Issues**
   - Check logo file exists
   - Verify font availability
   - Check file permissions

### Logs
- Backend logs: Check terminal running server
- Frontend logs: Check browser console
- Database logs: Check MySQL error log

## 📦 Dependencies

### Backend
- `express`: Web framework
- `mysql2`: MySQL client
- `pdfkit`: PDF generation
- `multer`: File uploads
- `xlsx`: Excel file processing
- `cors`: Cross-origin requests

### Frontend
- `react`: UI library
- `axios`: HTTP client
- `react-hot-toast`: Notifications
- `lucide-react`: Icons
- `tailwindcss`: Styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section
2. Review the code comments
3. Create an issue in the repository

---

**Palm Cafe Management System** - Making cafe management simple and efficient! ☕ 