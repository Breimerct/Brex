import { HttpClient } from '../client';

const baseHttpClient = new HttpClient();

export const GET = baseHttpClient.get.bind(baseHttpClient);

export const POST = baseHttpClient.post.bind(baseHttpClient);

export const PUT = baseHttpClient.put.bind(baseHttpClient);

export const DELETE = baseHttpClient.delete.bind(baseHttpClient);

export const PATCH = baseHttpClient.patch.bind(baseHttpClient);

export const HEAD = baseHttpClient.head.bind(baseHttpClient);

export const OPTIONS = baseHttpClient.options.bind(baseHttpClient);

export const createBrex = HttpClient.createBrex;
