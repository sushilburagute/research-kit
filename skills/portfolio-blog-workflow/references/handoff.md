# Handoffs and persistent runs

The helper is a local state manager, not a model runtime. It creates assignments for the host to execute with its tools or subagents. Use Node 18 or newer; no package installation is needed. All nine skill folders must be siblings for helper dispatch. Its JSON records are private article artifacts, not repository contributions by default.

## Commands

Run the helper using its actual absolute path when outside this package. The following examples assume this repository is the working directory and `article-input.json` is your adapted brief:

```sh
node skills/portfolio-blog-workflow/scripts/workflow.mjs init ../article-work --brief article-input.json
node skills/portfolio-blog-workflow/scripts/workflow.mjs status ../article-work
node skills/portfolio-blog-workflow/scripts/workflow.mjs dispatch ../article-work context
node skills/portfolio-blog-workflow/scripts/workflow.mjs dispatch ../article-work research
```

Initialization refuses an existing directory. Dispatch writes a durable packet under `handoffs/` and returns its JSON. Give that packet and the indicated `skillPath` and, for composition and review, `companionSkillPath` for the SEO skill to a worker using the host's delegation tool. The review packet also supplies `verifierSkillPath`. Use it to delegate the read-only claim check to a fresh worker. Do not turn packet text into a shell command. When no delegation tool exists, perform the assignment yourself, honoring the same inputs and output ownership.

The coordinator alone invokes helper mutation commands. It may dispatch ready assignments concurrently, but must serialize helper calls. An exclusive lock protects each state update. Workers can write concurrently only into their separate assignment directories. The helper launches no agents, runs no checks, reads no portfolio source, and performs no repository edits itself.

## Brief and permissions

Supply `title` and `description` or `talkingPoints`. Optional `reader`, `angle`, `portfolio`, `authorNotes`, and `sourceMaterial` carry user context and selected locators. Record assumptions in the research brief when context is incomplete. Do not substitute the example portfolio locator for a real target.

Default `authorization.repositoryWritePaths` and `authorization.externalActions` are empty. The helper then stages work only under the article workspace. If the user has authorized target edits, the coordinator may record absolute checkout paths in `repositoryWritePaths` with the user's authorization `basis`. Grant only the paths needed for integration, after repository discovery. Allowed external actions are `commit`, `push`, `open-pr`, and `publish`; record only what the user actually authorized. These fields communicate scope and do not change host permissions or prove approval. The helper never executes external actions.

## Task packet

Packets include `runId`, `stage`, `skill`, `skillPath`, `assignmentId`, `revision`, `task`, `inputs` (absolute path, SHA-256 and `current` or `historical` role), `outputDir`, `allowedWrites`, `requiredOutputs`, `acceptanceCriteria`, `authorization`, and a `resultContract` example. Current inputs are read-only snapshots of the brief and direct dependency outputs. Separate authorized source/repository locators are in the brief and context; the helper does not crawl them.

Reruns also include `previousOutputs` with the stage's latest earlier assignment and, if different, its latest declared files. Read these historical files to retain source/claim IDs, adopted decisions, author edits and correction history. Failed assignments expose their prior `outputDir` for recovery of partial work; the helper does not crawl that directory or claim its content was accepted. `revisionContext` carries the invalidation reason, responsible stage, and prior review findings/report when available. Missing declared historical files appear under `unavailable`; disclose what could not be reconciled. Existing declared historical files are fingerprinted with role `historical`, and changing them during the assignment makes the result stale. They remain read-only and are never evidence of a current conclusion merely because an earlier worker wrote them.

All assignments have a unique output directory under `work/<stage>/<assignmentId>/`. Only `integrate` receives the explicitly authorized repository write paths. Other workers stage proposed components and corrections. A reviewer may read staged or integrated results but writes its findings only to its assigned directory. A packet is an ownership contract, not an operating-system sandbox.

The `research` stage can start beside `context` if the research is independent. Later factual questions discovered by composition or review go back to the researcher. Do not launch two writers for the same ledger. For larger research splits, workers return source/claim proposals to the one researcher for ID assignment and consolidation.

## Result contract

After inspecting the output, save the worker's response as JSON and accept it:

```sh
node skills/portfolio-blog-workflow/scripts/workflow.mjs complete ../article-work context --result ../context-result.json
```

