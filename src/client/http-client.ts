import {
  mergeHeaders,
  mergeParams,
  buildURL,
  createHttpError,
  createTimeoutSignal,
  getFetch,
} from '../helpers';
import {
  QueryParams,
  HttpHeaders,
  HttpResponse,
  RequestInterceptor,
  ResponseInterceptor,
  RequestConfig,
  HttpClientConfig,
  Interceptors,
  HttpRequestOptions,
} from '../types';

export class HttpClient {
  private config: HttpClientConfig;
  private interceptors: Interceptors;

  constructor(config: HttpClientConfig = {}) {
    this.config = config;
    this.interceptors = {
      request: config.interceptors?.request || [],
      response: config.interceptors?.response || [],
    };
  }

  setBaseURL(baseURL: string) {
    this.config.baseURL = baseURL;
    return this;
  }

  setHeaders(headers: HttpHeaders) {
    this.config.headers = mergeHeaders(this.config.headers, headers);
    return this;
  }

  setHeader(key: keyof HttpHeaders, value: string) {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    this.config.headers[key] = value;
    return this;
  }

  setParams(params: QueryParams) {
    this.config.params = mergeParams(this.config.params, params);
    return this;
  }

  setParam(key: string, value: string | number | boolean) {
    if (!this.config.params) {
      this.config.params = {};
    }
    this.config.params[key] = value;
    return this;
  }

  setTimeout(timeout: number) {
    this.config.timeout = timeout;
    return this;
  }

  get getConfig() {
    return this.config;
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.interceptors.request.push(interceptor);
    return this;
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.interceptors.response.push(interceptor);
    return this;
  }

  private async applyRequestInterceptors(config: RequestConfig) {
    let processedConfig = config;

    for (const interceptor of this.interceptors.request) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  private async applyResponseInterceptors<T>(response: HttpResponse<T>) {
    let processedResponse = response;

    try {
      for (const interceptor of this.interceptors.response) {
        processedResponse = await interceptor(processedResponse);
      }
    } catch (error: any) {
      // If a response interceptor throws an error, return an error response
      return {
        content: null as T,
        error: createHttpError(error),
        status: 500,
        headers: {},
      };
    }

    return processedResponse;
  }

  private async makeRequest<T = any>(config: RequestConfig) {
    try {
      const mergedConfig: RequestConfig = {
        ...config,
        headers: mergeHeaders(this.config.headers, config.headers),
        params: mergeParams(this.config.params, config.params),
        timeout: config.timeout || this.config.timeout || 30000,
      };

      const processedConfig = await this.applyRequestInterceptors(mergedConfig);

      const fullURL = buildURL(this.config.baseURL, processedConfig.url, processedConfig.params);

      const fetchOptions: RequestInit = {
        method: processedConfig.method,
        headers: processedConfig.headers as HeadersInit,
        signal: createTimeoutSignal(processedConfig.timeout!),
      };

      if (processedConfig.body && !['GET', 'HEAD'].includes(processedConfig.method)) {
        if (typeof processedConfig.body === 'object') {
          fetchOptions.body = JSON.stringify(processedConfig.body);

          if (!processedConfig.headers?.['Content-Type']) {
            fetchOptions.headers = {
              ...(fetchOptions.headers as Record<string, string>),
              'Content-Type': 'application/json',
            };
          }
        } else {
          fetchOptions.body = processedConfig.body;
        }
      }

      const fetchFn = getFetch();

      const response = await fetchFn(fullURL, fetchOptions);

      let content: T;

      // HEAD requests should not have a response body
      if (processedConfig.method === 'HEAD') {
        content = null as T;
      } else {
        const contentType = response.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
          content = await response.json();
        } else if (contentType.includes('text/')) {
          content = (await response.text()) as T;
        } else {
          content = (await response.blob()) as T;
        }
      }

      const headers: HttpHeaders = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const httpResponse: HttpResponse<T> = {
        content,
        error: response.ok
          ? null
          : createHttpError(
              `HTTP Error: ${response.status} ${response.statusText}`,
              response.status,
            ),
        status: response.status,
        headers,
      };

      return await this.applyResponseInterceptors(httpResponse);
    } catch (error: any) {
      const httpResponse: HttpResponse<T> = {
        content: null as T,
        error: createHttpError(error),
        status: 500,
        headers: {},
      };

      return await this.applyResponseInterceptors(httpResponse);
    }
  }

  async get<T = any>(url: string, config?: HttpRequestOptions) {
    return this.makeRequest<T>({
      url,
      method: 'GET',
      ...config,
    });
  }

  async post<T = any>(url: string, body?: any, config?: HttpRequestOptions) {
    return this.makeRequest<T>({
      url,
      method: 'POST',
      body,
      ...config,
    });
  }

  async put<T = any>(url: string, body?: any, config?: HttpRequestOptions) {
    return this.makeRequest<T>({
      url,
      method: 'PUT',
      body,
      ...config,
    });
  }

  async delete<T = any>(url: string, config?: HttpRequestOptions) {
    return this.makeRequest<T>({
      url,
      method: 'DELETE',
      ...config,
    });
  }

  async patch<T = any>(url: string, body?: any, config?: HttpRequestOptions) {
    return this.makeRequest<T>({
      url,
      method: 'PATCH',
      body,
      ...config,
    });
  }

  async head<T = any>(url: string, config?: HttpRequestOptions) {
    return this.makeRequest<T>({
      url,
      method: 'HEAD',
      ...config,
    });
  }

  async options<T = any>(url: string, config?: HttpRequestOptions) {
    return this.makeRequest<T>({
      url,
      method: 'OPTIONS',
      ...config,
    });
  }

  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(config);
  }

  static createBrex(config?: HttpClientConfig): HttpClient {
    return new HttpClient(config);
  }
}
