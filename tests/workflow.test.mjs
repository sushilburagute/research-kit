import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  completeStage, dispatchStage, failStage, initWorkflow,
  invalidateStage, skipArtifacts, statusWorkflow,
} from '../skills/portfolio-blog-workflow/scripts/workflow.mjs';

const runtime = resolve(dirname(fileURLToPath(import.meta.url)), '../skills/portfolio-blog-workflow/scripts/workflow.mjs');
const brief = { title: 'Cache trade-offs', description: 'Explore when cache invalidation outweighs read savings.', reader: 'Application engineers' };
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const write = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n');

function fixture(t, extra = {}) {
  const holder = mkdtempSync(join(tmpdir(), 'research-kit-workflow-'));
  // The only recursive cleanup target is this verified newly allocated directory.
  assert.equal(dirname(holder), resolve(tmpdir()));
  t.after(() => rmSync(holder, { recursive: true, force: true }));
  const run = join(holder, 'run');
  initWorkflow(run, { ...brief, ...extra });
  return { holder, run };
}

function resultFor(packet, overrides = {}) {
  for (const path of packet.requiredOutputs) writeFileSync(join(packet.outputDir, path), 'Synthetic ' + packet.stage + ' output: ' + path + '\n');
  return {
    assignmentId: packet.assignmentId, revision: packet.revision, outcome: 'complete',
    summary: 'Synthetic stage outputs for coordinator behavior testing only.',
    outputs: [...packet.requiredOutputs], unresolved: [],
    checks: [{ command: 'Synthetic output fixture', status: 'passed', details: 'Files created; content quality is not evaluated.' }],
    ...(packet.stage === 'review' ? { reviewVerdict: 'ready-for-publication', verification: 'independent', findings: [] } : {}),
    ...overrides,
  };
}

function finish(run, name, overrides = {}) {
  const packet = dispatchStage(run, name);
  completeStage(run, name, resultFor(packet, overrides));
  return packet;
}

function throughCompose(run) {
  finish(run, 'context');
  finish(run, 'research');
  finish(run, 'compose');
}

test('context and research run in parallel; composition waits for both handoffs', t => {
  const { run } = fixture(t);
  assert.deepEqual(statusWorkflow(run).ready, ['context', 'research']);
  const context = dispatchStage(run, 'context');
  const research = dispatchStage(run, 'research');
  assert.notEqual(context.assignmentId, research.assignmentId);
  assert.deepEqual(statusWorkflow(run).ready, []);
  assert.throws(() => dispatchStage(run, 'compose'), /unfinished dependencies/);
  completeStage(run, 'context', resultFor(context));
  assert.throws(() => dispatchStage(run, 'compose'), /unfinished dependencies/);
  completeStage(run, 'research', resultFor(research));
  assert.deepEqual(statusWorkflow(run).ready, ['compose']);
  const composition = dispatchStage(run, 'compose');
  assert.ok(composition.inputs.some(input => input.path.endsWith('writing-profile.md')));
  assert.ok(composition.inputs.some(input => input.path.endsWith('evidence-ledger.md')));
  assert.equal(statusWorkflow(run).stages.compose.status, 'running');
});

test('fresh article runs snapshot shared preferences independently and retain local overrides', t => {
  const { holder } = fixture(t);
  const profilePath = join(holder, 'writing-profile.md');
  const cli = (...args) => JSON.parse(execFileSync(process.execPath, [runtime, ...args], { encoding: 'utf8' }));
  const input = join(holder, 'article-input.json');
  const first = join(holder, 'first');
  const second = join(holder, 'second');
  writeFileSync(profilePath, 'Prefer detailed walkthroughs.');
  write(input, { ...brief, profilePath, length: '500 words', tone: 'Conversational' });
  cli('init', first, '--brief', input);
  writeFileSync(profilePath, 'Prefer concise posts.');
  write(input, { ...brief, profilePath });
  cli('init', second, '--brief', input);
  for (const [run, expected] of [[first, 'Prefer detailed walkthroughs.'], [second, 'Prefer concise posts.']]) {
    const packet = cli('dispatch', run, 'context');
    const snapshot = packet.inputs.find(file => file.path === join(run, 'writing-profile.md'));
    assert.equal(readFileSync(snapshot.path, 'utf8'), expected);
    assert.deepEqual(packet.allowedWrites, [packet.outputDir]);
  }
  assert.equal(read(join(first, 'brief.json')).length, '500 words');
  assert.equal(read(join(second, 'brief.json')).tone, undefined);
  assert.equal(cli('status', first).outcome, 'in-progress');
  writeFileSync(join(first, 'writing-profile.md'), 'Changed after dispatch.');
  assert.equal(cli('status', first).outcome, 'stale');
});

