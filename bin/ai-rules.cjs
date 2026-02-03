#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const os = require('os');

const VERSION = require('../package.json').version;

program
  .name('ai-rules')
  .description('AI coding assistant rule manager for Claude Code and Codex')
  .version(VERSION);

program
  .command('init')
  .description('Initialize rules in current project (.claude/, .codex/)')
  .option('--rules <url>', 'Git repository URL for rules (e.g., github.com/org/my-rules)')
  .option('--copy', 'Copy files instead of symlink')
  .action(async (options) => {
    const { init } = await import('../dist/commands/init.js');
    await init({ scope: 'project', ...options });
  });

program
  .command('install')
  .description('Install rules globally (~/.claude/, ~/.codex/)')
  .option('--rules <url>', 'Git repository URL for rules')
  .option('--copy', 'Copy files instead of symlink')
  .action(async (options) => {
    const { init } = await import('../dist/commands/init.js');
    await init({ scope: 'global', ...options });
  });

program
  .command('update')
  .description('Update installed rules to latest version')
  .action(async () => {
    const { update } = await import('../dist/commands/update.js');
    await update();
  });

program
  .command('list')
  .description('List available rules and keywords')
  .action(async () => {
    const { list } = await import('../dist/commands/list.js');
    await list();
  });

program
  .command('add <source>')
  .description('Add rules from a git repository')
  .option('--name <name>', 'Custom name for the rule source')
  .action(async (source, options) => {
    const { add } = await import('../dist/commands/add.js');
    await add(source, options);
  });

program
  .command('remove <name>')
  .description('Remove a rule source')
  .action(async (name) => {
    const { remove } = await import('../dist/commands/remove.js');
    await remove(name);
  });

program.parse();
