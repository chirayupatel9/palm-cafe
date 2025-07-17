const XLSX = require('xlsx');
const fs = require('fs');

console.log('📝 Generating Sample Menu Template...');

// Create workbook
const workbook = XLSX.utils.book_new();

// Sample menu items data
const menuData = [
  { 'Category': 'Beverages', 'Item Name': 'Espresso', 'Description': 'Single shot of espresso', 'Price': 3.50, 'Sort Order': 1 },
  { 'Category': 'Beverages', 'Item Name': 'Cappuccino', 'Description': 'Espresso with steamed milk and foam', 'Price': 4.50, 'Sort Order': 2 },
  { 'Category': 'Beverages', 'Item Name': 'Latte', 'Description': 'Espresso with steamed milk', 'Price': 4.75, 'Sort Order': 3 },
  { 'Category': 'Beverages', 'Item Name': 'Americano', 'Description': 'Espresso with hot water', 'Price': 3.75, 'Sort Order': 4 },
  { 'Category': 'Food', 'Item Name': 'Croissant', 'Description': 'Buttery French pastry', 'Price': 3.25, 'Sort Order': 1 },
  { 'Category': 'Food', 'Item Name': 'Sandwich', 'Description': 'Fresh deli sandwich', 'Price': 8.50, 'Sort Order': 2 },
  { 'Category': 'Desserts', 'Item Name': 'Chocolate Cake', 'Description': 'Rich chocolate layer cake', 'Price': 5.50, 'Sort Order': 1 },
  { 'Category': 'Desserts', 'Item Name': 'Cheesecake', 'Description': 'New York style cheesecake', 'Price': 6.00, 'Sort Order': 2 }
];

// Sample categories data
const categoryData = [
  { 'Category Name': 'Beverages', 'Description': 'Hot and cold drinks', 'Sort Order': 1 },
  { 'Category Name': 'Food', 'Description': 'Meals and snacks', 'Sort Order': 2 },
  { 'Category Name': 'Desserts', 'Description': 'Sweet treats and pastries', 'Sort Order': 3 }
];

// Create worksheets
const menuWorksheet = XLSX.utils.json_to_sheet(menuData);
const categoryWorksheet = XLSX.utils.json_to_sheet(categoryData);

// Add worksheets to workbook
XLSX.utils.book_append_sheet(workbook, menuWorksheet, 'Menu Items');
XLSX.utils.book_append_sheet(workbook, categoryWorksheet, 'Categories');

// Write to file
const outputPath = 'sample-menu-template.xlsx';
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Sample template created: ${outputPath}`);
console.log('\n📋 Template includes:');
console.log('   - Menu Items sheet with columns: Category, Item Name, Description, Price, Sort Order');
console.log('   - Categories sheet with columns: Category Name, Description, Sort Order');
console.log('\n💡 Instructions:');
console.log('   1. Use this template as a starting point');
console.log('   2. Fill in your menu items in the "Menu Items" sheet');
console.log('   3. Categories will be created automatically if they don\'t exist');
console.log('   4. Required fields: Item Name, Price');
console.log('   5. Optional fields: Category, Description, Sort Order'); 