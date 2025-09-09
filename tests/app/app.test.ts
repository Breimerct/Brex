import { createBrex, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } from '../../src/app';

import { describe, it, expect } from 'vitest';

const baseURL = 'https://jsonplaceholder.typicode.com/';

describe('Base app HTTP Client', () => {
  describe('createBrex function', () => {
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

    it('should create a Brex client with custom configuration', async () => {
      const client = createBrex({
        baseURL,
        headers: { 'Custom-Header': 'value' },
        timeout: 10000,
      });

      const config = client.getConfig;
      expect(config.baseURL).toBe(baseURL);
      expect(config.headers?.['Custom-Header']).toBe('value');
      expect(config.timeout).toBe(10000);
    });

    it('should create a Brex client without config', () => {
      const client = createBrex();
      expect(client).toBeDefined();
    });
  });

  describe('Global HTTP methods', () => {
    describe('GET method', () => {
      it('should handle GET request', async () => {
        const response = await GET(`${baseURL}users/1`);

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(200);
        expect(response.content.id).toBe(1);
      });

      it('should handle GET request with options', async () => {
        const response = await GET(`${baseURL}users`, {
          params: { _limit: 1 },
        });

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(200);
        expect(response.content.length).toBe(1);
      });

      it('should handle GET request with headers', async () => {
        const response = await GET(`${baseURL}users/1`, {
          headers: { Accept: 'application/json' },
        });

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(200);
      });
    });

    describe('POST method', () => {
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

      it('should handle POST request with custom headers', async () => {
        const response = await POST(
          `${baseURL}users`,
          {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(201);
      });

      it('should handle POST request with string body', async () => {
        const response = await POST(`${baseURL}posts`, 'Plain text content', {
          headers: { 'Content-Type': 'text/plain' },
        });

        expect(response.status).toBe(201);
      });
    });

    describe('PUT method', () => {
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

      it('should handle PUT request with options', async () => {
        const response = await PUT(
          `${baseURL}users/1`,
          {
            name: 'Updated User',
          },
          {
            headers: { 'If-Match': '"abc123"' },
            timeout: 5000,
          },
        );

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(200);
      });
    });

    describe('PATCH method', () => {
      it('should handle PATCH request', async () => {
        const response = await PATCH(`${baseURL}users/1`, {
          name: 'Updated Name',
        });

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(200);
        expect(response.content.name).toBe('Updated Name');
      });

      it('should handle PATCH request with partial data', async () => {
        const response = await PATCH(`${baseURL}users/1`, {
          email: 'new.email@example.com',
        });

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(200);
      });

      it('should handle PATCH request with options', async () => {
        const response = await PATCH(
          `${baseURL}users/1`,
          {
            name: 'Patched Name',
          },
          {
            headers: { 'Content-Type': 'application/merge-patch+json' },
          },
        );

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(200);
      });
    });

    describe('DELETE method', () => {
      it('should handle DELETE request', async () => {
        const response = await DELETE(`${baseURL}users/1`);

        expect(response.content).not.toBeNull();
        expect(response.status).toBe(200);
      });

      it('should handle DELETE request with options', async () => {
        const response = await DELETE(`${baseURL}users/1`, {
          headers: { Authorization: 'Bearer token' },
        });

        expect(response.status).toBe(200);
      });

      it('should handle DELETE request with params', async () => {
        const response = await DELETE(`${baseURL}users/1`, {
          params: { force: true },
        });

        expect(response.status).toBe(200);
      });
    });

    describe('HEAD method', () => {
      it('should handle HEAD request', async () => {
        const response = await HEAD(`${baseURL}`);

        expect(response.status).toBe(200);
      });

      it('should handle HEAD request with specific resource', async () => {
        const response = await HEAD(`${baseURL}users/1`);

        // HEAD request should work properly now
        expect(response.status).toBe(200);
        expect(response.content).toBeNull(); // HEAD should not have body
        expect(response.headers).toBeDefined();
      });

      it('should handle HEAD request with options', async () => {
        const response = await HEAD(`${baseURL}users/1`, {
          headers: { Accept: 'application/json' },
        });

        expect(response.status).toBe(200);
        expect(response.content).toBeNull(); // HEAD should not have body
      });
    });

    describe('OPTIONS method', () => {
      it('should handle OPTIONS request', async () => {
        const response = await OPTIONS(`${baseURL}`);

        expect(response.status).toBe(204);
      });

      it('should handle OPTIONS request with specific endpoint', async () => {
        const response = await OPTIONS(`${baseURL}users`);

        expect(response.status).toBe(204);
      });

      it('should handle OPTIONS request with headers', async () => {
        const response = await OPTIONS(`${baseURL}`, {
          headers: { 'Access-Control-Request-Method': 'POST' },
        });

        expect(response.status).toBe(204);
      });
    });
  });

  describe('Global methods with parameters', () => {
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
      const response = await GET(`${baseURL}users/1`, {
        timeout: 5000,
      });

      expect(response.content).not.toBeNull();
      expect(response.status).toBe(200);
    });

    it('should handle multiple parameters', async () => {
      const response = await GET(`${baseURL}users`, {
        params: { _limit: 2, _page: 1 },
        headers: { Accept: 'application/json' },
        timeout: 10000,
      });

      expect(response.content).not.toBeNull();
      expect(response.status).toBe(200);
      expect(response.content.length).toBe(2);
    });
  });

  describe('Error handling in global methods', () => {
    it('should handle network errors in GET', async () => {
      const response = await GET('https://invalid-domain-that-does-not-exist.com/users');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });

    it('should handle 404 errors', async () => {
      const response = await GET(`${baseURL}users/999999`);

      expect(response.status).toBe(404);
      expect(response.error).not.toBeNull();
    });

    it('should handle timeout errors', async () => {
      const response = await GET(`${baseURL}users/1`, {
        timeout: 1,
      });

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });
  });

  describe('Method chaining and reusability', () => {
    it('should maintain independent global state between calls', async () => {
      const response1 = await GET(`${baseURL}users/1`);
      const response2 = await GET(`${baseURL}users/2`);

      expect(response1.content.id).toBe(1);
      expect(response2.content.id).toBe(2);
      expect(response1.content.id).not.toBe(response2.content.id);
    });

    it('should handle concurrent requests', async () => {
      const promises = [
        GET(`${baseURL}users/1`),
        GET(`${baseURL}users/2`),
        GET(`${baseURL}users/3`),
      ];

      const responses = await Promise.all(promises);

      expect(responses).toHaveLength(3);
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.content.id).toBe(index + 1);
      });
    });
  });
});
