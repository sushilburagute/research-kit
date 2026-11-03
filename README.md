# Research Kit

Research a technical question or turn your notes into a portfolio article. The full workflow produces a draft, a claim-to-source evidence ledger, proposed portfolio files, and an editorial review. Publishing requires your instruction.

## Install once

Open a terminal in your private writing workspace (one per author and portfolio). With Git and Node.js 18+ installed, run these commands:

```sh
git clone https://github.com/sushilburagute/research-kit.git
node research-kit/scripts/install.mjs .
```

Open that workspace in Codex and start a new chat. The installer copies all seven skills into the project's `.agents/skills/` and skips existing folders. To try the kit without installing, ask your agent to read `skills/portfolio-blog-workflow/SKILL.md` from the checkout. The skills also support manual handoffs without Node.

## Set up your writer profile

> Use $understand-portfolio to initialise my portfolio in this workspace. My portfolio is [path or URL]. Use [About page] and [one or two posts] to learn my byline, audience and writing style. I like drafting with enough detail to cut later.

Edit the resulting `writing-profile.md` whenever your preferences change. Each new article in this workspace takes its own copy. You can also start with an article and let the workflow handle first-time setup.

## Write an article

> Use $portfolio-blog-workflow to write about when a cache makes reads slower. My notes are [talking points]. Use my saved profile and stage the article here for review.

If a choice such as length or tone would change the draft, the agent asks a focused question. You can pick an option or leave the choice to the agent. To make a one-off change, say “use a shorter, more conversational tone for this post.”

For research alone:

> Use $research-technical-article to investigate when a cache makes reads slower. Challenge my angle and give me the evidence.

For stage details, CLI commands and resuming a run, see the [workflow guide](docs/workflow.md).
