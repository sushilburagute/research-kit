import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function checkSkill(root) {
  const errors = [];
  const skillDir = join(root, 'skills', 'research-technical-article');
  const mainPath = join(skillDir, 'SKILL.md');
  let main;
  try { main = readFileSync(mainPath, 'utf8'); }
  catch { return ['Missing readable skills/research-technical-article/SKILL.md']; }

  const match = main.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) errors.push('SKILL.md must start with YAML frontmatter.');
  else {
    const fields = new Map();
    for (const line of match[1].split(/\r?\n/)) {
      const field = line.match(/^([a-z_-]+):\s+(.+)$/);
      if (!field || fields.has(field[1])) {
        errors.push(`Invalid or duplicate metadata line: ${line}`);
        continue;
      }
      fields.set(field[1], field[2]);
    }
    if (fields.size !== 2 || !fields.has('name') || !fields.has('description'))
      errors.push('Use exactly name and description in skill metadata.');
    if (fields.get('name') !== 'research-technical-article') errors.push('Skill name must match its directory.');
    const description = fields.get('description') ?? '';
    if (!description.trim() || description.length > 1024) errors.push('Description must contain 1-1024 characters.');
  }
  if (main.split(/\r?\n/).length > 500) errors.push('Keep SKILL.md under 500 lines.');

  const required = [
    'references/research-quality.md', 'references/output-contract.md',
    'assets/research-brief.md', 'assets/evidence-ledger.md',
  ];
  for (const path of required) {
    try {
      if (!readFileSync(join(skillDir, path), 'utf8').trim()) errors.push(`Empty required file: ${path}`);
    } catch { errors.push(`Missing readable required file: ${path}`); }
    if (!main.includes(`](${path})`)) errors.push(`SKILL.md must link directly to ${path}`);
  }

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) { errors.push(`Unexpected symlink: ${relative(root, path)}`); continue; }
      if (entry.isDirectory()) { walk(path); continue; }
      if (!entry.name.endsWith('.md')) continue;
      const text = readFileSync(path, 'utf8');
      if (/\b(?:TODO|FIXME)\b/.test(text)) errors.push(`Unresolved authoring marker in ${relative(root, path)}`);
      for (const [, target] of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
        if (/^(?:https?:|mailto:|#)/.test(target)) continue;
        const local = target.split('#')[0];
        const resolved = resolve(dirname(path), local);
        const fromRoot = relative(resolve(root), resolved);
        if (isAbsolute(local) || isAbsolute(fromRoot) || fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) {
          errors.push(`Reference escapes package: ${target}`); continue;
        }
        try { if (!statSync(resolved).isFile()) errors.push(`Reference is not a file: ${target}`); }
        catch { errors.push(`Missing local reference ${target} in ${relative(root, path)}`); }
      }
    }
  }
  walk(root);
  return errors;
}

const invokedPath = process.argv[1] && resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const errors = checkSkill(root);
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else console.log('Skill package checks passed (structure and local references only).');
}
