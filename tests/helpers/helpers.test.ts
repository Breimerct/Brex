import { HttpCode } from '../../src/constants';
import {
  buildURL,
  mergeHeaders,
  mergeParams,
  createTimeoutSignal,
  createHttpError,
  getFetch,
} from '../../src/helpers';
import { describe, it, expect } from 'vitest';

describe('Helpers', () => {
  it('should build url', () => {
    const url = buildURL('https://api.example.com/', '/users', { page: 1, limit: 10 });
    expect(url).toBe('https://api.example.com/users?page=1&limit=10');
  });

  it('should merge headers', () => {
    const headers1 = { 'Content-Type': 'application/json' };
    const headers2 = { Authorization: 'Bearer token' };
    const mergedHeaders = mergeHeaders(headers1, headers2);

    expect(mergedHeaders).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    });
  });

  it('should merge params', () => {
    const params1 = { page: 1, limit: 10 };
    const params2 = { sort: 'asc' };
    const mergedParams = mergeParams(params1, params2);

    expect(mergedParams).toEqual({
      page: 1,
      limit: 10,
      sort: 'asc',
    });
  });

  it('should create timeout signal', () => {
    const signal = createTimeoutSignal(1000);
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);

    // Wait for the timeout to complete
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(signal.aborted).toBe(true);
        resolve(true);
      }, 1000);
    });
  });

  it('should create HTTP error', () => {
    const error = new Error('Test error');
    const httpError = createHttpError(error, 404);

    expect(httpError).toEqual({
      message: 'Test error',
      status: 404,
      code: HttpCode[404],
    });
  });

  it('should create HTTP error with unknown error', () => {
    const httpError = createHttpError(null, 500);

    expect(httpError).toEqual({
      message: 'Internal Server Error',
      status: 500,
      code: HttpCode[500],
    });
  });

  it('should get fetch function', () => {
    const fetchFn = getFetch();

    expect(fetchFn).toBeDefined();
    expect(typeof fetchFn).toBe('function');
  });
});
