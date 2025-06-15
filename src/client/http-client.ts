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

  setBaseURL(baseURL: string): HttpClient {
    this.config.baseURL = baseURL;
    return this;
  }

  setHeaders(headers: HttpHeaders): HttpClient {
    this.config.headers = mergeHeaders(this.config.headers, headers);
    return this;
  }

  setHeader(key: keyof HttpHeaders, value: string): HttpClient {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    this.config.headers[key] = value;
    return this;
  }

  setParams(params: QueryParams): HttpClient {
    this.config.params = mergeParams(this.config.params, params);
    return this;
  }

  setParam(key: string, value: string | number | boolean): HttpClient {
    if (!this.config.params) {
      this.config.params = {};
    }
    this.config.params[key] = value;
    return this;
  }

  setTimeout(timeout: number): HttpClient {
    this.config.timeout = timeout;
    return this;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): HttpClient {
    this.interceptors.request.push(interceptor);
    return this;
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): HttpClient {
    this.interceptors.response.push(interceptor);
    return this;
  }

  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;

    for (const interceptor of this.interceptors.request) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  private async applyResponseInterceptors<T>(response: HttpResponse<T>): Promise<HttpResponse<T>> {
    let processedResponse = response;

    for (const interceptor of this.interceptors.response) {
      processedResponse = await interceptor(processedResponse);
    }

    return processedResponse;
  }

  private async makeRequest<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
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
      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        content = await response.json();
      } else if (contentType.includes('text/')) {
        content = (await response.text()) as T;
      } else {
        content = (await response.blob()) as T;
      }

      const httpResponse: HttpResponse<T> = {
        content,
        error: response.ok
          ? null
          : createHttpError(
              `HTTP Error: ${response.status} ${response.statusText}`,
              response.status,
            ),
        status: response.status,
      };

      return await this.applyResponseInterceptors(httpResponse);
    } catch (error: any) {
      const httpResponse: HttpResponse<T> = {
        content: null as T,
        error: createHttpError(error),
        status: 0,
      };

      return await this.applyResponseInterceptors(httpResponse);
    }
  }

  async get<T = any>(
    url: string,
    config?: Partial<Omit<RequestConfig, 'method'>>,
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>({
      url,
      method: 'GET',
      ...config,
    });
  }

  async post<T = any>(
    url: string,
    body?: any,
    config?: Partial<Omit<RequestConfig, 'method'>>,
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>({
      url,
      method: 'POST',
      body,
      ...config,
    });
  }

  async put<T = any>(
    url: string,
    body?: any,
    config?: Partial<Omit<RequestConfig, 'method'>>,
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>({
      url,
      method: 'PUT',
      body,
      ...config,
    });
  }

  async delete<T = any>(
    url: string,
    config?: Partial<Omit<RequestConfig, 'method'>>,
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>({
      url,
      method: 'DELETE',
      ...config,
    });
  }

  async patch<T = any>(
    url: string,
    body?: any,
    config?: Partial<Omit<RequestConfig, 'method'>>,
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>({
      url,
      method: 'PATCH',
      body,
      ...config,
    });
  }

  async head<T = any>(
    url: string,
    config?: Partial<Omit<RequestConfig, 'method'>>,
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>({
      url,
      method: 'HEAD',
      ...config,
    });
  }

  async options<T = any>(
    url: string,
    config?: Partial<Omit<RequestConfig, 'method'>>,
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>({
      url,
      method: 'OPTIONS',
      ...config,
    });
  }

  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(config);
  }
}
