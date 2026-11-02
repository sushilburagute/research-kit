# Research Kit

Research and develop technical portfolio articles with an AI agent while keeping the argument, experience, and story in the author's hands.

Research Kit is a package of seven skills and dependency-free handoff tooling. Use the research skill on its own for an inspectable brief and evidence ledger, or use the portfolio workflow for an outline, draft, optional artifacts, repository integration, and review. A research request does not automatically become a full article.

## Start here

1. Choose your endpoint: research material, a drafted article, repository changes, or an authorized PR/publication action.
2. For research only, ask the agent to read [`research-technical-article/SKILL.md`](skills/research-technical-article/SKILL.md). For the larger workflow, start with [`portfolio-blog-workflow/SKILL.md`](skills/portfolio-blog-workflow/SKILL.md).
3. Provide a title plus description or talking points, your reader, and a tentative angle. For portfolio work, select the repository and a few writing samples; add your notes and permitted sources.
4. Install the complete skill folders through your host's supported mechanism, or ask it to read them here. Keep all seven as siblings for automatic helper dispatch. Individual specialists remain usable independently.
5. Review the evidence, proposed editorial decisions, and actual output. The workflow uses available host tools and can run sequentially or hand independent work to subagents. Missing capabilities are reported rather than simulated.

Example request:

> Use the research-technical-article skill to investigate when microfrontends justify their operational cost. The audience is engineers considering a migration. My tentative angle is that team autonomy matters more than frontend scale. Challenge that angle, separate documented evidence from inference, and prepare research I can use to tell my own story. Save outputs under research/microfrontends/.

The example is a research request, not a claim about microfrontends. No personal work history or private repository is assumed.

For an article workflow:

> Use portfolio-blog-workflow to develop a blog from this title and these talking points. Inspect my selected portfolio repository and two posts for conventions and voice, challenge my angle through research, draft a story, create a demo only if it explains something useful, reuse existing components, integrate citations, and review the result. Keep outputs in my article workspace and stage proposed repository files there. Do not publish. My title is [...], my reader is [...], and my notes are [...].

Replace the example fields and supply actual authorized repository/sample locators. See [the workflow walkthrough](docs/workflow.md) for handoffs, local commands, revision handling, and publication boundaries.

## Skills and outputs

| Skill | Responsibility | Main outputs |
| --- | --- | --- |
| [portfolio-blog-workflow](skills/portfolio-blog-workflow/SKILL.md) | Coordinate dependencies, decisions, ownership, revision and readiness | Durable run state, task packets, final handoff |
| [understand-portfolio](skills/understand-portfolio/SKILL.md) | Inspect selected repository and posts | Verified repository context, editable writing profile |
| [research-technical-article](skills/research-technical-article/SKILL.md) | Investigate, read sources, challenge claims | Research brief, evidence ledger |
| [compose-technical-article](skills/compose-technical-article/SKILL.md) | Structure and draft within author intent | Outline, draft, talking-point summary, decisions |
| [build-article-artifacts](skills/build-article-artifacts/SKILL.md) | Build optional explanatory artifacts | Staged assets/code, assumptions and check report |
| [integrate-portfolio-article](skills/integrate-portfolio-article/SKILL.md) | Reuse repository conventions and render citations | Staged files or authorized edits, integration report |
| [review-portfolio-article](skills/review-portfolio-article/SKILL.md) | Audit evidence, narrative and actual integration | Findings, responsible stages, review verdict |

The coordinator's Node helper manages handoff state; it does not invoke models, supply browsing, execute builds, or publish. The host agent performs those tasks with available tools. Node is optional for the instruction-only workflow; the same handoffs can be maintained in conversation with structural-validation limits disclosed.

## What you receive

- Research-only: a compact brief, evidence ledger, author questions, and explicit coverage/access limits.
- Article workflow: those research outputs plus portfolio context, a provisional writing profile, an outline and draft, talking-point coverage, editorial decisions, optional artifacts, integration files/report, and review findings.
- A final handoff distinguishing finished work from evidence gaps, unrun checks, required corrections, author input, and permission to publish.

Keep each article's outputs outside the installed skill directory, preferably outside this public repository. `.research-kit-runs/` is ignored for local trials. The templates are starting points; expand evidence entries when a table would hide important context. Do not commit private notes, writing profiles, credentials, or licensed source copies to this public repository.

## Scope

The package covers research and the larger article workflow through focused instructions, output templates, a repository-discovery adapter, and executable handoff validation. Optional artifacts use the host's existing capabilities and the target repository's conventions; no framework, demo runtime, or writing profile is hardcoded. See [the roadmap](docs/roadmap.md) for evaluation status and deferred work.

The skill supplies a process, not search access, model credits, a crawler, a scheduler, or an accuracy guarantee. If the host cannot access evidence, it must disclose that limit rather than pretend research succeeded. Research runs on the host's tools and providers; local output files do not imply local AI processing.

## Validate the package

With Node.js 18 or newer, run:

```sh
node scripts/check-skill.mjs
node --test tests/check-skill.test.mjs
node --test tests/workflow.test.mjs
```

The checker validates all seven skills, metadata, local references, templates, and unresolved authoring markers in maintained package directories. Its metadata parser deliberately handles this package's simple name/description convention, not arbitrary YAML. Workflow tests cover dependencies, separate ownership, stale results, scoped paths, failures, retries, revision invalidation, and review/readiness separation. These checks do not judge whether external evidence supports claims, prose preserves the author's voice, or a portfolio renders correctly. [Research scenarios](evals/scenarios.md) and [workflow scenarios](evals/workflow-scenarios.md) describe behavioral evaluation. One [source-limited workflow trial](evals/workflow-forward-result.md) exercised drafting, staged MDX integration, host delegation and independent review; it did not render a production portfolio or establish live research accuracy.

## Design and references

Use question-driven investigation, explicit evidence outcomes, and targeted editorial suggestions. Keep the skill small and load supporting references when needed. The package is written for Research Kit; it does not bundle competitor implementations.

- [Agent Skills specification](https://agentskills.io/specification)
- [STORM and Co-STORM](https://github.com/stanford-oval/storm): perspective-driven research and human steering.
- [Lyra review documentation](https://docs.trylyra.ai/concepts/review-scores/): claim-level outcomes and unresolved evidence.
- [Lex style and editing features](https://lex.page/about): author-controlled suggestions.

These references explain the design inputs, not equivalent performance or endorsement.
