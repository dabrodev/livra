---
name: documentation
description: Generates and improves code documentation including README files, inline comments, JSDoc/TSDoc, and API documentation. Use when asked to document code, add comments, or create/update documentation files.
---

# Documentation Skill

When documenting code, follow these guidelines:

## README Files

- Start with a clear project description
- Include installation and setup instructions
- Add usage examples with code snippets
- Document environment variables and configuration
- Include contributing guidelines if applicable

## Inline Comments

- Explain **why**, not **what** (the code shows what)
- Document complex algorithms and business logic
- Add TODO/FIXME comments with context
- Keep comments up-to-date with code changes

## TSDoc / JSDoc

For functions and classes, include:
```typescript
/**
 * Brief description of what this does.
 * 
 * @param paramName - Description of the parameter
 * @returns Description of return value
 * @throws {ErrorType} When this error occurs
 * @example
 * const result = myFunction('input');
 */
```

## API Documentation

- Document all endpoints with method, path, and description
- Include request/response examples
- Specify required headers and authentication
- Document error responses and status codes

## Checklist

- [ ] Is the purpose of the code clear?
- [ ] Are complex parts explained?
- [ ] Are public APIs documented?
- [ ] Are examples provided where helpful?
- [ ] Is the documentation accurate and up-to-date?
