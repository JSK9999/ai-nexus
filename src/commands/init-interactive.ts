import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import {
  getTargetDir,
  getConfigPath,
  ensureDir,
  createSymlink,
  scanDir,
} from '../utils/files.js';
import { scanConfigDir, type ConfigFile } from '../utils/config-scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const require = createRequire(import.meta.url);

interface Selections {
  scope: 'project' | 'global';
  tools: string[];
  categories: string[];
  selectedFiles: Record<string, string[]>;
  template: string | null;
  method: 'symlink' | 'copy';
}

interface DotrulesMeta {
  version: string;
  mode: 'symlink' | 'copy';
  tools: string[];
  template: string | null;
  sources: Array<{
    name: string;
    url?: string;
    type: 'builtin' | 'external';
  }>;
  selectedFiles?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATES = [
  { name: '🚀 React/Next.js', value: 'react-nextjs' },
  { name: '🖥️  Node/Express', value: 'node-express' },
  { name: '📝 기본 (최소 설정)', value: 'basic' },
  { name: '⏭️  건너뛰기', value: null },
];

export async function initInteractive(): Promise<void> {
  console.clear();
  printHeader();

  const builtinConfigDir = path.join(PACKAGE_ROOT, 'config');
  const configInfo = scanConfigDir(builtinConfigDir);

  // Step 1: 설치 범위 선택
  const { scope } = await inquirer.prompt<{ scope: 'project' | 'global' }>([
    {
      type: 'list',
      name: 'scope',
      message: '설치 범위를 선택하세요',
      choices: [
        { name: '📁 현재 프로젝트 (.claude/, .codex/)', value: 'project' },
        { name: '🏠 전역 설치 (~/.claude/, ~/.codex/)', value: 'global' },
      ],
    },
  ]);

  // Step 2: 도구 선택
  const { tools } = await inquirer.prompt<{ tools: string[] }>([
    {
      type: 'checkbox',
      name: 'tools',
      message: '설치할 도구를 선택하세요',
      choices: [
        { name: 'Claude Code (.claude/)', value: 'claude', checked: true },
        { name: 'Codex (.codex/)', value: 'codex', checked: false },
      ],
      validate: (input: string[]) => input.length > 0 || '최소 하나 이상 선택해주세요',
    },
  ]);

  // Step 3: 카테고리 선택
  const categoryChoices = configInfo.map(cat => ({
    name: `${cat.name}/ (${cat.label}) - ${cat.files.length}개 파일`,
    value: cat.name,
    checked: ['rules', 'commands'].includes(cat.name),
  }));

  const { categories } = await inquirer.prompt<{ categories: string[] }>([
    {
      type: 'checkbox',
      name: 'categories',
      message: '설치할 항목을 선택하세요 (Space로 선택, Enter로 확인)',
      choices: categoryChoices,
      validate: (input: string[]) => input.length > 0 || '최소 하나 이상 선택해주세요',
    },
  ]);

  // Step 4: 상세 선택 (파일별)
  const { detailSelect } = await inquirer.prompt<{ detailSelect: boolean }>([
    {
      type: 'confirm',
      name: 'detailSelect',
      message: '파일별로 상세 선택하시겠습니까?',
      default: false,
    },
  ]);

  let selectedFiles: Record<string, string[]> = {};

  if (detailSelect) {
    for (const category of categories) {
      const catInfo = configInfo.find(c => c.name === category);
      if (!catInfo) continue;

      console.log(chalk.cyan(`\n📂 ${category}/ (${catInfo.label})`));

      const fileChoices = catInfo.files.map(file => ({
        name: file.description
          ? `${file.name} - ${chalk.gray(file.description)}`
          : file.name,
        value: file.file,
        checked: true,
      }));

      const { files } = await inquirer.prompt<{ files: string[] }>([
        {
          type: 'checkbox',
          name: 'files',
          message: `설치할 파일을 선택하세요`,
          choices: fileChoices,
          pageSize: 15,
        },
      ]);

      selectedFiles[category] = files;
    }
  } else {
    // 전체 선택
    for (const category of categories) {
      const catInfo = configInfo.find(c => c.name === category);
      if (catInfo) {
        selectedFiles[category] = catInfo.files.map(f => f.file);
      }
    }
  }

  // Step 5: 템플릿 선택
  const { template } = await inquirer.prompt<{ template: string | null }>([
    {
      type: 'list',
      name: 'template',
      message: '프로젝트 템플릿을 선택하세요 (CLAUDE.md 생성)',
      choices: TEMPLATES,
    },
  ]);

  // Step 6: 설치 방식 선택
  const { method } = await inquirer.prompt<{ method: 'symlink' | 'copy' }>([
    {
      type: 'list',
      name: 'method',
      message: '설치 방식을 선택하세요',
      choices: [
        {
          name: '🔗 symlink (ai-rules update로 자동 업데이트)',
          value: 'symlink',
        },
        {
          name: '📄 copy (독립적인 복사본)',
          value: 'copy',
        },
      ],
    },
  ]);

  // Step 7: 확인
  console.log(chalk.cyan('\n📋 설치 요약\n'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(`   범위: ${scope === 'global' ? '전역 (~/)' : '프로젝트 (./)'}` );
  console.log(`   도구: ${tools.join(', ')}`);
  console.log(`   방식: ${method === 'symlink' ? 'symlink' : 'copy'}`);
  console.log(`   템플릿: ${template || '없음'}`);
  console.log(`   항목:`);

  let totalFiles = 0;
  for (const category of categories) {
    const count = selectedFiles[category]?.length || 0;
    totalFiles += count;
    console.log(`      • ${category}/ (${count}개)`);
  }
  console.log(chalk.gray('─'.repeat(40)));
  console.log(`   총 ${totalFiles}개 파일\n`);

  const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message: '설치를 진행하시겠습니까?',
      default: true,
    },
  ]);

