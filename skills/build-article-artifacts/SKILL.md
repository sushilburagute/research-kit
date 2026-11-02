---
name: build-article-artifacts
description: Build and verify diagrams, runnable examples, and interactive demos that explain a specific technical article. Use when an article needs supporting artifacts; prefer the simplest useful form and reuse the target repository's existing stack.
---

# Build article artifacts

Create an artifact only when it helps the reader understand a concrete mechanism, comparison, or decision. A full blogging workflow does not require a demo for every article.

## Decide what helps

- Read the article or outline, learning goal, evidence, repository context, relevant component contracts, and any author choices. Identify the exact section the artifact supports.
- Choose a static figure, worked example, code snippet, or interactive demo based on the explanation. If prose or an existing component is sufficient, return an explicit no-artifact recommendation with its reason.
- Describe inputs, outputs, assumptions, boundary cases, and what readers should notice. Distinguish measured data from synthetic data and an illustrative model from an empirical result.
- Use real source values only with provenance and applicable usage rights. Never invent production metrics or present simulated results as measurements.

## Implement in the available stack

- Inspect and reuse actual components, dependencies, styles, asset handling, and browser/server boundaries. Do not invent component APIs or add a new framework to render one example.
- If the repository defers heavy interactive code behind a lazy client wrapper or component registry, follow that pattern rather than loading demo JavaScript on every post. Preserve useful text in static rendering and feeds when the site supports them.
- Prefer small deterministic examples. Label nondeterminism and use reproducible seeds when randomness matters to the explanation.
- Keep demo code and data within the assigned artifact directory. Produce integration instructions with imports, props, styles, dependencies, and the intended content location; change portfolio files only when explicitly assigned ownership.
- Avoid side effects unrelated to the demonstration. Do not add third-party network calls, analytics, account setup, paid services, or dependency installations without task authorization.
- Provide keyboard operation, accessible names, readable contrast, meaningful text alternatives, and a static or textual explanation when interaction cannot run. Respect the site's motion preferences and mobile layout conventions.
- Bound expensive work and large inputs. State browser or rendering limits that could affect readers. A visually convincing animation does not validate its underlying claim.

## Validate the explanation and behavior

- Check representative inputs and meaningful edge cases against the intended mechanism. Where possible, verify results through an independent calculation or an existing test tool rather than testing only that the code returns itself.
- Run the relevant available syntax, build, or runtime checks. Exercise keyboard controls, reset behavior, narrow layouts, and the fallback where the host permits it.
- If rendering or execution is unavailable, provide source and explicit `not-run` checks. Do not say the demo works because code was generated or a screenshot looks plausible.
- Confirm captions, units, axes, baseline, provenance, and surrounding prose match the artifact's actual behavior. Route empirical claim changes back to research.

## Handoff

Use [artifact-report.md](assets/artifact-report.md). Return `artifact-report.md`, the artifact files if any, integration instructions, validation results, and known limits. A skipped artifact can be a complete result when the explanation does not need one; missing execution access is a limit rather than a passed test.

With a coordinator, follow the packet's `task`, `inputs`, `authorization`, `acceptanceCriteria`, and `allowedWrites`. Only write inside `outputDir` and any separately assigned paths. Do not edit workflow state, the evidence ledger, another artifact worker's files, or the article while its owner is writing. Report unread inputs. Return `assignmentId`, `revision`, outcome (`complete`, `limited`, or `needs-author`), summary, relative output paths, `unresolved`, and `checks` entries containing `command`, `status` (`passed`, `failed`, or `not-run`), and `details`. Without a coordinator, use the same report in the authorized workspace or chat.
