const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs').promises;
const path = require('path');

// Performance test configuration
const PERFORMANCE_CONFIG = {
  baseUrl: 'http://localhost:3009',
  pages: [
    { path: '/', name: 'Home' },
    { path: '/portfolio', name: 'Portfolio' },
    { path: '/contact', name: 'Contact' },
    { path: '/admin', name: 'Admin' }
  ],
  thresholds: {
    performance: 70,
    accessibility: 90,
    bestPractices: 80,
    seo: 80,
    pwa: 50,
    // Core Web Vitals
    firstContentfulPaint: 2000, // ms
    largestContentfulPaint: 4000, // ms
    cumulativeLayoutShift: 0.1,
    totalBlockingTime: 300, // ms
    speedIndex: 4000 // ms
  },
  viewports: [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ]
};

class PerformanceTester {
  constructor() {
    this.browser = null;
    this.results = [];
  }

  async initialize() {
    console.log('🚀 Initializing performance testing...');
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps'
      ]
    });
    
    console.log('✅ Browser launched successfully');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  async testPagePerformance(url, pageName, viewport = null) {
    console.log(`\n📊 Testing ${pageName} performance...`);
    
    const page = await this.browser.newPage();
    
    try {
      if (viewport) {
        await page.setViewport(viewport);
        console.log(`📱 Set viewport to ${viewport.width}x${viewport.height}`);
      }

      // Enable performance monitoring
      await page.setCacheEnabled(false);
      
      // Start performance monitoring
      const performanceMetrics = await this.collectPerformanceMetrics(page, url);
      
      // Run Lighthouse audit
      const lighthouseResults = await this.runLighthouseAudit(url, viewport);
      
      const result = {
        page: pageName,
        url,
        viewport: viewport ? `${viewport.width}x${viewport.height}` : 'Default',
        timestamp: new Date().toISOString(),
        performanceMetrics,
        lighthouse: lighthouseResults,
        passed: this.evaluateResults(performanceMetrics, lighthouseResults)
      };
      
      this.results.push(result);
      this.printResults(result);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error testing ${pageName}:`, error.message);
      return {
        page: pageName,
        url,
        error: error.message,
        passed: false
      };
    } finally {
      await page.close();
    }
  }

  async collectPerformanceMetrics(page, url) {
    console.log('📈 Collecting performance metrics...');
    
    // Start timing
    const startTime = Date.now();
    
    // Navigate to page
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        // Navigation timing
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        // Paint timing
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        // Resource timing
        totalResources: performance.getEntriesByType('resource').length,
        // Memory usage (if available)
        usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
        totalJSHeapSize: performance.memory?.totalJSHeapSize || 0,
      };
    });
    
    // Get Core Web Vitals
    const coreWebVitals = await this.getCoreWebVitals(page);
    
    // Get resource loading metrics
    const resourceMetrics = await this.getResourceMetrics(page);
    
    return {
      loadTime,
      statusCode: response.status(),
      ...performanceMetrics,
      ...coreWebVitals,
      ...resourceMetrics
    };
  }

  async getCoreWebVitals(page) {
    console.log('🎯 Collecting Core Web Vitals...');
    
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            vitals.largestContentfulPaint = entries[entries.length - 1].startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (approximated with event timing)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            vitals.firstInputDelay = entries[0].processingStart - entries[0].startTime;
          }
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cumulativeLayoutShift = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Resolve after a short delay to collect metrics
        setTimeout(() => {
          resolve(vitals);
        }, 2000);
      });
    });
  }

  async getResourceMetrics(page) {
    console.log('📦 Analyzing resource loading...');
    
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      
      const resourceStats = {
        totalResources: resources.length,
        totalSize: 0,
        imageCount: 0,
        scriptCount: 0,
        stylesheetCount: 0,
        slowResources: []
      };
      
      resources.forEach(resource => {
        // Categorize resources
        if (resource.initiatorType === 'img') resourceStats.imageCount++;
        if (resource.initiatorType === 'script') resourceStats.scriptCount++;
        if (resource.initiatorType === 'link') resourceStats.stylesheetCount++;
        
        // Track slow resources (>1 second)
        const loadTime = resource.responseEnd - resource.startTime;
        if (loadTime > 1000) {
          resourceStats.slowResources.push({
            name: resource.name.split('/').pop(),
            loadTime: Math.round(loadTime),
            size: resource.transferSize || 0
          });
        }
        
        // Approximate total size
        resourceStats.totalSize += resource.transferSize || 0;
      });
      
      return resourceStats;
    });
  }

  async runLighthouseAudit(url, viewport = null) {
    console.log('🏮 Running Lighthouse audit...');
    
    const config = {
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      settings: {
        formFactor: viewport && viewport.width < 768 ? 'mobile' : 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        emulatedUserAgent: viewport && viewport.width < 768 ? 
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15' : 
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };
    
    try {
      const runnerResult = await lighthouse(url, { port: 9222 }, config);
      
      if (!runnerResult) {
        throw new Error('Lighthouse failed to return results');
      }
      
      const { categories, audits } = runnerResult.lhr;
      
      return {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
        metrics: {
          firstContentfulPaint: audits['first-contentful-paint'].numericValue,
          largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
          speedIndex: audits['speed-index'].numericValue,
          totalBlockingTime: audits['total-blocking-time'].numericValue,
          cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue
        }
      };
    } catch (error) {
      console.error('Lighthouse audit failed:', error.message);
      return {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        error: error.message
      };
    }
  }

  evaluateResults(performanceMetrics, lighthouseResults) {
    const { thresholds } = PERFORMANCE_CONFIG;
    
    if (lighthouseResults.error) {
      return false;
    }
    
    const checks = {
      performance: lighthouseResults.performance >= thresholds.performance,
      accessibility: lighthouseResults.accessibility >= thresholds.accessibility,
      bestPractices: lighthouseResults.bestPractices >= thresholds.bestPractices,
      seo: lighthouseResults.seo >= thresholds.seo,
      fcp: lighthouseResults.metrics.firstContentfulPaint <= thresholds.firstContentfulPaint,
      lcp: lighthouseResults.metrics.largestContentfulPaint <= thresholds.largestContentfulPaint,
      cls: lighthouseResults.metrics.cumulativeLayoutShift <= thresholds.cumulativeLayoutShift,
      tbt: lighthouseResults.metrics.totalBlockingTime <= thresholds.totalBlockingTime,
      si: lighthouseResults.metrics.speedIndex <= thresholds.speedIndex
    };
    
    return Object.values(checks).every(check => check);
  }

  printResults(result) {
    const { page, lighthouse, performanceMetrics, passed } = result;
    
    console.log(`\n📋 Results for ${page}:`);
    console.log(`${passed ? '✅' : '❌'} Overall: ${passed ? 'PASSED' : 'FAILED'}`);
    
    if (lighthouse && !lighthouse.error) {
      console.log(`📊 Lighthouse Scores:`);
      console.log(`   Performance: ${lighthouse.performance}/100`);
      console.log(`   Accessibility: ${lighthouse.accessibility}/100`);
      console.log(`   Best Practices: ${lighthouse.bestPractices}/100`);
      console.log(`   SEO: ${lighthouse.seo}/100`);
      
      console.log(`🎯 Core Web Vitals:`);
      console.log(`   FCP: ${Math.round(lighthouse.metrics.firstContentfulPaint)}ms`);
      console.log(`   LCP: ${Math.round(lighthouse.metrics.largestContentfulPaint)}ms`);
      console.log(`   CLS: ${lighthouse.metrics.cumulativeLayoutShift.toFixed(3)}`);
      console.log(`   TBT: ${Math.round(lighthouse.metrics.totalBlockingTime)}ms`);
      console.log(`   SI: ${Math.round(lighthouse.metrics.speedIndex)}ms`);
    }
    
    console.log(`⚡ Load Metrics:`);
    console.log(`   Page Load Time: ${performanceMetrics.loadTime}ms`);
    console.log(`   Resources: ${performanceMetrics.totalResources}`);
    console.log(`   Total Size: ${Math.round(performanceMetrics.totalSize / 1024)}KB`);
    
    if (performanceMetrics.slowResources && performanceMetrics.slowResources.length > 0) {
      console.log(`🐌 Slow Resources:`);
      performanceMetrics.slowResources.forEach(resource => {
        console.log(`   ${resource.name}: ${resource.loadTime}ms`);
      });
    }
  }

  async generateReport() {
    console.log('\n📄 Generating performance report...');
    
    const reportData = {
      testRun: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        thresholds: PERFORMANCE_CONFIG.thresholds
      },
      summary: {
        totalTests: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        errorRate: this.results.filter(r => r.error).length / this.results.length * 100
      },
      results: this.results
    };
    
    // Save detailed JSON report
    const reportPath = path.join(__dirname, '../reports/performance-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport(reportData);
    const htmlPath = path.join(__dirname, '../reports/performance-report.html');
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`📊 Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
    
    return reportData;
  }

  generateHtmlReport(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .results { margin-top: 30px; }
        .result-card { background: white; margin-bottom: 20px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
        .score { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .score.good { background: #d4edda; }
        .score.average { background: #fff3cd; }
        .score.poor { background: #f8d7da; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Test Report</h1>
        <p>Generated on ${new Date(data.testRun.timestamp).toLocaleString()}</p>
        <p>Test Duration: ${Math.round(data.testRun.duration / 1000)}s</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">${data.summary.totalTests}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div class="value passed">${data.summary.passed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div class="value failed">${data.summary.failed}</div>
        </div>
        <div class="metric">
            <h3>Success Rate</h3>
            <div class="value">${Math.round((data.summary.passed / data.summary.totalTests) * 100)}%</div>
        </div>
    </div>
    
    <div class="results">
        <h2>Detailed Results</h2>
        ${data.results.map(result => `
            <div class="result-card">
                <div class="result-header">
                    <h3>${result.page} (${result.viewport})</h3>
                    <span class="${result.passed ? 'passed' : 'failed'}">
                        ${result.passed ? '✅ PASSED' : '❌ FAILED'}
                    </span>
                </div>
                
                ${result.lighthouse && !result.lighthouse.error ? `
                    <div class="scores">
                        <div class="score ${result.lighthouse.performance >= 90 ? 'good' : result.lighthouse.performance >= 50 ? 'average' : 'poor'}">
                            <div>Performance</div>
                            <strong>${result.lighthouse.performance}</strong>
                        </div>
                        <div class="score ${result.lighthouse.accessibility >= 90 ? 'good' : result.lighthouse.accessibility >= 50 ? 'average' : 'poor'}">
                            <div>Accessibility</div>
                            <strong>${result.lighthouse.accessibility}</strong>
                        </div>
                        <div class="score ${result.lighthouse.bestPractices >= 90 ? 'good' : result.lighthouse.bestPractices >= 50 ? 'average' : 'poor'}">
                            <div>Best Practices</div>
                            <strong>${result.lighthouse.bestPractices}</strong>
                        </div>
                        <div class="score ${result.lighthouse.seo >= 90 ? 'good' : result.lighthouse.seo >= 50 ? 'average' : 'poor'}">
                            <div>SEO</div>
                            <strong>${result.lighthouse.seo}</strong>
                        </div>
                    </div>
                    
                    <h4>Core Web Vitals</h4>
                    <div class="scores">
                        <div class="score">
                            <div>FCP</div>
                            <strong>${Math.round(result.lighthouse.metrics.firstContentfulPaint)}ms</strong>
                        </div>
                        <div class="score">
                            <div>LCP</div>
                            <strong>${Math.round(result.lighthouse.metrics.largestContentfulPaint)}ms</strong>
                        </div>
                        <div class="score">
                            <div>CLS</div>
                            <strong>${result.lighthouse.metrics.cumulativeLayoutShift.toFixed(3)}</strong>
                        </div>
                        <div class="score">
                            <div>TBT</div>
                            <strong>${Math.round(result.lighthouse.metrics.totalBlockingTime)}ms</strong>
                        </div>
                    </div>
                ` : ''}
                
                <h4>Load Metrics</h4>
                <p>Page Load Time: ${result.performanceMetrics.loadTime}ms</p>
                <p>Total Resources: ${result.performanceMetrics.totalResources}</p>
                <p>Total Size: ${Math.round(result.performanceMetrics.totalSize / 1024)}KB</p>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  async runAllTests() {
    this.startTime = Date.now();
    
    try {
      await this.initialize();
      
      console.log('🧪 Starting comprehensive performance testing...');
      
      // Test each page on each viewport
      for (const page of PERFORMANCE_CONFIG.pages) {
        for (const viewport of PERFORMANCE_CONFIG.viewports) {
          await this.testPagePerformance(
            `${PERFORMANCE_CONFIG.baseUrl}${page.path}`,
            `${page.name} (${viewport.name})`,
            viewport
          );
        }
      }
      
      // Generate report
      const report = await this.generateReport();
      
      // Print summary
      console.log('\n🎉 Performance testing completed!');
      console.log(`📊 Summary: ${report.summary.passed}/${report.summary.totalTests} tests passed`);
      
      if (report.summary.failed > 0) {
        console.log('❌ Some tests failed. Check the detailed report for more information.');
        process.exit(1);
      } else {
        console.log('✅ All performance tests passed!');
      }
      
    } catch (error) {
      console.error('💥 Performance testing failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run performance tests if this file is executed directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { PerformanceTester, PERFORMANCE_CONFIG };