---
name: security-review
description: Reviews code for security vulnerabilities including injection attacks, authentication issues, data exposure, and insecure configurations. Use when reviewing security-sensitive code or performing security audits.
---

# Security Review Skill

When reviewing code for security, check these categories:

## 1. Injection Attacks

- [ ] SQL: Are queries parameterized? (no string concatenation)
- [ ] XSS: Is user input sanitized before rendering?
- [ ] Command injection: Is shell input escaped?
- [ ] Path traversal: Are file paths validated?

## 2. Authentication & Authorization

- [ ] Are passwords hashed with strong algorithms (bcrypt, argon2)?
- [ ] Are JWTs properly validated (signature, expiry)?
- [ ] Is authorization checked on every protected route?
- [ ] Are session tokens secure (httpOnly, secure, sameSite)?

## 3. Data Exposure

- [ ] Are secrets in environment variables, not code?
- [ ] Is sensitive data excluded from logs?
- [ ] Are API responses filtered (no password hashes, tokens)?
- [ ] Is PII handled according to privacy requirements?

## 4. API Security

- [ ] Is rate limiting implemented on sensitive endpoints?
- [ ] Are CORS settings restrictive enough?
- [ ] Is input validated on the server (not just client)?
- [ ] Are file uploads validated (type, size, content)?

## 5. Dependencies

- [ ] Are there known vulnerabilities? (run `npm audit`)
- [ ] Are dependencies up to date?
- [ ] Are unused dependencies removed?

## 6. Configuration

- [ ] Is debug mode disabled in production?
- [ ] Are error messages generic (no stack traces to users)?
- [ ] Is HTTPS enforced?
- [ ] Are security headers set (CSP, HSTS, X-Frame-Options)?

## Severity Levels

- 🔴 **Critical**: Immediate exploitation risk (RCE, SQL injection, auth bypass)
- 🟠 **High**: Significant risk requiring prompt fix
- 🟡 **Medium**: Should be fixed in normal development cycle
- 🟢 **Low**: Minor issue, fix when convenient

Always provide:
1. What the vulnerability is
2. How it could be exploited
3. How to fix it
