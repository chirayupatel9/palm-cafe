const PDFDocument = require('pdfkit');
const fs = require('fs');
const CurrencySettings = require('./models/currencySettings');

async function testPDFGeneration() {
  try {
    console.log('Testing PDF generation with currency symbols...');
    
    // Get currency settings
    const currencySettings = await CurrencySettings.getCurrent();
    console.log('Currency settings:', currencySettings);
    
    const currencySymbol = currencySettings.currency_symbol || '₹';
    console.log('Using currency symbol:', currencySymbol);
    
    // Create a test PDF
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream('test-invoice.pdf');
    doc.pipe(stream);
    
    // Set font
    doc.font('Helvetica');
    
    // Add content
    doc.fontSize(24).text('Test Invoice', { align: 'center' });
    doc.moveDown();
    
    // Test currency formatting
    const formatCurrency = (amount) => {
      const num = parseFloat(amount || 0).toFixed(2);
      
      // Map Unicode symbols to ASCII equivalents for PDF compatibility
      let symbol = currencySymbol;
      if (currencySymbol === '₹') {
        symbol = 'Rs.';
      } else if (currencySymbol === '€') {
        symbol = 'EUR';
      } else if (currencySymbol === '£') {
        symbol = 'GBP';
      } else if (currencySymbol === '¥') {
        symbol = 'JPY';
      }
      
      const formatted = `${symbol}${num}`;
      console.log(`Formatting: ${amount} -> ${formatted} (original: ${currencySymbol}, used: ${symbol})`);
      return formatted;
    };
    
    doc.fontSize(12).text('Item: Americano');
    doc.text(`Price: ${formatCurrency(3.75)}`);
    doc.text(`Total: ${formatCurrency(3.75)}`);
    doc.moveDown();
    
    doc.text(`Subtotal: ${formatCurrency(3.75)}`);
    doc.text(`Tax: ${formatCurrency(0.32)}`);
    doc.text(`Total: ${formatCurrency(4.07)}`);
    
    doc.end();
    
    stream.on('finish', () => {
      console.log('✅ Test PDF generated: test-invoice.pdf');
      console.log('Check the PDF to see if currency symbols are displayed correctly');
    });
    
  } catch (error) {
    console.error('❌ Error testing PDF generation:', error);
  }
}

testPDFGeneration(); 