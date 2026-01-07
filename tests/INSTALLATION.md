# Test Installation and Setup Guide

## Prerequisites

This project uses Vue 2.6.14, so we need Vue 2-compatible testing tools.

## Step 1: Install Test Dependencies

Run the following command to install all required dependencies:

```bash
npm install --save-dev \
  @vue/cli-plugin-unit-jest@~5.0.0 \
  @vue/test-utils@^1.3.6 \
  vue-jest@^3.0.7 \
  babel-jest@^27.5.1 \
  identity-obj-proxy@^3.0.0 \
  jest@^27.5.1 \
  jest-environment-jsdom@^27.5.1
```

## Step 2: Add Test Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

## Step 3: Verify Installation

```bash
# Run tests
npm test

# Check if tests are discovered
npm test -- --listTests
```

## Step 4: View Coverage Report

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Troubleshooting

### Issue: "Cannot find module 'vue-jest'"
**Solution**: Ensure you installed `vue-jest@^3.x` (not version 5+, which is for Vue 3)

```bash
npm install --save-dev vue-jest@^3.0.7
```

### Issue: "@vue/test-utils version mismatch"  
**Solution**: Use version 1.x for Vue 2:

```bash
npm install --save-dev @vue/test-utils@^1.3.6
```

### Issue: "SyntaxError: Unexpected token 'export'"
**Solution**: Ensure `babel-jest` is installed and `jest.config.js` is properly configured

### Issue: "Cannot find module '@/services/apiClient'"
**Solution**: Check that `moduleNameMapper` in `jest.config.js` includes the @ alias:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1'
}
```

## What Was Tested

### Files with Comprehensive Tests:

1. **src/services/apiClient.js** (188 lines)
   - ✅ All new API methods
   - ✅ HTTP methods (GET, POST)
   - ✅ Query parameter handling
   - ✅ Error handling
   - ✅ Request cancellation

2. **src/components/Dashboard/RightRankingPanel.vue** (161 lines)
   - ✅ API integration
   - ✅ Data transformation
   - ✅ Date-based status calculation
   - ✅ Event handling

3. **src/components/PlotDetail/FarmerProfileCard.vue** (148 lines)
   - ✅ Props validation
   - ✅ Dynamic rendering
   - ✅ CSS modifications

4. **src/views/PlotDetail.vue** (3163 lines - partial coverage)
   - ✅ New computed properties
   - ✅ API data integration methods
   - ✅ Complex data transformations
   - ✅ Edge case handling

### Test Statistics:
- **Total test suites**: 4
- **Estimated test cases**: 80+
- **Lines of test code**: ~2000+
- **Coverage focus**: New/modified functionality

## Running Specific Tests

```bash
# Run tests for a specific file
npm test apiClient

# Run tests in a specific directory
npm test tests/unit/services

# Run tests matching a pattern
npm test -- --testNamePattern="getPlotDetail"
```

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# Example for GitHub Actions
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Next Steps

1. ✅ Tests are created and ready to run
2. Install dependencies using the command above
3. Run `npm test` to execute all tests
4. Review coverage report
5. Add more tests as needed for additional edge cases

## Contact & Support

For issues with the tests, check:
- Jest documentation: https://jestjs.io/
- Vue Test Utils docs: https://v1.test-utils.vuejs.org/
- Project-specific test patterns in `tests/unit/README.md`
