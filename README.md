# Research Kit

![Research Kit](docs/assets/research-kit.png)

Turn a technical question or a handful of rough notes into a well-researched article that sounds like you. Research Kit is a set of nine skills that helps your AI assistant research, write, and prepare articles for your portfolio—with you in control of the final decisions.

For an open-ended request, the assistant uses the host’s question tool, or chat, to ask 2–3 short questions in one round. It uses your answers across the workflow and skips questions your notes or saved profile already answer. Start with an idea, a question, or a few talking points. You don't need a polished outline.

## Quick start

**1. Install the skills.** In a terminal, open your private writing workspace (one per author and portfolio). With Node.js 22.20 or later installed, run:

```sh
npx skills add sushilburagute/research-kit
```

Select all nine skills and your coding agent, such as Codex or Claude Code. Open the workspace in your agent and start a new session. Using Claude or ChatGPT chat instead? See [other setup options](#choose-your-setup).

**2. Share an idea.** Try this prompt, replacing the topic and notes with your own:

> Use portfolio-blog-workflow to write about when a cache makes reads slower. My notes: cache misses add a network round trip; invalidation and stale data can complicate the design. Help me prepare a draft for review.

You can start with just a question if that's all you have. On your first article, the workflow can help set up your writing profile. Give it your portfolio and a couple of writing samples if you have them, or describe your preferred style. You can also ask it to decide when you're unsure about length or tone.

**3. Review the result.** You'll get a draft and the material needed to check it. Publishing happens only when you ask for it.

## What you get

- **An article draft** shaped around your topic, audience, and writing style.
- **An evidence ledger** connecting factual claims to their sources, so you can check the research.
- **An SEO plan and audit** connecting the reader’s search question to the article title, description, and checks on the rendered page when available.
- **Proposed portfolio files**, adapted to your site's conventions when the assistant can inspect them.
- **An independent fact-check** from a fresh verifier subagent, with claim-level evidence, corrections and coverage limits. Hosts without delegation return a labeled local check and limited readiness.
- **An editorial and technical review**, including open questions and checks performed.

The exact output depends on the tools and access available to your assistant. You can also use the research skill on its own without drafting an article.

## How it works

1. **Learn your style.** The kit creates an editable writing profile from your preferences and any samples you provide.
2. **Research the question.** It investigates your angle, looks for evidence, and records sources and limitations.
3. **Write and prepare.** It turns the research and your notes into a draft, with useful examples or artifacts where appropriate, and stages portfolio files for review.
4. **Review together.** A fresh subagent verifies the article’s claims when delegation is available. The reviewer combines those findings with the editorial, technical and SEO checks. You decide what to change and whether to publish.

The workflow coordinates these stages while keeping your review and publication decisions in your hands:

```mermaid
flowchart LR
    Idea["Idea and notes"] --> Context["Understand portfolio and style"]
    Idea --> Research["Research and evidence"]
    Context --> Draft["Plan search intent and compose article"]
    Research --> Draft
    Draft --> Artifacts{"Would an artifact help?"}
    Artifacts -->|Yes| Build["Build and verify artifact"]
    Artifacts -->|No| Integrate["Prepare portfolio files"]
    Build --> Integrate
    Integrate --> Review["Review article, audit SEO and verify claims with a fresh subagent"]
    Review --> Author["Author review and decisions"]
```

## Skills and when to use them

Each specialist can also be used on its own with the relevant inputs.

| Skill | What it does and when to use it |
| --- | --- |
| [portfolio-blog-workflow](skills/portfolio-blog-workflow/SKILL.md) | Coordinates the full article process; use it to go from an idea or notes to a reviewable portfolio contribution. |
| [understand-portfolio](skills/understand-portfolio/SKILL.md) | Builds a writing profile and discovers portfolio conventions; use it for initial setup or article context. |
| [research-technical-article](skills/research-technical-article/SKILL.md) | Investigates a topic and tracks evidence and counterarguments; use it to research or verify claims, including without writing an article. |
| [compose-technical-article](skills/compose-technical-article/SKILL.md) | Shapes notes and research into an outline and draft; use it when you want to write an article. |
| [optimize-article-seo](skills/optimize-article-seo/SKILL.md) | Plan search intent before outlining, or audit an existing draft or rendered article for copy, metadata, internal links and indexability. |
| [build-article-artifacts](skills/build-article-artifacts/SKILL.md) | Creates and checks diagrams, examples, or demos; use it when an artifact would clarify an article. |
| [integrate-portfolio-article](skills/integrate-portfolio-article/SKILL.md) | Fits a draft, citations, and artifacts to a portfolio's conventions; use it to prepare repository-ready changes. |
| [verify-portfolio-article](skills/verify-portfolio-article/SKILL.md) | Ask a fresh subagent to check claims, citations, examples and calculations in a draft or published post. Also runs during final workflow review. |
| [review-portfolio-article](skills/review-portfolio-article/SKILL.md) | Checks evidence, editorial quality, and the integrated article; use it to assess readiness and identify corrections. |

Choose an entry point based on what you need:

```mermaid
flowchart TD
    Start["What do you want to do?"] --> Full["Create an article end to end"]
    Start --> Focus["Work on one part"]
    Full --> Workflow["portfolio-blog-workflow"]
    Focus --> Setup["Writing profile or portfolio context"]
    Focus --> Evidence["Research or verify claims"]
    Focus --> Other["Draft, optimize for search, build, integrate, or review"]
    Setup --> Understand["understand-portfolio"]
    Evidence --> ResearchSkill["research-technical-article"]
    Other --> Specialist["Choose the matching specialist above"]
```

## Choose your setup

### Codex, Claude Code, and other coding agents

Use the [quick-start command](#quick-start) to install with the [skills CLI](https://github.com/vercel-labs/skills). The install is project-scoped by default; add `-g` to install for your user across projects. See the CLI's documentation for supported agents and options. Ask for a skill by name; Codex also supports syntax such as `$portfolio-blog-workflow`.

Alternatively, for Codex, use the included installer with Git and Node.js 18 or later:

```sh
git clone https://github.com/sushilburagute/research-kit.git
node research-kit/scripts/install.mjs .
```

The included installer copies all nine skills into the project's `.agents/skills/` and skips existing folders. To upgrade an earlier local installation, compare the installed folders with this release and merge updates where you have local edits. Update the coordinator and review skill together to pick up the SEO and verifier handoffs. To try the kit without installing, ask your agent to read `skills/portfolio-blog-workflow/SKILL.md` from the checkout.

### Claude and ChatGPT chat

The CLI installs skills for supported coding agents; it does not install them into Claude or ChatGPT chat accounts. For Claude, follow its [custom skills instructions](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) to package and upload skill folders, including their resources. For ChatGPT chat, provide the relevant `SKILL.md` and supporting files as conversation or project context and ask it to follow them. For either chat, provide the other skill folders when the workflow calls for them.

File access, web research, scripts, and handoffs depend on the product and tools available in the session. The workflow also supports manual handoffs without Node.

## Make it yours

You can set up your writing profile before starting an article. For example, the kit's creator might use [sush.dev](https://sush.dev/) and select [How AI Quietly Made Me a Multi-Stack Engineer](https://sush.dev/blog/how-ai-quietly-made-me-a-multi-stack-engineer) and [Spotify API Integration with NextJS](https://sush.dev/blog/spotify-api-integration-with-nextjs) as writing samples:

> Use understand-portfolio to initialise my portfolio in this workspace. My portfolio is https://sush.dev. Use it and these articles to learn my byline, audience, and writing style: https://sush.dev/blog/how-ai-quietly-made-me-a-multi-stack-engineer and https://sush.dev/blog/spotify-api-integration-with-nextjs. I like drafting with enough detail to cut later.

Replace the URL and samples with your own, and include a local repository path if you want the assistant to inspect your site's conventions. If you don't have a portfolio or published posts yet, share your preferences instead.

Edit the resulting `writing-profile.md` whenever your preferences change. Each new article in the workspace takes its own copy. For a one-off change, include it in your article request—for example, “use a shorter, more conversational tone for this post.”

## Verify an existing post

> Use verify-portfolio-article on this draft. Have a fresh subagent check the benchmark math and whether the cited sources support the conclusions. Show the passage and evidence for each finding.

Supply the article text, file, or URL. A standalone check needs no writing profile or previous workflow run. In the full workflow, the same verifier checks the integrated article and its findings appear in the final review.

## Check an existing article for SEO

> Use optimize-article-seo on my post about cache misses. My audience is backend engineers debugging slow reads. Suggest title and description edits, then check the rendered page if available.

Supply the draft, a built page, or a public URL. You can run this skill on its own.

## Research without writing an article

> Use research-technical-article to investigate when a cache makes reads slower. Challenge my angle and give me the evidence.

Replace the question with your own. For stage details, CLI commands, and resuming a run, see the [workflow guide](docs/workflow.md).
