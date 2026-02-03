import fs from 'fs';
import path from 'path';
import { detectInstall, scanDir, compareConfigs, ensureDir } from '../utils/files.js';
import { updateRepo } from '../utils/git.js';

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

export async function update(): Promise<void> {
  const install = detectInstall();

  if (!install) {
    console.log('\n❌ No ai-rules installation found.');
    console.log('   Run "ai-rules init" or "ai-rules install" first.\n');
    process.exit(1);
  }

  const { configPath, scope } = install;
  const scopeLabel = scope === 'global' ? 'Global' : 'Project';

  console.log(`\n🔄 Updating ${scopeLabel} rules (${configPath})\n`);

  // Read metadata
  const metaPath = path.join(configPath, 'meta.json');
  if (!fs.existsSync(metaPath)) {
    console.log('❌ No metadata found. Please reinstall.\n');
    process.exit(1);
  }

  const meta: DotrulesMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  console.log(`   Mode: ${meta.mode}`);
  console.log(`   Sources: ${meta.sources.map(s => s.name).join(', ')}\n`);

  // Update external sources
  let hasChanges = false;
  const sourcesDir = path.join(configPath, 'sources');

  for (const source of meta.sources) {
    if (source.type === 'external' && source.url) {
      const repoPath = path.join(sourcesDir, source.name);
      console.log(`   📥 Updating ${source.name}...`);

      if (fs.existsSync(repoPath)) {
        const updated = updateRepo(repoPath);
        if (updated) {
          console.log(`      ✓ Updated`);
          hasChanges = true;
        } else {
          console.log(`      - Already up to date`);
        }
      }
    }
  }

  // Sync config to .claude/
  const configDir = path.join(configPath, 'config');
  const targetDir = scope === 'global'
    ? require('os').homedir()
    : process.cwd();
  const claudeDir = path.join(targetDir, '.claude');

  if (meta.mode === 'copy') {
    // Copy mode: compare and update files
    const sourceFiles = scanDir(configDir);
    const installedFiles = scanDir(claudeDir);
    const diff = compareConfigs(sourceFiles, installedFiles);

    if (diff.added.length === 0 && diff.modified.length === 0 && diff.removed.length === 0) {
      console.log('\n✅ Already up to date!\n');
      return;
    }

    console.log('\n   Changes:');
    if (diff.added.length > 0) console.log(`   + ${diff.added.length} new files`);
    if (diff.modified.length > 0) console.log(`   ~ ${diff.modified.length} modified files`);
    if (diff.removed.length > 0) console.log(`   - ${diff.removed.length} removed files`);

    // Apply changes
    for (const rel of [...diff.added, ...diff.modified]) {
      const src = path.join(configDir, rel);
      const dest = path.join(claudeDir, rel);
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
    }

    for (const rel of diff.removed) {
      const dest = path.join(claudeDir, rel);
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
    }

    hasChanges = true;
  }

  // Update metadata
  meta.updatedAt = new Date().toISOString();
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  if (hasChanges || meta.mode === 'symlink') {
    console.log('\n✅ Update complete!\n');
  } else {
    console.log('\n✅ Already up to date!\n');
  }
}
