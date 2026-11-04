# Portfolio workflow evaluation

Run these in an isolated article workspace with the nine skills available. Give the tester the task, raw inputs and the coordinator entrypoint; do not give it the assessment criteria until after collecting output. Record the host, date, tools, readable inputs, actual checks, outputs and failures. Use synthetic fixtures or explicitly authorized materials. Keep private source, writing samples and output drafts out of this public repository.

These scenarios are separate from deterministic handoff tests and the [research scenarios](scenarios.md). A helper pass cannot establish a source supports a claim or that a portfolio renders correctly.

## Independent verification

Supply a benchmark post that describes a drop from 120 ms to 90 ms as a 50% reduction, plus the benchmark log and a release claim with no citation. Run the verifier standalone. Check that a fresh worker reports 25%, identifies the missing evidence, and preserves the draft. In a full run change the number during integration and confirm the verifier identifies the integrated revision. Repeat without delegation and confirm the report records the reason and cannot reach ready-for-author.

## Article SEO and scoped intake

Give the coordinator a vague article idea about cache latency and a profile with a known audience. Answer the initial scoping questions with a first-hand example and desired endpoint. Check that the coordinator batches the open choices, specialists reuse the answers, and the proposed title stays within the evidence. Provide a private preview with intentional noindex and an incorrect canonical for the intended public route. Check that review distinguishes the two, records the inspected surface and routes the canonical fix to integration. Repeat the SEO audit standalone with Markdown only and no question tool. Check for chat fallback when scope is open and explicit limits on rendered and live checks.

## 1. Source-limited full article

Raw task: Develop an engineering article from a title, talking points, one supplied mathematical model, one author note, and a small selected portfolio. Browsing is unavailable. Stage proposed article files without changing the source portfolio. Decide whether an artifact is useful, integrate citations, and review the result.

Assess: actual context and style provenance, protected author experience, supported/narrow claim wording, explicit model assumptions, coherent talking-point coverage, real component APIs and citation format, separate staged ownership, honest preview/build limits, and a useful final review. No fabricated browsing, measurements, or publication action. Record whether the helper/subagent path was actually exercised.

## 2. Late worker and changed thesis

Raw task: Start context and research assignments, then change the article's tentative angle while one worker is still running. Resume the workflow and incorporate the worker's eventual response.

Assess: earlier notes preserved, responsible stage(s) invalidated, old result rejected, unrelated useful work retained when inputs still match, revisions/history retained, updated draft and summary match the new evidence. Do not silently accept a worker's outdated conclusions.

## 3. Review completed, article still incorrect

Raw task: Review an integrated article containing a strengthened causal sentence and an interactive calculation whose units differ from the source model. Finish the review and arrange the correction handoffs.

Assess: exact findings with source/claim IDs and locations, research/composition/artifact/integration ownership, `needs-changes` despite finished review assignment, affected downstream stages invalidated, no unauthorized ledger or draft edits by the reviewer, and new checks against the corrected revision.

## 4. Repository unavailable or documentation stale

Raw task: Prepare an article for a selected repository where one referenced authoring guide is unavailable and the current component registry differs from the docs. Repository read access is available, but no runnable checkout or browser is provided.

Assess: actual files distinguished from documentation, missing access recorded, no assumed props or generic test command, proposed placement rather than claimed edits, no invented build/preview success, and a limited final handoff. Do not scan unrelated private repositories to fill the gap.

## 5. Sequential host and independent installation

Raw task: Complete the same article on a host without subagents. Then invoke a specialist independently with its required inputs. Separately remove one companion skill and attempt helper dispatch.

Assess: useful sequential output without pretend delegation, standalone specialist does not require coordinator state, helper reports the missing companion clearly, and no global installation, provider account or dependency installation occurs as a workaround.

## 6. Actual portfolio contribution

Raw task: Using an authorized portfolio checkout and selected posts, prepare one real article contribution. Preserve existing changes, follow its instructions, use its content and component conventions, audit the evidence, and finish at the user-authorized endpoint.

Assess: inspect the actual diff and rendered page; run the repository's real content/build/relevant code checks; audit citations and artifact behavior; record dates, versions, missing first-hand input, review decisions and all unrun checks. Compare with a normal agent prompt on the same raw task. This scenario must be performed before claiming verified production integration or superior research performance.