  if (!confirmed) {
    console.log(chalk.yellow('\n취소되었습니다.\n'));
    return;
  }

  // 설치 진행
  const spinner = ora('설치 중...').start();

  try {
    await install({
      scope,
      tools,
      categories,
      selectedFiles,
      template,
      method,
    });
    spinner.succeed('설치 완료!');
  } catch (error) {
    spinner.fail('설치 실패');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    return;
  }

  // 완료 메시지
  const targetDir = getTargetDir(scope);

  console.log(chalk.green('\n✅ ai-rules 설치 완료!\n'));
  console.log(chalk.gray('─'.repeat(40)));

  if (tools.includes('claude')) {
    console.log(`   Claude: ${path.join(targetDir, '.claude')}`);
  }
  if (tools.includes('codex')) {
    console.log(`   Codex:  ${path.join(targetDir, '.codex')}`);
  }
  console.log(`   모드: ${method}`);
  if (template) {
    console.log(`   템플릿: ${template}`);
  }
  console.log(chalk.gray('─'.repeat(40)));

  if (method === 'symlink') {
    console.log(chalk.cyan('\n💡 팁: ai-rules update로 최신 규칙을 동기화하세요\n'));
  }
}

async function install(selections: Selections): Promise<void> {
  const { scope, tools, categories, selectedFiles, template, method } = selections;
  const targetDir = getTargetDir(scope);
  const aiRulesDir = getConfigPath(scope);
  const configDir = path.join(aiRulesDir, 'config');

  // Create directories
  ensureDir(aiRulesDir);
  ensureDir(configDir);

  const builtinConfigDir = path.join(PACKAGE_ROOT, 'config');

  // Copy selected files to .ai-rules/config/
  for (const category of categories) {
    const srcCatDir = path.join(builtinConfigDir, category);
    const destCatDir = path.join(configDir, category);

    if (!fs.existsSync(srcCatDir)) continue;

    ensureDir(destCatDir);

    const files = selectedFiles[category] || [];
    for (const file of files) {
      const srcFile = path.join(srcCatDir, file);
      const destFile = path.join(destCatDir, file);

      if (fs.existsSync(srcFile)) {
        ensureDir(path.dirname(destFile));
        fs.copyFileSync(srcFile, destFile);
      }
    }
  }

  // Install for each selected tool
  for (const tool of tools) {
    const toolDir = path.join(targetDir, tool === 'claude' ? '.claude' : '.codex');
    ensureDir(toolDir);

    // Create symlinks or copy to tool directory
    for (const category of categories) {
      const sourceDir = path.join(configDir, category);
      const targetPath = path.join(toolDir, category);

      if (!fs.existsSync(sourceDir)) continue;

      if (method === 'symlink') {
        createSymlink(sourceDir, targetPath);
      } else {
        // Copy mode
        const files = scanDir(sourceDir);
        for (const [rel, content] of Object.entries(files)) {
          const dest = path.join(targetPath, rel);
          ensureDir(path.dirname(dest));
          fs.writeFileSync(dest, content);
        }
      }
    }

    // Copy template CLAUDE.md or AGENTS.md
    if (template) {
      const templateDir = path.join(builtinConfigDir, 'templates', template);

      if (tool === 'claude') {
        const templateFile = path.join(templateDir, 'CLAUDE.md');
        if (fs.existsSync(templateFile)) {
          fs.copyFileSync(templateFile, path.join(toolDir, 'CLAUDE.md'));
        }
      }
    }

    // Copy AGENTS.md for Codex
    if (tool === 'codex') {
      const agentsFile = path.join(builtinConfigDir, 'codex', 'AGENTS.md');
      if (fs.existsSync(agentsFile)) {
        fs.copyFileSync(agentsFile, path.join(toolDir, 'AGENTS.md'));
      }
    }
  }

  // Save metadata
  const meta: DotrulesMeta = {
    version: require(path.join(PACKAGE_ROOT, 'package.json')).version,
    mode: method,
    tools,
    template,
    sources: [{ name: 'builtin', type: 'builtin' }],
    selectedFiles,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(aiRulesDir, 'meta.json'),
    JSON.stringify(meta, null, 2)
  );
}

function printHeader(): void {
  console.log(chalk.cyan(`
   ╭─────────────────────────────────╮
   │                                 │
   │   ${chalk.bold('ai-rules')} 설치 마법사           │
   │                                 │
   ╰─────────────────────────────────╯
`));
}
