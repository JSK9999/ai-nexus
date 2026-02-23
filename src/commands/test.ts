import chalk from 'chalk';
import ora from 'ora';
import {
  selectFiles,
  selectFilesWithKeywords,
  isSemanticRouterEnabled,
  getKeywordMap
} from '../utils/semantic-router.js';
import { detectInstall } from '../utils/files.js';

export interface TestOptions {
  keyword?: boolean;
}

export async function test(input: string, options: TestOptions = {}): Promise<void> {
  const install = detectInstall();

  if (!install) {
    console.log(chalk.yellow('ai-nexus is not installed.'));
    console.log(chalk.gray('Run "ai-nexus init" or "ai-nexus install" first.'));
    return;
  }

  console.log(chalk.cyan('\nRule Routing Test\n'));
  console.log(chalk.gray(`Input: "${input}"`));
  console.log();

  const spinner = ora('Selecting rules...').start();

  try {
    let result;

    if (options.keyword) {
      const files = selectFilesWithKeywords(input);
      result = { files, method: 'keyword' as const };
    } else {
      result = await selectFiles(input);
    }

    spinner.stop();

    const methodLabel = result.method === 'semantic'
      ? chalk.magenta('AI (Semantic Router)')
      : chalk.blue('Keyword matching');

    console.log(chalk.gray(`Method: ${methodLabel}`));

    if (result.method === 'keyword' && isSemanticRouterEnabled()) {
      console.log(chalk.gray('(AI selection failed, keyword fallback)'));
    } else if (result.method === 'keyword' && !options.keyword) {
      console.log(chalk.gray('(Requires SEMANTIC_ROUTER_ENABLED=true and API key)'));
    }

    console.log();

    if (result.files.length === 0) {
      console.log(chalk.yellow('No rule files selected.'));
      console.log();
      console.log(chalk.gray('Available keywords:'));
      const keywords = Object.keys(getKeywordMap()).slice(0, 10);
      console.log(chalk.gray(`  ${keywords.join(', ')} ...`));
    } else {
      console.log(chalk.green(`Selected files (${result.files.length}):`));
      for (const file of result.files) {
        console.log(chalk.white(`  • ${file}`));
      }
    }

    console.log();

  } catch (error) {
    spinner.fail('Error occurred');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

export async function testKeywords(): Promise<void> {
  console.log(chalk.cyan('\nRegistered Keywords\n'));

  const keywordMap = getKeywordMap();
  const categories = ['rules', 'commands', 'skills', 'agents', 'contexts'] as const;

  const byCategory: Record<string, string[]> = {};

  for (const [keyword, files] of Object.entries(keywordMap)) {
    for (const category of categories) {
      if (files[category]?.length) {
        if (!byCategory[category]) byCategory[category] = [];
        byCategory[category].push(keyword);
      }
    }
  }

  for (const category of categories) {
    if (byCategory[category]?.length) {
      console.log(chalk.yellow(`${category}/`));
      const unique = [...new Set(byCategory[category])];
      console.log(chalk.gray(`  Keywords: ${unique.join(', ')}`));
      console.log();
    }
  }

  console.log(chalk.gray('─'.repeat(40)));
  if (isSemanticRouterEnabled()) {
    console.log(chalk.green('Semantic Router enabled'));
  } else {
    console.log(chalk.yellow('Semantic Router disabled'));
    console.log(chalk.gray('  Enable: SEMANTIC_ROUTER_ENABLED=true'));
    console.log(chalk.gray('  API key: ANTHROPIC_API_KEY or OPENAI_API_KEY'));
  }
  console.log();
}
