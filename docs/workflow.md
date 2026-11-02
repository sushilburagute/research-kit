# Portfolio article workflow

Research Kit can handle a selected stage or coordinate an article from title and notes through a reviewable portfolio contribution. The agent investigates and drafts within the request; the author owns first-hand experience, the argument, and final editorial decisions. Repository knowledge comes from actual inspected files, not a fixed Next.js or MDX assumption.

## Coverage of the article lifecycle

| Input or step | Implementation |
| --- | --- |
| Title, description and talking points | Article brief; infer missing nonessential context and state assumptions. |
| Research and talking points | Existing researcher, counterevidence, stable claim/source IDs, evidence gaps. |
| Voice, repository and portfolio context | Selected samples, editable profile with provenance, verified schema/component/check inventory. |
| Story structure and draft | Reader outcome, outline, author contribution, draft, decisions and talking-point coverage. |
| Optional artifacts | Explanatory decision, staged artifact, assumptions, validation and accessible fallback. |
| Repository conventions and components | Discovered adapter, actual component props, registration, paths, metadata and checks. |
| Summary and review decisions | Draft takeaways and traceable editorial choices; actionable review findings. |
| Sources in the blog | Claim-to-citation mapping using the site's actual footnote/link/component mechanism. |
| Publication and maintenance | Reviewable files/diff and authorized endpoint; date/version-sensitive maintenance notes. |

These are skills and local coordination logic. Search access, a writable checkout, a working browser, and deployment credentials are host capabilities, not bundled services. Permission to inspect a private repository does not permit copying its sources into this public package.

## Skill layout and use

Keep the seven directories under `skills/` together as sibling skill folders when installing the complete workflow. Each has its own entrypoint and local resources; the coordinator routes by skill name and its helper resolves sibling entrypoints. Individual specialist folders are portable, with no dependency on a global configuration or on another installed skill for standalone tasks. If a companion is absent, helper dispatch identifies the missing skill rather than inventing its output.

Start by asking the host to read [the coordinator](../skills/portfolio-blog-workflow/SKILL.md), then provide the topic, notes, intended reader, target repository, samples, output workspace and desired endpoint. A full workflow request allows drafting, while a research-only request still stops at research. Preserve already supplied authorization; do not add a new approval gate at each stage.

## Executable handoffs

Adapt [the example brief](../skills/portfolio-blog-workflow/assets/brief.json) into a private `article-input.json`. Keep author notes as notes, with source locators in `sourceMaterial`. The default authorization stages all work in the article workspace. Run:

```sh
node skills/portfolio-blog-workflow/scripts/workflow.mjs init ../article-work --brief article-input.json
node skills/portfolio-blog-workflow/scripts/workflow.mjs status ../article-work
node skills/portfolio-blog-workflow/scripts/workflow.mjs dispatch ../article-work context
node skills/portfolio-blog-workflow/scripts/workflow.mjs dispatch ../article-work research
```

The new run directory must not exist already. Each dispatch returns and saves a packet with a unique assignment ID, revision, required skill, selected read-only inputs and fingerprints, allowed writes, task and acceptance criteria. Reruns explicitly receive previous outputs and the correction context, so source IDs, author edits, adopted decisions and history can survive a handoff. Historical files are distinguished from current dependencies. The parent passes the packet to the host's subagent tool, or performs it sequentially. Node never calls a model or executes packet content. Serialize parent mutations; workers write only their assigned directories. Research owns the ledger, composition owns the draft, integration alone receives any explicit target write paths, and review returns findings.

Inspect each result, save the returned JSON, then accept it with `complete <run-dir> <stage> --result <file>`. The helper rejects wrong identities, stale inputs, outputs outside the assignment, missing required files, invalid outcomes, and misleading `complete` results with failed/unrun declared checks. It cannot detect an omitted check or establish factual accuracy. The coordinator still reviews the substance.

Context and research are initially ready together. If context discovery changes the investigation, complete the relevant research follow-up before composition. Composition waits for both. Artifacts follow composition and evidence; skip them with `skip-artifacts <run-dir> --reason <text>` when prose or an existing example is sufficient. Integration waits for that decision, and review waits for integration.

See [the handoff contract](../skills/portfolio-blog-workflow/references/handoff.md) for exact result fields, commands, lock recovery and limitations.

## Revision and review

Use `status` to resume rather than reinitializing or overwriting work. To revise a stage, stop affected workers and use `invalidate <run-dir> <stage> --reason <text>`. The state retains previous assignments/results, increases affected revisions, and rejects late worker returns. A failed worker can be recorded with `fail` and retried in a new output directory. Nothing deletes an earlier draft or resets unrelated repository work.

Hashes detect changes to the brief and accepted run files, including inputs of active assignments. Repository and web changes outside the run require an explicit revision check on resume. Preserve a prior brief before changing its notes and invalidate both initial stages after a brief change.

The review result has both an assignment outcome and an article verdict. A completed review can find blocking changes; the helper then reports `needs-changes` rather than `ready-for-author`. Its findings name the responsible stage so the coordinator can invalidate and redo the affected work. A limited research/context/integration pass remains visible even if the final review succeeds. Missing essential evidence or author input blocks dependent work. See [the editorial loop](../skills/portfolio-blog-workflow/references/editorial-loop.md).

## Repository integration and publication

Inspect the current collection/schema, representative article, MDX or Markdown renderer, component registry, asset conventions, package scripts and relevant instructions. Record what is observed, what is inferred, what is inaccessible and what documentation contradicts current files. Reuse actual components, footnote transformations, metadata/feed pipelines and build checks. Do not invent a successful compile, preview, interactive behavior, measurement, or first-hand outcome.

By default, integrations are proposed files or a patch plus an exact placement manifest, not target repository mutations. After discovery, the coordinator can put already-authorized absolute target paths into `authorization.repositoryWritePaths` with the user's authorization basis. Only integration gets those write scopes. External actions (`commit`, `push`, `open-pr`, `publish`) are separately recorded communication of the user's scope, not operating-system permissions or automatic actions.

Finish with the article/diff location, summary, decisions, evidence mapping, artifact rationale, findings, actual checks, remaining limits and next useful action. Run or inspect the selected repository's content checks, build, relevant code tests and rendered preview where possible. Report `not-run` accurately. `ready-for-author` is a review handoff, not a deployment action. Complete an already-authorized PR/publication endpoint without redundant confirmation; otherwise deliver a concrete reviewable result and its remaining publication step.
