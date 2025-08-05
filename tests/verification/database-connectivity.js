const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Database connectivity test configuration
const DB_TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  
  // Tables to verify
  tables: [
    {
      name: 'portfolio_images',
      required: true,
      expectedColumns: ['id', 'title', 'description', 'image_url', 'category', 'created_at']
    }
  ],
  
  // Test data for validation
  testQueries: [
    {
      name: 'Basic Select',
      query: 'portfolio_images',
      operation: 'select',
      fields: '*',
      limit: 5
    },
    {
      name: 'Category Filter',
      query: 'portfolio_images',
      operation: 'select',
      fields: '*',
      filter: { column: 'category', value: 'wedding' },
      limit: 3
    },
    {
      name: 'Count Records',
      query: 'portfolio_images',
      operation: 'select',
      fields: 'id',
      count: true
    }
  ]
};

class DatabaseConnectivityTester {
  constructor() {
    this.supabase = null;
    this.results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      supabaseUrl: DB_TEST_CONFIG.supabaseUrl,
      overallStatus: 'UNKNOWN',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async initialize() {
    console.log('🔌 Initializing database connectivity tests...');
    
    if (!DB_TEST_CONFIG.supabaseUrl || !DB_TEST_CONFIG.supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(
      DB_TEST_CONFIG.supabaseUrl,
      DB_TEST_CONFIG.supabaseKey
    );
    
    console.log('✅ Supabase client initialized');
  }

  addResult(test, status, message, details = null) {
    const result = {
      test,
      status, // 'PASS', 'FAIL', 'WARN'
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.tests.push(result);
    this.results.summary.total++;
    
    if (status === 'PASS') {
      this.results.summary.passed++;
      console.log(`✅ ${test}: ${message}`);
    } else if (status === 'FAIL') {
      this.results.summary.failed++;
      console.log(`❌ ${test}: ${message}`);
    } else if (status === 'WARN') {
      this.results.summary.warnings++;
      console.log(`⚠️  ${test}: ${message}`);
    }
  }

  async testBasicConnection() {
    console.log('\n🔗 Testing basic database connection...');
    
    try {
      // Simple connection test
      const { data, error } = await this.supabase
        .from('portfolio_images')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        this.addResult(
          'Basic Connection',
          'FAIL',
          `Connection failed: ${error.message}`,
          { error: error.details }
        );
      } else {
        this.addResult(
          'Basic Connection',
          'PASS',
          'Successfully connected to Supabase',
          { count: data }
        );
      }
    } catch (error) {
      this.addResult(
        'Basic Connection',
        'FAIL',
        `Connection error: ${error.message}`
      );
    }
  }

  async testTableStructure() {
    console.log('\n📋 Testing table structure...');
    
    for (const table of DB_TEST_CONFIG.tables) {
      try {
        // Get a sample record to check structure
        const { data, error } = await this.supabase
          .from(table.name)
          .select('*')
          .limit(1);
        
        if (error) {
          this.addResult(
            `Table Structure - ${table.name}`,
            'FAIL',
            `Table query failed: ${error.message}`
          );
          continue;
        }
        
        if (!data || data.length === 0) {
          this.addResult(
            `Table Structure - ${table.name}`,
            'WARN',
            `Table ${table.name} exists but is empty`
          );
          continue;
        }
        
        // Check for expected columns
        const record = data[0];
        const actualColumns = Object.keys(record);
        const missingColumns = table.expectedColumns.filter(col => !actualColumns.includes(col));
        const extraColumns = actualColumns.filter(col => !table.expectedColumns.includes(col));
        
        if (missingColumns.length === 0) {
          this.addResult(
            `Table Structure - ${table.name}`,
            'PASS',
            `All expected columns present`,
            {
              expectedColumns: table.expectedColumns,
              actualColumns,
              extraColumns
            }
          );
        } else {
          this.addResult(
            `Table Structure - ${table.name}`,
            'FAIL',
            `Missing columns: ${missingColumns.join(', ')}`,
            {
              missingColumns,
              expectedColumns: table.expectedColumns,
              actualColumns
            }
          );
        }
        
      } catch (error) {
        this.addResult(
          `Table Structure - ${table.name}`,
          'FAIL',
          `Structure test failed: ${error.message}`
        );
      }
    }
  }

  async testDataTypes() {
    console.log('\n🔢 Testing data types...');
    
    try {
      const { data, error } = await this.supabase
        .from('portfolio_images')
        .select('*')
        .limit(3);
      
      if (error) {
        this.addResult(
          'Data Types',
          'FAIL',
          `Data type test failed: ${error.message}`
        );
        return;
      }
      
      if (!data || data.length === 0) {
        this.addResult(
          'Data Types',
          'WARN',
          'No data available for type checking'
        );
        return;
      }
      
      // Check data types for first record
      const record = data[0];
      const typeChecks = {
        id: 'string',
        title: 'string',
        description: ['string', 'null'],
        image_url: 'string',
        category: 'string',
        created_at: 'string'
      };
      
      let typeErrors = [];
      
      for (const [field, expectedTypes] of Object.entries(typeChecks)) {
        if (record[field] !== undefined) {
          const actualType = record[field] === null ? 'null' : typeof record[field];
          const expected = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
          
          if (!expected.includes(actualType)) {
            typeErrors.push(`${field}: expected ${expected.join(' or ')}, got ${actualType}`);
          }
        }
      }
      
      if (typeErrors.length === 0) {
        this.addResult(
          'Data Types',
          'PASS',
          'All fields have correct data types',
          { sampleRecord: record }
        );
      } else {
        this.addResult(
          'Data Types',
          'FAIL',
          `Type mismatches: ${typeErrors.join(', ')}`,
          { typeErrors, sampleRecord: record }
        );
      }
      
    } catch (error) {
      this.addResult(
        'Data Types',
        'FAIL',
        `Data type test error: ${error.message}`
      );
    }
  }

  async testQueryPerformance() {
    console.log('\n⚡ Testing query performance...');
    
    const performanceTests = [
      {
        name: 'Simple Select',
        query: () => this.supabase.from('portfolio_images').select('*').limit(10)
      },
      {
        name: 'Filtered Query',
        query: () => this.supabase.from('portfolio_images').select('*').eq('category', 'wedding').limit(5)
      },
      {
        name: 'Count Query',
        query: () => this.supabase.from('portfolio_images').select('*', { count: 'exact', head: true })
      },
      {
        name: 'Ordered Query',
        query: () => this.supabase.from('portfolio_images').select('*').order('created_at', { ascending: false }).limit(5)
      }
    ];
    
    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        const { data, error } = await test.query();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (error) {
          this.addResult(
            `Performance - ${test.name}`,
            'FAIL',
            `Query failed: ${error.message}`
          );
        } else if (duration < 1000) {
          this.addResult(
            `Performance - ${test.name}`,
            'PASS',
            `Query completed in ${duration}ms`,
            { duration, resultCount: Array.isArray(data) ? data.length : 'count query' }
          );
        } else if (duration < 3000) {
          this.addResult(
            `Performance - ${test.name}`,
            'WARN',
            `Query took ${duration}ms (slow)`,
            { duration, resultCount: Array.isArray(data) ? data.length : 'count query' }
          );
        } else {
          this.addResult(
            `Performance - ${test.name}`,
            'FAIL',
            `Query too slow: ${duration}ms`,
            { duration, resultCount: Array.isArray(data) ? data.length : 'count query' }
          );
        }
        
      } catch (error) {
        this.addResult(
          `Performance - ${test.name}`,
          'FAIL',
          `Performance test error: ${error.message}`
        );
      }
    }
  }

