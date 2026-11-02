import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkSkill } from '../scripts/check-skill.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'research-kit-check-'));
  // Only this verified, newly created test directory is removed in cleanup.
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  cpSync(join(root, 'skills'), join(dir, 'skills'), { recursive: true });
  return dir;
}

test('the shipped package has complete metadata and local references', () => {
  assert.deepEqual(checkSkill(root), []);
});

test('rejects a package with a missing referenced quality guide', t => {
  const dir = fixture(t);
  rmSync(join(dir, 'skills/research-technical-article/references/research-quality.md'));
  assert.ok(checkSkill(dir).some(error => error.includes('Missing readable required file: references/research-quality.md')));
});

test('rejects mismatched metadata and duplicated metadata keys', t => {
  const dir = fixture(t);
  const path = join(dir, 'skills/research-technical-article/SKILL.md');
  const original = readFileSync(path, 'utf8');
  writeFileSync(path, original.replace('name: research-technical-article', 'name: wrong-name\nname: duplicate'));
  const errors = checkSkill(dir);
  assert.ok(errors.some(error => error.includes('Invalid or duplicate metadata')));
  assert.ok(errors.some(error => error.includes('must match its directory')));
});

test('rejects file references escaping the package', t => {
  const dir = fixture(t);
  const path = join(dir, 'skills/research-technical-article/SKILL.md');
  writeFileSync(path, readFileSync(path, 'utf8') + '\n[Outside](../../../private.md)\n');
  assert.ok(checkSkill(dir).some(error => error.includes('Reference escapes package')));
});
