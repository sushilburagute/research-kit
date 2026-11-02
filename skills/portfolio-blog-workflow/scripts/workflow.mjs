import { createHash, randomUUID } from 'node:crypto';
import {
  existsSync, lstatSync, mkdirSync, readFileSync,
  renameSync, rmdirSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';

// This manages handoffs. It never launches models, executes commands, or publishes.
export const STAGES = Object.freeze({
  context: {
    skill: 'understand-portfolio', dependencies: [],
    outputs: ['portfolio-context.md', 'writing-profile.md'],
    task: 'Inspect only the selected portfolio and samples. Record current repository conventions, component APIs, checks, source locators, an editable writing profile, and access limits.',
  },
  research: {
    skill: 'research-technical-article', dependencies: [],
    outputs: ['research-brief.md', 'evidence-ledger.md'],
    task: 'Investigate the brief, challenge the tentative angle, and maintain stable source and claim IDs. Separate evidence, interpretations, author experience, and unresolved essential claims.',
  },
  compose: {
    skill: 'compose-technical-article', dependencies: ['context', 'research'],
    outputs: ['outline.md', 'article.md', 'decisions.md', 'talking-points.md'],
    task: 'Use the context, writing profile, brief, and ledger to structure and draft the article. Preserve author notes, map factual passages to claim IDs, summarize talking points, and record editorial decisions.',
  },
  artifacts: {
    skill: 'build-article-artifacts', dependencies: ['context', 'research', 'compose'],
    outputs: ['artifact-report.md'],
    task: 'Create only artifacts justified by the article. Reuse discovered patterns, label hypothetical data, verify behavior, and supply accessible static or textual fallbacks.',
  },
  integrate: {
    skill: 'integrate-portfolio-article', dependencies: ['context', 'research', 'compose', 'artifacts'],
    outputs: ['integration-report.md'],
    task: 'Prepare the article and assets using verified repository conventions, actual component APIs, and citations tied to supported wording. Stage proposed files unless explicit repository write paths are granted. Record the proposed file manifest and checks.',
  },
  review: {
    skill: 'review-portfolio-article', dependencies: ['context', 'research', 'compose', 'artifacts', 'integrate'],
    outputs: ['review-report.md'],
    task: 'Review the integrated article against the ledger, author intent, repository conventions, code/demo behavior, accessibility, and rendered preview. Report decision requests and rework owners. Do not silently fix another stage or claim unrun checks passed.',
  },
});

const accepted = stage => ['complete', 'limited', 'skipped'].includes(stage.status);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function localPath(root, name) {
  assert(nonempty(name) && !isAbsolute(name) && !win32.isAbsolute(name), 'Expected a relative run path.');
  assert(!/[\\:<>"|?*\x00-\x1f]/.test(name), `Invalid run path: ${name}`);
  assert(name.split('/').every(part => part && part !== '.' && part !== '..'), `Invalid run path: ${name}`);
  const target = resolve(root, ...name.split('/'));
  const fromRoot = relative(root, target);
  assert(fromRoot && !isAbsolute(fromRoot) && fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`), 'Path escapes run directory.');
  let cursor = root;
  for (const part of name.split('/')) {
    cursor = join(cursor, part);
    if (existsSync(cursor)) assert(!lstatSync(cursor).isSymbolicLink(), `Symlink is not permitted in run paths: ${name}`);
  }
  return target;
}

function readJSON(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { throw new Error(`Cannot read JSON ${path}: ${error.message}`); }
}

function atomicJSON(root, name, value) {
  const target = localPath(root, name);
  mkdirSync(dirname(target), { recursive: true });
  const tempName = `${name}.${randomUUID()}.tmp`;
  const temp = localPath(root, tempName);
  try {
    writeFileSync(temp, json(value), { flag: 'wx' });
    renameSync(temp, target);
  } finally {
    if (existsSync(temp)) unlinkSync(temp);
  }
}

function load(root) {
  assert(existsSync(root) && lstatSync(root).isDirectory() && !lstatSync(root).isSymbolicLink(), 'Run directory must be a real directory.');
  const state = readJSON(localPath(root, 'workflow.json'));
  assert(state.schemaVersion === 1 && nonempty(state.runId), 'Unsupported or invalid workflow state.');
  const statuses = ['pending', 'running', 'complete', 'limited', 'needs-author', 'failed', 'skipped'];
  assert(Object.keys(STAGES).every(name => {
    const stage = state.stages?.[name];
    return stage && Number.isInteger(stage.revision) && stage.revision > 0 && statuses.includes(stage.status)
      && (stage.status !== 'skipped' || name === 'artifacts');
  }), 'Invalid workflow stages or status.');
  return state;
}

function mutate(runDir, operation) {
  const root = resolve(runDir);
  const state = load(root);
  const lock = localPath(root, '.workflow-lock');
  try { mkdirSync(lock); }
  catch { throw new Error('Another coordinator holds .workflow-lock; serialize coordinator writes. If it crashed, verify no writer remains before removing the empty lock directory.'); }
  try {
    // Reload after acquiring the lock so two callers cannot overwrite each other.
    const current = load(root);
    assert(current.runId === state.runId, 'Run changed while acquiring its lock.');
    const result = operation(current, root);
    current.updatedAt = new Date().toISOString();
    atomicJSON(root, 'workflow.json', current);
    return result;
  } finally { rmdirSync(lock); }
}

function validateBrief(brief) {
  assert(brief && typeof brief === 'object' && !Array.isArray(brief), 'Brief must be an object.');
  assert(nonempty(brief.title), 'Brief requires a title.');
  assert(nonempty(brief.description) || (Array.isArray(brief.talkingPoints) && brief.talkingPoints.some(nonempty)), 'Provide a description or talking points.');
  for (const key of ['talkingPoints', 'authorNotes', 'sourceMaterial']) {
    if (brief[key] !== undefined) assert(Array.isArray(brief[key]) && brief[key].every(nonempty), `${key} must be an array of nonempty strings.`);
  }
  for (const key of ['reader', 'angle', 'portfolio']) {
    if (brief[key] !== undefined) assert(nonempty(brief[key]), `${key} must be a nonempty string when supplied.`);
  }
  const auth = brief.authorization ?? {};
  const paths = auth.repositoryWritePaths ?? [];
  assert(Array.isArray(paths) && paths.every(path => nonempty(path) && isAbsolute(path)), 'repositoryWritePaths must contain absolute local paths.');
  const actions = auth.externalActions ?? [];
  assert(Array.isArray(actions) && actions.every(action => ['commit', 'push', 'open-pr', 'publish'].includes(action)), 'Unknown external action.');
  if (paths.length || actions.length) assert(nonempty(auth.basis), 'Record the user authorization basis for repository writes or external actions.');
  return { ...brief, authorization: { repositoryWritePaths: paths, externalActions: actions, basis: auth.basis ?? 'Article workspace only.' } };
}

export function initWorkflow(runDir, brief) {
  const root = resolve(runDir);
  const normalized = validateBrief(brief);
  assert(!existsSync(root), 'Run directory already exists; resume it or choose a new directory.');
  mkdirSync(dirname(root), { recursive: true });
  mkdirSync(root);
  const now = new Date().toISOString();
  const state = {
    schemaVersion: 1, runId: randomUUID(), createdAt: now, updatedAt: now,
    stages: Object.fromEntries(Object.keys(STAGES).map(name => [name, { status: 'pending', revision: 1 }])),
    history: [],
  };
  atomicJSON(root, 'brief.json', normalized);
  atomicJSON(root, 'workflow.json', state);
  return statusWorkflow(root);
}

function fingerprints(root, paths) {
  return paths.map(path => {
    const absolute = localPath(root, path);
    assert(lstatSync(absolute).isFile(), `Expected an output file: ${path}`);
    return { path, sha256: hash(absolute) };
  });
}

function assertFingerprints(root, files) {
  for (const file of files) {
    const path = localPath(root, file.path);
    assert(existsSync(path) && lstatSync(path).isFile() && hash(path) === file.sha256, `Stale or missing input/output ${file.path}; invalidate its owning stage and rerun.`);
  }
}

function checkFresh(root, state) {
  for (const stage of Object.values(state.stages)) {
    if (stage.status === 'running') {
      assertFingerprints(root, stage.inputs ?? []);
      continue;
    }
    if (!accepted(stage) || stage.status === 'skipped') continue;
    assertFingerprints(root, stage.inputs ?? []);
    assertFingerprints(root, stage.files ?? []);
  }
}

function previousAssignments(state, name) {
  const candidates = [state.stages[name], ...state.history.slice().reverse().map(event => event.previous?.[name])]
    .filter(stage => stage?.outputDir && stage.assignmentId);
  const seen = new Set();
  const unique = candidates.filter(stage => {
    if (seen.has(stage.assignmentId)) return false;
    seen.add(stage.assignmentId);
    return true;
  });
  const latest = unique[0];
  const latestWithFiles = unique.find(stage => stage.files?.length);
  return [...new Set([latest, latestWithFiles].filter(Boolean))];
}

function historicalFiles(root, files) {
  const available = [];
  const unavailable = [];
  for (const file of files ?? []) {
    const absolute = localPath(root, file.path);
    if (existsSync(absolute) && lstatSync(absolute).isFile()) available.push(file.path);
    else unavailable.push(file.path);
  }
  return { files: fingerprints(root, available), unavailable };
}

export function statusWorkflow(runDir) {
  const root = resolve(runDir);
  const state = load(root);
  const issues = [];
  try { checkFresh(root, state); } catch (error) { issues.push(error.message); }
  const stages = Object.values(state.stages);
  let outcome = 'in-progress';
  if (stages.some(stage => stage.status === 'needs-author')) outcome = 'needs-author';
  if (stages.every(accepted)) outcome = stages.some(stage => stage.status === 'limited') ? 'limited' : 'ready-for-author';
  const verdict = state.stages.review.result?.reviewVerdict;
  if (verdict === 'needs-changes') outcome = 'needs-changes';
  if (stages.every(accepted) && verdict === 'limited-review') outcome = 'limited';
  if (issues.length) outcome = 'stale';
  return {
    runId: state.runId, outcome, issues,
    ready: issues.length ? [] : Object.keys(STAGES).filter(name =>
      ['pending', 'failed'].includes(state.stages[name].status) && STAGES[name].dependencies.every(dep => accepted(state.stages[dep]))),
    stages: Object.fromEntries(Object.entries(state.stages).map(([name, stage]) => [name, {
      status: stage.status, revision: stage.revision, assignmentId: stage.assignmentId,
      summary: stage.result?.summary ?? stage.reason, unresolved: stage.result?.unresolved ?? [],
      reviewVerdict: stage.result?.reviewVerdict, findings: stage.result?.findings,
    }])),
  };
}

export function dispatchStage(runDir, name) {
  assert(Object.hasOwn(STAGES, name), `Unknown stage: ${name}`);
  return mutate(runDir, (state, root) => {
    checkFresh(root, state);
    const stage = state.stages[name];
    const definition = STAGES[name];
    assert(['pending', 'failed'].includes(stage.status), `Stage ${name} is ${stage.status}; invalidate it before rerunning.`);
    assert(definition.dependencies.every(dep => accepted(state.stages[dep])), `Stage ${name} has unfinished dependencies.`);
    const brief = validateBrief(readJSON(localPath(root, 'brief.json')));
    const skillPath = join(skillRoot, definition.skill, 'SKILL.md');
    assert(existsSync(skillPath), `Install the companion skill ${definition.skill} beside portfolio-blog-workflow, or follow the manual handoff contract.`);
    const assignmentId = randomUUID();
    const outputDir = `work/${name}/${assignmentId}`;
    mkdirSync(localPath(root, outputDir), { recursive: true });
    const paths = ['brief.json', ...definition.dependencies.flatMap(dep => (state.stages[dep].files ?? []).map(file => file.path))];
    const previousOutputs = previousAssignments(state, name).map(previous => ({
      assignmentId: previous.assignmentId, revision: previous.revision, outcome: previous.status,
      outputDir: localPath(root, previous.outputDir),
      ...historicalFiles(root, previous.files),
    }));
    const revisionContext = stage.rework ? {
      reason: stage.rework.reason, requestedStage: stage.rework.requestedStage,
      reviewFindings: stage.rework.reviewFindings,
      ...historicalFiles(root, stage.rework.reviewFiles),
    } : null;
    const historical = [...previousOutputs.flatMap(previous => previous.files), ...(revisionContext?.files ?? [])];
    const currentInputs = fingerprints(root, [...new Set(paths)]).map(file => ({ ...file, role: 'current' }));
    const seen = new Set(currentInputs.map(file => file.path));
    const inputs = [...currentInputs];
    for (const file of historical) {
      if (!seen.has(file.path)) { inputs.push({ ...file, role: 'historical' }); seen.add(file.path); }
    }
    const absoluteFiles = files => files.map(file => ({ ...file, path: localPath(root, file.path) }));
    const packet = {
      schemaVersion: 1, runId: state.runId, assignmentId, revision: stage.revision, stage: name,
      skill: definition.skill, skillPath, task: definition.task,
      inputs: inputs.map(file => ({ ...file, path: localPath(root, file.path) })),
      previousOutputs: previousOutputs.map(previous => ({ ...previous, files: absoluteFiles(previous.files) })),
      revisionContext: revisionContext ? { ...revisionContext, reviewFiles: absoluteFiles(revisionContext.files), files: undefined } : null,
      outputDir: localPath(root, outputDir),
      allowedWrites: [localPath(root, outputDir), ...(name === 'integrate' ? brief.authorization.repositoryWritePaths : [])],
      authorization: brief.authorization,
      acceptanceCriteria: definition.outputs.map(path => `Return ${path}, or report why the stage needs author input.`),
      requiredOutputs: definition.outputs,
      resultContract: { assignmentId, revision: stage.revision, outcome: 'complete | limited | needs-author', summary: 'What was done and what was not checked.', outputs: ['paths relative to outputDir'], unresolved: ['remaining questions or blockers'], checks: [{ command: 'command or review procedure actually attempted', status: 'passed | failed | not-run', details: 'observed result or reason not run' }] },
    };
    if (name === 'review') {
      packet.resultContract.reviewVerdict = 'ready-for-publication | needs-changes | limited-review';
      packet.resultContract.findings = [{ id: 'R1', severity: 'blocking | important | suggestion', stage: 'responsible stage', summary: 'Finding and requested correction; details in review-report.md.' }];
    }
    if (stage.outputDir) state.history.push({ event: 'retried', stage: name, previous: { [name]: stage }, at: new Date().toISOString() });
    state.stages[name] = { status: 'running', revision: stage.revision, assignmentId, outputDir, inputs, ...(stage.rework ? { rework: stage.rework } : {}) };
    atomicJSON(root, `handoffs/${assignmentId}.json`, packet);
    state.history.push({ event: 'dispatched', stage: name, assignmentId, revision: stage.revision, at: new Date().toISOString() });
    return packet;
  });
}

export function completeStage(runDir, name, result) {
  assert(Object.hasOwn(STAGES, name), `Unknown stage: ${name}`);
  return mutate(runDir, (state, root) => {
    const stage = state.stages[name];
    assert(stage.status === 'running', `Stage ${name} is not running.`);
    assert(result?.assignmentId === stage.assignmentId && result.revision === stage.revision, 'Stale or mismatched assignment result.');
    checkFresh(root, state);
    assertFingerprints(root, stage.inputs);
    assert(['complete', 'limited', 'needs-author'].includes(result.outcome), 'Invalid result outcome.');
    assert(nonempty(result.summary), 'Result requires a summary.');
    assert(Array.isArray(result.outputs) && result.outputs.every(nonempty) && new Set(result.outputs).size === result.outputs.length, 'Result outputs must be unique relative paths.');
    assert(Array.isArray(result.unresolved) && result.unresolved.every(nonempty), 'Result requires an unresolved array of strings.');
    assert(Array.isArray(result.checks) && result.checks.every(check => nonempty(check.command) && ['passed', 'failed', 'not-run'].includes(check.status) && nonempty(check.details)), 'Result requires checks with command, status, and details.');
    if (name === 'review') {
      assert(['ready-for-publication', 'needs-changes', 'limited-review'].includes(result.reviewVerdict), 'Review result requires a reviewVerdict.');
      assert(Array.isArray(result.findings) && result.findings.every(finding => nonempty(finding.id) && ['blocking', 'important', 'suggestion'].includes(finding.severity) && Object.hasOwn(STAGES, finding.stage) && nonempty(finding.summary)), 'Review requires findings with id, severity, responsible stage, and summary.');
      const blocking = result.findings.some(finding => finding.severity === 'blocking');
      assert(result.reviewVerdict !== 'ready-for-publication' || !blocking, 'A ready review cannot contain blocking findings.');
      assert(result.reviewVerdict !== 'needs-changes' || blocking, 'A needs-changes review requires a blocking finding.');
    }
    if (result.outcome === 'complete') {
      assert(result.unresolved.length === 0, 'Use limited or needs-author for unresolved work.');
      assert(result.checks.every(check => check.status === 'passed'), 'A complete result cannot contain failed or unrun checks.');
    }
    if (result.outcome !== 'needs-author') {
      assert(STAGES[name].outputs.every(path => result.outputs.includes(path)), `Missing required outputs for ${name}: ${STAGES[name].outputs.join(', ')}`);
    }
    const paths = result.outputs.map(path => {
      // Validate relative to the assignment, not just the containing run.
      localPath(localPath(root, stage.outputDir), path);
      return `${stage.outputDir}/${path}`;
    });
    const files = fingerprints(root, paths);
    assert(paths.every(path => readFileSync(localPath(root, path)).length > 0), 'Output files must not be empty.');
    stage.status = result.outcome;
    stage.files = files;
    stage.result = structuredClone(result);
    atomicJSON(root, `results/${stage.assignmentId}.json`, result);
    state.history.push({ event: 'returned', stage: name, assignmentId: stage.assignmentId, outcome: stage.status, at: new Date().toISOString() });
    return { stage: name, status: stage.status };
  });
}

export function failStage(runDir, name, assignmentId, reason) {
  assert(nonempty(reason), 'Failure requires a reason.');
  return mutate(runDir, state => {
    const stage = state.stages[name];
    assert(stage?.status === 'running' && stage.assignmentId === assignmentId, 'Failure does not match the running assignment.');
    stage.status = 'failed';
    stage.reason = reason;
    state.history.push({ event: 'failed', stage: name, assignmentId, reason, at: new Date().toISOString() });
    return { stage: name, status: 'failed' };
  });
}

export function skipArtifacts(runDir, reason) {
  assert(nonempty(reason), 'Skipping artifacts requires an editorial reason.');
  return mutate(runDir, (state, root) => {
    checkFresh(root, state);
    assert(state.stages.artifacts.status === 'pending', 'Only pending artifacts can be skipped.');
    assert(STAGES.artifacts.dependencies.every(dep => accepted(state.stages[dep])), 'Complete context and composition before deciding artifacts are unnecessary.');
    const stage = state.stages.artifacts;
    stage.status = 'skipped';
    stage.reason = reason;
    state.history.push({ event: 'skipped', stage: 'artifacts', reason, at: new Date().toISOString() });
    return { stage: 'artifacts', status: 'skipped', reason };
  });
}

export function invalidateStage(runDir, name, reason) {
  assert(Object.hasOwn(STAGES, name) && nonempty(reason), 'Invalidation requires a known stage and reason.');
  return mutate(runDir, state => {
    const affected = new Set([name]);
    for (const stage of Object.keys(STAGES)) {
      if (STAGES[stage].dependencies.some(dep => affected.has(dep))) affected.add(stage);
    }
    const cancelled = [];
    const previous = {};
    const rework = {
      reason, requestedStage: name,
      reviewFindings: state.stages.review.result?.findings ?? [],
      reviewFiles: state.stages.review.files ?? [],
    };
    for (const stageName of affected) {
      const stage = state.stages[stageName];
      previous[stageName] = stage;
      if (stage.status === 'running') cancelled.push(stage.assignmentId);
      state.stages[stageName] = { status: 'pending', revision: stage.revision + 1, rework };
    }
    state.history.push({ event: 'invalidated', stage: name, reason, previous, at: new Date().toISOString() });
    return { affected: [...affected], cancelled, reason };
  });
}

const help = `Research Kit handoff coordinator (Node 18+, no dependencies)
  node workflow.mjs init <new-run-dir> --brief <brief.json>
  node workflow.mjs status <run-dir>
  node workflow.mjs dispatch <run-dir> <stage>
  node workflow.mjs complete <run-dir> <stage> --result <result.json>
  node workflow.mjs fail <run-dir> <stage> --assignment <id> --reason <text>
  node workflow.mjs skip-artifacts <run-dir> --reason <text>
  node workflow.mjs invalidate <run-dir> <stage> --reason <text>
Stages: ${Object.keys(STAGES).join(', ')}
Only the parent coordinator writes state. Subagents receive dispatch JSON and return result JSON.
The helper validates handoffs, not evidence accuracy, browser behavior, or publication readiness.`;

export function main(argv = process.argv.slice(2)) {
  if (!argv.length || argv[0] === '--help') { console.log(help); return; }
  const [command, runDir, ...rest] = argv;
  assert(nonempty(runDir), 'Provide a run directory.');
  const allowedFlags = {
    init: ['--brief'], status: [], dispatch: [], complete: ['--result'],
    fail: ['--assignment', '--reason'], 'skip-artifacts': ['--reason'], invalidate: ['--reason'],
  };
  assert(Object.hasOwn(allowedFlags, command), `Unknown command: ${command}`);
  const hasStage = ['dispatch', 'complete', 'fail', 'invalidate'].includes(command);
  const stage = hasStage ? rest.shift() : undefined;
  const flags = {};
  while (rest.length) {
    const flag = rest.shift();
    assert(allowedFlags[command].includes(flag) && !Object.hasOwn(flags, flag) && nonempty(rest[0]), `Unexpected, duplicate, or missing flag: ${flag}`);
    flags[flag] = rest.shift();
  }
  assert(allowedFlags[command].every(flag => Object.hasOwn(flags, flag)), `Required flags: ${allowedFlags[command].join(', ')}`);
  let result;
  if (command === 'init') result = initWorkflow(runDir, readJSON(resolve(flags['--brief'])));
  if (command === 'status') result = statusWorkflow(runDir);
  if (command === 'dispatch') result = dispatchStage(runDir, stage);
  if (command === 'complete') result = completeStage(runDir, stage, readJSON(resolve(flags['--result'])));
  if (command === 'fail') result = failStage(runDir, stage, flags['--assignment'], flags['--reason']);
  if (command === 'skip-artifacts') result = skipArtifacts(runDir, flags['--reason']);
  if (command === 'invalidate') result = invalidateStage(runDir, stage, flags['--reason']);
  console.log(json(result).trimEnd());
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
