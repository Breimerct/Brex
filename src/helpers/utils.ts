import { HttpCode } from '../constants';
import { HttpError, HttpHeaders, QueryParams } from '../types';

export function buildURL(baseURL: string = '', endpoint: string, params?: QueryParams) {
  const cleanBaseURL = baseURL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');

  let fullURL: string;
  if (cleanBaseURL && cleanEndpoint) {
    fullURL = `${cleanBaseURL}/${cleanEndpoint}`;
  } else if (cleanBaseURL) {
    fullURL = cleanBaseURL;
  } else {
    fullURL = cleanEndpoint;
  }

  if (params) {
    const validParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    if (validParams) {
      fullURL += `${fullURL.includes('?') ? '&' : '?'}${validParams}`;
    }
  }

  return fullURL;
}

export function mergeHeaders(...headerObjects: (HttpHeaders | undefined)[]) {
  return (
    headerObjects.reduce<HttpHeaders>((merged, headers) => {
      if (headers) {
        return { ...merged, ...headers };
      }
      return merged;
    }, {}) || {}
  );
}

export function mergeParams(...paramObjects: (QueryParams | undefined)[]) {
  return (
    paramObjects.reduce<QueryParams>((merged, params) => {
      if (params) {
        return { ...merged, ...params };
      }
      return merged;
    }, {}) || {}
  );
}

export function createTimeoutSignal(timeoutMs: number) {
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export function createHttpError(error: any, status: number = 500) {
  const message = error?.message || error?.toString() || 'Internal Server Error';
  const code = HttpCode[status];

  const payload: HttpError = {
    message,
    status,
    code,
  };

  return payload;
}