test('invalid profile input leaves the requested run directory available for retry', t => {
  const { holder } = fixture(t);
  const run = join(holder, 'next');
  const profilePath = join(holder, 'missing.md');
  assert.throws(() => initWorkflow(run, { ...brief, profilePath }), /ENOENT/);
  writeFileSync(profilePath, '\n');
  assert.throws(() => initWorkflow(run, { ...brief, profilePath }), /empty/);
  assert.equal(existsSync(run), false);
});

test('init preserves existing runs and rejects incomplete briefs or ungrounded authorization', t => {
  const { holder, run } = fixture(t);
  const original = readFileSync(join(run, 'workflow.json'), 'utf8');
  assert.throws(() => initWorkflow(run, brief), /already exists/);
  assert.equal(readFileSync(join(run, 'workflow.json'), 'utf8'), original);
  assert.throws(() => initWorkflow(join(holder, 'bad'), { title: 'Only title' }), /description or talking points/);
  assert.equal(existsSync(join(holder, 'bad')), false);
  assert.throws(() => initWorkflow(join(holder, 'bad-auth'), {
    ...brief, authorization: { externalActions: ['push'] },
  }), /authorization basis/);
});

test('rejects wrong assignments, revisions, and result outcomes without completing a stage', t => {
  const { run } = fixture(t);
  const packet = dispatchStage(run, 'context');
  const result = resultFor(packet);
  for (const override of [
    { assignmentId: 'not-this-agent' }, { revision: packet.revision + 1 }, { outcome: 'success' },
  ]) {
    assert.throws(() => completeStage(run, 'context', { ...result, ...override }), /mismatched|Invalid result outcome/);
    assert.equal(statusWorkflow(run).stages.context.status, 'running');
  }
  completeStage(run, 'context', result);
  assert.throws(() => completeStage(run, 'context', result), /not running/);
});

test('requires nonempty existing outputs and rejects missing or duplicate output declarations', t => {
  const { run } = fixture(t);
  const packet = dispatchStage(run, 'context');
  const result = resultFor(packet);
  assert.throws(() => completeStage(run, 'context', { ...result, outputs: [] }), /Missing required outputs/);
  assert.throws(() => completeStage(run, 'context', { ...result, outputs: [...result.outputs, result.outputs[0]] }), /unique relative paths/);
  rmSync(join(packet.outputDir, result.outputs[0]));
  assert.throws(() => completeStage(run, 'context', result), /ENOENT|output file/);
  writeFileSync(join(packet.outputDir, result.outputs[0]), '');
  assert.throws(() => completeStage(run, 'context', result), /must not be empty/);
  writeFileSync(join(packet.outputDir, result.outputs[0]), 'Restored synthetic output.\n');
  completeStage(run, 'context', result);
});

test('result files cannot escape an assignment using POSIX, Windows, or mixed-separator syntax', t => {
  const { run, holder } = fixture(t);
  const packet = dispatchStage(run, 'context');
  const result = resultFor(packet);
  for (const path of ['../escape.md', '/tmp/escape.md', 'C:\\private\\escape.md', '..\\escape.md', 'nested/../../escape.md', 'nested//escape.md', './escape.md']) {
    assert.throws(() => completeStage(run, 'context', { ...result, outputs: [...result.outputs, path] }), /relative run path|Invalid run path|escapes run/);
  }
  assert.equal(existsSync(join(holder, 'escape.md')), false);
  assert.equal(statusWorkflow(run).stages.context.status, 'running');
});

