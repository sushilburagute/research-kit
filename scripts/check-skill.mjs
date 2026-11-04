import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const requiredSkills = [
  'portfolio-blog-workflow', 'understand-portfolio', 'research-technical-article',
  'compose-technical-article', 'build-article-artifacts', 'integrate-portfolio-article',
  'review-portfolio-article', 'optimize-article-seo', 'verify-portfolio-article',
];

const researchFiles = [
  'references/research-quality.md', 'references/output-contract.md',
  'assets/research-brief.md', 'assets/evidence-ledger.md',
];
const packageEntries = ['README.md', 'docs', 'evals', 'skills', 'scripts', 'tests'];
const ignoredNames = new Set(['.git', 'node_modules']);

function inside(boundary, path) {
  const rel = relative(boundary, path);
  return !isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + sep);
}

// Inspect each ancestor before reading it. stat/realpath alone would follow a
// link before it could be rejected, including links used as required resources.
function inspect(boundary, path) {
  if (!inside(boundary, path)) throw new Error('Path escapes package');
  const parts = relative(boundary, path).split(sep).filter(Boolean);
  let current = boundary;
  let info = lstatSync(current);
  if (info.isSymbolicLink()) throw new Error('Unexpected symlink');
  for (const part of parts) {
    current = join(current, part);
    info = lstatSync(current);
    if (info.isSymbolicLink()) throw new Error('Unexpected symlink');
  }
  return info;
}

export function checkSkill(root) {
  root = resolve(root);
  const errors = [];
  const label = path => relative(root, path).split(sep).join('/');

  function readable(path, description) {
    try {
      if (!inspect(root, path).isFile()) throw new Error('Not a file');
      return readFileSync(path, 'utf8');
    } catch (error) {
      errors.push(error.message === 'Unexpected symlink'
        ? 'Unexpected symlink in ' + label(path) : 'Missing readable ' + description);
      return null;
    }
  }

  function checkMetadata(main, skillDir) {
    const where = label(skillDir) + '/SKILL.md';
    const match = main.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) errors.push(where + ' must start with YAML frontmatter.');
    else {
      // Deliberately a narrow package convention, not a general YAML parser.
      const fields = new Map();
      for (const line of match[1].split(/\r?\n/)) {
        const field = line.match(/^([a-z_-]+):\s+(.+)$/);
        if (!field || fields.has(field[1])) {
          errors.push('Invalid or duplicate metadata line in ' + where + ': ' + line);
          continue;
        }
        fields.set(field[1], field[2]);
      }
      if (fields.size !== 2 || !fields.has('name') || !fields.has('description'))
        errors.push('Use exactly name and description in ' + where + ' metadata.');
      if (fields.get('name') !== basename(skillDir))
        errors.push('Skill name must match its directory: ' + where);
      const name = fields.get('name') ?? '';
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64)
        errors.push('Skill name must use 1-64 lowercase letters, digits, and single hyphens: ' + where);
      const description = fields.get('description') ?? '';
      if (!description.trim() || description.length > 1024)
        errors.push('Description must contain 1-1024 characters: ' + where);
    }
    if (main.split(/\r?\n/).length > 500) errors.push('Keep ' + where + ' under 500 lines.');
  }

  function checkMarkdown(path, boundary) {
    const text = readable(path, label(path));
    if (text === null) return;
    if (/\b(?:TODO|FIXME)\b/.test(text)) errors.push('Unresolved authoring marker in ' + label(path));
    // Inline Markdown links; full CommonMark parsing and heading anchors are
    // intentionally outside this dependency-free structural check.
    for (const [, angleTarget, plainTarget] of text.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g)) {
      const target = angleTarget ?? plainTarget;
      if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
      let local;
      try { local = decodeURIComponent(target.split('#')[0]); }
      catch { errors.push('Invalid local reference ' + target + ' in ' + label(path)); continue; }
      const resolved = resolve(dirname(path), local);
      if (isAbsolute(local) || !inside(boundary, resolved)) {
        errors.push('Reference escapes ' + (boundary === root ? 'package' : 'skill') + ': ' + target + ' in ' + label(path));
        continue;
      }
      try {
        if (!inspect(root, resolved).isFile()) errors.push('Reference is not a file: ' + target + ' in ' + label(path));
      } catch (error) {
        errors.push(error.message === 'Unexpected symlink'
          ? 'Unexpected symlink in reference ' + target + ' in ' + label(path)
          : 'Missing local reference ' + target + ' in ' + label(path));
      }
    }
  }

  function walk(path, boundary = root) {
    let info;
    try { info = inspect(root, path); }
    catch (error) {
      errors.push(error.message === 'Unexpected symlink'
        ? 'Unexpected symlink: ' + label(path) : 'Unreadable package entry: ' + label(path));
      return;
    }
    if (info.isDirectory()) {
      let entries;
      try { entries = readdirSync(path, { withFileTypes: true }); }
      catch { errors.push('Unreadable package directory: ' + label(path)); return; }
      for (const entry of entries) {
        if (!ignoredNames.has(entry.name)) walk(join(path, entry.name), boundary);
      }
    } else if (info.isFile() && path.endsWith('.md')) checkMarkdown(path, boundary);
  }

  const skillsDir = join(root, 'skills');
  let skillNames = [];
  try {
    if (!inspect(root, skillsDir).isDirectory()) throw new Error('Not a directory');
    skillNames = readdirSync(skillsDir);
  } catch (error) {
    errors.push(error.message === 'Unexpected symlink' ? 'Unexpected symlink: skills' : 'Missing readable skills directory');
  }
  for (const name of requiredSkills) {
    if (!skillNames.includes(name)) errors.push('Missing required skill: ' + name);
  }
  for (const name of skillNames) {
    const skillDir = join(skillsDir, name);
    let info;
    try { info = inspect(root, skillDir); }
    catch { errors.push('Unexpected or unreadable skill directory: ' + label(skillDir)); continue; }
    if (!info.isDirectory()) { errors.push('Skill entry must be a directory: ' + label(skillDir)); continue; }
    const main = readable(join(skillDir, 'SKILL.md'), label(skillDir) + '/SKILL.md');
    if (main !== null) {
      checkMetadata(main, skillDir);
      if (name === 'research-technical-article') {
        for (const path of researchFiles) {
          const content = readable(join(skillDir, path), 'required file: ' + path);
          if (content !== null && !content.trim()) errors.push('Empty required file: ' + path);
          if (!main.includes('](' + path + ')')) errors.push('SKILL.md must link directly to ' + path);
        }
      }
    }
    walk(skillDir, skillDir);
  }
  // Only maintained package roots are scanned. Article runs, private inputs,
  // local configuration, and Git internals elsewhere in the checkout are not.
  for (const entry of packageEntries.filter(entry => entry !== 'skills')) {
    const path = join(root, entry);
    try { lstatSync(path); } catch { continue; }
    walk(path);
  }
  return errors;
}

const invokedPath = process.argv[1] && resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  const errors = checkSkill(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else console.log('Skill package checks passed (structure and local references only).');
}
