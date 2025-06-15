import { describe, it, expect } from 'vitest';
import type {
  HttpMethod,
  HttpHeaders,
  QueryParams,
  HttpError,
  HttpResponse,
  RequestInterceptor,
  ResponseInterceptor,
  Interceptors,
  RequestConfig,
  HttpClientConfig,
} from '../../src/types';

describe('HTTP Client Types', () => {
  it('should accept valid HTTP methods', () => {
    const validMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    expect(validMethods).toHaveLength(7);
    expect(validMethods.includes('GET')).toBeTruthy();
  });

  it('should allow standard HTTP headers', () => {
    const headers: HttpHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token123',
      Accept: 'application/json',
      'X-API-Key': 'api-key-123',
    };

    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Authorization).toBe('Bearer token123');
  });

  it('should allow custom headers', () => {
    const headers: HttpHeaders = {
      'X-Custom-Header': 'custom-value',
      'X-Another-Header': 'another-value',
    };

    expect(headers['X-Custom-Header']).toBe('custom-value');
    expect(headers['X-Another-Header']).toBe('another-value');
  });

  it('should allow valid query parameters', () => {
    const params: QueryParams = {
      page: 1,
      limit: 10,
      search: 'test',
      isActive: true,
      optional: undefined,
    };

    expect(params.page).toBe(1);
    expect(params.limit).toBe(10);
    expect(params.search).toBe('test');
    expect(params.isActive).toBe(true);
    expect(params.optional).toBeUndefined();
  });

  it('should have the correct structure', () => {
    const error: HttpError = {
      message: 'Not Found',
      status: 404,
      code: 'RESOURCE_NOT_FOUND',
    };

    expect(error.message).toBe('Not Found');
    expect(error.status).toBe(404);
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('should handle successful responses', () => {
    const response: HttpResponse<{ name: string }> = {
      content: { name: 'John Doe' },
      error: null,
      status: 200,
    };

    expect(response.content.name).toBe('John Doe');
    expect(response.error).toBeNull();
    expect(response.status).toBe(200);
  });

  it('should handle error responses', () => {
    const response: HttpResponse<null> = {
      content: null,
      error: {
        message: 'Server Error',
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      },
      status: 500,
    };

    expect(response.content).toBeNull();
    expect(response.error?.message).toBe('Server Error');
    expect(response.status).toBe(500);
  });

  it('should have request and response interceptors', () => {
    const requestInterceptor: RequestInterceptor = (config) => config;
    const responseInterceptor: ResponseInterceptor = (response) => response;

    const interceptors: Interceptors = {
      request: [requestInterceptor],
      response: [responseInterceptor],
    };

    expect(interceptors.request).toHaveLength(1);
    expect(interceptors.response).toHaveLength(1);
  });

  it('should have required and optional properties', () => {
    const config: RequestConfig = {
      url: '/users',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      params: { page: 1 },
      body: { name: 'John' },
      timeout: 5000,
    };

    expect(config.url).toBe('/users');
    expect(config.method).toBe('GET');
    expect(config.headers?.['Content-Type']).toBe('application/json');
    expect(config.params?.page).toBe(1);
    expect(config.body.name).toBe('John');
    expect(config.timeout).toBe(5000);
  });

  it('should configure client with all options', () => {
    const config: HttpClientConfig = {
      baseURL: 'https://api.example.com',
      headers: { 'Content-Type': 'application/json' },
      params: { version: 1 },
      timeout: 10000,
      interceptors: {
        request: [(config) => config],
        response: [(response) => response],
      },
    };

    expect(config.baseURL).toBe('https://api.example.com');
    expect(config.headers?.['Content-Type']).toBe('application/json');
    expect(config.params?.version).toBe(1);
    expect(config.timeout).toBe(10000);
    expect(config.interceptors?.request).toHaveLength(1);
    expect(config.interceptors?.response).toHaveLength(1);
  });

  it('should allow minimal configuration', () => {
    const config: HttpClientConfig = {
      baseURL: 'https://api.example.com',
    };

    expect(config.baseURL).toBe('https://api.example.com');
    expect(config.headers).toBeUndefined();
    expect(config.params).toBeUndefined();
    expect(config.timeout).toBeUndefined();
    expect(config.interceptors).toBeUndefined();
  });
});