test('rejects unknown check statuses and complete results with failed, unrun, or unresolved work', t => {
  const { run } = fixture(t);
  const packet = dispatchStage(run, 'research');
  const result = resultFor(packet);
  assert.throws(() => completeStage(run, 'research', { ...result, checks: [{ command: 'audit', status: 'assumed', details: 'Not observed' }] }), /requires checks/);
  for (const status of ['failed', 'not-run']) {
    assert.throws(() => completeStage(run, 'research', { ...result, checks: [{ command: 'audit', status, details: 'Observed limitation' }] }), /failed or unrun/);
  }
  assert.throws(() => completeStage(run, 'research', { ...result, unresolved: ['Essential source unavailable'] }), /limited or needs-author/);
  completeStage(run, 'research', { ...result, outcome: 'limited', unresolved: ['External reading unavailable'], checks: [{ command: 'source reading', status: 'not-run', details: 'Network unavailable' }] });
  assert.equal(statusWorkflow(run).stages.research.status, 'limited');
});

test('limited work propagates through a full run and never becomes ready-for-author', t => {
  const { run } = fixture(t);
  finish(run, 'context');
  finish(run, 'research', { outcome: 'limited', unresolved: ['One nonessential example remains unread.'] });
  finish(run, 'compose');
  skipArtifacts(run, 'A prose mechanism is sufficient.');
  finish(run, 'integrate');
  finish(run, 'review');
  const status = statusWorkflow(run);
  assert.equal(status.outcome, 'limited');
  assert.deepEqual(status.ready, []);
});

test('a full run with artifacts and a ready review finishes at author handoff without publishing', t => {
  const { run } = fixture(t);
  for (const name of ['context', 'research', 'compose', 'artifacts', 'integrate', 'review']) finish(run, name);
  const status = statusWorkflow(run);
  assert.equal(status.outcome, 'ready-for-author');
  assert.equal(status.stages.artifacts.status, 'complete');
  assert.equal(status.stages.review.reviewVerdict, 'ready-for-publication');
  assert.deepEqual(status.ready, []);
  assert.deepEqual(read(join(run, 'brief.json')).authorization.externalActions, []);
});

test('review requires an explicit article verdict and cannot hide blocking findings behind completion', t => {
  const { run } = fixture(t);
  throughCompose(run);
  skipArtifacts(run, 'No demo required.');
  finish(run, 'integrate');
  const packet = dispatchStage(run, 'review');
  const result = resultFor(packet);
  const { reviewVerdict, findings, ...withoutVerdict } = result;
  assert.throws(() => completeStage(run, 'review', withoutVerdict), /review|verdict|findings/i);
  assert.throws(() => completeStage(run, 'review', { ...result, reviewVerdict: 'all-good' }), /review|verdict/i);
  const blocker = { id: 'R1', severity: 'blocking', stage: 'research', summary: 'An essential article claim lacks readable evidence.' };
  assert.throws(() => completeStage(run, 'review', { ...result, findings: [blocker] }), /blocking|verdict/i);
  assert.throws(() => completeStage(run, 'review', { ...result, reviewVerdict: 'needs-changes' }), /blocking|finding/i);
  completeStage(run, 'review', { ...result, reviewVerdict: 'needs-changes', findings: [blocker] });
  const status = statusWorkflow(run);
  assert.equal(status.stages.review.status, 'complete', 'review work can finish even when the article needs changes');
  assert.equal(status.stages.review.reviewVerdict, 'needs-changes');
  assert.equal(status.outcome, 'needs-changes');
  assert.deepEqual(status.stages.review.findings, [blocker]);
});

test('limited review remains limited even when all other stages completed', t => {
  const { run } = fixture(t);
  throughCompose(run);
  skipArtifacts(run, 'No artifact needed.');
  finish(run, 'integrate');
  finish(run, 'review', { reviewVerdict: 'limited-review', findings: [] });
  assert.equal(statusWorkflow(run).outcome, 'limited');
});

