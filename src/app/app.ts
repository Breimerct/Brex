import { HttpClient } from '../client';
import { HttpClientConfig, HttpResponse, RequestConfig } from '../types';

const defaultHttpClient = new HttpClient();

export const GET = <T = any>(
  url: string,
  config?: Partial<Omit<RequestConfig, 'method'>>,
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.get<T>(url, config);
};

export const POST = <T = any>(
  url: string,
  body?: any,
  config?: Partial<Omit<RequestConfig, 'method'>>,
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.post<T>(url, body, config);
};

export const PUT = <T = any>(
  url: string,
  body?: any,
  config?: Partial<Omit<RequestConfig, 'method'>>,
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.put<T>(url, body, config);
};

export const DELETE = <T = any>(
  url: string,
  config?: Partial<Omit<RequestConfig, 'method'>>,
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.delete<T>(url, config);
};

export const PATCH = <T = any>(
  url: string,
  body?: any,
  config?: Partial<Omit<RequestConfig, 'method'>>,
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.patch<T>(url, body, config);
};

export const HEAD = <T = any>(
  url: string,
  config?: Partial<Omit<RequestConfig, 'method'>>,
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.head<T>(url, config);
};

export const OPTIONS = <T = any>(
  url: string,
  config?: Partial<Omit<RequestConfig, 'method'>>,
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.options<T>(url, config);
};

export const createBrexClient = (config?: HttpClientConfig): HttpClient => {
  return new HttpClient(config);
};
