function isNodeEnvironment() {
  return (
    typeof process !== 'undefined' && process.versions !== null && process.versions.node !== null
  );
}

export function getFetch(): typeof fetch {
  if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    return globalThis.fetch;
  }

  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch;
  }

  if (typeof global !== 'undefined' && global.fetch) {
    return global.fetch;
  }

  if (isNodeEnvironment()) {
    try {
      const nodeFetch = require('node-fetch');
      return nodeFetch.default || nodeFetch;
    } catch {
      throw new Error(
        'Fetch is not available. For Node.js < 18, install node-fetch: npm install node-fetch@2',
      );
    }
  }

  throw new Error('Fetch is not available in this environment');
}