test('needs-author blocks dependent stages until the owning stage is revised', t => {
  const { run } = fixture(t);
  finish(run, 'research');
  const packet = dispatchStage(run, 'context');
  completeStage(run, 'context', resultFor(packet, {
    outcome: 'needs-author', outputs: [], unresolved: ['Portfolio cannot be accessed.'],
    checks: [{ command: 'read selected portfolio', status: 'failed', details: 'Access denied' }],
  }));
  assert.equal(statusWorkflow(run).outcome, 'needs-author');
  assert.throws(() => dispatchStage(run, 'compose'), /unfinished dependencies/);
  assert.throws(() => dispatchStage(run, 'context'), /invalidate/);
  invalidateStage(run, 'context', 'Author supplied readable selected files.');
  finish(run, 'context');
  assert.deepEqual(statusWorkflow(run).ready, ['compose']);
});

test('artifacts can be skipped only after context and composition, with a recorded reason', t => {
  const { run } = fixture(t);
  assert.throws(() => skipArtifacts(run, 'No demo needed.'), /Complete context and composition/);
  assert.throws(() => skipArtifacts(run, ''), /editorial reason/);
  throughCompose(run);
  assert.deepEqual(skipArtifacts(run, 'A static explanation is clearer.'), { stage: 'artifacts', status: 'skipped', reason: 'A static explanation is clearer.' });
  assert.equal(statusWorkflow(run).stages.artifacts.status, 'skipped');
  assert.throws(() => skipArtifacts(run, 'Again'), /Only pending artifacts/);
  assert.deepEqual(statusWorkflow(run).ready, ['integrate']);
  assert.ok(read(join(run, 'workflow.json')).history.some(entry => entry.event === 'skipped' && entry.reason));
});

test('only integration receives explicit repository write paths; otherwise all stages are workspace-only', t => {
  const { run, holder } = fixture(t);
  throughCompose(run);
  skipArtifacts(run, 'No artifact needed.');
  const integrate = dispatchStage(run, 'integrate');
  assert.deepEqual(integrate.allowedWrites, [integrate.outputDir]);
  failStage(run, 'integrate', integrate.assignmentId, 'Test alternate authorization run.');

  const authorizedRun = join(holder, 'authorized');
  const contentPath = join(holder, 'portfolio', 'content');
  initWorkflow(authorizedRun, {
    ...brief, authorization: { repositoryWritePaths: [contentPath], externalActions: ['commit', 'open-pr'], basis: 'Synthetic explicit authorization for this fixture.' },
  });
  const context = dispatchStage(authorizedRun, 'context');
  assert.deepEqual(context.allowedWrites, [context.outputDir]);
  completeStage(authorizedRun, 'context', resultFor(context));
  finish(authorizedRun, 'research');
  const compose = finish(authorizedRun, 'compose');
  assert.deepEqual(compose.allowedWrites, [compose.outputDir]);
  skipArtifacts(authorizedRun, 'No demo needed.');
  const authorized = dispatchStage(authorizedRun, 'integrate');
  assert.deepEqual(authorized.allowedWrites, [authorized.outputDir, contentPath]);
  assert.equal(existsSync(contentPath), false, 'dispatch does not write to the portfolio itself');
});

test('failure and retry produce new assignment IDs and directories while retaining earlier artifacts', t => {
  const { run } = fixture(t);
  const first = dispatchStage(run, 'context');
  const firstResult = resultFor(first);
  assert.throws(() => failStage(run, 'context', 'wrong-agent', 'Failure'), /does not match/);
  failStage(run, 'context', first.assignmentId, 'Temporary access failure.');
  assert.deepEqual(statusWorkflow(run).ready, ['context', 'research']);
  const retry = dispatchStage(run, 'context');
  assert.notEqual(first.assignmentId, retry.assignmentId);
  assert.notEqual(first.outputDir, retry.outputDir);
  assert.ok(existsSync(join(first.outputDir, first.requiredOutputs[0])));
  assert.throws(() => completeStage(run, 'context', firstResult), /mismatched/);
  completeStage(run, 'context', resultFor(retry));
  const history = read(join(run, 'workflow.json')).history;
  assert.ok(history.some(entry => entry.event === 'failed' && entry.assignmentId === first.assignmentId));
});

