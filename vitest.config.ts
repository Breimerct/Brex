import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Entorno de testing
    environment: 'node',

    // Patrones de archivos de test
    include: ['tests/**/*.{test,spec}.{js,ts}', 'src/**/*.{test,spec}.{js,ts}'],

    // Excluir archivos
    exclude: ['node_modules', 'dist', 'build'],

    // Coverage
    coverage: {
      provider: 'v8', // o 'c8'
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/index.ts', // archivo de entrada principal
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
      ],
    },

    // Configuración adicional
    globals: true, // Para usar expect, describe, it sin importar
    clearMocks: true,
    restoreMocks: true,
  },
});
