# 🌐 Brex

[![npm version](https://img.shields.io/npm/v/@breimerct/brex.svg)](https://www.npmjs.com/package/@breimerct/brex)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, type-safe HTTP client for JavaScript and TypeScript applications. Built on top of the Fetch API with extended functionality for modern web and Node.js applications.

## ✨ Features

- 🚀 Simple and intuitive API
- 📦 Tiny footprint with zero dependencies
- 🔄 Request and response interceptors
- ⚙️ Configurable defaults
- 🔒 Type-safe with TypeScript generics
- 🌐 Works in browsers and Node.js
- ⏱️ Timeout support
- 🛠️ Chainable instance configuration

## 📥 Installation

```bash
# Using npm
npm install @breimerct/brex

# Using yarn
yarn add @breimerct/brex

# Using pnpm
pnpm add @breimerct/brex
```

## 💻 Usage

### 🌱 Basic Example

```typescript
import { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } from '@breimerct/brex';

// Simple GET request
GET('https://api.example.com/users').then((response) => {
  if (!response.error) {
    console.log(response.content);
  } else {
    console.error(response.error);
  }
});

// POST request with body
POST('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com',
}).then((response) => console.log(response.content));

// PUT request
PUT('https://api.example.com/users/1', {
  name: 'Updated Name',
}).then((response) => console.log(response.status));

// DELETE request
DELETE('https://api.example.com/users/1').then((response) =>
  console.log('User deleted:', !response.error),
);

// PATCH request
PATCH('https://api.example.com/users/1', {
  email: 'john.new@example.com',
}).then((response) => {
  console.log('User updated:', !response.error);
});

// HEAD request
HEAD('https://api.example.com/users/1').then((response) => {
  console.log('Response headers:', response.headers);
});

// OPTIONS request
OPTIONS('https://api.example.com/users').then((response) => {
  console.log('Allowed methods:', response.headers['allow']);
});
```

### 📘 Using with TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Type-safe responses
GET<User[]>('https://api.example.com/users').then((response) => {
  const users = response.content;
  users.forEach((user) => console.log(user.name));
});

// Type-safe single response
GET<User>('https://api.example.com/users/1').then((response) => {
  const user = response.content;
  console.log(user.email);
});
```

### ⚙️ Creating a Custom Client

```typescript
import { createBrexClient, Brex } from '@breimerct/brex';

// Create a custom client with configuration
const api = createBrexClient({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer your-token',
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 seconds
});

// Use the custom client
api.get('/users').then((response) => console.log(response.content));

// Chain configuration methods
api
  .setHeader('X-API-Key', 'your-api-key')
  .setTimeout(10000)
  .get('/users/premium')
  .then((response) => console.log(response.content));

// Or use the Brex class directly
const client = new Brex({
  baseURL: 'https://api.example.com',
});

client.get('/users').then((response) => console.log(response.content));
```

### 🔌 Using Interceptors

```typescript
import { createBrexClient } from '@breimerct/brex';

const api = createBrexClient({
  baseURL: 'https://api.example.com',
});

// Add request interceptor
api.addRequestInterceptor((config) => {
  console.log('Request:', config);
  // Add authentication token
  config.headers = {
    ...config.headers,
    Authorization: 'Bearer ' + localStorage.getItem('token'),
  };
  return config;
});

// Add response interceptor
api.addResponseInterceptor((response) => {
  console.log('Response:', response);
  // Transform response data
  if (response.content && !response.error) {
    response.content = response.content.data;
  }
  return response;
});

// Make requests with interceptors applied
api.get('/users').then((response) => console.log(response.content));
```

### ⚠️ Error Handling

```typescript
import { GET } from '@breimerct/brex';

GET('https://api.example.com/users')
  .then((response) => {
    if (response.error) {
      console.error(`Error ${response.status}: ${response.error.message}`);
      console.error('Error code:', response.error.code);
      return;
    }

    console.log('Success:', response.content);
  })
  .catch((error) => {
    // This catches network errors or other exceptions
    console.error('Unexpected error:', error);
  });
```

## 📚 API Reference

### 🧰 Core Functions

- `GET<T>(url, config?)`: Make a GET request
- `POST<T>(url, body?, config?)`: Make a POST request
- `PUT<T>(url, body?, config?)`: Make a PUT request
- `DELETE<T>(url, config?)`: Make a DELETE request
- `createBrexClient(config?)`: Create a new instance with custom configuration

### 🏗️ HttpClient Class

The `HttpClient` class (exported as `Brex`) provides more control:

```typescript
const client = new Brex({
  baseURL: 'https://api.example.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});
```

#### 🔨 Methods

- `get<T>(url, config?)`: Make a GET request
- `post<T>(url, body?, config?)`: Make a POST request
- `put<T>(url, body?, config?)`: Make a PUT request
- `delete<T>(url, config?)`: Make a DELETE request
- `patch<T>(url, body?, config?)`: Make a PATCH request
- `head<T>(url, config?)`: Make a HEAD request
- `options<T>(url, config?)`: Make an OPTIONS request
- `request<T>(config)`: Make a custom request

#### 🔧 Configuration Methods

- `setBaseURL(url)`: Set the base URL
- `setHeaders(headers)`: Set multiple headers
- `setHeader(key, value)`: Set a single header
- `setParams(params)`: Set query parameters
- `setParam(key, value)`: Set a single query parameter
- `setTimeout(timeout)`: Set the request timeout
- `addRequestInterceptor(interceptor)`: Add a request interceptor
- `addResponseInterceptor(interceptor)`: Add a response interceptor

### 📝 Types

#### HttpResponse<T>

```typescript
interface HttpResponse<T> {
  content: T;
  error: HttpError | null;
  status: number;
}
```

#### HttpError

```typescript
interface HttpError {
  message: string;
  status: number;
  code: string;
}
```

#### RequestConfig

```typescript
interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: HttpHeaders;
  params?: QueryParams;
  body?: any;
  timeout?: number;
}
```

## 👥 Contributing

Contributions are welcome! Here's how you can contribute to Brex:

### 🛠️ Setting up the Development Environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/brex.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`

### 📈 Development Workflow

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Build and test: `npm run build`
4. Commit your changes: `git commit -m "Add your feature description"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a pull request to the main repository

### 📏 Code Style Guidelines

- Follow the existing code style
- Use TypeScript features appropriately
- Write clear, descriptive comments
- Use meaningful variable and function names

### 📤 Pull Request Process

1. Update the README.md if needed
2. Ensure all code is properly tested
3. Make sure the code builds without errors or warnings
4. Update the version in package.json following semantic versioning
5. Your pull request will be reviewed by maintainers

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributors

<a href="https://github.com/Breimerct/Brex/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Breimerct/Brex" />
</a>

## ✍️ Author

Breimer Correa <breimerct@gmail.com>

---

Made with ❤️ by [Breimer Correa](https://github.com/breimerct)