test('invalidation cancels dependent active work, increments revisions, and preserves previous results', t => {
  const { run } = fixture(t);
  throughCompose(run);
  const artifact = dispatchStage(run, 'artifacts');
  const oldResult = resultFor(artifact);
  const previous = read(join(run, 'workflow.json'));
  const result = invalidateStage(run, 'context', 'Repository components changed.');
  assert.deepEqual(result.affected, ['context', 'compose', 'artifacts', 'integrate', 'review']);
  assert.deepEqual(result.cancelled, [artifact.assignmentId]);
  const state = read(join(run, 'workflow.json'));
  assert.equal(state.stages.research.status, 'complete');
  for (const name of result.affected) {
    assert.equal(state.stages[name].revision, previous.stages[name].revision + 1);
    assert.equal(state.stages[name].status, 'pending');
  }
  assert.ok(state.history.at(-1).previous.context.result.summary);
  assert.ok(existsSync(join(artifact.outputDir, artifact.requiredOutputs[0])));
  assert.throws(() => completeStage(run, 'artifacts', oldResult), /not running/);
  const newContext = dispatchStage(run, 'context');
  assert.equal(newContext.revision, 2);
});

test('research revisions receive the earlier ledger as read-only historical input and detect drift', t => {
  const { run } = fixture(t);
  const first = dispatchStage(run, 'research');
  const result = resultFor(first);
  const ledgerPath = join(first.outputDir, 'evidence-ledger.md');
  writeFileSync(ledgerPath, '# Sources\nS1: supplied source\n# Claims\nC1: bounded finding\n');
  completeStage(run, 'research', result);
  invalidateStage(run, 'research', 'Add contrary evidence without renumbering prior claims.');
  const revised = dispatchStage(run, 'research');
  const previous = revised.previousOutputs.find(output => output.assignmentId === first.assignmentId);
  assert.equal(previous.revision, first.revision);
  assert.equal(previous.outcome, 'complete');
  assert.equal(previous.outputDir, first.outputDir);
  assert.ok(previous.files.some(file => file.path === ledgerPath && file.sha256));
  assert.deepEqual(previous.unavailable, []);
  assert.ok(revised.inputs.some(input => input.path === ledgerPath && input.role === 'historical'));
  assert.ok(revised.inputs.some(input => input.path === join(run, 'brief.json') && input.role === 'current'));
  assert.deepEqual(revised.allowedWrites, [revised.outputDir]);
  writeFileSync(ledgerPath, 'Unexpected edit to historical evidence.\n');
  assert.equal(statusWorkflow(run).outcome, 'stale');
  assert.throws(() => completeStage(run, 'research', resultFor(revised)), /Stale or missing/);
});

test('composition revisions receive prior adopted decisions instead of starting a fresh decision record', t => {
  const { run } = fixture(t);
  finish(run, 'context');
  finish(run, 'research');
  const first = dispatchStage(run, 'compose');
  const result = resultFor(first);
  const decisionPath = join(first.outputDir, 'decisions.md');
  writeFileSync(decisionPath, '# Decisions\nD1 | adopted | preserve the qualified thesis\n');
  completeStage(run, 'compose', result);
  invalidateStage(run, 'compose', 'Revise the opening while retaining adopted decisions.');
  const revised = dispatchStage(run, 'compose');
  assert.ok(revised.previousOutputs.some(output => output.assignmentId === first.assignmentId && output.files.some(file => file.path === decisionPath)));
  assert.ok(revised.inputs.some(input => input.path === decisionPath && input.role === 'historical'));
  assert.equal(revised.revisionContext.reason, 'Revise the opening while retaining adopted decisions.');
  assert.equal(revised.revisionContext.requestedStage, 'compose');
  assert.ok(!revised.allowedWrites.includes(first.outputDir));
});

