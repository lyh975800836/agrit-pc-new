import apiClient from '@/services/apiClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('apiClient', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('request()', () => {
    it('should make a successful GET request with query parameters', async () => {
      const mockResponse = { code: 0, data: { test: 'data' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.request('/api/test', {
        query: { param1: 'value1', param2: 'value2' }
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/test?param1=value1&param2=value2',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make a successful POST request with body', async () => {
      const mockResponse = { code: 0, data: { id: 123 } };
      const requestBody = { name: 'test', value: 42 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.request('/api/create', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/create',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle request with AbortSignal', async () => {
      const controller = new AbortController();
      const mockResponse = { code: 0, data: {} };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await apiClient.request('/api/test', {
        signal: controller.signal
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({ signal: controller.signal })
      );
    });

    it('should throw error for non-OK HTTP status', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(apiClient.request('/api/notfound')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.request('/api/test')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getPlotDetail()', () => {
    it('should fetch plot detail with plotId', async () => {
      const plotId = '12345';
      const mockResponse = {
        code: 0,
        data: {
          id: plotId,
          name: 'Test Plot',
          config_data: {}
        }
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.getPlotDetail(plotId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/p/detail'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`id=${plotId}`),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFarmingList()', () => {
    it('should fetch farming list with type "standard"', async () => {
      const mockResponse = {
        code: 0,
        data: { list: [] }
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.getFarmingList('standard');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/farming/list'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('type=standard'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch farming list with type "warning"', async () => {
      const mockResponse = { code: 0, data: { list: [] } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await apiClient.getFarmingList('warning');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('type=warning'),
        expect.any(Object)
      );
    });
  });

  describe('getSpicePrice()', () => {
    it('should fetch spice price with default pagination', async () => {
      const mockResponse = {
        code: 0,
        data: {
          list: [{ price: 10.5, date: '2024-01-01' }]
        }
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.getSpicePrice();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/spice-price/list'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch spice price with custom pagination', async () => {
      const mockResponse = { code: 0, data: { list: [] } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await apiClient.getSpicePrice(2, 20);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('pageNum=2'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('pageSize=20'),
        expect.any(Object)
      );
    });
  });
});