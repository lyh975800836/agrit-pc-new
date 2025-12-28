/**
 * Infrastructure 层统一导出
 *
 * 提供:
 * - HTTP Client
 * - API 层 (Plot, Farming, Price, Map)
 *
 * 使用示例:
 * import { plotApi, httpClient } from '@/infrastructure';
 *
 * @module infrastructure
 */

// HTTP Client
export { default as httpClient } from './http/client';

// API 层
export { default as plotApi } from './api/plotApi';
export { default as farmingApi } from './api/farmingApi';
export { default as priceApi } from './api/priceApi';
export { default as mapApi } from './api/mapApi';
