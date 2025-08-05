const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Load testing configuration
const LOAD_TEST_CONFIG = {
  baseUrl: 'http://localhost:3009',
  pages: [
    { path: '/portfolio', name: 'Portfolio' },
    { path: '/', name: 'Home' }
  ],
  scenarios: [
    {
      name: 'Light Load',
      concurrentUsers: 5,
      duration: 30000, // 30 seconds
      requestsPerSecond: 2
    },
    {
      name: 'Medium Load',
      concurrentUsers: 10,
      duration: 60000, // 1 minute
      requestsPerSecond: 5
    },
    {
      name: 'Heavy Load',
      concurrentUsers: 20,
      duration: 120000, // 2 minutes
      requestsPerSecond: 10
    }
  ],
  thresholds: {
    averageResponseTime: 2000, // ms
    maxResponseTime: 5000, // ms
    errorRate: 5, // %
    throughput: 1 // requests per second minimum
  }
};

class LoadTester {
  constructor() {
    this.browser = null;
    this.results = [];
    this.activeRequests = new Map();
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing load testing...');
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
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

  async simulateUser(userId, scenario, page) {
    const startTime = Date.now();
    let requests = 0;
    let errors = 0;
    const userStats = {
      userId,
      requests: 0,
      errors: 0,
      averageResponseTime: 0,
      responseTimes: []
    };

    console.log(`👤 User ${userId} started (${scenario.name})`);

    try {
      const browserPage = await this.browser.newPage();
      
      // Set reasonable timeouts
      browserPage.setDefaultTimeout(10000);
      browserPage.setDefaultNavigationTimeout(15000);

      // Simulate user behavior for the duration
      const endTime = startTime + scenario.duration;
      
      while (Date.now() < endTime) {
        try {
          const requestStart = Date.now();
          
          // Navigate to the page
          const response = await browserPage.goto(`${LOAD_TEST_CONFIG.baseUrl}${page.path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
          });
          
          const requestEnd = Date.now();
          const responseTime = requestEnd - requestStart;
          
          // Record statistics
          requests++;
          userStats.requests++;
          userStats.responseTimes.push(responseTime);
          this.stats.totalRequests++;
          this.stats.responseTimes.push(responseTime);
          
          if (response && response.ok()) {
            this.stats.successfulRequests++;
          } else {
            this.stats.failedRequests++;
            errors++;
            userStats.errors++;
            this.stats.errors.push({
              userId,
              url: `${LOAD_TEST_CONFIG.baseUrl}${page.path}`,
              status: response ? response.status() : 0,
              time: new Date().toISOString()
            });
          }

          // Wait before next request based on requests per second
          const waitTime = Math.max(0, (1000 / scenario.requestsPerSecond) - responseTime);
          if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }

          // Random think time (simulate user reading/interacting)
          const thinkTime = Math.random() * 2000 + 500; // 0.5-2.5 seconds
          await new Promise(resolve => setTimeout(resolve, thinkTime));

        } catch (error) {
          errors++;
          userStats.errors++;
          this.stats.failedRequests++;
          this.stats.totalRequests++;
          this.stats.errors.push({
            userId,
            url: `${LOAD_TEST_CONFIG.baseUrl}${page.path}`,
            error: error.message,
            time: new Date().toISOString()
          });
        }
      }

      await browserPage.close();
      
    } catch (error) {
      console.error(`❌ User ${userId} encountered fatal error:`, error.message);
    }

    // Calculate user statistics
    if (userStats.responseTimes.length > 0) {
      userStats.averageResponseTime = userStats.responseTimes.reduce((sum, time) => sum + time, 0) / userStats.responseTimes.length;
    }

    const duration = Date.now() - startTime;
    console.log(`👤 User ${userId} completed: ${requests} requests, ${errors} errors in ${Math.round(duration/1000)}s`);
    
    return userStats;
  }

  async runLoadTest(scenario, page) {
    console.log(`\n🧪 Starting load test: ${scenario.name} on ${page.name}`);
    console.log(`👥 Users: ${scenario.concurrentUsers}, Duration: ${scenario.duration/1000}s, RPS: ${scenario.requestsPerSecond}`);
    
    const testStart = Date.now();
    
    // Reset statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };

    // Create concurrent users
    const userPromises = [];
    for (let i = 1; i <= scenario.concurrentUsers; i++) {
      userPromises.push(this.simulateUser(i, scenario, page));
    }

    // Wait for all users to complete
    const userResults = await Promise.all(userPromises);
    
    const testEnd = Date.now();
    const totalDuration = testEnd - testStart;

    // Calculate test statistics
    const testResults = this.calculateTestResults(scenario, page, userResults, totalDuration);
    
    this.results.push(testResults);
    this.printTestResults(testResults);
    
    return testResults;
  }

  calculateTestResults(scenario, page, userResults, duration) {
    const { stats } = this;
    
    // Calculate response time statistics
    const sortedResponseTimes = stats.responseTimes.sort((a, b) => a - b);
    const responseTimeStats = {
      min: sortedResponseTimes[0] || 0,
      max: sortedResponseTimes[sortedResponseTimes.length - 1] || 0,
      average: stats.responseTimes.length > 0 ? 
        stats.responseTimes.reduce((sum, time) => sum + time, 0) / stats.responseTimes.length : 0,
      median: sortedResponseTimes[Math.floor(sortedResponseTimes.length / 2)] || 0,
      p95: sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0,
      p99: sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0
    };

    // Calculate throughput
    const throughput = stats.totalRequests / (duration / 1000); // requests per second
    
    // Calculate error rate
    const errorRate = stats.totalRequests > 0 ? 
      (stats.failedRequests / stats.totalRequests) * 100 : 0;

    // Evaluate against thresholds
    const thresholds = LOAD_TEST_CONFIG.thresholds;
    const passed = {
      averageResponseTime: responseTimeStats.average <= thresholds.averageResponseTime,
      maxResponseTime: responseTimeStats.max <= thresholds.maxResponseTime,
      errorRate: errorRate <= thresholds.errorRate,
      throughput: throughput >= thresholds.throughput
    };

    const overallPassed = Object.values(passed).every(p => p);

    return {
      scenario: scenario.name,
      page: page.name,
      timestamp: new Date().toISOString(),
      duration: Math.round(duration / 1000),
      concurrentUsers: scenario.concurrentUsers,
      totalRequests: stats.totalRequests,
      successfulRequests: stats.successfulRequests,
      failedRequests: stats.failedRequests,
      throughput: Math.round(throughput * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      responseTime: {
        ...responseTimeStats,
        min: Math.round(responseTimeStats.min),
        max: Math.round(responseTimeStats.max),
        average: Math.round(responseTimeStats.average),
        median: Math.round(responseTimeStats.median),
        p95: Math.round(responseTimeStats.p95),
        p99: Math.round(responseTimeStats.p99)
      },
      userResults,
      errors: stats.errors,
      thresholds: passed,
      passed: overallPassed
    };
  }

  printTestResults(results) {
    const { scenario, page, throughput, errorRate, responseTime, passed } = results;
    
    console.log(`\n📊 Results for ${scenario} - ${page}:`);
    console.log(`${passed ? '✅' : '❌'} Overall: ${passed ? 'PASSED' : 'FAILED'}`);
    
    console.log(`📈 Performance Metrics:`);
    console.log(`   Throughput: ${throughput} req/s`);
    console.log(`   Error Rate: ${errorRate}%`);
    console.log(`   Total Requests: ${results.totalRequests}`);
    console.log(`   Successful: ${results.successfulRequests}`);
    console.log(`   Failed: ${results.failedRequests}`);
    
    console.log(`⏱️  Response Times:`);
    console.log(`   Average: ${responseTime.average}ms`);
    console.log(`   Median: ${responseTime.median}ms`);
    console.log(`   Min: ${responseTime.min}ms`);
    console.log(`   Max: ${responseTime.max}ms`);
    console.log(`   95th percentile: ${responseTime.p95}ms`);
    console.log(`   99th percentile: ${responseTime.p99}ms`);
    
    console.log(`🎯 Threshold Results:`);
    console.log(`   Average Response Time: ${results.thresholds.averageResponseTime ? '✅' : '❌'} (${responseTime.average}ms ≤ ${LOAD_TEST_CONFIG.thresholds.averageResponseTime}ms)`);
    console.log(`   Max Response Time: ${results.thresholds.maxResponseTime ? '✅' : '❌'} (${responseTime.max}ms ≤ ${LOAD_TEST_CONFIG.thresholds.maxResponseTime}ms)`);
    console.log(`   Error Rate: ${results.thresholds.errorRate ? '✅' : '❌'} (${errorRate}% ≤ ${LOAD_TEST_CONFIG.thresholds.errorRate}%)`);
    console.log(`   Throughput: ${results.thresholds.throughput ? '✅' : '❌'} (${throughput} req/s ≥ ${LOAD_TEST_CONFIG.thresholds.throughput} req/s)`);

    if (results.errors.length > 0) {
      console.log(`\n🚨 Recent Errors (showing first 5):`);
      results.errors.slice(0, 5).forEach((error, index) => {
        console.log(`   ${index + 1}. User ${error.userId}: ${error.error || `HTTP ${error.status}`}`);
      });
    }
  }

  async generateLoadTestReport() {
    console.log('\n📄 Generating load test report...');
    
    const reportData = {
      testRun: {
        timestamp: new Date().toISOString(),
        configuration: LOAD_TEST_CONFIG,
        summary: {
          totalScenarios: this.results.length,
          passedScenarios: this.results.filter(r => r.passed).length,
          failedScenarios: this.results.filter(r => !r.passed).length
        }
      },
      results: this.results
    };
    
    // Save detailed JSON report
    const reportPath = path.join(__dirname, '../reports/load-test-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateLoadTestHtmlReport(reportData);
    const htmlPath = path.join(__dirname, '../reports/load-test-report.html');
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`📊 Load test reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
    
    return reportData;
  }

  generateLoadTestHtmlReport(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; }
        .metric .value { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        .results { display: grid; gap: 20px; }
        .result-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .metric-small { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; }
        .metric-small .label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .metric-small .value { font-size: 18px; font-weight: bold; }
        .threshold-check { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .threshold-check.pass { color: #28a745; }
        .threshold-check.fail { color: #dc3545; }
        .error-list { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 15px; }
        .error-item { margin-bottom: 8px; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Load Test Report</h1>
            <p>Generated on ${new Date(data.testRun.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Scenarios</h3>
                <div class="value">${data.testRun.summary.totalScenarios}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value passed">${data.testRun.summary.passedScenarios}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value failed">${data.testRun.summary.failedScenarios}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value">${Math.round((data.testRun.summary.passedScenarios / data.testRun.summary.totalScenarios) * 100)}%</div>
            </div>
        </div>
        
        <div class="results">
            ${data.results.map(result => `
                <div class="result-card">
                    <div class="result-header">
                        <div>
                            <h3>${result.scenario} - ${result.page}</h3>
                            <p>${result.concurrentUsers} concurrent users for ${result.duration}s</p>
                        </div>
                        <span class="${result.passed ? 'passed' : 'failed'}">
                            ${result.passed ? '✅ PASSED' : '❌ FAILED'}
                        </span>
                    </div>
                    
                    <div class="metrics-grid">
                        <div class="metric-small">
                            <div class="label">Throughput</div>
                            <div class="value">${result.throughput} req/s</div>
                        </div>
                        <div class="metric-small">
                            <div class="label">Error Rate</div>
                            <div class="value">${result.errorRate}%</div>
                        </div>
                        <div class="metric-small">
                            <div class="label">Avg Response</div>
                            <div class="value">${result.responseTime.average}ms</div>
                        </div>
                        <div class="metric-small">
                            <div class="label">95th Percentile</div>
                            <div class="value">${result.responseTime.p95}ms</div>
                        </div>
                        <div class="metric-small">
                            <div class="label">Max Response</div>
                            <div class="value">${result.responseTime.max}ms</div>
                        </div>
                        <div class="metric-small">
                            <div class="label">Total Requests</div>
                            <div class="value">${result.totalRequests}</div>
                        </div>
                    </div>
                    
                    <h4>Threshold Validation</h4>
                    <div class="threshold-check ${result.thresholds.averageResponseTime ? 'pass' : 'fail'}">
                        <span>${result.thresholds.averageResponseTime ? '✅' : '❌'}</span>
                        <span>Average Response Time: ${result.responseTime.average}ms ≤ ${data.testRun.configuration.thresholds.averageResponseTime}ms</span>
                    </div>
                    <div class="threshold-check ${result.thresholds.maxResponseTime ? 'pass' : 'fail'}">
                        <span>${result.thresholds.maxResponseTime ? '✅' : '❌'}</span>
                        <span>Max Response Time: ${result.responseTime.max}ms ≤ ${data.testRun.configuration.thresholds.maxResponseTime}ms</span>
                    </div>
                    <div class="threshold-check ${result.thresholds.errorRate ? 'pass' : 'fail'}">
                        <span>${result.thresholds.errorRate ? '✅' : '❌'}</span>
                        <span>Error Rate: ${result.errorRate}% ≤ ${data.testRun.configuration.thresholds.errorRate}%</span>
                    </div>
                    <div class="threshold-check ${result.thresholds.throughput ? 'pass' : 'fail'}">
                        <span>${result.thresholds.throughput ? '✅' : '❌'}</span>
                        <span>Throughput: ${result.throughput} req/s ≥ ${data.testRun.configuration.thresholds.throughput} req/s</span>
                    </div>
                    
                    ${result.errors.length > 0 ? `
                        <h4>Errors (showing first 10)</h4>
                        <div class="error-list">
                            ${result.errors.slice(0, 10).map(error => `
                                <div class="error-item">
                                    User ${error.userId}: ${error.error || `HTTP ${error.status}`} at ${new Date(error.time).toLocaleTimeString()}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  async runAllLoadTests() {
    try {
      await this.initialize();
      
      console.log('🧪 Starting comprehensive load testing...');
      
      // Run all scenarios on all pages
      for (const scenario of LOAD_TEST_CONFIG.scenarios) {
        for (const page of LOAD_TEST_CONFIG.pages) {
          await this.runLoadTest(scenario, page);
          
          // Wait between tests to let system recover
          console.log('⏳ Waiting 10 seconds before next test...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
      
      // Generate report
      const report = await this.generateLoadTestReport();
      
      // Print final summary
      console.log('\n🎉 Load testing completed!');
      console.log(`📊 Summary: ${report.testRun.summary.passedScenarios}/${report.testRun.summary.totalScenarios} scenarios passed`);
      
      if (report.testRun.summary.failedScenarios > 0) {
        console.log('❌ Some load tests failed. Check the detailed report for more information.');
        process.exit(1);
      } else {
        console.log('✅ All load tests passed!');
      }
      
    } catch (error) {
      console.error('💥 Load testing failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run load tests if this file is executed directly
if (require.main === module) {
  const tester = new LoadTester();
  tester.runAllLoadTests().catch(console.error);
}

module.exports = { LoadTester, LOAD_TEST_CONFIG };