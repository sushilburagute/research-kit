---
name: integrate-portfolio-article
description: Integrate a drafted technical article, citations, and optional artifacts into an authorized portfolio repository using its existing content schemas and components. Use for repository-ready blog changes and preview validation; publishing is a separate authorized action.
---

# Integrate a portfolio article

Fit the article to the actual repository with the smallest coherent change. Preserve the author's material and unrelated working-tree changes.

## Establish the integration contract

- Read applicable repository instructions, current working-tree status, portfolio context, writing profile, draft, evidence ledger, decisions, and artifact report. Confirm that source revisions still match the assigned inputs.
- Verify discovered conventions against the current files before editing: article location, content schema, imports, component props, slug rules, date fields, asset processing, and draft/publication behavior. Use [repository-adapter.md](references/repository-adapter.md) to record the mapping when context is incomplete.
- Use the existing package manager, lockfile, build configuration, and components. Do not introduce a new content pipeline or global redesign to publish one article.
- If no portfolio checkout or write authorization is available, create a reviewable patch or file-placement plan inside the assigned output directory. Mark application and execution checks `not-run`; do not claim the portfolio was changed.

## Apply the article

- Edit only assigned article, asset, and necessary registration paths. Keep private repository content and drafts out of public skill packages and fixtures. Do not overwrite unrelated edits or replace a full file merely to simplify a small change.
- Match the actual Markdown, MDX, or content format. Preserve supplied notes outside the publication files. Remove scaffolding instructions, unresolved placeholder prose, and internal claim-status notation from the reader-facing article; retain unresolved questions in the handoff.
- Check content-compiler transformations and registrations: the first paragraph may receive lead styling, footnotes may become a references section, and a takeaway component may have a defined schema. Reuse the verified mechanism rather than duplicating its output manually.
- Reuse verified components with their real imports and props. For MDX, confirm the import/export mechanism, escaping, server/client boundaries, allowed syntax, and renderer support for raw HTML and scripts. Use standard links or fenced code when support is unknown.
- Place artifact source and assets according to repository conventions. Verify captions, alternative text, static fallback, dependencies, and relative paths after moving files.
- Use the site's existing lazy-loading or hydration wrapper for heavy interactivity when available. Keep the article meaningful in feeds, static output, and environments where the demo cannot execute.
- Fill required metadata from known or task-authorized choices: title, description, slug, tags, dates, draft status, canonical URL, and social image where supported. Do not invent publication dates or create a canonical URL before the actual route is known.
- Add useful internal links only when their routes exist. Preserve cited source URLs and attribution. A references list without a connection to the claim does not establish support.

## Integrate citations without changing the claim

- Map article claims to the evidence ledger's stable IDs and readable source locators. Render inline links, footnotes, or an existing citation component according to the repository.
- Recheck the exact wording around each citation after editing. Preserve study conditions, uncertainty, version limits, and attribution. Do not silently turn a vendor statement into an independent result.
- Surface unsupported or contradicted essential claims as correction requests to the composer/researcher. Do not silently delete inconvenient counterevidence or invent a supporting source.
- Keep internal citation maps in working outputs; do not leak private source locators or nonpublic notes into public links. If publishing a claim would disclose private material, flag the specific decision needed.

## Verify and hand off

Run configured checks appropriate to the actual change, such as content/schema validation, typecheck, lint, build, and relevant tests. Use the existing preview mechanism to inspect the rendered article when available. Record exact commands and actual outcomes. Do not deploy, merge, push, open a PR, or publish unless the current task authorizes that action; preserve authorization already given rather than asking again.

Use [integration-report.md](assets/integration-report.md). Return `integration-report.md`, changed paths or the unapplied patch, citation mapping, checks, preview evidence where available, unresolved issues, and publication readiness. Build success is not proof of factual accuracy.

With a coordinator, follow `task`, `inputs`, `authorization`, `acceptanceCriteria`, and `allowedWrites`; only this assigned integration owner applies portfolio changes. Keep the report and proposed files inside `outputDir` unless portfolio write paths were separately granted. Do not edit workflow state or the evidence ledger. Report unread inputs. Return `assignmentId`, `revision`, outcome (`complete`, `limited`, or `needs-author`), summary, relative output paths, `unresolved`, and `checks` with `command`, `status` (`passed`, `failed`, or `not-run`), and `details`. Stand-alone use requires no coordinator.
