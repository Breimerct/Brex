# Configuración de Linting

Este proyecto usa **oxlint** como linter principal para mantener la calidad del código.

## Scripts disponibles

- `npm run lint` - Ejecuta el linter y muestra errores/warnings
- `npm run lint:fix` - Ejecuta el linter y arregla automáticamente los problemas que puede
- `npm run lint:watch` - Ejecuta el linter en modo watch para desarrollo
- `npm run check` - Ejecuta tanto el linter como la verificación de formato
- `npm run check:fix` - Arregla tanto problemas de linting como de formato

## Reglas principales

La configuración incluye reglas esenciales para:

- **Variables**: Evitar variables sin usar, preferir `const` sobre `let`, no usar `var`
- **Clases**: Evitar miembros duplicados, constructores innecesarios
- **Control de flujo**: Detectar código inaccesible, casos duplicados en switch
- **Comparaciones**: Usar `===` en lugar de `==`, validar uso de `isNaN`
- **Imports**: Evitar imports duplicados
- **Legibilidad**: Usar object shorthand, template literals, evitar renombres innecesarios
- **Seguridad**: Evitar `eval`, funciones generadas dinámicamente
- **Buenas prácticas**: Warnings para `console.log`, errores para `debugger`

## Archivos ignorados

- `dist/` - Archivos compilados
- `node_modules/` - Dependencias
- `coverage/` - Reportes de cobertura
- `*.d.ts` - Archivos de definición de tipos
- `**/*.config.js` y `**/*.config.ts` - Archivos de configuración

## Integración con Git

Los hooks de Git (via husky y lint-staged) ejecutan automáticamente el linter y prettier en los archivos modificados antes de cada commit.
