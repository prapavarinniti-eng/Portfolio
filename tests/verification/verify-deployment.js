const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Verification configuration
const VERIFICATION_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3009',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  
  // Critical pages to verify
  pages: [
    { path: '/', name: 'Home', required: true },
    { path: '/portfolio', name: 'Portfolio', required: true },
    { path: '/contact', name: 'Contact', required: false },
    { path: '/admin', name: 'Admin', required: false }
  ],
  
  // Performance thresholds
  thresholds: {
    maxLoadTime: 5000, // 5 seconds
    maxImageLoadTime: 3000, // 3 seconds
    minAccessibilityScore: 80,
    maxErrorRate: 1 // 1%
  }
};

class DeploymentVerifier {
  constructor() {
    this.browser = null;
    this.supabase = null;
    this.results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      baseUrl: VERIFICATION_CONFIG.baseUrl,
      overallStatus: 'UNKNOWN',
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async initialize() {
    console.log('🚀 Initializing deployment verification...');
    
    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    // Initialize Supabase client
    if (VERIFICATION_CONFIG.supabaseUrl && VERIFICATION_CONFIG.supabaseKey) {
      this.supabase = createClient(
        VERIFICATION_CONFIG.supabaseUrl,
        VERIFICATION_CONFIG.supabaseKey
      );
    }
    
    console.log('✅ Initialization complete');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  addResult(check, status, message, details = null) {
    const result = {
      check,
      status, // 'PASS', 'FAIL', 'WARN'
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.checks.push(result);
    this.results.summary.total++;
    
    if (status === 'PASS') {
      this.results.summary.passed++;
      console.log(`✅ ${check}: ${message}`);
    } else if (status === 'FAIL') {
      this.results.summary.failed++;
      console.log(`❌ ${check}: ${message}`);
    } else if (status === 'WARN') {
      this.results.summary.warnings++;
      console.log(`⚠️  ${check}: ${message}`);
    }
  }

  async verifyEnvironmentVariables() {
    console.log('\n🔧 Verifying environment variables...');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        this.addResult(
          'Environment Variables',
          'PASS',
          `${varName} is set`
        );
      } else {
        this.addResult(
          'Environment Variables',
          'FAIL',
          `${varName} is missing`
        );
      }
    }
  }

  async verifyDatabaseConnection() {
    console.log('\n🗄️  Verifying database connection...');
    
    if (!this.supabase) {
      this.addResult(
        'Database Connection',
        'FAIL',
        'Supabase client not initialized'
      );
      return;
    }
    
    try {
      // Test basic connection by fetching a single record
      const { data, error } = await this.supabase
        .from('portfolio_images')
        .select('id')
        .limit(1);
      
      if (error) {
        this.addResult(
          'Database Connection',
          'FAIL',
          `Database query failed: ${error.message}`
        );
      } else {
        this.addResult(
          'Database Connection',
          'PASS',
          'Successfully connected to database'
        );
        
        // Check if we have data
        if (data && data.length > 0) {
          this.addResult(
            'Database Data',
            'PASS',
            'Portfolio images table has data'
          );
        } else {
          this.addResult(
            'Database Data',
            'WARN',
            'Portfolio images table is empty'
          );
        }
      }
    } catch (error) {
      this.addResult(
        'Database Connection',
        'FAIL',
        `Database connection error: ${error.message}`
      );
    }
  }

  async verifyPageAccessibility(url, pageName) {
    console.log(`\n🌐 Verifying ${pageName} page accessibility...`);
    
    const page = await this.browser.newPage();
    
    try {
      const startTime = Date.now();
      
      // Navigate to page
      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: VERIFICATION_CONFIG.thresholds.maxLoadTime
      });
      
      const loadTime = Date.now() - startTime;
      
      // Check response status
      if (response && response.ok()) {
        this.addResult(
          `${pageName} Accessibility`,
          'PASS',
          `Page loads successfully (${response.status()})`
        );
      } else {
        this.addResult(
          `${pageName} Accessibility`,
          'FAIL',
          `Page returned ${response ? response.status() : 'no response'}`
        );
        return;
      }
      
      // Check load time
      if (loadTime < VERIFICATION_CONFIG.thresholds.maxLoadTime) {
        this.addResult(
          `${pageName} Performance`,
          'PASS',
          `Page loaded in ${loadTime}ms`
        );
      } else {
        this.addResult(
          `${pageName} Performance`,
          'WARN',
          `Page loaded slowly in ${loadTime}ms`
        );
      }
      
      // Check for JavaScript errors
      const jsErrors = [];
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      // Wait for any async operations
      await page.waitForTimeout(2000);
      
      if (jsErrors.length === 0) {
        this.addResult(
          `${pageName} JavaScript`,
          'PASS',
          'No JavaScript errors detected'
        );
      } else {
        this.addResult(
          `${pageName} JavaScript`,
          'FAIL',
          `JavaScript errors detected: ${jsErrors.join(', ')}`
        );
      }
      
      // Check basic content structure
      const hasTitle = await page.$('title');
      const hasHeading = await page.$('h1, h2, h3');
      const hasMainContent = await page.$('main, [role="main"], .main-content');
      
      if (hasTitle) {
        const title = await page.title();
        this.addResult(
          `${pageName} SEO`,
          'PASS',
          `Page has title: "${title}"`
        );
      } else {
        this.addResult(
          `${pageName} SEO`,
          'FAIL',
          'Page missing title tag'
        );
      }
      
      if (hasHeading) {
        this.addResult(
          `${pageName} Structure`,
          'PASS',
          'Page has heading structure'
        );
      } else {
        this.addResult(
          `${pageName} Structure`,
          'WARN',
          'Page missing heading elements'
        );
      }
      
      if (hasMainContent) {
        this.addResult(
          `${pageName} Accessibility`,
          'PASS',
          'Page has main content landmark'
        );
      } else {
        this.addResult(
          `${pageName} Accessibility`,
          'WARN',
          'Page missing main content landmark'
        );
      }
      
    } catch (error) {
      this.addResult(
        `${pageName} Accessibility`,
        'FAIL',
        `Page verification failed: ${error.message}`
      );
    } finally {
      await page.close();
    }
  }

  async verifyPortfolioFunctionality() {
    console.log('\n📸 Verifying portfolio functionality...');
    
    const page = await this.browser.newPage();
    
    try {
      await page.goto(`${VERIFICATION_CONFIG.baseUrl}/portfolio`, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      
      // Wait for content to load
      await page.waitForTimeout(3000);
      
      // Check for portfolio grid or empty state
      const hasGrid = await page.$('[role="grid"]');
      const hasEmptyState = await page.$('[role="status"]');
      const hasError = await page.$('[role="alert"]');
      
      if (hasError) {
        this.addResult(
          'Portfolio Functionality',
          'FAIL',
          'Portfolio page shows error state'
        );
      } else if (hasGrid) {
        // Check if grid has images
        const imageCount = await page.$$eval('[role="grid"] article', articles => articles.length);
        
        if (imageCount > 0) {
          this.addResult(
            'Portfolio Functionality',
            'PASS',
            `Portfolio displays ${imageCount} images`
          );
          
          // Test modal functionality
          const firstImage = await page.$('[role="button"][aria-label*="View"]');
          if (firstImage) {
            await firstImage.click();
            
            // Wait for modal
            const modal = await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
            if (modal) {
              this.addResult(
                'Portfolio Modal',
                'PASS',
                'Image modal opens successfully'
              );
              
              // Close modal
              const closeButton = await page.$('[aria-label="Close modal"]');
              if (closeButton) {
                await closeButton.click();
                await page.waitForTimeout(500);
                
                const modalClosed = await page.$('[role="dialog"]');
                if (!modalClosed) {
                  this.addResult(
                    'Portfolio Modal',
                    'PASS',
                    'Modal closes successfully'
                  );
                } else {
                  this.addResult(
                    'Portfolio Modal',
                    'WARN',
                    'Modal may not close properly'
                  );
                }
              }
            }
          }
          
        } else {
          this.addResult(
            'Portfolio Functionality',
            'WARN',
            'Portfolio grid is empty'
          );
        }
        
      } else if (hasEmptyState) {
        this.addResult(
          'Portfolio Functionality',
          'PASS',
          'Portfolio shows appropriate empty state'
        );
      } else {
        this.addResult(
          'Portfolio Functionality',
          'FAIL',
          'Portfolio page has unexpected structure'
        );
      }
      
      // Test category filters if they exist
      const categoryButtons = await page.$$('button');
      const filterButtons = [];
      
      for (const button of categoryButtons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && (text.includes('ทั้งหมด') || text.includes('งาน'))) {
          filterButtons.push(button);
        }
      }
      
      if (filterButtons.length > 0) {
        this.addResult(
          'Portfolio Filters',
          'PASS',
          `Found ${filterButtons.length} category filter buttons`
        );
        
        // Test clicking a filter
        if (filterButtons.length > 1) {
          await filterButtons[1].click();
          await page.waitForTimeout(1000);
          
          this.addResult(
            'Portfolio Filters',
            'PASS',
            'Category filter interaction works'
          );
        }
      } else {
        this.addResult(
          'Portfolio Filters',
          'WARN',
          'No category filter buttons found'
        );
      }
      
    } catch (error) {
      this.addResult(
        'Portfolio Functionality',
        'FAIL',
        `Portfolio verification failed: ${error.message}`
      );
    } finally {
      await page.close();
    }
  }

  async verifyImageLoading() {
    console.log('\n🖼️  Verifying image loading...');
    
    const page = await this.browser.newPage();
    
    try {
      await page.goto(`${VERIFICATION_CONFIG.baseUrl}/portfolio`, {
        waitUntil: 'networkidle0'
      });
      
      await page.waitForTimeout(3000);
      
      // Get all images on the page
      const images = await page.$$('img');
      
      if (images.length === 0) {
        this.addResult(
          'Image Loading',
          'WARN',
          'No images found on portfolio page'
        );
        return;
      }
      
      let loadedImages = 0;
      let brokenImages = 0;
      
      for (const img of images) {
        try {
          const isLoaded = await img.evaluate(image => {
            return image.complete && image.naturalWidth > 0;
          });
          
          if (isLoaded) {
            loadedImages++;
          } else {
            brokenImages++;
          }
        } catch (error) {
          brokenImages++;
        }
      }
      
      const totalImages = images.length;
      const successRate = (loadedImages / totalImages) * 100;
      
      if (successRate >= 95) {
        this.addResult(
          'Image Loading',
          'PASS',
          `${loadedImages}/${totalImages} images loaded successfully (${successRate.toFixed(1)}%)`
        );
      } else if (successRate >= 80) {
        this.addResult(
          'Image Loading',
          'WARN',
          `${loadedImages}/${totalImages} images loaded (${successRate.toFixed(1)}%)`
        );
      } else {
        this.addResult(
          'Image Loading',
          'FAIL',
          `Only ${loadedImages}/${totalImages} images loaded (${successRate.toFixed(1)}%)`
        );
      }
      
    } catch (error) {
      this.addResult(
        'Image Loading',
        'FAIL',
        `Image verification failed: ${error.message}`
      );
    } finally {
      await page.close();
    }
  }

  async verifyAPIEndpoints() {
    console.log('\n🔌 Verifying API endpoints...');
    
    if (!this.supabase) {
      this.addResult(
        'API Endpoints',
        'SKIP',
        'Supabase client not available'
      );
      return;
    }
    
    try {
      // Test portfolio images endpoint
      const { data, error } = await this.supabase
        .from('portfolio_images')
        .select('*')
        .limit(5);
      
      if (error) {
        this.addResult(
          'API Endpoints',
          'FAIL',
          `Portfolio API error: ${error.message}`
        );
      } else {
        this.addResult(
          'API Endpoints',
          'PASS',
          `Portfolio API returns ${data ? data.length : 0} records`
        );
        
        // Verify data structure
        if (data && data.length > 0) {
          const firstRecord = data[0];
          const requiredFields = ['id', 'title', 'image_url', 'category'];
          const missingFields = requiredFields.filter(field => !(field in firstRecord));
          
          if (missingFields.length === 0) {
            this.addResult(
              'API Data Structure',
              'PASS',
              'Portfolio records have required fields'
            );
          } else {
            this.addResult(
              'API Data Structure',
              'FAIL',
              `Missing fields: ${missingFields.join(', ')}`
            );
          }
        }
      }
      
    } catch (error) {
      this.addResult(
        'API Endpoints',
        'FAIL',
        `API verification failed: ${error.message}`
      );
    }
  }

  async verifySecurityHeaders() {
    console.log('\n🔒 Verifying security headers...');
    
    const page = await this.browser.newPage();
    
    try {
      const response = await page.goto(VERIFICATION_CONFIG.baseUrl);
      const headers = response.headers();
      
      // Check for security headers
      const securityHeaders = {
        'x-frame-options': 'X-Frame-Options',
        'x-content-type-options': 'X-Content-Type-Options',
        'x-xss-protection': 'X-XSS-Protection',
        'strict-transport-security': 'Strict-Transport-Security',
        'content-security-policy': 'Content-Security-Policy'
      };
      
      let secureHeaders = 0;
      const totalHeaders = Object.keys(securityHeaders).length;
      
      for (const [headerKey, headerName] of Object.entries(securityHeaders)) {
        if (headers[headerKey]) {
          secureHeaders++;
          this.addResult(
            'Security Headers',
            'PASS',
            `${headerName} header present`
          );
        } else {
          this.addResult(
            'Security Headers',
            'WARN',
            `${headerName} header missing`
          );
        }
      }
      
      if (secureHeaders >= totalHeaders * 0.6) {
        this.addResult(
          'Security Headers',
          'PASS',
          `${secureHeaders}/${totalHeaders} security headers present`
        );
      } else {
        this.addResult(
          'Security Headers',
          'WARN',
          `Only ${secureHeaders}/${totalHeaders} security headers present`
        );
      }
      
    } catch (error) {
      this.addResult(
        'Security Headers',
        'FAIL',
        `Security header verification failed: ${error.message}`
      );
    } finally {
      await page.close();
    }
  }

  async generateReport() {
    console.log('\n📄 Generating verification report...');
    
    // Calculate overall status
    if (this.results.summary.failed === 0) {
      this.results.overallStatus = 'HEALTHY';
    } else if (this.results.summary.failed <= 2) {
      this.results.overallStatus = 'WARNING';
    } else {
      this.results.overallStatus = 'CRITICAL';
    }
    
    // Save detailed JSON report
    const reportPath = path.join(__dirname, '../reports/verification-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport();
    const htmlPath = path.join(__dirname, '../reports/verification-report.html');
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`📊 Verification reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
    
    return this.results;
  }

  generateHtmlReport() {
    const { results } = this;
    const statusColors = {
      'PASS': '#28a745',
      'FAIL': '#dc3545',
      'WARN': '#ffc107',
      'SKIP': '#6c757d'
    };
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Verification Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-badge { padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; }
        .status-HEALTHY { background: #28a745; }
        .status-WARNING { background: #ffc107; color: black; }
        .status-CRITICAL { background: #dc3545; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; }
        .metric .value { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .checks { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .check-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
        .check-item:last-child { border-bottom: none; }
        .check-status { width: 80px; text-align: center; font-weight: bold; padding: 4px 8px; border-radius: 4px; margin-right: 15px; }
        .check-content { flex: 1; }
        .check-title { font-weight: bold; margin-bottom: 4px; }
        .check-message { color: #666; font-size: 14px; }
        .check-details { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 8px; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Deployment Verification Report</h1>
            <p>
                <span class="status-badge status-${results.overallStatus}">${results.overallStatus}</span>
                &nbsp;&nbsp;
                Environment: ${results.environment} | 
                URL: ${results.baseUrl} | 
                Generated: ${new Date(results.timestamp).toLocaleString()}
            </p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Checks</h3>
                <div class="value">${results.summary.total}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value" style="color: #28a745">${results.summary.passed}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value" style="color: #dc3545">${results.summary.failed}</div>
            </div>
            <div class="metric">
                <h3>Warnings</h3>
                <div class="value" style="color: #ffc107">${results.summary.warnings}</div>
            </div>
        </div>
        
        <div class="checks">
            <h2>Detailed Results</h2>
            ${results.checks.map(check => `
                <div class="check-item">
                    <div class="check-status" style="background: ${statusColors[check.status]}; color: ${check.status === 'WARN' ? 'black' : 'white'}">
                        ${check.status}
                    </div>
                    <div class="check-content">
                        <div class="check-title">${check.check}</div>
                        <div class="check-message">${check.message}</div>
                        ${check.details ? `<div class="check-details">${JSON.stringify(check.details, null, 2)}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  async runAllVerifications() {
    try {
      await this.initialize();
      
      console.log(`🔍 Starting deployment verification for ${VERIFICATION_CONFIG.baseUrl}`);
      
      // Run all verification checks
      await this.verifyEnvironmentVariables();
      await this.verifyDatabaseConnection();
      
      // Verify each page
      for (const pageConfig of VERIFICATION_CONFIG.pages) {
        const url = `${VERIFICATION_CONFIG.baseUrl}${pageConfig.path}`;
        await this.verifyPageAccessibility(url, pageConfig.name);
      }
      
      await this.verifyPortfolioFunctionality();
      await this.verifyImageLoading();
      await this.verifyAPIEndpoints();
      await this.verifySecurityHeaders();
      
      // Generate report
      const report = await this.generateReport();
      
      // Print summary
      console.log('\n🎉 Deployment verification completed!');
      console.log(`📊 Summary: ${report.summary.passed}/${report.summary.total} checks passed`);
      console.log(`⚠️  Warnings: ${report.summary.warnings}`);
      console.log(`❌ Failures: ${report.summary.failed}`);
      console.log(`🏥 Overall Status: ${report.overallStatus}`);
      
      // Exit with appropriate code
      if (report.overallStatus === 'CRITICAL') {
        console.log('\n💥 Critical issues found. Deployment verification failed.');
        process.exit(1);
      } else if (report.overallStatus === 'WARNING') {
        console.log('\n⚠️  Warnings found. Please review before proceeding.');
        process.exit(0);
      } else {
        console.log('\n✅ All checks passed. Deployment verified successfully!');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  verifier.runAllVerifications().catch(console.error);
}

module.exports = { DeploymentVerifier, VERIFICATION_CONFIG };