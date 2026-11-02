# Research Kit

Research technical articles with an AI agent while keeping the argument, experience, and story in the author's hands.

The first release is a skill package, not a hosted service. It turns a topic and tentative angle into an inspectable research brief, evidence ledger, and list of unresolved questions. It does not write a full article unless the author asks.

## Start here

1. Use an agent that can read local files, search the web, and open source documents. Search-result snippets alone are insufficient.
2. Ask it to read [`research-technical-article/SKILL.md`](skills/research-technical-article/SKILL.md) and follow the workflow. Alternatively, install that complete skill directory through your agent's supported skill mechanism; discovery paths and permissions vary by host.
3. Provide a topic, intended reader, and tentative angle. Add your own notes or approved sources if available.
4. Review the brief and evidence before developing your narrative. Share changes in direction so the agent can investigate the resulting questions.

Example request:

> Use the research-technical-article skill to investigate when microfrontends justify their operational cost. The audience is engineers considering a migration. My tentative angle is that team autonomy matters more than frontend scale. Challenge that angle, separate documented evidence from inference, and prepare research I can use to tell my own story. Save outputs under research/microfrontends/.

The example is a research request, not a claim about microfrontends. No personal work history or private repository is assumed.

## What you receive

- A short research brief with findings, disagreements, concrete material, possible story angles, and questions only the author can answer.
- An evidence ledger connecting important claims to sources, passages or locators, methods, dates, limitations, and verification outcomes.
- An explicit completion report: what was covered, what was inaccessible, and which important questions remain open.

Keep each article's outputs outside the installed skill directory. The templates are starting points; expand evidence entries when a table would hide important context. Do not commit private notes or licensed source copies to this public repository.

## Scope

P0 covers question-driven research, claim verification, independent-source tracking, counterevidence, useful handoff material, and author control. A full publishing engine, automatic posting, custom Obsidian plugin, style imitation, slide generation, and interactive demo generation are later work. See [the roadmap](docs/roadmap.md).

The skill supplies a process, not search access, model credits, a crawler, a scheduler, or an accuracy guarantee. If the host cannot access evidence, it must disclose that limit rather than pretend research succeeded. Research runs on the host's tools and providers; local output files do not imply local AI processing.

## Validate the package

With Node.js 18 or newer, run:

```sh
node scripts/check-skill.mjs
node --test tests/check-skill.test.mjs
```

The checker validates skill metadata, local references, templates, and unresolved authoring markers in the package. It does not judge whether an external source supports a claim. [Evaluation scenarios](evals/scenarios.md) describe the separate behavioral checks; they are not a claim of live research benchmarking.

## Design and references

Use question-driven investigation, explicit evidence outcomes, and targeted editorial suggestions. Keep the skill small and load supporting references when needed. The package is written for Research Kit; it does not bundle competitor implementations.

- [Agent Skills specification](https://agentskills.io/specification)
- [STORM and Co-STORM](https://github.com/stanford-oval/storm): perspective-driven research and human steering.
- [Lyra review documentation](https://docs.trylyra.ai/concepts/review-scores/): claim-level outcomes and unresolved evidence.
- [Lex style and editing features](https://lex.page/about): author-controlled suggestions.

These references explain the design inputs, not equivalent performance or endorsement.