  async testRLSPolicies() {
    console.log('\n🔒 Testing Row Level Security policies...');
    
    try {
      // Test public read access
      const { data, error } = await this.supabase
        .from('portfolio_images')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('permission') || error.message.includes('policy')) {
          this.addResult(
            'RLS Policies',
            'FAIL',
            `RLS blocking read access: ${error.message}`,
            { error: error.details }
          );
        } else {
          this.addResult(
            'RLS Policies',
            'WARN',
            `Query failed, but not due to RLS: ${error.message}`
          );
        }
      } else {
        this.addResult(
          'RLS Policies',
          'PASS',
          'Public read access works correctly',
          { recordCount: data ? data.length : 0 }
        );
      }
      
      // Test write access (should fail for anonymous users)
      try {
        const { error: insertError } = await this.supabase
          .from('portfolio_images')
          .insert({
            title: 'TEST RECORD - DELETE ME',
            image_url: 'https://example.com/test.jpg',
            category: 'test'
          });
        
        if (insertError) {
          if (insertError.message.includes('permission') || insertError.message.includes('policy')) {
            this.addResult(
              'RLS Write Protection',
              'PASS',
              'Write access properly blocked for anonymous users'
            );
          } else {
            this.addResult(
              'RLS Write Protection',
              'WARN',
              `Insert failed for other reason: ${insertError.message}`
            );
          }
        } else {
          this.addResult(
            'RLS Write Protection',
            'FAIL',
            'Anonymous users can write to database (security risk!)'
          );
        }
      } catch (error) {
        this.addResult(
          'RLS Write Protection',
          'PASS',
          'Write access properly blocked'
        );
      }
      
    } catch (error) {
      this.addResult(
        'RLS Policies',
        'FAIL',
        `RLS test error: ${error.message}`
      );
    }
  }

  async testDataConsistency() {
    console.log('\n📊 Testing data consistency...');
    
    try {
      const { data, error } = await this.supabase
        .from('portfolio_images')
        .select('*');
      
      if (error) {
        this.addResult(
          'Data Consistency',
          'FAIL',
          `Consistency check failed: ${error.message}`
        );
        return;
      }
      
      if (!data || data.length === 0) {
        this.addResult(
          'Data Consistency',
          'WARN',
          'No data available for consistency check'
        );
        return;
      }
      
      const issues = [];
      const validCategories = ['wedding', 'corporate', 'fine-dining', 'cocktail', 'buffet', 'food-stall', 'snack-box', 'coffee-break'];
      
      data.forEach((record, index) => {
        // Check for required fields
        if (!record.id) issues.push(`Record ${index}: Missing ID`);
        if (!record.title || record.title.trim() === '') issues.push(`Record ${index}: Empty title`);
        if (!record.image_url || record.image_url.trim() === '') issues.push(`Record ${index}: Empty image URL`);
        if (!record.category) issues.push(`Record ${index}: Missing category`);
        
        // Check category validity
        if (record.category && !validCategories.includes(record.category)) {
          issues.push(`Record ${index}: Invalid category "${record.category}"`);
        }
        
        // Check URL format
        if (record.image_url && !record.image_url.match(/^https?:\/\/.+/)) {
          issues.push(`Record ${index}: Invalid image URL format`);
        }
        
        // Check for extremely long titles (potential data issues)
        if (record.title && record.title.length > 200) {
          issues.push(`Record ${index}: Title unusually long (${record.title.length} chars)`);
        }
      });
      
      if (issues.length === 0) {
        this.addResult(
          'Data Consistency',
          'PASS',
          `All ${data.length} records pass consistency checks`,
          { recordCount: data.length }
        );
      } else if (issues.length <= data.length * 0.1) { // Less than 10% issues
        this.addResult(
          'Data Consistency',
          'WARN',
          `Minor consistency issues: ${issues.length}/${data.length} records`,
          { issues: issues.slice(0, 10) } // Show first 10 issues
        );
      } else {
        this.addResult(
          'Data Consistency',
          'FAIL',
          `Major consistency issues: ${issues.length}/${data.length} records`,
          { issues: issues.slice(0, 20) } // Show first 20 issues
        );
      }
      
    } catch (error) {
      this.addResult(
        'Data Consistency',
        'FAIL',
        `Consistency test error: ${error.message}`
      );
    }
  }

  async testConnectionPooling() {
    console.log('\n🏊 Testing connection pooling...');
    
    try {
      // Create multiple concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) => 
        this.supabase
          .from('portfolio_images')
          .select('id')
          .limit(1)
      );
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const successCount = results.filter(result => !result.error).length;
      const errorCount = results.filter(result => result.error).length;
      
      if (errorCount === 0) {
        this.addResult(
          'Connection Pooling',
          'PASS',
          `All ${successCount} concurrent requests succeeded in ${duration}ms`,
          { duration, successCount, errorCount }
        );
      } else if (errorCount <= 2) {
        this.addResult(
          'Connection Pooling',
          'WARN',
          `${errorCount}/${promises.length} requests failed, may indicate pooling issues`,
          { duration, successCount, errorCount }
        );
      } else {
        this.addResult(
          'Connection Pooling',
          'FAIL',
          `${errorCount}/${promises.length} requests failed, connection pooling issues`,
          { duration, successCount, errorCount }
        );
      }
      
    } catch (error) {
      this.addResult(
        'Connection Pooling',
        'FAIL',
        `Connection pooling test error: ${error.message}`
      );
    }
  }

  async generateReport() {
    console.log('\n📄 Generating database connectivity report...');
    
    // Calculate overall status
    if (this.results.summary.failed === 0) {
      this.results.overallStatus = this.results.summary.warnings === 0 ? 'EXCELLENT' : 'GOOD';
    } else if (this.results.summary.failed <= 2) {
      this.results.overallStatus = 'WARNING';
    } else {
      this.results.overallStatus = 'CRITICAL';
    }
    
    // Save detailed JSON report
    const reportPath = path.join(__dirname, '../reports/database-connectivity-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport();
    const htmlPath = path.join(__dirname, '../reports/database-connectivity-report.html');
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`📊 Database connectivity reports saved:`);
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
    <title>Database Connectivity Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-badge { padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; }
        .status-EXCELLENT { background: #28a745; }
        .status-GOOD { background: #17a2b8; }
        .status-WARNING { background: #ffc107; color: black; }
        .status-CRITICAL { background: #dc3545; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .tests { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-item { display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee; }
        .test-item:last-child { border-bottom: none; }
        .test-status { width: 80px; text-align: center; font-weight: bold; padding: 4px 8px; border-radius: 4px; margin-right: 15px; margin-top: 2px; }
        .test-content { flex: 1; }
        .test-title { font-weight: bold; margin-bottom: 4px; }
        .test-message { color: #666; font-size: 14px; margin-bottom: 8px; }
        .test-details { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Database Connectivity Report</h1>
            <p>
                <span class="status-badge status-${results.overallStatus}">${results.overallStatus}</span>
                &nbsp;&nbsp;
                Environment: ${results.environment} | 
                Database: ${results.supabaseUrl} | 
                Generated: ${new Date(results.timestamp).toLocaleString()}
            </p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value" style="font-size: 28px; font-weight: bold;">${results.summary.total}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value" style="font-size: 28px; font-weight: bold; color: #28a745">${results.summary.passed}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value" style="font-size: 28px; font-weight: bold; color: #dc3545">${results.summary.failed}</div>
            </div>
            <div class="metric">
                <h3>Warnings</h3>
                <div class="value" style="font-size: 28px; font-weight: bold; color: #ffc107">${results.summary.warnings}</div>
            </div>
        </div>
        
        <div class="tests">
            <h2>Test Results</h2>
            ${results.tests.map(test => `
                <div class="test-item">
                    <div class="test-status" style="background: ${statusColors[test.status]}; color: ${test.status === 'WARN' ? 'black' : 'white'}">
                        ${test.status}
                    </div>
                    <div class="test-content">
                        <div class="test-title">${test.test}</div>
                        <div class="test-message">${test.message}</div>
                        ${test.details ? `<div class="test-details">${JSON.stringify(test.details, null, 2)}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  async runAllTests() {
    try {
      await this.initialize();
      
      console.log('🔍 Starting database connectivity tests...');
      
      await this.testBasicConnection();
      await this.testTableStructure();
      await this.testDataTypes();
      await this.testQueryPerformance();
      await this.testRLSPolicies();
      await this.testDataConsistency();
      await this.testConnectionPooling();
      
      const report = await this.generateReport();
      
      // Print summary
      console.log('\n🎉 Database connectivity tests completed!');
      console.log(`📊 Summary: ${report.summary.passed}/${report.summary.total} tests passed`);
      console.log(`⚠️  Warnings: ${report.summary.warnings}`);
      console.log(`❌ Failures: ${report.summary.failed}`);
      console.log(`🏥 Overall Status: ${report.overallStatus}`);
      
      // Exit with appropriate code
      if (report.overallStatus === 'CRITICAL') {
        console.log('\n💥 Critical database issues found.');
        process.exit(1);
      } else if (report.overallStatus === 'WARNING') {
        console.log('\n⚠️  Database warnings found. Please review.');
        process.exit(0);
      } else {
        console.log('\n✅ Database connectivity verified successfully!');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('💥 Database connectivity tests failed:', error);
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new DatabaseConnectivityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { DatabaseConnectivityTester, DB_TEST_CONFIG };