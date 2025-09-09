import { GET, POST, DELETE, HEAD } from '../../src/app';
import { HttpClient } from '../../src/client';
import { createHttpError } from '../../src/helpers/utils';
import { describe, it, expect } from 'vitest';

const baseURL = 'https://jsonplaceholder.typicode.com/';

describe('Edge Cases Tests', () => {
  describe('HEAD method edge cases', () => {
    it('should handle HEAD request correctly', async () => {
      const client = new HttpClient({ baseURL });
      const response = await client.head('/users/1');

      expect(response.status).toBe(200);
      expect(response.content).toBeNull(); // HEAD should never have body content
      expect(response.headers).toBeDefined();
    });

    it('should handle global HEAD method', async () => {
      const response = await HEAD(`${baseURL}users/1`);

      expect(response.status).toBe(200);
      expect(response.content).toBeNull(); // HEAD should never have body content
      expect(response.headers).toBeDefined();
    });
  });

  describe('Network errors and timeouts', () => {
    it('should handle network connection failures', async () => {
      const response = await GET('http://invalid-domain-that-does-not-exist.com/test');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
      expect(response.content).toBeNull();
    });

    it('should handle DNS resolution failures', async () => {
      const response = await GET('http://non-existent-domain-12345.invalid/api');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });

    it('should handle very short timeouts', async () => {
      const client = new HttpClient({ timeout: 1 });
      const response = await client.get(`${baseURL}users`);

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });
  });

  describe('HTTP status codes edge cases', () => {
    it('should handle 404 Not Found', async () => {
      const response = await GET(`${baseURL}users/999999`);

      expect(response.status).toBe(404);
      expect(response.error).not.toBeNull();
      // JSONPlaceholder returns empty object for 404, not null
      expect(
        response.content === null ||
          (typeof response.content === 'object' &&
            Object.keys(response.content || {}).length === 0),
      ).toBe(true);
    });

    it('should handle empty response bodies for DELETE', async () => {
      const response = await DELETE(`${baseURL}posts/1`);

      expect(response.status).toBe(200);
    });
  });

  describe('Request/Response edge cases', () => {
    it('should handle special characters in request data', async () => {
      const specialData = {
        title: 'Special chars: üñíçødé 测试 🚀',
        body: 'Content with émojis: 😀💻🌟',
        userId: 1,
      };

      const response = await POST(`${baseURL}posts`, specialData);

      expect(response.status).toBe(201);
      expect(response.content.title).toBe(specialData.title);
    });

    it('should handle null and undefined values', async () => {
      const dataWithNulls = {
        title: 'Test',
        body: null,
        metadata: undefined,
        tags: [],
        userId: 1,
      };

      const response = await POST(`${baseURL}posts`, dataWithNulls);

      expect(response.status).toBe(201);
    });

    it('should handle empty header values', async () => {
      const response = await GET(`${baseURL}users/1`, {
        headers: {
          'X-Empty': '',
          'X-Valid': 'test',
        },
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Interceptor edge cases', () => {
    it('should handle interceptor that throws error', async () => {
      const client = new HttpClient({ baseURL });

      client.addRequestInterceptor(() => {
        throw new Error('Interceptor error');
      });

      const response = await client.get('/users/1');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });

    it('should handle async interceptor errors', async () => {
      const client = new HttpClient({ baseURL });

      client.addRequestInterceptor(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error('Async interceptor error');
      });

      const response = await client.get('/users/1');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });

    it('should handle response interceptor that throws', async () => {
      const client = new HttpClient({ baseURL });

      client.addResponseInterceptor(() => {
        throw new Error('Response interceptor error');
      });

      const response = await client.get('/users/1');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });
  });

  describe('Configuration edge cases', () => {
    it('should handle invalid base URL', async () => {
      const client = new HttpClient({ baseURL: 'not-a-url' });
      const response = await client.get('/test');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });

    it('should handle empty configuration', async () => {
      const client = new HttpClient({});
      const response = await client.get(`${baseURL}users/1`);

      expect(response.status).toBe(200);
    });
  });

  describe('Memory and performance edge cases', () => {
    it('should handle many concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => GET(`${baseURL}users/${(i % 5) + 1}`));

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(10);
      responses.forEach((response) => {
        expect([200, 500]).toContain(response.status);
      });
    });

    it('should handle client reuse', async () => {
      const client = new HttpClient({ baseURL });

      const responses: any[] = [];
      for (let i = 0; i < 3; i++) {
        const response = await client.get(`/users/${i + 1}`);
        responses.push(response);
      }

      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Utility function edge cases', () => {
    it('should handle createHttpError with various inputs', () => {
      const error1 = createHttpError('Not Found', 404);
      expect(error1.message).toBe('Not Found');
      expect(error1.status).toBe(404);

      const error2 = createHttpError('Server Error', 500);
      expect(error2.status).toBe(500);

      const error3 = createHttpError('Success', 200);
      expect(error3.status).toBe(200);
    });

    it('should handle edge cases in error creation', () => {
      const error1 = createHttpError('', 0);
      expect(error1.status).toBe(0);

      const error2 = createHttpError('Negative status', -1);
      expect(error2.status).toBe(-1);

      const error3 = createHttpError('Custom status', 999);
      expect(error3.status).toBe(999);
    });
  });

  describe('Response handling edge cases', () => {
    it('should handle OPTIONS requests', async () => {
      const client = new HttpClient({ baseURL });
      const response = await client.options('/users');

      // JSONPlaceholder returns 204 for OPTIONS
      expect([200, 204, 404, 405, 500]).toContain(response.status);
    });

    it('should handle response with various content types', async () => {
      const client = new HttpClient({ baseURL });

      const responses = await Promise.all([
        client.get('/users/1', {
          headers: { Accept: 'application/json' },
        }),
        client.get('/users/1', {
          headers: { Accept: '*/*' },
        }),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.content).toBeDefined();
      });
    });
  });
});