test('review corrections and their report reach the responsible researcher on redispatch', t => {
  const { run } = fixture(t);
  throughCompose(run);
  skipArtifacts(run, 'No demo required.');
  finish(run, 'integrate');
  const review = dispatchStage(run, 'review');
  const finding = { id: 'R1', severity: 'blocking', stage: 'research', summary: 'C1 exceeds the scope of S1.' };
  completeStage(run, 'review', resultFor(review, { reviewVerdict: 'needs-changes', findings: [finding] }));
  const reason = 'Narrow C1 to the studied workload and update affected passages.';
  invalidateStage(run, 'research', reason);
  const revised = dispatchStage(run, 'research');
  const report = join(review.outputDir, 'review-report.md');
  assert.equal(revised.revisionContext.reason, reason);
  assert.equal(revised.revisionContext.requestedStage, 'research');
  assert.deepEqual(revised.revisionContext.reviewFindings, [finding]);
  assert.ok(revised.revisionContext.reviewFiles.some(file => file.path === report && file.sha256));
  assert.ok(revised.inputs.some(input => input.path === report && input.role === 'historical'));
  assert.ok(!revised.allowedWrites.includes(review.outputDir));
});

test('retry retains failed partial directories and the last declared ledger across attempts', t => {
  const { run } = fixture(t);
  const accepted = finish(run, 'research');
  invalidateStage(run, 'research', 'Investigate an additional source.');
  const failed = dispatchStage(run, 'research');
  const partial = join(failed.outputDir, 'partial-notes.md');
  writeFileSync(partial, 'Useful partial source notes.\n');
  failStage(run, 'research', failed.assignmentId, 'Source access interrupted.');
  const retry = dispatchStage(run, 'research');
  const failedReference = retry.previousOutputs.find(output => output.assignmentId === failed.assignmentId);
  assert.equal(failedReference.outcome, 'failed');
  assert.equal(failedReference.outputDir, failed.outputDir);
  assert.ok(existsSync(partial));
  assert.ok(retry.previousOutputs.some(output => output.assignmentId === accepted.assignmentId && output.files.some(file => file.path.endsWith('evidence-ledger.md'))));
  const history = read(join(run, 'workflow.json')).history;
  function hasFailedSnapshot(value) {
    if (!value || typeof value !== 'object') return false;
    if (value.assignmentId === failed.assignmentId && value.outputDir && value.reason === 'Source access interrupted.') return true;
    return Object.values(value).some(hasFailedSnapshot);
  }
  assert.ok(history.some(hasFailedSnapshot), 'retry must archive the full failed assignment before replacing it');
  assert.ok(!retry.allowedWrites.includes(failed.outputDir));
});

test('missing historical files are disclosed without pretending they remain readable', t => {
  const { run } = fixture(t);
  const first = finish(run, 'research');
  invalidateStage(run, 'research', 'Reconcile an older run with incomplete retained files.');
  const ledger = join(first.outputDir, 'evidence-ledger.md');
  rmSync(ledger);
  const revised = dispatchStage(run, 'research');
  const previous = revised.previousOutputs.find(output => output.assignmentId === first.assignmentId);
  assert.ok(previous.unavailable.some(path => path.endsWith('evidence-ledger.md')));
  assert.ok(!previous.files.some(file => file.path === ledger));
  assert.ok(!revised.inputs.some(input => input.path === ledger));
  assert.equal(statusWorkflow(run).outcome, 'in-progress');
});

test('changed accepted upstream files make status stale and prevent dispatch or completion', t => {
  const { run } = fixture(t);
  const context = finish(run, 'context');
  const research = dispatchStage(run, 'research');
  writeFileSync(join(context.outputDir, 'writing-profile.md'), 'Unexpected edit after acceptance.\n');
  const status = statusWorkflow(run);
  assert.equal(status.outcome, 'stale');
  assert.deepEqual(status.ready, []);
  assert.throws(() => dispatchStage(run, 'compose'), /Stale or missing/);
  assert.throws(() => completeStage(run, 'research', resultFor(research)), /Stale or missing/);
  invalidateStage(run, 'context', 'Incorporate the changed style preference.');
  assert.equal(statusWorkflow(run).outcome, 'in-progress');
  completeStage(run, 'research', resultFor(research));
  finish(run, 'context');
  assert.deepEqual(statusWorkflow(run).ready, ['compose']);
});

