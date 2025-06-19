import { HttpClient } from '../client';

const defaultHttpClient = new HttpClient();

export const GET = defaultHttpClient.get.bind(defaultHttpClient);

export const POST = defaultHttpClient.post.bind(defaultHttpClient);

export const PUT = defaultHttpClient.put.bind(defaultHttpClient);

export const DELETE = defaultHttpClient.delete.bind(defaultHttpClient);

export const PATCH = defaultHttpClient.patch.bind(defaultHttpClient);

export const HEAD = defaultHttpClient.head.bind(defaultHttpClient);

export const OPTIONS = defaultHttpClient.options.bind(defaultHttpClient);

export const createBrex = HttpClient.createBrex;
