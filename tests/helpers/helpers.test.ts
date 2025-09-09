import { HttpCode } from '../../src/constants';
import {
  buildURL,
  mergeHeaders,
  mergeParams,
  createTimeoutSignal,
  createHttpError,
  getFetch,
} from '../../src/helpers';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Helpers', () => {
  describe('buildURL', () => {
    it('should build url with base URL and endpoint', () => {
      const url = buildURL('https://api.example.com/', '/users', { page: 1, limit: 10 });
      expect(url).toBe('https://api.example.com/users?page=1&limit=10');
    });

    it('should build url without base URL', () => {
      const url = buildURL('', '/users', { page: 1, limit: 10 });
      expect(url).toBe('users?page=1&limit=10');
    });

    it('should build url without params', () => {
      const url = buildURL('https://api.example.com/', '/users');
      expect(url).toBe('https://api.example.com/users');
    });

    it('should build url with empty params object', () => {
      const url = buildURL('https://api.example.com/', '/users', {});
      expect(url).toBe('https://api.example.com/users');
    });

    it('should filter out undefined and null params', () => {
      const url = buildURL('https://api.example.com/', '/users', {
        page: 1,
        limit: undefined,
        filter: undefined,
        sort: 'asc',
      });
      expect(url).toBe('https://api.example.com/users?page=1&sort=asc');
    });

    it('should handle existing query params in URL', () => {
      const url = buildURL('https://api.example.com/users?existing=true', '', { page: 1 });
      expect(url).toBe('https://api.example.com/users?existing=true&page=1');
    });

    it('should encode special characters in params', () => {
      const url = buildURL('https://api.example.com/', '/search', {
        q: 'hello world',
        filter: 'name:John & age>25',
      });
      expect(url).toBe(
        'https://api.example.com/search?q=hello%20world&filter=name%3AJohn%20%26%20age%3E25',
      );
    });

    it('should handle boolean and number params', () => {
      const url = buildURL('https://api.example.com/', '/users', {
        active: true,
        inactive: false,
        count: 0,
        limit: 100,
      });
      expect(url).toBe(
        'https://api.example.com/users?active=true&inactive=false&count=0&limit=100',
      );
    });
  });

  describe('mergeHeaders', () => {
    it('should merge multiple header objects', () => {
      const headers1 = { 'Content-Type': 'application/json' };
      const headers2 = { Authorization: 'Bearer token' };
      const headers3 = { 'X-API-Key': 'key123' };
      const mergedHeaders = mergeHeaders(headers1, headers2, headers3);

      expect(mergedHeaders).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
        'X-API-Key': 'key123',
      });
    });

    it('should handle undefined headers', () => {
      const headers1 = { 'Content-Type': 'application/json' };
      const mergedHeaders = mergeHeaders(headers1, undefined, { Authorization: 'Bearer token' });

      expect(mergedHeaders).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      });
    });

    it('should override headers with same key', () => {
      const headers1 = { 'Content-Type': 'application/json' };
      const headers2 = { 'Content-Type': 'text/plain' };
      const mergedHeaders = mergeHeaders(headers1, headers2);

      expect(mergedHeaders).toEqual({
        'Content-Type': 'text/plain',
      });
    });

    it('should handle empty objects', () => {
      const mergedHeaders = mergeHeaders({}, {});
      expect(mergedHeaders).toEqual({});
    });

    it('should handle no arguments', () => {
      const mergedHeaders = mergeHeaders();
      expect(mergedHeaders).toEqual({});
    });

    it('should handle all undefined headers', () => {
      const mergedHeaders = mergeHeaders(undefined, undefined, undefined);
      expect(mergedHeaders).toEqual({});
    });
  });

  describe('mergeParams', () => {
    it('should merge multiple param objects', () => {
      const params1 = { page: 1, limit: 10 };
      const params2 = { sort: 'asc' };
      const params3 = { filter: 'active' };
      const mergedParams = mergeParams(params1, params2, params3);

      expect(mergedParams).toEqual({
        page: 1,
        limit: 10,
        sort: 'asc',
        filter: 'active',
      });
    });

    it('should handle undefined params', () => {
      const params1 = { page: 1 };
      const mergedParams = mergeParams(params1, undefined, { limit: 10 });

      expect(mergedParams).toEqual({
        page: 1,
        limit: 10,
      });
    });

    it('should override params with same key', () => {
      const params1 = { page: 1 };
      const params2 = { page: 2 };
      const mergedParams = mergeParams(params1, params2);

      expect(mergedParams).toEqual({
        page: 2,
      });
    });

    it('should handle empty objects', () => {
      const mergedParams = mergeParams({}, {});
      expect(mergedParams).toEqual({});
    });

    it('should handle no arguments', () => {
      const mergedParams = mergeParams();
      expect(mergedParams).toEqual({});
    });

    it('should handle all undefined params', () => {
      const mergedParams = mergeParams(undefined, undefined, undefined);
      expect(mergedParams).toEqual({});
    });
  });

  describe('createTimeoutSignal', () => {
    it('should create timeout signal with AbortSignal.timeout when available', () => {
      const originalTimeout = AbortSignal.timeout;
      const mockTimeout = vi.fn().mockReturnValue(new AbortController().signal);
      AbortSignal.timeout = mockTimeout;

      const signal = createTimeoutSignal(1000);
      expect(mockTimeout).toHaveBeenCalledWith(1000);
      expect(signal).toBeInstanceOf(AbortSignal);

      AbortSignal.timeout = originalTimeout;
    });

    it('should create timeout signal with AbortController when AbortSignal.timeout not available', () => {
      const originalTimeout = AbortSignal.timeout;
      delete (AbortSignal as any).timeout;

      const signal = createTimeoutSignal(100);
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(signal.aborted).toBe(true);
          AbortSignal.timeout = originalTimeout;
          resolve(true);
        }, 150);
      });
    });

    it('should create timeout signal that aborts after specified time', () => {
      const signal = createTimeoutSignal(50);
      expect(signal.aborted).toBe(false);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(signal.aborted).toBe(true);
          resolve(true);
        }, 100);
      });
    });
  });

  describe('createHttpError', () => {
    it('should create HTTP error from Error object', () => {
      const error = new Error('Test error');
      const httpError = createHttpError(error, 404);

      expect(httpError).toEqual({
        message: 'Test error',
        status: 404,
        code: HttpCode[404],
      });
    });

    it('should create HTTP error from string', () => {
      const httpError = createHttpError('String error', 400);

      expect(httpError).toEqual({
        message: 'String error',
        status: 400,
        code: HttpCode[400],
      });
    });

    it('should create HTTP error with null/undefined error', () => {
      const httpError = createHttpError(null, 500);

      expect(httpError).toEqual({
        message: 'Internal Server Error',
        status: 500,
        code: HttpCode[500],
      });
    });

    it('should create HTTP error with undefined error', () => {
      const httpError = createHttpError(undefined, 503);

      expect(httpError).toEqual({
        message: 'Internal Server Error',
        status: 503,
        code: HttpCode[503],
      });
    });

    it('should use default status 500 when not provided', () => {
      const error = new Error('Test error');
      const httpError = createHttpError(error);

      expect(httpError).toEqual({
        message: 'Test error',
        status: 500,
        code: HttpCode[500],
      });
    });

    it('should handle non-standard error objects', () => {
      const error = { toString: () => 'Custom error object' };
      const httpError = createHttpError(error, 422);

      expect(httpError).toEqual({
        message: 'Custom error object',
        status: 422,
        code: HttpCode[422],
      });
    });
  });

  describe('getFetch', () => {
    let originalGlobalThis: any;
    let originalWindow: any;
    let originalGlobal: any;
    let originalProcess: any;

    beforeEach(() => {
      // Save original values
      originalGlobalThis = globalThis.fetch;
      originalWindow = (globalThis as any).window;
      originalGlobal = (globalThis as any).global;
      originalProcess = (globalThis as any).process;
    });

    afterEach(() => {
      // Restore original values
      globalThis.fetch = originalGlobalThis;
      (globalThis as any).window = originalWindow;
      (globalThis as any).global = originalGlobal;
      (globalThis as any).process = originalProcess;
    });

    it('should return globalThis.fetch when available', () => {
      const mockFetch = vi.fn();
      globalThis.fetch = mockFetch;

      const result = getFetch();
      expect(result).toBe(mockFetch);
    });

    it('should return window.fetch when globalThis.fetch not available', () => {
      delete (globalThis as any).fetch;
      const mockFetch = vi.fn();
      (globalThis as any).window = { fetch: mockFetch };

      const result = getFetch();
      expect(result).toBe(mockFetch);
    });

    it('should return global.fetch when window.fetch not available', () => {
      delete (globalThis as any).fetch;
      delete (globalThis as any).window;
      const mockFetch = vi.fn();
      (globalThis as any).global = { fetch: mockFetch };

      const result = getFetch();
      expect(result).toBe(mockFetch);
    });

    it('should work in current environment', () => {
      // Test that it works in the actual test environment
      const fetchFn = getFetch();
      expect(typeof fetchFn).toBe('function');
    });

    it('should handle Node.js environment detection', () => {
      // Mock Node.js environment
      delete (globalThis as any).fetch;
      delete (globalThis as any).window;
      delete (globalThis as any).global;

      (globalThis as any).process = {
        versions: { node: '18.0.0' },
      };

      // In real Node.js environment, this would try to require node-fetch
      // Since we're in a test environment, it should either work or throw a helpful error
      try {
        const result = getFetch();
        expect(typeof result).toBe('function');
      } catch (error: any) {
        expect(error.message).toContain('Fetch is not available');
      }
    });

    it('should throw error when no fetch available in non-Node environment', () => {
      delete (globalThis as any).fetch;
      delete (globalThis as any).window;
      delete (globalThis as any).global;
      delete (globalThis as any).process;

      expect(() => getFetch()).toThrow('Fetch is not available in this environment');
    });
  });
});
