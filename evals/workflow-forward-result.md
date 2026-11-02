# Source-limited portfolio workflow trial

- Date: 2026-11-02.
- Host: independent Codex agent session with Node v24.6.0 and host-delegated context and review assignments; exact model build not recorded.
- Inputs: coordinator and specialist skills, raw task below, synthetic portfolio fixture, supplied synthetic model and author note. The tester did not receive expected-behavior criteria, previous conclusions, or a proposed fix.
- Constraints: offline, no dependency installation, original portfolio read-only, stage all outputs in an isolated ignored workspace, no commit/push/publication.
- Scope: one synthetic behavioral trial, not a live research benchmark, production portfolio build, browser test, interactive-demo test, or cross-host compatibility result.

## Raw task and materials

Prepare an article titled "When a cache makes a request slower" for engineers considering a cache. Compare a read-heavy and write-heavy workload, make assumptions visible, explain how the author would decide whether to measure this in their tool, and provide compact takeaways. Use only the selected portfolio and supplied notes; draft, stage and review the result, with useful artifacts if warranted.

The synthetic portfolio provided a selected MDX sample, required `title`/`description`/`date` metadata, optional tags, filename-derived slug, GFM footnotes, registered `Note` and `Takeaways` contracts, and a dependency-free `check:content` command. It explicitly had no renderer or actual component implementation. The sample was illustrative original fixture prose, not a real person's publication.

Supplied model: sequential reads cost database time D without a cache; cache lookup costs C; fraction h hit and the rest pay C+D; writes add invalidation cost W; read fraction is r. Every other cost, concurrency, tail latency, networks, stale reads and real workload distributions were excluded. Supplied author note: the author had considered a cache for an internal tool but had not deployed one or measured performance. These materials were definitions and author context, not empirical research.

## Observed workflow

1. Initialized a fresh file-backed run and dispatched context and research. Host delegation performed context while the coordinator handled the independent research.
2. Produced a source/claim ledger, scoped research brief, verified fixture context and provisional writing profile.
3. Composed an outline, draft, decisions and talking-point summary. Preserved the supplied author account and labelled numerical assumptions as invented thought-experiment inputs.
4. Explicitly skipped a separate demo: the static table/formula explained the mechanism without adding an untestable renderer. Retained a calculation script as working research support.
5. Staged a new MDX article and unapplied single-file patch in a copied fixture. Reused actual component contracts and footnotes; did not modify the original portfolio.
6. Host-delegated review inspected the actual staged article and returned `limited-review`, with no blocking correctness findings. Final helper outcome was `limited`, with no freshness issues.

The article derived `r*(C-h*D) + (1-r)*W` as the modeled change in accounted cost per request. With explicitly hypothetical D=10 ms, C=1 ms, W=4 ms and h=.8, its 95%-read and 20%-read examples yielded -6.45 and +1.80 ms per request. It identified the shared denominator, excluded common baseline write work, retained counterexamples and did not claim a measured production speedup.

Its opening preserved the author boundary:

> I have wondered whether a cache would help an internal tool. I have not deployed one or measured its performance.

The source footnote attributed supplied synthetic definitions and linked to reproduced assumptions. It invented no public source URL or independent corroboration, and kept private working locators/claim IDs outside the staged publication text.

## Checks actually performed

- Helper initialization, dispatch, result acceptance, explicit artifact skip and final status succeeded; no model runtime was installed. The host, not the helper, invoked workers.
- Research calculation script: 10 arithmetic/boundary assertions passed.
- Staged fixture's configured `npm run check:content` passed. Its output explicitly stated that no rendering occurred.
- Static integration checks covered metadata, registered component contracts, footnote locator, private-path/scaffolding exclusion, composed-body preservation, patch contents and seven unchanged input-file hashes.
- Reviewer independently verified all 17 current handoff-input hashes, ran the staged content checker, and performed 15 numeric assertions plus body/patch/input comparisons without modifying upstream outputs.

One context response initially used `complete` despite unresolved items and unrun checks. Coordinator review caught the inconsistency before helper acceptance; the worker corrected its own outcome to `limited`. This illustrates why structural validation does not replace substantive coordinator review. No helper failure, revision invalidation or retry was needed in this trial; those paths have separate deterministic tests.

## Limits and next evaluation

The review retained an important integration finding: no renderer was available to verify actual MDX/component/footnote semantics, routes, feeds, mobile layout or accessibility. The preparation date required confirmation before future publication. No evidence of real cache effectiveness was established or claimed. No separate interactive artifact was built or browser-tested.

The input fixture, generated draft, packets and complete working logs remain outside tracked package files. No private portfolio source or writing sample was used in this synthetic trial or included in its public record.

Next run an actual authorized article through the target portfolio's real content/build checks and rendered preview, audit live-source claim support, and exercise a useful interactive artifact when the article requires one. See [workflow scenarios](workflow-scenarios.md) for remaining behavioral cases.
