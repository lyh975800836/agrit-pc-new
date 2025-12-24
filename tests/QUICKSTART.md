# Quick Start Guide - Unit Tests

## What Was Created

Comprehensive unit tests for all files modified in your branch:

1. ✅ **src/services/apiClient.js** - 3 new API methods tested
2. ✅ **src/components/Dashboard/RightRankingPanel.vue** - Farming data integration tested
3. ✅ **src/components/PlotDetail/FarmerProfileCard.vue** - UI component tested

## Installation (2 minutes)

### Step 1: Install Test Dependencies

```bash
npm install --save-dev @vue/cli-plugin-unit-jest@~5.0.0 @vue/test-utils@^1.3.6 vue-jest@^3.0.7 babel-jest@^27.5.1 identity-obj-proxy@^3.0.0 jest@^27.5.1 jest-environment-jsdom@^27.5.1
```

### Step 2: Add Test Scripts

Add to your `package.json` scripts section:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 3: Run Tests

```bash
npm test
```

## What Gets Tested

### API Client (`apiClient.spec.js`)
- ✅ New `getPlotDetail()` method
- ✅ New `getFarmingList()` method  
- ✅ New `getSpicePrice()` method
- ✅ POST requests with JSON body
- ✅ Query parameter encoding
- ✅ Error handling (404, 500, network errors)
- ✅ Request cancellation with AbortSignal

**20+ test cases**

### RightRankingPanel Component (`RightRankingPanel.spec.js`)
- ✅ Component mounting and initialization
- ✅ API data loading (`loadFarmingList()`)
- ✅ Data transformation (`transformFarmingData()`)
- ✅ Date-based status calculation (`getFarmingStatus()`)
- ✅ Event emissions
- ✅ Error handling

**15+ test cases**

### FarmerProfileCard Component (`FarmerProfileCard.spec.js`)
- ✅ Props validation
- ✅ Dynamic status tags rendering
- ✅ Background and avatar images
- ✅ Font fallbacks
- ✅ Edge cases (special characters, empty data)

**15+ test cases**

## Expected Results

```bash
$ npm test

PASS  tests/unit/services/apiClient.spec.js
PASS  tests/unit/components/Dashboard/RightRankingPanel.spec.js
PASS  tests/unit/components/PlotDetail/FarmerProfileCard.spec.js

Test Suites: 3 passed, 3 total
Tests:       50+ passed, 50+ total
Snapshots:   0 total
Time:        3-5s
```

## View Coverage Report

```bash
npm run test:coverage
```

Opens `coverage/lcov-report/index.html` with detailed coverage metrics.

## Common Issues & Solutions

### ❌ "Cannot find module '@vue/test-utils'"
```bash
npm install --save-dev @vue/test-utils@^1.3.6
```

### ❌ "Cannot find module 'vue-jest'"
```bash
npm install --save-dev vue-jest@^3.0.7
```

### ❌ Tests fail with module resolution errors
- Check that `jest.config.js` exists in project root
- Verify the `moduleNameMapper` includes: `'^@/(.*)$': '<rootDir>/src/$1'`

## Test Files Location