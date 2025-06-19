import { createBrex, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } from '../../src/app';

import { describe, it, expect } from 'vitest';

const baseURL = 'https://jsonplaceholder.typicode.com/';

describe('Base app HTTP Client', () => {
  it('should create a Brex client with default config', async () => {
    const client = createBrex({ baseURL });

    const response = await client.request({
      method: 'GET',
      url: '/users',
    });

    expect(client).toBeDefined();
    expect(response.content).not.toBeNull();
    expect(response.status).toBe(200);
  });

  it('should handle GET request', async () => {
    const response = await GET(`${baseURL}users/1`);

    expect(response.content).not.toBeNull();
    expect(response.status).toBe(200);
    expect(response.content.id).toBe(1);
  });

  it('should handle POST request', async () => {
    const response = await POST(`${baseURL}users`, {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      website: 'https://example.com',
    });

    expect(response.content).not.toBeNull();
    expect(response.status).toBe(201);
    expect(response.content.name).toBe('John Doe');
    expect(response.content.email).toBe('john.doe@example.com');
    expect(response.content.phone).toBe('123-456-7890');
    expect(response.content.website).toBe('https://example.com');
  });

  it('should handle PUT request', async () => {
    const response = await PUT(`${baseURL}users/1`, {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '987-654-3210',
      website: 'https://jane-doe.com',
    });

    expect(response.content).not.toBeNull();
    expect(response.status).toBe(200);
    expect(response.content.name).toBe('Jane Doe');
    expect(response.content.email).toBe('jane.doe@example.com');
    expect(response.content.phone).toBe('987-654-3210');
    expect(response.content.website).toBe('https://jane-doe.com');
  });

  it('should handle PATCH request', async () => {
    const response = await PATCH(`${baseURL}users/1`, {
      name: 'Updated Name',
    });

    expect(response.content).not.toBeNull();
    expect(response.status).toBe(200);
    expect(response.content.name).toBe('Updated Name');
  });

  it('should handle DELETE request', async () => {
    const response = await DELETE(`${baseURL}users/1`);

    expect(response.content).not.toBeNull();
    expect(response.status).toBe(200);
  });

  it('should handle OPTIONS request', async () => {
    const response = await OPTIONS(`${baseURL}`);

    expect(response.status).toBe(204);
  });

  it('should handle HEAD request', async () => {
    const response = await HEAD(`${baseURL}`);

    expect(response.status).toBe(200);
  });

  it('should handle request with custom headers', async () => {
    const response = await GET(`${baseURL}`, {
      headers: { 'Custom-Header': 'CustomValue' },
    });

    expect(response.status).toBe(200);
  });

  it('should handle request with query parameters', async () => {
    const response = await GET(`${baseURL}users`, {
      params: { _limit: 1 },
    });

    expect(response.content).not.toBeNull();
    expect(response.status).toBe(200);
    expect(response.content.length).toBe(1);
  });

  it('should handle request with timeout', async () => {
    const client = createBrex({ baseURL, timeout: 1000 });

    const response = await client.request({
      method: 'GET',
      url: '/users/1',
    });

    expect(response.content).not.toBeNull();
    expect(response.status).toBe(200);
  });
});
