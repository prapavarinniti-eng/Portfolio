# Comprehensive Test Suite for Catering Portfolio

This comprehensive test suite ensures the portfolio grid displays images correctly and functions flawlessly across all environments and use cases.

## 📋 Test Overview

### Test Categories
- **Unit Tests** - Component-level testing with mocking
- **Integration Tests** - Database and API integration
- **E2E Tests** - End-to-end user journey testing
- **Accessibility Tests** - WCAG compliance and screen reader support
- **Performance Tests** - Load times, Core Web Vitals, and stress testing
- **Visual Regression Tests** - UI consistency across browsers/devices
- **Manual Tests** - Human-driven testing scenarios
- **Verification Scripts** - Deployment and infrastructure validation

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Ensure application is running
npm run dev  # Should be available at http://localhost:3009
```

### Run All Tests
```bash
# Run the complete test suite
npm run test:all

# Or run individual test categories
npm run test              # Unit tests
npm run test:e2e         # E2E tests
npm run test:accessibility  # Accessibility tests
npm run test:performance    # Performance tests
npm verify                  # Deployment verification
```

## 📁 Test Structure

```
tests/
├── README.md                    # This file
├── setup.js                     # Jest configuration
├── unit/                        # Unit tests
│   ├── PortfolioGrid.test.tsx   # Main component tests
│   └── CategoryFilter.test.tsx  # Filter component tests
├── integration/                 # Integration tests
│   └── supabase.test.ts        # Database integration
├── e2e/                        # End-to-end tests
│   ├── global-setup.ts         # E2E setup
│   ├── portfolio.spec.ts       # Portfolio functionality
│   └── navigation.spec.ts      # Navigation and routing
├── accessibility/              # Accessibility tests
│   └── accessibility.test.tsx  # WCAG compliance
├── performance/                # Performance tests
│   ├── performance.test.js     # Lighthouse & metrics
│   └── load-test.js           # Load and stress testing
├── visual/                     # Visual regression tests
│   └── visual-regression.spec.ts
├── manual/                     # Manual testing guides
│   ├── test-checklist.md      # Comprehensive checklist
│   └── mobile-testing-guide.md # Mobile-specific testing
├── verification/               # Deployment verification
│   ├── verify-deployment.js   # Full deployment check
│   └── database-connectivity.js # Database validation
└── reports/                    # Generated test reports
    ├── coverage/               # Code coverage reports
    ├── performance-report.html # Performance results
    ├── load-test-report.html  # Load test results
    └── verification-report.html # Deployment status
```

## 🧪 Test Categories Detail

### 1. Unit Tests (`npm run test`)

**Location**: `tests/unit/`
**Framework**: Jest + React Testing Library
**Coverage**: Components, hooks, utility functions

**What's Tested**:
- PortfolioGrid component rendering
- Category filtering logic
- Modal functionality
- Error handling
- Loading states
- User interactions
- Keyboard navigation
- Image error handling

**Example**:
```bash
npm run test
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### 2. Integration Tests

**Location**: `tests/integration/`
**Framework**: Jest + Supabase client
**Coverage**: API connections, data flow

**What's Tested**:
- Supabase connection
- Data fetching functions
- Error handling
- Caching mechanisms
- Data validation
- API response formats

### 3. E2E Tests (`npm run test:e2e`)

**Location**: `tests/e2e/`
**Framework**: Playwright
**Coverage**: Complete user journeys

**What's Tested**:
- Portfolio page loading
- Image display and modal
- Category filtering
- Mobile responsiveness
- Cross-browser compatibility
- Navigation flows
- Error scenarios

**Browsers Tested**:
- Chromium (Desktop & Mobile)
- Firefox
- WebKit/Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

**Example**:
```bash
npm run test:e2e      # Run all E2E tests
npm run test:e2e:ui   # Run with UI mode
npx playwright test --project=chromium  # Specific browser
```

### 4. Accessibility Tests (`npm run test:accessibility`)

**Location**: `tests/accessibility/`
**Framework**: Jest + axe-core
**Coverage**: WCAG 2.1 AA compliance

**What's Tested**:
- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility
- ARIA labels and roles
- Focus management
- Semantic HTML structure

### 5. Performance Tests (`npm run test:performance`)

**Location**: `tests/performance/`
**Framework**: Puppeteer + Lighthouse
**Coverage**: Performance metrics and optimization

**What's Tested**:
- Core Web Vitals (FCP, LCP, CLS, TBT)
- Lighthouse scores
- Load times across devices
- Memory usage
- Network efficiency
- Image optimization

**Load Testing** (`tests/performance/load-test.js`):
- Concurrent user simulation
- Stress testing scenarios
- Performance under load
- Error rate monitoring

### 6. Visual Regression Tests

**Location**: `tests/visual/`
**Framework**: Playwright
**Coverage**: UI consistency

**What's Tested**:
- Page layouts across viewports
- Component rendering
- Loading states
- Error states
- Modal appearances
- Theme variations
- Print layouts

### 7. Manual Testing

**Location**: `tests/manual/`
**Type**: Documentation and checklists
**Coverage**: Human validation scenarios

