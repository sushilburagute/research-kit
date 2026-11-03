---
name: review-portfolio-article
description: Review a technical portfolio article against its research evidence, author intent, repository conventions, and rendered behavior. Use for claim audits, editorial review, and publication readiness; report corrections without silently rewriting the author's argument.
---

# Review a portfolio article

Review the actual integrated revision, not a remembered draft. Return actionable findings and a readiness decision with the evidence and checks supporting it.

## Establish review scope

- Read the original talking points, reader outcome, author preferences, decisions, research brief and ledger, article, artifact report, and integration report. Inspect current repository instructions and relevant changed files when accessible.
- Record input revisions or hashes and unread inputs. If the integrated article differs materially from the draft or research used, review the current text and request updated evidence where needed.
- Preserve the author's notes, draft, and argument. Review does not imply authorization to rewrite, publish, or modify the evidence ledger. If fixes are requested, agree or follow assigned ownership and keep corrections focused.

## Audit claims and sources

- For each important factual statement, inspect the supporting source or precise supplied passage, not only a bibliography entry or search snippet. Verify the sentence as worded, with its conditions, dates, versions, denominators, and attribution.
- Check numerical calculations, causal wording, source independence, omitted qualifications, and counterevidence. Mark unsupported or inaccessible claims honestly; unconfirmed does not mean false.
- Distinguish personal observations, interpretations, hypotheses, illustrative examples, simulations, and measured results. Never add anecdotes or measurements to improve the story.
- Confirm citations are placed where they support a claim and retain accurate URLs and locators. Check for sources introduced or wording strengthened during drafting/integration. A reachable link is not verification.
- Propose ledger updates and corrections using existing claim/source IDs. Do not renumber IDs or mutate another worker's evidence registry.

## Review the reader experience

When the author likes to trim or the draft exceeds the requested length, identify the easiest useful cut by section or example and explain what the reader would lose. Distinguish optional cuts from required corrections.

- Check that the opening establishes the reader's problem, sections develop a coherent argument, examples explain mechanisms, and the conclusion gives useful takeaways with applicability limits.
- Trace the original talking points to the final article. Identify omissions, unsupported additions, repetitive sections, and decisions that diverge from author instructions.
- Compare the writing with the editable profile, allowing topic-appropriate variation. Suggest precise edits, not a generic rewrite or a manufactured voice.
- Evaluate whether each artifact earns its complexity and actually demonstrates what the article says. Inspect code behavior, input boundaries, units, captions, attribution, fallback, keyboard use, and mobile layout where tools permit.

## Verify integration and release readiness

- Inspect metadata, content schema, existing component use, internal links, asset paths, code formatting, and publication/draft settings against the repository contract.
- Check registered MDX components, compiler-generated references, lead/takeaway conventions, deferred demo loading, and feed/static fallbacks where the repository uses them. Do not add a second references section merely because one is absent in the raw source.
- Run or inspect appropriate current build, lint, typecheck, content, and artifact checks. Record actual command, revision, outcome, and scope. Reuse trustworthy check records only when inputs match; changed files can invalidate a previous pass.
- Preview the rendered article when possible. Explicitly report unavailable preview, accessibility, interaction, or network checks rather than treating absence of a failure as success.
- Identify private notes, unpublished personal material, internal locators, secrets, unfinished scaffolding, or inaccessible citations that would appear in the published output. Keep review details within the authorized workspace.

## Return an actionable handoff

Use [review-report.md](assets/review-report.md). Choose `ready-for-publication`, `needs-changes`, or `limited-review`; readiness is a review judgment, not an instruction or authorization to publish. Essential unresolved factual claims or failed required checks prevent a ready verdict.

Give each finding a stable ID, severity, exact location, evidence, consequence, proposed fix, and responsible stage (`context`, `research`, `compose`, `artifacts`, or `integrate`). Distinguish changes required for correctness from optional editorial suggestions. Route requests through the coordinator so affected downstream work is invalidated and checked again. Do not silently mark proposed decisions adopted or treat author silence as approval.

With a coordinator, follow `task`, `inputs`, `authorization`, `acceptanceCriteria`, and `allowedWrites`. Write `review-report.md` under `outputDir`; do not edit workflow state, the ledger, or portfolio files. Return `assignmentId`, `revision`, outcome (`complete`, `limited`, or `needs-author`), summary, relative output paths, `unresolved`, and `checks` containing `command`, `status` (`passed`, `failed`, or `not-run`), and `details`. Also return `reviewVerdict` using the three verdicts above and `findings` with each finding's `id`, `severity`, responsible `stage`, and `summary`. Use `blocking` for required corrections. A `needs-changes` verdict requires at least one blocking finding; a ready verdict cannot contain blocking findings. A complete review may report `needs-changes`; stage completion and publication readiness are different decisions. Without a coordinator, use the same report in the authorized workspace or chat.
