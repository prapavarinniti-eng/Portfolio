import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');
  
  // Check if the application is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle' });
    console.log('✅ Application is running and ready for testing');
    
    // Verify essential pages are accessible
    await page.goto('http://localhost:3009/portfolio');
    console.log('✅ Portfolio page is accessible');
    
  } catch (error) {
    console.error('❌ Application setup failed:', error);
    throw new Error('Application is not ready for testing. Please make sure it\'s running on http://localhost:3009');
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed successfully');
}

export default globalSetup;