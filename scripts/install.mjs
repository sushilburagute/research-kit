import { cpSync, existsSync, mkdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requiredSkills } from './check-skill.mjs';

// Install complete sibling folders so the coordinator can resolve its specialists.
const source = fileURLToPath(new URL('../skills/', import.meta.url));
const [project, ...extra] = process.argv.slice(2);
if (!project || extra.length) {
  console.error('Usage: node scripts/install.mjs <project-directory>');
  process.exitCode = 1;
} else {
  const destination = resolve(project, '.agents', 'skills');
  mkdirSync(destination, { recursive: true });
  for (const name of requiredSkills) {
    const target = join(destination, name);
    if (existsSync(target)) {
      console.log(`Skipped existing ${target}`);
      continue;
    }
    const temp = mkdtempSync(join(destination, '.install-'));
    try {
      const staged = join(temp, name);
      cpSync(join(source, name), staged, { recursive: true });
      renameSync(staged, target);
      console.log(`Installed ${target}`);
    } finally {
      if (dirname(temp) === destination) rmSync(temp, { recursive: true, force: true });
    }
  }
}
