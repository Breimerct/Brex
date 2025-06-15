function isNodeEnvironment(): boolean {
  return (
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
  );
}

export function getFetch(): typeof fetch {
  if (typeof globalThis !== "undefined" && globalThis.fetch) {
    return globalThis.fetch;
  }

  if (typeof window !== "undefined" && window.fetch) {
    return window.fetch;
  }

  if (typeof global !== "undefined" && global.fetch) {
    return global.fetch;
  }

  if (isNodeEnvironment()) {
    try {
      const nodeFetch = require("node-fetch");
      return nodeFetch.default || nodeFetch;
    } catch (error) {
      throw new Error(
        "Fetch no está disponible. Para Node.js < 18, instala node-fetch: npm install node-fetch@2"
      );
    }
  }

  throw new Error("Fetch no está disponible en este entorno");
}