test('brief changes invalidate accepted work and require fresh root-stage handoffs', t => {
  const { run } = fixture(t);
  finish(run, 'context');
  const research = dispatchStage(run, 'research');
  const changed = read(join(run, 'brief.json'));
  write(join(run, 'brief.json'), { ...changed, description: 'Changed investigation.' });
  assert.equal(statusWorkflow(run).outcome, 'stale');
  assert.throws(() => dispatchStage(run, 'compose'), /Stale or missing/);
  assert.throws(() => completeStage(run, 'research', resultFor(research)), /Stale or missing/);
  invalidateStage(run, 'context', 'Brief changed.');
  invalidateStage(run, 'research', 'Brief changed.');
  assert.equal(statusWorkflow(run).outcome, 'in-progress');
  finish(run, 'context');
  finish(run, 'research');
  assert.deepEqual(statusWorkflow(run).ready, ['compose']);
});

test('input drift is visible even while all dispatched stages are still running', t => {
  const { run } = fixture(t);
  const context = dispatchStage(run, 'context');
  write(join(run, 'brief.json'), { ...read(join(run, 'brief.json')), description: 'Changed while the specialist was working.' });
  assert.equal(statusWorkflow(run).outcome, 'stale');
  assert.throws(() => dispatchStage(run, 'research'), /Stale or missing/);
  assert.throws(() => completeStage(run, 'context', resultFor(context)), /Stale or missing/);
});

test('rejects unknown persisted statuses instead of silently treating a corrupt run as in progress', t => {
  const { run } = fixture(t);
  const state = read(join(run, 'workflow.json'));
  state.stages.context.status = 'invented-status';
  write(join(run, 'workflow.json'), state);
  assert.throws(() => statusWorkflow(run), /Invalid workflow|Unknown.*status|invalid.*status/i);
  assert.throws(() => dispatchStage(run, 'research'), /Invalid workflow|Unknown.*status|invalid.*status/i);
});

test('coordinator lock prevents mutation and preserves state for a later retry', t => {
  const { run } = fixture(t);
  const state = readFileSync(join(run, 'workflow.json'), 'utf8');
  const lock = join(run, '.workflow-lock');
  mkdirSync(lock);
  assert.throws(() => dispatchStage(run, 'context'), /Another coordinator/);
  assert.equal(readFileSync(join(run, 'workflow.json'), 'utf8'), state);
  rmdirSync(lock);
  assert.equal(dispatchStage(run, 'context').stage, 'context');
});

test('symlinked output files are rejected without hashing their targets', t => {
  const { run } = fixture(t);
  const packet = dispatchStage(run, 'context');
  const result = resultFor(packet);
  const output = join(packet.outputDir, packet.requiredOutputs[0]);
  rmSync(output);
  try { symlinkSync(join(run, 'brief.json'), output); }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) { t.skip('Symlink creation is unavailable'); return; }
    throw error;
  }
  assert.throws(() => completeStage(run, 'context', result), /Symlink/);
});

test('CLI resumes a run across fresh processes and rejects duplicate flags', t => {
  const { holder } = fixture(t);
  const run = join(holder, 'cli-run');
  const sourceBrief = join(holder, 'source-brief.json');
  const returned = join(holder, 'returned.json');
  write(sourceBrief, brief);
  const cli = (...args) => JSON.parse(execFileSync(process.execPath, [runtime, ...args], { encoding: 'utf8' }));
  assert.equal(cli('init', run, '--brief', sourceBrief).outcome, 'in-progress');
  const packet = cli('dispatch', run, 'context');
  write(returned, resultFor(packet));
  assert.deepEqual(cli('complete', run, 'context', '--result', returned), { stage: 'context', status: 'complete' });
  const status = cli('status', run);
  assert.equal(status.stages.context.status, 'complete');
  assert.deepEqual(status.ready, ['research']);
  const duplicate = spawnSync(process.execPath, [runtime, 'complete', run, 'context', '--result', returned, '--result', returned], { encoding: 'utf8' });
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /duplicate/);
  assert.equal(cli('status', run).stages.context.status, 'complete');
});

