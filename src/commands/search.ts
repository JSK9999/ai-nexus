import chalk from 'chalk';
import ora from 'ora';
import {
  fetchRegistry,
  fetchFileContent,
  extractDescription,
  searchFiles,
} from '../utils/registry.js';

export async function search(keyword: string): Promise<void> {
  const spinner = ora('Searching registry...').start();

  try {
    const allFiles = await fetchRegistry();
    const matched = searchFiles(allFiles, keyword);

    if (matched.length === 0) {
      spinner.stop();
      console.log(`\n  No results for "${keyword}".`);
      console.log(chalk.gray('  Try a broader keyword or run "ai-nexus search" to list all.\n'));
      return;
    }

    // Fetch descriptions for matched files
    const descriptions = new Map<string, string | null>();
    await Promise.all(
      matched.map(async (file) => {
        try {
          const content = await fetchFileContent(file);
          descriptions.set(file.path, extractDescription(content));
        } catch {
          descriptions.set(file.path, null);
        }
      })
    );

    spinner.stop();

    // Group by category
    const grouped = new Map<string, typeof matched>();
    for (const file of matched) {
      const list = grouped.get(file.category) || [];
      list.push(file);
      grouped.set(file.category, list);
    }

    console.log(`\n  Results for "${keyword}":\n`);

    for (const [category, files] of grouped) {
      console.log(chalk.bold(`  ${category}/`));
      for (const file of files) {
        const desc = descriptions.get(file.path);
        const descText = desc ? chalk.gray(` - ${desc}`) : '';
        console.log(`    ${file.name}${descText}`);
      }
      console.log('');
    }

    console.log(chalk.gray(`  ${matched.length} file(s) found.`));
    console.log(chalk.gray(`  Use "ai-nexus get <filename>" to download.\n`));
  } catch (error) {
    spinner.fail('Failed to search registry');
    if (error instanceof Error && error.message.includes('403')) {
      console.log(chalk.yellow('  GitHub API rate limit exceeded. Try again later.\n'));
    } else {
      console.log(chalk.red(`  ${error}\n`));
    }
  }
}

export async function searchAll(): Promise<void> {
  const spinner = ora('Fetching registry...').start();

  try {
    const allFiles = await fetchRegistry();

    spinner.stop();

    const grouped = new Map<string, typeof allFiles>();
    for (const file of allFiles) {
      const list = grouped.get(file.category) || [];
      list.push(file);
      grouped.set(file.category, list);
    }

    console.log('\n  Community Registry:\n');

    for (const [category, files] of grouped) {
      console.log(chalk.bold(`  ${category}/ (${files.length})`));
      for (const file of files) {
        console.log(`    ${file.name}`);
      }
      console.log('');
    }

    console.log(chalk.gray(`  ${allFiles.length} file(s) available.`));
    console.log(chalk.gray(`  Use "ai-nexus search <keyword>" to filter.\n`));
  } catch (error) {
    spinner.fail('Failed to fetch registry');
    console.log(chalk.red(`  ${error}\n`));
  }
}
