const CurrencySettings = require('./models/currencySettings');

async function testCurrencySettings() {
  try {
    console.log('Testing currency settings...');
    
    // Test getting current settings
    const current = await CurrencySettings.getCurrent();
    console.log('Current currency settings:', JSON.stringify(current, null, 2));
    
    // Test available currencies
    const available = await CurrencySettings.getAvailableCurrencies();
    console.log('Available currencies:', JSON.stringify(available, null, 2));
    
    // Test history
    const history = await CurrencySettings.getHistory();
    console.log('Currency history:', JSON.stringify(history, null, 2));
    
    console.log('\n✅ Currency settings test completed successfully!');
    console.log(`Current symbol: ${current.currency_symbol}`);
    console.log(`Current code: ${current.currency_code}`);
    console.log(`Current name: ${current.currency_name}`);
    
  } catch (error) {
    console.error('❌ Error testing currency settings:', error);
  } finally {
    process.exit(0);
  }
}

testCurrencySettings(); 