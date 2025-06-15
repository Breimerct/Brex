import { HttpClient } from "../client";
import { HttpClientConfig, HttpResponse, RequestConfig } from "../types";

const defaultHttpClient = new HttpClient();

export const GET = <T = any>(
  url: string,
  config?: Partial<RequestConfig>
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.get<T>(url, config);
};

export const POST = <T = any>(
  url: string,
  body?: any,
  config?: Partial<RequestConfig>
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.post<T>(url, body, config);
};

export const PUT = <T = any>(
  url: string,
  body?: any,
  config?: Partial<RequestConfig>
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.put<T>(url, body, config);
};

export const DELETE = <T = any>(
  url: string,
  config?: Partial<RequestConfig>
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.delete<T>(url, config);
};

export const createBrexClient = (config?: HttpClientConfig): HttpClient => {
  return new HttpClient(config);
};
