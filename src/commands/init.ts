import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import {
  getTargetDir,
  getConfigPath,
  ensureDir,
  copyFile,
  createSymlink,
  scanDir,
} from '../utils/files.js';
import { cloneRepo, getRepoName, normalizeGitUrl } from '../utils/git.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const require = createRequire(import.meta.url);

interface InitOptions {
  scope: 'project' | 'global';
  rules?: string;
  copy?: boolean;
}

interface DotrulesMeta {
  version: string;
  mode: 'symlink' | 'copy';
  sources: Array<{
    name: string;
    url?: string;
    type: 'builtin' | 'external';
  }>;
  createdAt: string;
  updatedAt: string;
}

export async function init(options: InitOptions): Promise<void> {
  const { scope, rules: rulesUrl, copy: copyMode } = options;
  const targetDir = getTargetDir(scope);
  const aiRulesDir = getConfigPath(scope);
  const configDir = path.join(aiRulesDir, 'config');
  const mode = copyMode ? 'copy' : 'symlink';

  console.log(`\n📦 ai-rules ${scope === 'global' ? 'global' : 'project'} setup\n`);

  // Create .ai-rules directory
  ensureDir(aiRulesDir);
  ensureDir(configDir);

  const sources: DotrulesMeta['sources'] = [];

  // Handle external rules repository
  if (rulesUrl) {
    console.log(`📥 Fetching rules from: ${rulesUrl}`);
    const repoName = getRepoName(rulesUrl);
    const repoPath = path.join(aiRulesDir, 'sources', repoName);

    try {
      cloneRepo(rulesUrl, repoPath);
      sources.push({
        name: repoName,
        url: normalizeGitUrl(rulesUrl),
        type: 'external',
      });
      console.log(`   ✓ Cloned ${repoName}\n`);

      // Copy/link rules from external repo
      const externalConfigDir = path.join(repoPath, 'config');
      if (fs.existsSync(externalConfigDir)) {
        copyConfigToTarget(externalConfigDir, configDir);
      } else {
        // Try root level if no config/ folder
        copyConfigToTarget(repoPath, configDir);
      }
    } catch (error) {
      console.error(`   ✗ Failed to clone: ${error}`);
      process.exit(1);
    }
  } else {
    // Use built-in rules
    const builtinConfigDir = path.join(PACKAGE_ROOT, 'config');
    if (fs.existsSync(builtinConfigDir)) {
      copyConfigToTarget(builtinConfigDir, configDir);
      sources.push({ name: 'builtin', type: 'builtin' });
    }
  }

  // Create symlinks or copy to .claude/
  const claudeDir = path.join(targetDir, '.claude');
  ensureDir(claudeDir);

  const categories = ['rules', 'commands', 'skills', 'agents', 'contexts'];

  for (const category of categories) {
    const sourceDir = path.join(configDir, category);
    const targetPath = path.join(claudeDir, category);

    if (!fs.existsSync(sourceDir)) continue;

    if (mode === 'symlink') {
      createSymlink(sourceDir, targetPath);
      console.log(`   🔗 ${category}/ → symlink`);
    } else {
      // Copy mode
      const files = scanDir(sourceDir);
      for (const [rel, content] of Object.entries(files)) {
        const dest = path.join(targetPath, rel);
        ensureDir(path.dirname(dest));
        fs.writeFileSync(dest, content);
      }
      console.log(`   📄 ${category}/ → copied`);
    }
  }

  // Save metadata
  const meta: DotrulesMeta = {
    version: require(path.join(PACKAGE_ROOT, 'package.json')).version,
    mode,
    sources,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(aiRulesDir, 'meta.json'),
    JSON.stringify(meta, null, 2)
  );

  console.log(`\n✅ Setup complete!`);
  console.log(`   Location: ${claudeDir}`);
  console.log(`   Mode: ${mode}\n`);

  if (mode === 'symlink') {
    console.log('💡 Run "ai-rules update" to sync latest rules\n');
  }
}

function copyConfigToTarget(sourceDir: string, targetDir: string): void {
  const categories = ['rules', 'commands', 'skills', 'agents', 'contexts'];

  for (const category of categories) {
    const srcCat = path.join(sourceDir, category);
    if (!fs.existsSync(srcCat)) continue;

    const destCat = path.join(targetDir, category);
    ensureDir(destCat);

    const files = scanDir(srcCat);
    for (const [rel, content] of Object.entries(files)) {
      const dest = path.join(destCat, rel);
      ensureDir(path.dirname(dest));
      fs.writeFileSync(dest, content);
    }
  }
}
