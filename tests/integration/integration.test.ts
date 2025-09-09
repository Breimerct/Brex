import { createBrex, GET, POST } from '../../src/app';
import { HttpClient } from '../../src/client';
import { describe, it, expect } from 'vitest';

const baseURL = 'https://jsonplaceholder.typicode.com/';

describe('Integration Tests', () => {
  describe('End-to-end request flow', () => {
    it('should handle complete request lifecycle with interceptors', async () => {
      const client = new HttpClient({ baseURL });
      const requestLog: string[] = [];
      const responseLog: string[] = [];

      // Add request interceptor
      client.addRequestInterceptor((config) => {
        requestLog.push('Request intercepted');
        config.headers = { ...config.headers, 'X-Request-ID': '123' };
        return config;
      });

      // Add response interceptor
      client.addResponseInterceptor((response) => {
        responseLog.push('Response intercepted');
        return response;
      });

      const response = await client.get('/users/1');

      expect(requestLog).toContain('Request intercepted');
      expect(responseLog).toContain('Response intercepted');
      expect(response.status).toBe(200);
      expect(response.content.id).toBe(1);
    });

    it('should handle error response with interceptors', async () => {
      const client = new HttpClient({ baseURL });
      let errorIntercepted = false;

      client.addResponseInterceptor((response) => {
        if (response.error) {
          errorIntercepted = true;
        }
        return response;
      });

      const response = await client.get('/users/999999');

      expect(errorIntercepted).toBe(true);
      expect(response.status).toBe(404);
      expect(response.error).not.toBeNull();
    });

    it('should handle request transformation chain', async () => {
      const client = new HttpClient({ baseURL });

      client.addRequestInterceptor((config) => {
        config.headers = { ...config.headers, 'X-Step': '1' };
        return config;
      });

      client.addRequestInterceptor((config) => {
        config.headers = { ...config.headers, 'X-Step': '2' };
        return config;
      });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
    });

    it('should handle response transformation chain', async () => {
      const client = new HttpClient({ baseURL });

      client.addResponseInterceptor((response) => {
        if (response.content && typeof response.content === 'object') {
          (response.content as any).step1 = true;
        }
        return response;
      });

      client.addResponseInterceptor((response) => {
        if (response.content && typeof response.content === 'object') {
          (response.content as any).step2 = true;
        }
        return response;
      });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect((response.content as any).step1).toBe(true);
      expect((response.content as any).step2).toBe(true);
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should handle authenticated requests', async () => {
      const client = new HttpClient({
        baseURL,
        headers: { Authorization: 'Bearer fake-token' },
      });

      const response = await client.get('/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.content)).toBe(true);
    });

    it('should handle pagination', async () => {
      const client = new HttpClient({ baseURL });

      const page1 = await client.get('/users', { params: { _page: 1, _limit: 2 } });
      const page2 = await client.get('/users', { params: { _page: 2, _limit: 2 } });

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);
      expect(page1.content).toHaveLength(2);
      expect(page2.content).toHaveLength(2);
      expect(page1.content[0].id).not.toBe(page2.content[0].id);
    });

    it('should handle file upload simulation', async () => {
      const client = new HttpClient({ baseURL });
      const formData = {
        title: 'Test Post',
        body: 'This is a test post content',
        userId: 1,
      };

      const response = await client.post('/posts', formData);

      expect(response.status).toBe(201);
      expect(response.content.title).toBe('Test Post');
    });

    it('should handle timeout correctly', async () => {
      const client = new HttpClient({ baseURL, timeout: 1 });

      const response = await client.get('/users');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });
  });

  describe('Performance and reliability', () => {
    it('should handle concurrent requests', async () => {
      const client = new HttpClient({ baseURL });
      const requests = Array.from({ length: 5 }, (_, i) => client.get(`/users/${i + 1}`));

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(5);
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.content.id).toBe(index + 1);
      });
    });

    it('should handle mixed success and failure requests', async () => {
      const client = new HttpClient({ baseURL });

      const requests = [
        client.get('/users/1'), // Success
        client.get('/users/999999'), // Not found
        client.get('/users/2'), // Success
      ];

      const responses = await Promise.all(requests);

      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(404);
      expect(responses[2].status).toBe(200);
    });
  });

  describe('Global methods integration', () => {
    it('should work with createBrex factory', async () => {
      const client = createBrex({
        baseURL,
        timeout: 5000,
        headers: { 'User-Agent': 'Brex-Test/1.0' },
      });

      const response = await client.get('/users/1');

      expect(response.status).toBe(200);
      expect(response.content.id).toBe(1);
    });

    it('should handle global methods with different content types', async () => {
      // JSON
      const jsonResponse = await GET(`${baseURL}users/1`);
      expect(jsonResponse.status).toBe(200);
      expect(typeof jsonResponse.content).toBe('object');

      // Create post (JSON)
      const postResponse = await POST(`${baseURL}posts`, {
        title: 'Test',
        body: 'Content',
        userId: 1,
      });
      expect(postResponse.status).toBe(201);
    });

    it('should maintain state isolation between global and instance methods', async () => {
      const client = new HttpClient({
        baseURL,
        headers: { 'X-Client': 'instance' },
      });

      const [globalResponse, instanceResponse] = await Promise.all([
        GET(`${baseURL}users/1`),
        client.get('/users/2'),
      ]);

      expect(globalResponse.status).toBe(200);
      expect(instanceResponse.status).toBe(200);
      expect(globalResponse.content.id).toBe(1);
      expect(instanceResponse.content.id).toBe(2);
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle malformed URLs gracefully', async () => {
      const response = await GET('not-a-valid-url');

      expect(response.error).not.toBeNull();
      expect(response.status).toBe(500);
    });

    it('should handle null and undefined values in request body', async () => {
      const response = await POST(`${baseURL}posts`, {
        title: 'Test',
        body: null,
        metadata: undefined,
        userId: 1,
      });

      expect(response.status).toBe(201);
    });

    it('should handle response headers correctly', async () => {
      const response = await GET(`${baseURL}users/1`);

      expect(response.status).toBe(200);
      expect(response.headers).toBeDefined();
      expect(typeof response.headers).toBe('object');
    });
  });

  describe('Type safety and API consistency', () => {
    it('should maintain type consistency across methods', async () => {
      const client = new HttpClient({ baseURL });

      interface User {
        id: number;
        name: string;
        email: string;
      }

      const response = await client.get<User>('/users/1');

      expect(response.status).toBe(200);
      expect(typeof response.content.id).toBe('number');
      expect(typeof response.content.name).toBe('string');
      expect(typeof response.content.email).toBe('string');
    });
  });
});
