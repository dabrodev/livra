---
name: code-review
description: Reviews code for bugs, style issues, performance problems, and best practices. Use when reviewing PRs, checking code quality, or asked to review changes.
---

# Code Review Skill

When reviewing code, systematically check:

## 1. Correctness

- [ ] Does the code do what it's supposed to do?
- [ ] Are edge cases handled (null, empty, boundary values)?
- [ ] Is error handling appropriate and consistent?
- [ ] Are async operations properly awaited?

## 2. Code Quality

- [ ] Are variable/function names descriptive?
- [ ] Is the code DRY (no unnecessary duplication)?
- [ ] Are functions focused and single-purpose?
- [ ] Is the code readable without excessive comments?

## 3. Performance

- [ ] Are there unnecessary loops or re-renders?
- [ ] Is data fetching optimized (no N+1 queries)?
- [ ] Are expensive operations memoized when needed?
- [ ] Are large dependencies justified?

## 4. Maintainability

- [ ] Would a new developer understand this easily?
- [ ] Are magic numbers/strings replaced with constants?
- [ ] Is the file/folder structure logical?
- [ ] Are types properly defined (no `any` abuse)?

## 5. Testing

- [ ] Are critical paths covered by tests?
- [ ] Are edge cases tested?
- [ ] Are tests readable and maintainable?

## Review Format

Provide feedback as:
- 🔴 **Critical**: Must fix before merge (bugs, security issues)
- 🟡 **Suggestion**: Should consider (improvements, best practices)
- 🟢 **Nitpick**: Optional (style, minor improvements)

Always explain **why** something is an issue and suggest a fix.