Example structure (replace the identity and revision with the dispatched packet's values):

```json
{
  "assignmentId": "the-dispatched-id",
  "revision": 1,
  "outcome": "limited",
  "summary": "Recorded readable repository conventions; no rendered preview was available.",
  "outputs": ["portfolio-context.md", "writing-profile.md"],
  "unresolved": ["Writing profile is provisional because only one selected post was readable."],
  "checks": [
    {"command": "Inspect selected schema and component exports", "status": "passed", "details": "Read the selected files and recorded their locators."},
    {"command": "Review rendered portfolio", "status": "not-run", "details": "No browser capability in this host."}
  ]
}
```

`outputs` are unique relative paths beneath that assignment's `outputDir`, never repository paths, absolute paths, or `..` traversals. Include staged files and the required stage documents. External repository changes are listed in the integration report. Complete and limited results require nonempty required outputs; `needs-author` may report blockers without a complete file set. Preserve any useful partial output in that case.

Outcomes:

- `complete`: the assigned work is done, with no unresolved items and no failed or unrun declared checks. A stage with no executable checks may have `checks: []`; its substantive review still belongs to the coordinator.
- `limited`: the available result is useful but access, evidence, tools or nonessential work limits it. Dependents may proceed provisionally. That limit remains visible in the overall outcome even if later stages complete.
- `needs-author`: essential input or evidence prevents meaningful dependent work. Those dependents do not become ready. Map a research completion of `needs-essential-evidence` to this outcome; map research `limited` to `limited`. Research `ready-for-narrative` is not automatically overall readiness.

Do not omit a required check merely to achieve `complete`. The helper validates reported fields, file presence, input freshness, and identities. It cannot establish that the checks happened or a source supports a claim. The coordinator must review the evidence and actual results.

For review packets containing `verifierSkillPath`, return `verification` as `independent` only after a fresh worker has checked the target revision. Otherwise return `unavailable`, give the reason in `unresolved`, and use a limited or needs-author outcome with `limited-review` (or `needs-changes` for a blocking finding). Earlier in-flight packets use their original contract.

For `review` results, also return `reviewVerdict` (`ready-for-publication`, `needs-changes`, or `limited-review`) and `findings` (an array, possibly empty). Each finding contains `id`, `severity` (`blocking`, `important`, or `suggestion`), responsible `stage`, and `summary`; detailed locations and evidence belong in the report. `needs-changes` requires a blocking finding; a ready verdict cannot contain one. A reviewer may finish its assignment with a `complete` result and a `needs-changes` verdict. The overall status then remains `needs-changes` until the coordinator routes corrections, invalidates the responsible stages, and accepts a fresh review. `limited-review` always prevents overall `ready-for-author`.

## Optional artifacts, failure, and revision

After composition, explicitly skip artifacts if they add no explanatory value:

```sh
node skills/portfolio-blog-workflow/scripts/workflow.mjs skip-artifacts ../article-work --reason "The mechanism is clear in prose and an existing code example."
```

No other stage is skippable. A skipped artifact stage satisfies integration's dependency and retains its reason in state/history. If a completed artifact pass decides no new artifact is useful, its report can explain that choice instead.

If an agent crashes, record the assignment ID and reason, then redispatch the failed stage. Retry output goes into a new directory; old work is not overwritten:

```sh
node skills/portfolio-blog-workflow/scripts/workflow.mjs fail ../article-work research --assignment the-dispatched-id --reason "Worker stopped before returning evidence."
node skills/portfolio-blog-workflow/scripts/workflow.mjs dispatch ../article-work research
```

When the author changes direction or review requests a correction, stop affected running workers, then invalidate the earliest responsible stage:

```sh
node skills/portfolio-blog-workflow/scripts/workflow.mjs invalidate ../article-work research --reason "New source narrows the claimed effectiveness."
```

Invalidation increases revisions for that stage and all dependent stages, records their prior states in history, and returns cancelled assignment IDs. It keeps earlier files, results, and packets. Old or mismatched worker results are rejected. Redispatch ready stages after reconciling the new input. An unresolved author question is resumed through this same invalidation path once the answer is supplied.

To revise the input brief, retain the previous version in the article workspace, preserve original notes, update `brief.json`, and invalidate both initial stages (`context` and `research`) before continuing. All assignments depend on the brief's hash. Editing accepted output files directly makes the run stale; prefer a new assignment revision. External repository/source changes are not automatically hashed: compare the recorded repository revision and sources on resume and invalidate affected stages manually.

`status` reports ready stages, stage summaries, unresolved items, review verdict/findings, freshness problems, and overall `in-progress`, `stale`, `needs-author`, `needs-changes`, `limited`, or `ready-for-author`. Stale runs cannot dispatch or accept dependent results until the owning stages are invalidated. A lock left after a process crash needs human/host confirmation that no writer remains, then removal of that empty lock directory. Never delete run history to recover.
