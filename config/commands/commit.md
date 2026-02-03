---
description: Git commit command - creates conventional commits
---

# /commit

Create a git commit following conventional commit format.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## Rules

1. Subject line ≤ 50 characters
2. Body wrapped at 72 characters
3. Use imperative mood ("add" not "added")
4. Reference issues in footer
