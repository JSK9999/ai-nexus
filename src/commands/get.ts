import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { fetchRegistry, fetchFileContent } from '../utils/registry.js';
import { ensureDir } from '../utils/files.js';

interface GetOptions {
  category?: string;
}

export async function get(filename: string, options: GetOptions): Promise<void> {
  const spinner = ora('Fetching registry...').start();

  try {
    const allFiles = await fetchRegistry();

    // Find matching files - support both "react.md" and "skills/react.md"
    const parts = filename.split('/');
    const matches = parts.length >= 2
      ? allFiles.filter(f => f.category === parts[0] && f.name === parts.slice(1).join('/'))
      : allFiles.filter(f => f.name === filename);

    if (matches.length === 0) {
      spinner.stop();
      console.log(`\n  "${filename}" not found in registry.`);
      console.log(chalk.gray('  Use "ai-nexus search <keyword>" to find available files.\n'));
      return;
    }

    // Filter by category if specified
    let target = matches[0];
    if (options.category) {
      const filtered = matches.filter(f => f.category === options.category);
      if (filtered.length === 0) {
        spinner.stop();
        console.log(`\n  "${filename}" not found in ${options.category}/.`);
        console.log(chalk.gray(`  Available in: ${matches.map(f => f.category).join(', ')}\n`));
        return;
      }
      target = filtered[0];
    } else if (matches.length > 1) {
      spinner.stop();
      const { selected } = await inquirer.prompt<{ selected: string }>([
        {
          type: 'list',
          name: 'selected',
          message: `"${filename}" exists in multiple categories:`,
          choices: matches.map(f => ({
            name: `${f.category}/${f.name}`,
            value: f.path,
          })),
        },
      ]);
      target = matches.find(f => f.path === selected)!;
      spinner.start('Downloading...');
    }

    // Download content
    spinner.text = `Downloading ${target.category}/${target.name}...`;
    const content = await fetchFileContent(target);
    spinner.stop();

    // Determine destination
    const claudeDir = path.join(os.homedir(), '.claude');
    const destDir = path.join(claudeDir, target.category);
    const destPath = path.join(destDir, target.name);

    // Check if exists
    if (fs.existsSync(destPath)) {
      const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `${target.category}/${target.name} already exists. Overwrite?`,
          default: false,
        },
      ]);
      if (!overwrite) {
        console.log(chalk.yellow('\n  Skipped.\n'));
        return;
      }
    }

    // Save
    ensureDir(destDir);
    fs.writeFileSync(destPath, content);

    console.log(chalk.green(`\n  Downloaded ${target.category}/${target.name}`));
    console.log(chalk.gray(`  Saved to ${destPath}\n`));
  } catch (error) {
    spinner.fail('Failed to download');
    console.log(chalk.red(`  ${error}\n`));
  }
}
