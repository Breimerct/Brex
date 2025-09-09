# Linting and Pre-commit Configuration

This project uses **oxlint** as the main linter and **Husky** for Git hooks to ensure code quality.

## Available Scripts

- `npm run lint` - Run linter and show errors/warnings
- `npm run lint:fix` - Run linter and automatically fix issues that can be fixed
- `npm run lint:watch` - Run linter in watch mode for development
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check that all files are properly formatted
- `npm run check` - Run both linter and format verification
- `npm run check:fix` - Fix both linting and formatting issues
- `npm run pre-commit` - Run the entire pre-commit flow manually

## Pre-commit Flow

When you run `git commit`, the following flow is automatically executed:

### 1. **Format and verify staged files** (lint-staged)

- Format JS/TS files with Prettier
- Automatically fix linting issues
- Verify there are no linting errors
- Format JSON/MD files

### 2. **Final complete verification**

- Run `npm run check` on the entire project
- Confirm there are no linting errors
- Verify all files are properly formatted

### 3. **Commit message validation**

- Use commitlint to verify the message follows conventional commits

If any step fails, the commit is cancelled and you must fix the issues before trying again.

## Main Rules

The configuration includes essential rules for:

- **Variables**: Avoid unused variables, prefer `const` over `let`, don't use `var`
- **Classes**: Avoid duplicate class members, unnecessary constructors
- **Control flow**: Detect unreachable code, duplicate cases in switch
- **Comparisons**: Use `===` instead of `==`, validate `isNaN` usage
- **Imports**: Avoid duplicate imports
- **Readability**: Use object shorthand, template literals, avoid unnecessary renaming
- **Security**: Avoid `eval`, dynamically generated functions
- **Best practices**: Warnings for `console.log`, errors for `debugger`

## Ignored Files

- `dist/` - Compiled files
- `node_modules/` - Dependencies
- `coverage/` - Coverage reports
- `*.d.ts` - Type definition files
- `**/*.config.js` and `**/*.config.ts` - Configuration files

## Manual Execution

If you want to run the pre-commit flow without making a commit:

```bash
npm run pre-commit
```

## Bypass (not recommended)

If you need to make a commit without running the hooks (emergencies only):

```bash
git commit --no-verify -m "emergency message"
```
