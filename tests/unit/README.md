# Unit Tests for Agrit PC Application

This directory contains comprehensive unit tests for the modified files in the current branch.

## Test Coverage

The following files have been tested:

1. **src/services/apiClient.js** - API client service tests
   - All new API methods (getPlotDetail, getFarmingList, getSpicePrice)
   - Request handling with query parameters
   - POST requests with body
   - Error handling scenarios
   - AbortSignal support

2. **src/components/Dashboard/RightRankingPanel.vue** - Component tests
   - Farming list loading from API
   - Data transformation logic
   - Status calculation based on dates
   - Event emissions

3. **src/components/PlotDetail/FarmerProfileCard.vue** - Component tests  
   - Props validation
   - Dynamic status tags rendering
   - Font family fallbacks

4. **src/views/PlotDetail.vue** - View component tests
   - Complex computed properties
   - API data integration
   - Calendar data extraction
   - Factory and farmer status logic

## Running Tests

```bash
# Install dependencies first
npm install --save-dev @vue/cli-plugin-unit-jest @vue/test-utils vue-jest babel-jest identity-obj-proxy jest jest-environment-jsdom

# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure