import { HttpClient } from "../client";
import { HttpClientConfig, HttpResponse, RequestConfig } from "../types";

/**
 * Instancia por defecto del cliente HTTP
 */
const defaultHttpClient = new HttpClient();

/**
 * Función de conveniencia para peticiones GET
 */
export const GET = <T = any>(
  url: string,
  config?: Partial<RequestConfig>
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.get<T>(url, config);
};

/**
 * Función de conveniencia para peticiones POST
 */
export const POST = <T = any>(
  url: string,
  body?: any,
  config?: Partial<RequestConfig>
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.post<T>(url, body, config);
};

/**
 * Función de conveniencia para peticiones PUT
 */
export const PUT = <T = any>(
  url: string,
  body?: any,
  config?: Partial<RequestConfig>
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.put<T>(url, body, config);
};

/**
 * Función de conveniencia para peticiones DELETE
 */
export const DELETE = <T = any>(
  url: string,
  config?: Partial<RequestConfig>
): Promise<HttpResponse<T>> => {
  return defaultHttpClient.delete<T>(url, config);
};

/**
 * Crea una nueva instancia del cliente HTTP con configuración personalizada
 */
export const createBrexClient = (config?: HttpClientConfig): HttpClient => {
  return new HttpClient(config);
};
