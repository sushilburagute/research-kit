import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkSkill, requiredSkills } from '../scripts/check-skill.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'research-kit-check-'));
  // Cleanup only this newly allocated fixture, never a caller-supplied path.
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  cpSync(join(root, 'skills'), join(dir, 'skills'), { recursive: true });
  return dir;
}

function append(path, text) {
  writeFileSync(path, readFileSync(path, 'utf8') + text);
}

function makeLink(t, target, path, type = 'file') {
  try { symlinkSync(target, path, type); return true; }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
      t.skip('Creating symlinks is unavailable for this account');
      return false;
    }
    throw error;
  }
}

test('the shipped package has complete metadata and local references', () => {
  assert.deepEqual(checkSkill(root), []);
});

test('rejects a missing skill entrypoint and missing required skill directory', t => {
  const dir = fixture(t);
  const name = requiredSkills.find(name => name !== 'research-technical-article');
  rmSync(join(dir, 'skills', name, 'SKILL.md'));
  assert.ok(checkSkill(dir).some(error => error.includes('skills/' + name + '/SKILL.md')));
  rmSync(join(dir, 'skills', name), { recursive: true });
  assert.ok(checkSkill(dir).some(error => error.includes('Missing required skill: ' + name)));
});

test('rejects a package with a missing referenced quality guide', t => {
  const dir = fixture(t);
  rmSync(join(dir, 'skills/research-technical-article/references/research-quality.md'));
  assert.ok(checkSkill(dir).some(error => error.includes('Missing readable required file: references/research-quality.md')));
});

test('validates metadata in every skill, including newly added skills', t => {
  const dir = fixture(t);
  const name = 'additional-skill';
  mkdirSync(join(dir, 'skills', name));
  writeFileSync(join(dir, 'skills', name, 'SKILL.md'), '---\nname: wrong-name\nname: duplicate\ndescription: Useful work.\n---\n');
  const errors = checkSkill(dir);
  assert.ok(errors.some(error => error.includes('Invalid or duplicate metadata')));
  assert.ok(errors.some(error => error.includes('must match its directory')));
});

test('rejects broken local links in nested supporting files', t => {
  const dir = fixture(t);
  const path = join(dir, 'skills/research-technical-article/references/research-quality.md');
  append(path, '\n[Missing](missing.md)\n');
  assert.ok(checkSkill(dir).some(error => error.includes('Missing local reference missing.md')));
});

test('rejects references escaping a skill even when they stay inside the repository', t => {
  const dir = fixture(t);
  const path = join(dir, 'skills/research-technical-article/SKILL.md');
  append(path, '\n[Sibling](../understand-portfolio/SKILL.md)\n[Outside](../../../private.md)\n');
  const errors = checkSkill(dir);
  assert.ok(errors.filter(error => error.includes('Reference escapes skill')).length >= 2);
});

test('rejects encoded path traversal and accepts local filenames with spaces', t => {
  const dir = fixture(t);
  const skillDir = join(dir, 'skills/research-technical-article');
  writeFileSync(join(skillDir, 'with spaces.md'), 'Useful details.\n');
  append(join(skillDir, 'SKILL.md'), '\n[Details](<with spaces.md>)\n');
  assert.deepEqual(checkSkill(dir), []);
  append(join(skillDir, 'SKILL.md'), '\n[Outside](%2e%2e/%2e%2e/private.md)\n');
  assert.ok(checkSkill(dir).some(error => error.includes('Reference escapes skill')));
});

test('ignores unrelated article runs, private material, and Git internals', t => {
  const dir = fixture(t);
  for (const name of ['article-runs', 'private', '.git', 'node_modules']) {
    mkdirSync(join(dir, name));
    writeFileSync(join(dir, name, 'unrelated.md'), 'TODO [Broken](missing.md)\n');
  }
  assert.deepEqual(checkSkill(dir), []);
});

test('rejects authoring markers in maintained documentation', t => {
  const dir = fixture(t);
  mkdirSync(join(dir, 'docs'));
  writeFileSync(join(dir, 'docs', 'unfinished.md'), 'FIXME\n');
  assert.ok(checkSkill(dir).some(error => error.includes('Unresolved authoring marker in docs/unfinished.md')));
});

test('rejects a required resource reached through a directory symlink', t => {
  const dir = fixture(t);
  const skillDir = join(dir, 'skills/research-technical-article');
  const outside = join(dir, 'private');
  mkdirSync(outside);
  writeFileSync(join(outside, 'research-quality.md'), 'PRIVATE SENTINEL TODO\n');
  rmSync(join(skillDir, 'references'), { recursive: true });
  if (!makeLink(t, outside, join(skillDir, 'references'), process.platform === 'win32' ? 'junction' : 'dir')) return;
  const errors = checkSkill(dir);
  assert.ok(errors.some(error => error.includes('symlink')));
  assert.ok(errors.every(error => !error.includes('PRIVATE SENTINEL')));
  assert.ok(errors.every(error => !error.includes('Unresolved authoring marker')));
});

test('rejects a symlinked skill entrypoint before reading its contents', t => {
  const dir = fixture(t);
  const path = join(dir, 'skills/research-technical-article/SKILL.md');
  const outside = join(dir, 'private.md');
  writeFileSync(outside, 'PRIVATE SENTINEL TODO\n');
  rmSync(path);
  if (!makeLink(t, outside, path)) return;
  const errors = checkSkill(dir);
  assert.ok(errors.some(error => error.includes('symlink')));
  assert.ok(errors.every(error => !error.includes('PRIVATE SENTINEL')));
  assert.ok(errors.every(error => !error.includes('Unresolved authoring marker')));
});

test('missing package directories produce diagnostics rather than exceptions', t => {
  const dir = fixture(t);
  rmSync(join(dir, 'skills'), { recursive: true });
  assert.ok(checkSkill(dir).some(error => error.includes('Missing readable skills directory')));
});
