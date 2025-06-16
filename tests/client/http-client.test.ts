import { HttpClient } from '../../src/client';
import { describe, it, expect } from 'vitest';
import { RequestConfig } from '../../src/types';

const baseURL = 'https://jsonplaceholder.typicode.com/';

describe('HttpClient', () => {
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

  it('should handle GET request', async () => {
    const client = new HttpClient({ baseURL });
    const response = await client.get('/users/1');

    expect(response.status).toBe(200);
    expect(response.content).not.toBeNull();
    expect(response.content.id).toBe(1);
  });

  it('should handle POST request', async () => {
    const client = new HttpClient({ baseURL });
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
    const client = new HttpClient({ baseURL });
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
    const client = new HttpClient({ baseURL });
    const response = await client.patch('/users/1', {
      name: 'Jane Smith',
    });

    expect(response.status).toBe(200);
    expect(response.content).not.toBeNull();
    expect(response.content.name).toBe('Jane Smith');
  });

  it('should handle DELETE request', async () => {
    const client = new HttpClient({ baseURL });
    const response = await client.delete('/users/1');

    expect(response.status).toBe(200);
    expect(response.content).not.toBeNull();
  });

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

  it('should handle request with interceptors', async () => {
    const client = new HttpClient({ baseURL });
    let _config: Partial<RequestConfig> = {};

    client.addRequestInterceptor((config) => {
      config.headers = { ...config.headers, 'X-Intercepted': 'true' };
      _config = config;
      return config;
    });

    const response = await client.get('/users/1');

    expect(response.status).toBe(200);
    expect(response.content).not.toBeNull();
    expect(response.content.id).toBe(1);
    expect(_config.headers?.['X-Intercepted']).toBe('true');
    expect(_config.url).toBe('/users/1');
  });

  it('should handle response interceptors', async () => {
    const client = new HttpClient({ baseURL });
    let _response;

    client.addResponseInterceptor((response) => {
      response.content = { ...response.content, intercepted: true };
      _response = response.content;
      return response;
    });

    const response = await client.get('/users/1');

    expect(response.status).toBe(200);
    expect(response.content).not.toBeNull();
    expect(response.content.id).toBe(1);
    expect(_response.intercepted).toBe(true);
  });

  it('should handle request with timeout', async () => {
    const client = new HttpClient({ baseURL, timeout: 1000 });

    const response = await client.request({
      method: 'GET',
      url: '/users/1',
    });

    expect(response.status).toBe(200);
    expect(response.content).not.toBeNull();
  });

  it('should validate config', async () => {
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
});
