export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type HttpHeaders = {
  Accept?: string;
  'Accept-Encoding'?: string;
  'Accept-Language'?: string;
  Authorization?: string;
  'Cache-Control'?: string;
  'Content-Type'?:
    | 'application/json'
    | 'application/x-www-form-urlencoded'
    | 'multipart/form-data'
    | 'text/plain'
    | 'text/html'
    | string;
  Cookie?: string;
  Host?: string;
  Origin?: string;
  Referer?: string;
  'User-Agent'?: string;
  'X-Requested-With'?: string;
  'X-CSRF-Token'?: string;
  'X-API-Key'?: string;
  [key: string]: string | undefined;
};

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface HttpError {
  message: string;
  status: number;
  code: string;
}

export interface HttpResponse<T = any> {
  content: T;
  error: HttpError | null;
  status: number;
  headers: HttpHeaders;
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor = <T>(
  response: HttpResponse<T>,
) => HttpResponse<T> | Promise<HttpResponse<T>>;

export interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
}

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: HttpHeaders;
  params?: QueryParams;
  body?: any;
  timeout?: number;
}

export interface HttpClientConfig {
  baseURL?: string;
  headers?: HttpHeaders;
  params?: QueryParams;
  timeout?: number;
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
  };
}

export type HttpRequestOptions = Partial<Omit<RequestConfig, 'method'>>;
