---
name: Code Standards
description: Code style, clean code, refactoring, and coding standards guidelines
keywords: [코드 스타일, code style, 린트, lint, 포맷, format, 코딩, coding, 개발, standards, clean code, refactoring, testing]
---

AGENTS.md

Problem Definition → Small Safe Changes → Change Review → Refactoring — Repeat this loop.

Mandatory Rules

    Read related files from start to finish, including call/reference paths, before changing anything.
    Keep work, commits, and PRs small.
    Record assumptions in Issues/PRs/ADRs.
    Validate all inputs and encode/normalize outputs.
    Avoid premature abstraction and use intention-revealing names.
    Compare at least two alternatives before deciding.

Mindset

    Think like a senior engineer.
    Don't jump to conclusions or rush into assumptions.
    Always evaluate multiple approaches, write one line each for pros/cons/risks, then choose the simplest solution.

Code & File Reference Rules

    Read files thoroughly from start to finish (no partial reading).
    Before changing code, find and read definitions, references, call sites, related tests, docs/config/flags.
    Don't change code without reading the entire file.
    Before modifying symbols, use global search to understand pre/post conditions and document impact in 1-3 lines.

Required Coding Rules

    Write Problem 1-Pager before coding: Background / Problem / Goals / Non-Goals / Constraints.
    Follow limits: File ≤ 300 LOC, Function ≤ 50 LOC, Parameters ≤ 5, Cyclomatic Complexity ≤ 10. Split/refactor if exceeded.
    Prefer explicit code; prohibit hidden "magic".
    Follow DRY but avoid premature abstraction.
    Isolate side effects (I/O, network, global state) to boundary layers.
    Handle only specific exceptions and provide clear messages to users.
    Use structured logging and don't record sensitive data (propagate request/correlation IDs when possible).
    Consider timezones and DST.

Testing Rules

    Add new tests for new code; bug fixes must include regression tests (write to fail first).
    Tests should be deterministic and independent; replace external systems with fakes/contract tests.
    E2E tests must include ≥1 success path and ≥1 failure path.
    Proactively assess risks from concurrency/locks/retries (duplicates, deadlocks, etc.).

ABSOLUTE Security Rules

    NEVER: Leave secrets (passwords/API keys/tokens) in code/logs/tickets/environment variables/.env files.
    NEVER: Log sensitive data (PII/credit cards/SSN) in logs.
    NEVER: Leave SQL injection, XSS, CSRF vulnerabilities.
    ALWAYS: Validate, normalize, and encode all inputs; use parameterized queries.
    ALWAYS: Use HTTPS/TLS and apply principle of least privilege.
    ALWAYS: Apply authentication/authorization to all endpoints.
    ALWAYS: Set security headers (CSP, HSTS, X-Frame-Options).
    ALWAYS: Regularly scan and update dependency vulnerabilities.
    Stop work immediately and request review upon security violations.

Clean Code Rules

    Use intention-revealing names.
    Each function does one thing.
    Isolate side effects to boundary layers.
    Prefer guard clauses.
    Always symbolize constants (no hardcoding).
    Structure code as Input → Processing → Return.
    Report failures with specific errors/messages.
    Make tests work as usage examples and include boundary/failure cases.
    Never add useless emojis.

Anti-Pattern Rules

    Don't modify code without reading full context.
    Don't expose secrets.
    Don't ignore failures or warnings.
    Don't introduce unfounded optimizations or abstractions.
    Don't abuse broad exceptions.
