# Editorial decisions and review loops

Keep author notes separate from draft prose and generated inference. The user owns the argument, experience, and publication choice; the agent may propose and draft within the requested scope. Do not manufacture an anecdote to improve an opening.

## Decisions that matter

The composition decision record gives each material choice an ID, status (`proposed`, `adopted`, `needs-author`, or `superseded`), rationale, alternatives, evidence/claim IDs where relevant, and author input. Record the working thesis, reader outcome, story structure, omissions, artifact choices, and citation treatment. The coordinator carries decisions forward; specialists propose changes instead of overwriting the author's choices. Keep superseded decisions and their reasons.

Proceed with routine structure and phrasing within the user's requested scope. Raise a specific question when the answer materially affects the article, especially first-hand details that only the author knows. A proposed choice need not block a useful draft. A missing essential experience can leave a clearly labelled author question in the private draft, but must not be presented as publishable prose.

At outline time, expose the central argument, evidence, counterargument, intended reader takeaway, and where author experience belongs. Do not force a universal hook/problem/solution template on every post. The story may be a tutorial, investigation, incident analysis, reflection, or comparison, depending on the author's intent and readable samples.

## Route findings to the responsible stage

| Review finding | Rework owner | Downstream work to refresh |
| --- | --- | --- |
| New source, numerical error, unsupported or overstated claim | `research` | Composition, artifacts, integration and review. |
| Misread component API, outdated content schema or writing-profile inference | `context` | Composition, artifacts, integration and review. |
| Search title promises an answer the article does not deliver | `compose` | Artifacts, integration and review. |
| Wrong emitted canonical or unintended public noindex | `integrate` | Review the corrected output. |
| Argument, voice, structure, author question, or takeaway changes | `compose` | Artifacts, integration and review. |
| Incorrect calculation, inaccessible interaction, or misleading demo default | `artifacts` | Integration and review. |
| Broken import, missing citation placement, wrong frontmatter or asset path | `integrate` | Review. |
| Reviewer omitted a check or misclassified an existing finding | `review` | Review only. |

One upstream correction can affect multiple passages. Keep IDs stable, narrow the current claim wording, preserve original wording and correction history, and check that summaries, headings, figure captions, demos, and social metadata do not retain an overstated claim. A failed website build is not evidence against a research claim; a successful build is not evidence for one.

## Readiness and publication handoff

For each verifier finding, compare the quoted article revision and evidence, assign the correction to its owner, and recheck affected claims after integration. An unavailable independent pass limits readiness even if local checks passed.

The review report distinguishes blocking and nonblocking findings, evidence gaps, author decisions, actual checks, and unperformed work. The coordinator inspects all stage limitations and does not clear an earlier limitation just because the final build passes.

Before calling a result `ready-for-author`, inspect the actual diff, make sure factual wording resolves to evidence or explicit qualified uncertainty, preserve the author's perspective, and verify the required repository checks and preview that the task calls for. When checks cannot run, deliver a limited handoff with the exact reason. Publication metadata should reflect the actual article, not introduce unsupported promises.

Where possible, check the article's target route, citations, internal links, code samples, images, keyboard interaction, reduced motion, mobile layout, static fallback, and feed representation. Use the site's existing metadata, sitemap, and feed pipeline rather than duplicating it. Record dependency/version-sensitive content and how a future maintainer can recheck it.

An end-to-end request ends at its authorized endpoint: reviewable staged files, repository diff, PR, or published article. Do not require repeated permission for actions already authorized, and do not infer publication permission from permission to prepare a draft. Report the actual endpoint reached and any remaining action explicitly.
