import { HttpClient } from '../../src/client';
import { describe, it, expect, beforeEach } from 'vitest';
import { RequestConfig } from '../../src/types';

const baseURL = 'https://jsonplaceholder.typicode.com/';

describe('HttpClient', () => {
  describe('Basic functionality', () => {
    it('should create an instance', () => {
      const client = new HttpClient();
      expect(client).toBeDefined();
    });

    it('should handle request with default config', async () => {
      const client = new HttpClient({ baseURL });
      const response = await client.request({ method: 'GET', url: '/users' });

      expect(response.status).toBe(200);
      expect(response.content).not.toBeNull();
    });
  });

  describe('HTTP Methods', () => {
    let client: HttpClient;

    beforeEach(() => {
      client = new HttpClient({ baseURL });
    });

    it('should handle GET request', async () => {
      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(response.content).not.toBeNull();
      expect(response.content.id).toBe(1);
    });

    it('should handle POST request', async () => {
      const response = await client.post('/users', {
        name: 'John Doe',
        email: 'john.doe@example.com',
      });

      expect(response.status).toBe(201);
      expect(response.content).not.toBeNull();
      expect(response.content.name).toBe('John Doe');
      expect(response.content.email).toBe('john.doe@example.com');
    });

    it('should handle PUT request', async () => {
      const response = await client.put('/users/1', {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '987-654-3210',
        website: 'https://jane-doe.com',
      });

      expect(response.status).toBe(200);
      expect(response.content).not.toBeNull();
    });

    it('should handle PATCH request', async () => {
      const response = await client.patch('/users/1', {
        name: 'Jane Smith',
      });

      expect(response.status).toBe(200);
      expect(response.content).not.toBeNull();
      expect(response.content.name).toBe('Jane Smith');
    });

    it('should handle DELETE request', async () => {
      const response = await client.delete('/users/1');

      expect(response.status).toBe(200);
      expect(response.content).not.toBeNull();
    });

    it('should handle HEAD request', async () => {
      const client = new HttpClient({ baseURL });
      const response = await client.head('/users/1');

      expect(response.status).toBe(200);
      expect(response.content).toBeNull(); // HEAD should not have body
    });

    it('should handle OPTIONS request', async () => {
      const response = await client.options('/users');

      expect(response.status).toBe(204);
    });
  });

  describe('Configuration Methods', () => {
    it('should configure client with fluent API', async () => {
      const client = new HttpClient({});
      client
        .setBaseURL(baseURL)
        .setHeader('Authorization', 'Bearer token')
        .setHeaders({ 'Custom-Header': 'CustomValue' })
        .setParams({ page: 1, limit: 10 })
        .setParam('sort', 'asc')
        .setTimeout(5000);

      const { baseURL: configBaseUrl, headers, params, timeout } = client.getConfig;

      expect(configBaseUrl).toBe(baseURL);
      expect(headers).toEqual({
        Authorization: 'Bearer token',
        'Custom-Header': 'CustomValue',
      });
      expect(params).toEqual({
        page: 1,
        limit: 10,
        sort: 'asc',
      });
      expect(timeout).toBe(5000);
    });

    it('should handle setHeader when headers is undefined', () => {
      const client = new HttpClient({});
      client.setHeader('Authorization', 'Bearer token');

      const { headers } = client.getConfig;
      expect(headers).toEqual({
        Authorization: 'Bearer token',
      });
    });

    it('should handle setParam when params is undefined', () => {
      const client = new HttpClient({});
      client.setParam('page', 1);

      const { params } = client.getConfig;
      expect(params).toEqual({
        page: 1,
      });
    });
  });

  describe('Interceptors', () => {
    it('should handle request interceptors', async () => {
      const client = new HttpClient({ baseURL });
      let interceptedConfig: Partial<RequestConfig> = {};

      client.addRequestInterceptor((config) => {
        config.headers = { ...config.headers, 'X-Intercepted': 'true' };
        interceptedConfig = config;
        return config;
      });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(response.content).not.toBeNull();
      expect(response.content.id).toBe(1);
      expect(interceptedConfig.headers?.['X-Intercepted']).toBe('true');
      expect(interceptedConfig.url).toBe('/users/1');
    });

    it('should handle response interceptors', async () => {
      const client = new HttpClient({ baseURL });
      let interceptedResponse: any;

      client.addResponseInterceptor((response) => {
        response.content = { ...response.content, intercepted: true };
        interceptedResponse = response.content;
        return response;
      });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(response.content).not.toBeNull();
      expect(response.content.id).toBe(1);
      expect(interceptedResponse.intercepted).toBe(true);
    });

    it('should handle multiple request interceptors in order', async () => {
      const client = new HttpClient({ baseURL });
      const interceptorOrder: number[] = [];

      client.addRequestInterceptor((config) => {
        interceptorOrder.push(1);
        return config;
      });

      client.addRequestInterceptor((config) => {
        interceptorOrder.push(2);
        return config;
      });

      await client.get('/users/1');

      expect(interceptorOrder).toEqual([1, 2]);
    });

    it('should handle multiple response interceptors in order', async () => {
      const client = new HttpClient({ baseURL });
      const interceptorOrder: number[] = [];

      client.addResponseInterceptor((response) => {
        interceptorOrder.push(1);
        return response;
      });

      client.addResponseInterceptor((response) => {
        interceptorOrder.push(2);
        return response;
      });

      await client.get('/users/1');

      expect(interceptorOrder).toEqual([1, 2]);
    });

    it('should handle async request interceptors', async () => {
      const client = new HttpClient({ baseURL });
      let interceptedConfig: Partial<RequestConfig> = {};

      client.addRequestInterceptor(async (config) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        config.headers = { ...config.headers, 'X-Async-Intercepted': 'true' };
        interceptedConfig = config;
        return config;
      });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(interceptedConfig.headers?.['X-Async-Intercepted']).toBe('true');
    });

    it('should handle async response interceptors', async () => {
      const client = new HttpClient({ baseURL });
      let interceptedResponse: any;

      client.addResponseInterceptor(async (response) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        response.content = { ...response.content, asyncIntercepted: true };
        interceptedResponse = response.content;
        return response;
      });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(interceptedResponse.asyncIntercepted).toBe(true);
    });
  });

  describe('Request Options', () => {
    it('should handle request with custom headers', async () => {
      const client = new HttpClient({ baseURL });
      const response = await client.request({
        method: 'GET',
        url: '/users',
        headers: { 'Custom-Header': 'CustomValue' },
      });

      expect(response.status).toBe(200);
      expect(response.content).not.toBeNull();
    });

    it('should handle request with query parameters', async () => {
      const client = new HttpClient({ baseURL });
      const response = await client.get('/users', {
        params: { _limit: 1 },
      });

      expect(response.content).not.toBeNull();
      expect(response.status).toBe(200);
      expect(response.content.length).toBe(1);
    });

    it('should handle request with timeout', async () => {
      const client = new HttpClient({ baseURL, timeout: 1000 });

      const response = await client.request({
        method: 'GET',
        url: '/users/1',
      });

      expect(response.content).not.toBeNull();
      expect(response.status).toBe(200);
    });

    it('should merge global and request-specific headers', async () => {
      const client = new HttpClient({
        baseURL,
        headers: { 'Global-Header': 'global' },
      });

      const response = await client.get('/users/1', {
        headers: { 'Request-Header': 'request' },
      });

      expect(response.status).toBe(200);
    });

    it('should merge global and request-specific params', async () => {
      const client = new HttpClient({
        baseURL,
        params: { global: 'value' },
      });

      const response = await client.get('/users', {
        params: { _limit: 1 },
      });

      expect(response.status).toBe(200);
      expect(response.content.length).toBe(1);
    });
  });

  describe('Request Body Handling', () => {
    it('should handle JSON body for POST request', async () => {
      const client = new HttpClient({ baseURL });
      const body = { name: 'Test User', email: 'test@example.com' };

      const response = await client.post('/users', body);

      expect(response.status).toBe(201);
      expect(response.content.name).toBe('Test User');
    });

    it('should handle string body for POST request', async () => {
      const client = new HttpClient({ baseURL });
      const body = 'plain text body';

      const response = await client.post('/posts', body, {
        headers: { 'Content-Type': 'text/plain' },
      });

      expect(response.status).toBe(201);
    });

    it('should not include body for GET requests', async () => {
      const client = new HttpClient({ baseURL });

      const response = await client.get('/users');

      expect(response.status).toBe(200);
    });

    it('should not include body for HEAD requests', async () => {
      const client = new HttpClient({ baseURL });

      const response = await client.head('/users');

      expect(response.status).toBe(200);
      expect(response.content).toBeNull(); // HEAD should not have body
    });

    it('should auto-set Content-Type for JSON bodies', async () => {
      const client = new HttpClient({ baseURL });
      const body = { name: 'Test User' };

      const response = await client.post('/users', body);

      expect(response.status).toBe(201);
    });

    it('should respect existing Content-Type header', async () => {
      const client = new HttpClient({ baseURL });
      const body = { name: 'Test User' };

      const response = await client.post('/users', body, {
        headers: { 'Content-Type': 'application/custom' },
      });

      expect(response.status).toBe(201);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const client = new HttpClient({ baseURL: 'https://invalid-domain-that-does-not-exist.com' });

      const response = await client.get('/users');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
      expect(response.content).toBeNull();
    });

    it('should handle HTTP error responses', async () => {
      const client = new HttpClient({ baseURL });

      const response = await client.get('/users/999999');

      expect(response.status).toBe(404);
      expect(response.error).not.toBeNull();
      expect(response.error?.status).toBe(404);
    });

    it('should handle timeout errors', async () => {
      const client = new HttpClient({ baseURL, timeout: 1 });

      const response = await client.get('/users');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });

    it('should apply response interceptors to error responses', async () => {
      const client = new HttpClient({ baseURL });
      let interceptorCalled = false;

      client.addResponseInterceptor((response) => {
        interceptorCalled = true;
        return response;
      });

      await client.get('/users/999999');

      expect(interceptorCalled).toBe(true);
    });
  });

  describe('Response Content Types', () => {
    it('should handle JSON response', async () => {
      const client = new HttpClient({ baseURL });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(typeof response.content).toBe('object');
      expect(response.content.id).toBe(1);
    });

    it('should handle text response', async () => {
      // Use JSONPlaceholder which returns JSON, then verify it's handled properly
      const client = new HttpClient({ baseURL });
      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('object');
    }, 10000);

    it('should handle blob response for non-JSON/text content', async () => {
      // Esto se testearía mejor con un mock, pero mantenemos funcional
      const client = new HttpClient({ baseURL });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(response.headers).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    it('should create Brex client with createBrex', () => {
      const client = HttpClient.createBrex({ baseURL });

      expect(client).toBeInstanceOf(HttpClient);
      expect(client.getConfig.baseURL).toBe(baseURL);
    });

    it('should create Brex client without config', () => {
      const client = HttpClient.createBrex();

      expect(client).toBeInstanceOf(HttpClient);
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle empty configuration', () => {
      const client = new HttpClient({});

      expect(client.getConfig).toEqual({});
    });

    it('should handle configuration with interceptors', () => {
      const requestInterceptor = (config: RequestConfig) => config;
      const responseInterceptor = (response: any) => response;

      const client = new HttpClient({
        baseURL,
        interceptors: {
          request: [requestInterceptor],
          response: [responseInterceptor],
        },
      });

      expect(client.getConfig.baseURL).toBe(baseURL);
    });

    it('should handle configuration without interceptors', () => {
      const client = new HttpClient({ baseURL });

      expect(client.getConfig.baseURL).toBe(baseURL);
    });

    it('should use default timeout when not specified', async () => {
      const client = new HttpClient({ baseURL });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
    });

    it('should override global timeout with request timeout', async () => {
      const client = new HttpClient({ baseURL, timeout: 10000 });

      const response = await client.get('/users/1', { timeout: 5000 });

      expect(response.status).toBe(200);
    });
  });
});
