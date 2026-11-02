---
name: understand-portfolio
description: Inspect an authorized portfolio repository and selected writing samples to produce a repository guide and editable writing profile for an article. Use before composing or integrating portfolio content; do not treat repository access as permission to publish private material.
---

# Understand a portfolio

Discover the conventions an article must fit and the author's observed writing preferences. Produce context for another agent, not a redesign or a new generic voice.

## Inputs and scope

- Start with the repository locator, title or talking points, intended reader, and selected writing samples. A live portfolio URL can supplement the repository when access is authorized.
- Read applicable repository instructions before inspecting content or proposing changes. Check the current branch and working tree; preserve uncommitted work.
- Inspect the smallest useful set: content configuration, package scripts, one representative article, relevant components, and additional author-selected samples. Record what you inspected. Do not scan unrelated repositories, private notes, or an entire vault.
- Use private repository contents only for the authorized task. Do not copy private posts, source, personal data, or full samples into a public skill package, public evaluation fixture, or unrelated external service. Summarize conventions and use authorized locators inside the task workspace instead.
- If access is unavailable, record the exact limit and proceed with supplied samples or an explicitly provisional profile. Do not guess the framework, content paths, components, or author's habits from the repository name.

## Discover repository conventions

Use [portfolio-context.md](assets/portfolio-context.md). Record actual paths and evidence for:

- Framework, language, content engine, supported article formats, and relevant versions.
- Article location, required frontmatter or schema, slug and date rules, draft/publication behavior, and index generation.
- Existing components suitable for callouts, code, citations, diagrams, and demos. Record imports, exports, props, examples, and styling constraints; distinguish observed from tested behavior.
- Assets, image processing, internal links, code highlighting, accessibility conventions, and social preview metadata.
- Content transformations such as first-paragraph lead styling, footnote-to-reference conversion, component registration, or generated feeds. Verify current configuration and a working use site; documentation alone may be stale.
- Build, lint, typecheck, tests, and preview commands from repository configuration, including required environment or unavailable services. Discover commands; do not install packages or execute repository lifecycle scripts merely to profile it.
- Existing topic coverage and relevant articles to link or avoid duplicating. A narrow sample does not establish the complete site's coverage.

## Build an editable writing profile

Use [writing-profile.md](assets/writing-profile.md). Separate explicit author preferences, observations from samples, and suggested choices for the current article.

- Describe point of view, sentence rhythm, technical depth, opening patterns, transitions, examples, headings, code explanations, and endings only when supported by samples.
- Give a source locator and confidence for each material observation. Note differences between posts rather than forcing one universal style.
- Ask about ambiguity only when it materially changes the article. Otherwise record a tentative choice the author can edit.
- Extract reusable preferences, not copied passages or distinctive phrases. Never infer personal experience, team history, beliefs, or measured outcomes from style.

## Handoff

Return `portfolio-context.md` and `writing-profile.md`, with missing inputs and the next useful action. They must remain useful without the original chat.

When assigned through a coordinator, read the packet's `task`, `inputs`, `authorization`, `acceptanceCriteria`, and `allowedWrites`. Write only inside the assigned `outputDir`; treat the portfolio as read-only for this stage. Do not edit another stage's outputs or workflow state. Report unread inputs. Return the packet's `assignmentId` and `revision`, an outcome of `complete`, `limited`, or `needs-author`, a summary, output paths relative to `outputDir`, `unresolved`, and `checks` entries with `command`, `status` (`passed`, `failed`, or `not-run`), and `details`. An observation is not a passed execution check. Without a coordinator, deliver the same documents in an authorized directory or chat.
