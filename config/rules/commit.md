---
description: Git commit message format, types, and security checks for commits
---

# Commit Convention

## Format

```
<type>: [<ticket>] <subject>

<body>
- Specific changes
- Key logic explanation
```

## Types

- feat: New feature
- fix: Bug fix
- refactor: Code improvement (no functionality change)
- style: Formatting (no logic change)
- docs: Documentation
- test: Tests
- chore: Build scripts, package manager, etc.

## Rules

- Title under 50 chars, in English
- Body explains changes and reasons
- NO emojis
- NO AI attribution markers (Co-Authored-By, Generated with, etc.)
- NO auto-commit without user request

## Security Check

- NEVER: Commit secrets (passwords/API keys/tokens)
- NEVER: Commit sensitive data (PII/credit cards)
- Stop immediately if secrets found

## Example

```
feat: [PP-1234] Add user authentication

- Implement JWT token validation
- Add login/logout endpoints
- Add refresh token rotation
```