**Includes**:
- Cross-browser compatibility checklist
- Mobile device testing guide
- Accessibility testing procedures
- User journey scenarios
- Bug reporting templates

### 8. Verification Scripts (`npm run verify`)

**Location**: `tests/verification/`
**Framework**: Puppeteer + Supabase
**Coverage**: Deployment validation

**What's Verified**:
- Environment variables
- Database connectivity
- API endpoints
- Security headers
- Performance thresholds
- Image loading
- Basic functionality

## 📊 Test Reports

All tests generate detailed reports in the `tests/reports/` directory:

### Coverage Reports
- **HTML**: `tests/reports/coverage/lcov-report/index.html`
- **JSON**: `tests/reports/coverage/coverage-final.json`

### Performance Reports
- **HTML**: `tests/reports/performance-report.html`
- **JSON**: `tests/reports/performance-report.json`

### E2E Reports
- **HTML**: `playwright-report/index.html`
- **JSON**: `test-results/results.json`

### Verification Reports
- **HTML**: `tests/reports/verification-report.html`
- **JSON**: `tests/reports/verification-report.json`

## 🎯 Testing Strategies

### Test Pyramid
1. **Unit Tests (70%)** - Fast, isolated, comprehensive
2. **Integration Tests (20%)** - API and database interactions
3. **E2E Tests (10%)** - Critical user journeys

### Browser Coverage
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome, Samsung Internet
- **Feature**: Modern browsers with ES2020+ support

### Device Coverage
- **Mobile**: 375px - 414px width
- **Tablet**: 768px - 1024px width  
- **Desktop**: 1200px+ width

### Network Conditions
- **Fast**: WiFi, 4G/LTE
- **Slow**: 3G, 2G simulation
- **Offline**: Service worker testing

## 🔧 Configuration

### Jest Configuration
Located in `package.json`:
- Environment: jsdom
- Setup files: `tests/setup.js`
- Module mapping for aliases
- Coverage thresholds (80% minimum)

### Playwright Configuration
Located in `playwright.config.ts`:
- Multiple browser projects
- Mobile device simulation
- Screenshot and video on failure
- Parallel execution

### Environment Variables
Required for testing:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🚨 Troubleshooting

### Common Issues

**1. Tests failing due to missing environment variables**
```bash
# Ensure .env.local exists with Supabase credentials
cp .env.example .env.local
# Edit with your actual values
```

**2. E2E tests timing out**
```bash
# Ensure application is running
npm run dev
# Check if http://localhost:3009 is accessible
```

**3. Performance tests failing**
```bash
# Install Puppeteer browsers
npx puppeteer browsers install
```

**4. Database connectivity issues**
```bash
# Test database connection
npm run verify
# Check Supabase dashboard for issues
```

### Debug Mode

**Unit Tests**:
```bash
npm run test -- --verbose
npm run test -- --no-cache
```

**E2E Tests**:
```bash
npx playwright test --debug
npx playwright test --headed  # See browser
```

**Performance Tests**:
```bash
DEBUG=true npm run test:performance
```

## 📈 Quality Gates

### Minimum Requirements for Production

**Code Coverage**: ≥ 80%
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**Performance Thresholds**:
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 4s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 300ms

**Accessibility**: WCAG 2.1 AA compliance
- No axe-core violations
- Keyboard navigation working
- Screen reader compatibility

**E2E Tests**: 100% pass rate
- All critical user journeys working
- Cross-browser compatibility verified
- Mobile responsiveness confirmed

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:all
      - run: npm run verify
```

### Pre-commit Hooks
```bash
# Install husky for git hooks
npx husky add .husky/pre-commit "npm run test && npm run test:accessibility"
```

## 📚 Best Practices

### Writing Tests
1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Test Behavior, Not Implementation**: Focus on user-facing functionality
3. **Use Descriptive Test Names**: Clear intent and expected outcome
4. **Mock External Dependencies**: Isolate units under test
5. **Keep Tests Fast**: Under 5ms per unit test

### Maintenance
1. **Update Snapshots**: When UI changes are intentional
2. **Review Flaky Tests**: Fix or remove unreliable tests
3. **Monitor Performance**: Set up alerts for regression
4. **Regular Dependency Updates**: Keep testing tools current

### Documentation
1. **Update Test Documentation**: When adding new test categories
2. **Document Test Data**: Explain mock data and fixtures
3. **Maintain Checklists**: Keep manual testing guides current
4. **Share Results**: Regular test reports and metrics

## 🆘 Support

### Getting Help
1. **Check Documentation**: Review test files and comments
2. **Run Diagnostics**: Use verification scripts to identify issues
3. **Debug Mode**: Run tests in verbose/debug mode
4. **Test Reports**: Check generated reports for details

### Contributing
1. **Add Tests**: For new features and bug fixes
2. **Update Documentation**: Keep testing guides current
3. **Report Issues**: Document any testing problems
4. **Optimize Performance**: Improve test speed and reliability

---

This comprehensive test suite ensures the catering portfolio application is robust, accessible, performant, and reliable across all supported platforms and use cases.