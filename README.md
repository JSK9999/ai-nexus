# ai-rules

AI coding assistant rule manager for **Claude Code** and **Codex**.

Manage, share, and sync rules across teams via Git repositories.

## Quick Start

```bash
# Install with built-in rules
npx ai-rules install

# Or use your team's rules
npx ai-rules install --rules github.com/your-org/your-rules
```

## Why ai-rules?

**Problem**: AI coding assistants load all rules on every request, wasting tokens.

**Solution**: Organize rules that can be selectively loaded, shared via Git.

| Before | After |
|--------|-------|
| 4,300 lines loaded every time | Only needed rules loaded |
| Each developer manages own rules | Team shares rules via Git |
| No sync when rules update | `ai-rules update` syncs all |

## Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize rules in current project |
| `install` | Install rules globally |
| `update` | Update rules to latest version |
| `list` | List installed rules |
| `add <url>` | Add rules from a Git repository |
| `remove <name>` | Remove a rule source |

## Using Team Rules

### Option 1: Install with --rules

```bash
# Project-level (current directory)
npx ai-rules init --rules github.com/your-org/team-rules

# Global (~/.claude/)
npx ai-rules install --rules github.com/your-org/team-rules
```

### Option 2: Add rules later

```bash
npx ai-rules add github.com/your-org/security-rules
npx ai-rules add github.com/your-org/react-rules --name react
```

### Updating rules

```bash
# Pull latest from all Git sources and sync
npx ai-rules update
```

## Creating a Rules Repository

Your rules repository should have this structure:

```
your-rules/
├── config/
│   ├── rules/          # Always loaded
│   │   └── essential.md
│   ├── commands/       # Slash commands (/commit)
│   │   └── commit.md
│   ├── skills/         # Domain knowledge (react, rust)
│   │   └── react.md
│   ├── agents/         # Sub-agent definitions
│   │   └── reviewer.md
│   └── contexts/       # Context files (@dev)
│       └── dev.md
└── README.md
```

### Rule file format

```markdown
---
description: When this rule should be loaded
---

# Rule Title

Your rule content here...
```

The `description` field helps AI assistants decide when to load the rule.

## Installation Modes

### Symlink (default)

```bash
npx ai-rules install
```

- Rules are symlinked to source
- `update` instantly syncs changes
- Cannot modify rules directly

### Copy

```bash
npx ai-rules install --copy
```

- Rules are copied as files
- Can modify rules locally
- `update` overwrites local changes

## How It Works

```
.ai-rules/              # ai-rules data
├── config/             # Merged rules from all sources
├── sources/            # Git repositories
│   ├── team-rules/
│   └── security-rules/
└── meta.json           # Installation metadata

.claude/                # Claude Code reads from here
├── rules/       → symlink or copy
├── commands/    → symlink or copy
└── ...
```

## Example Workflows

### Team Setup

```bash
# 1. Create rules repo on GitHub
# 2. Each team member:
npx ai-rules install --rules github.com/acme/claude-rules

# 3. When rules update:
npx ai-rules update
```

### Multi-source Setup

```bash
# Base rules from company
npx ai-rules install --rules github.com/acme/base-rules

# Add team-specific rules
npx ai-rules add github.com/acme/frontend-rules

# Add security rules
npx ai-rules add github.com/acme/security-rules

# Update all at once
npx ai-rules update
```

## License

MIT