test('a relocated coordinator resolves companion skills beside its installed folder', t => {
  const { holder } = fixture(t);
  const installedSkills = join(holder, 'installed-skills');
  const coordinator = join(installedSkills, 'portfolio-blog-workflow');
  const sourceSkills = resolve(dirname(runtime), '..', '..');
  cpSync(join(sourceSkills, 'portfolio-blog-workflow'), coordinator, { recursive: true });
  const relocated = join(coordinator, 'scripts', 'workflow.mjs');
  const run = join(holder, 'relocated-run');
  const sourceBrief = join(holder, 'relocated-brief.json');
  write(sourceBrief, brief);
  const cli = (...args) => spawnSync(process.execPath, [relocated, ...args], { encoding: 'utf8', cwd: holder });
  const initialized = cli('init', run, '--brief', sourceBrief);
  assert.equal(initialized.status, 0, initialized.stderr);
  const missing = cli('dispatch', run, 'context');
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /companion skill understand-portfolio/);
  assert.equal(read(join(run, 'workflow.json')).stages.context.status, 'pending');
  cpSync(join(sourceSkills, 'understand-portfolio'), join(installedSkills, 'understand-portfolio'), { recursive: true });
  const dispatched = cli('dispatch', run, 'context');
  assert.equal(dispatched.status, 0, dispatched.stderr);
  const packet = JSON.parse(dispatched.stdout);
  assert.equal(packet.skillPath, join(installedSkills, 'understand-portfolio', 'SKILL.md'));
  assert.equal(packet.stage, 'context');
  assert.equal(read(join(run, 'workflow.json')).stages.context.status, 'running');
});

test('project install dispatches from sibling skills and preserves local edits on repeat', t => {
  const { holder } = fixture(t);
  const installer = fileURLToPath(new URL('../scripts/install.mjs', import.meta.url));
  const install = () => execFileSync(process.execPath, [installer, holder], { encoding: 'utf8' });
  install();
  const skills = join(holder, '.agents', 'skills');
  const helper = join(skills, 'portfolio-blog-workflow', 'scripts', 'workflow.mjs');
  const entry = join(skills, 'understand-portfolio', 'SKILL.md');
  const run = join(holder, 'installed-run');
  initWorkflow(run, brief);
  const packet = JSON.parse(execFileSync(process.execPath, [helper, 'dispatch', run, 'context'], { encoding: 'utf8' }));
  assert.equal(packet.skillPath, entry);
  const installedSeo = join(skills, 'optimize-article-seo', 'SKILL.md');
  assert.ok(existsSync(installedSeo));
  completeStage(run, 'context', resultFor(packet));
  finish(run, 'research');
  const installedDispatch = stage => JSON.parse(execFileSync(process.execPath, [helper, 'dispatch', run, stage], { encoding: 'utf8' }));
  const compose = installedDispatch('compose');
  assert.equal(compose.companionSkillPath, installedSeo);
  completeStage(run, 'compose', resultFor(compose));
  skipArtifacts(run, 'No demo needed');
  finish(run, 'integrate');
  const review = installedDispatch('review');
  assert.equal(review.companionSkillPath, installedSeo);
  assert.equal(review.verifierSkillPath, join(skills, 'verify-portfolio-article', 'SKILL.md'));
  assert.ok(existsSync(review.verifierSkillPath));
  const result = resultFor(review);
  assert.throws(() => completeStage(run, 'review', { ...result, verification: undefined }), /verification mode/);
  const fallback = { ...result, verification: 'unavailable', outcome: 'limited', unresolved: ['Host has no subagent tool.'] };
  assert.throws(() => completeStage(run, 'review', fallback), /non-ready verdict/);
  completeStage(run, 'review', { ...fallback, reviewVerdict: 'limited-review' });
  assert.equal(statusWorkflow(run).outcome, 'limited');
  writeFileSync(entry, 'Local changes');
  install();
  assert.equal(readFileSync(entry, 'utf8'), 'Local changes');
});
