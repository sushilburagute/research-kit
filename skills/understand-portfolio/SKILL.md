---
name: understand-portfolio
description: Initialise or update a portfolio writer’s reusable Markdown profile, or prepare repository and writing context for an article using that profile.
---

# Understand a portfolio

Discover the conventions an article must fit and the author's observed writing preferences. Produce context for another agent, not a redesign or a new generic voice.

## Inputs and scope

- For “initialise my portfolio”, use the author's chosen private writing workspace, one per author and portfolio. Save `writing-profile.md` at its root using the template below. A topic is optional. An About page and one or two selected posts are a useful starting point. With no samples, save supplied preferences and mark observations unknown. Return the path and stop after setup.
- On setup or refresh, read any existing profile first. Preserve author corrections. Update durable preferences when the author says they generally apply. Keep a request like “cut this introduction” in the article decisions. Save publishable identity details only as supplied or confirmed by the author.
- On article runs, use the supplied snapshot (or the profile in the selected workspace for standalone work). Create the article's working profile from it. Read new samples only for a requested refresh or a material gap. Check current repository facts that affect this article. A context-stage assignment writes only its run outputs.

- For article context, take the repository locator and usual reader from the profile when available. Apply the brief's reader, tone and length to this article. A live portfolio URL can supplement the repository when access is authorized.
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
- When a missing preference matters, use the host's question tool if available, otherwise ask in chat. Offer concrete choices and a recommended default. A delegated worker routes the question to its coordinator.
- Extract reusable preferences, not copied passages or distinctive phrases. Never infer personal experience, team history, beliefs, or measured outcomes from style.

## Handoff

For article context, return `portfolio-context.md` and `writing-profile.md`, with missing inputs and the next useful action. For standalone profile setup or refresh, return just the reusable profile.

When assigned through a coordinator, read the packet's `task`, `inputs`, `authorization`, `acceptanceCriteria`, and `allowedWrites`. Write only inside the assigned `outputDir`; treat the portfolio as read-only for this stage. Do not edit another stage's outputs or workflow state. Report unread inputs. Return the packet's `assignmentId` and `revision`, an outcome of `complete`, `limited`, or `needs-author`, a summary, output paths relative to `outputDir`, `unresolved`, and `checks` entries with `command`, `status` (`passed`, `failed`, or `not-run`), and `details`. An observation is not a passed execution check. Without a coordinator, deliver the same documents in an authorized directory or chat.
