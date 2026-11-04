---
name: optimize-article-seo
description: Plan search intent for a technical portfolio article or audit a draft or rendered post for on-page SEO. Use for article discovery, search titles and descriptions, internal links, canonical URLs, or article indexability checks.
---

# Optimize article SEO

## Scope the request

Read the request, brief, profile and any prior answers. When scope is open, use the host's question tool to batch 2–3 short questions. Which developer is searching and what are they trying to solve? Which draft, URL or query data should guide the pass? Is the page intended for public search or a private preview? Ask only unresolved questions, fall back to chat when the tool is unavailable, and proceed when the author delegates a choice. In a coordinated run, reuse the brief and route new material questions through the coordinator.

## Plan before outlining

- Write the reader's likely search question in their own terms. Label inferred queries as hypotheses. If the author supplies search data, identify its source and date range. Never invent search volume or difficulty.
- State the answer the evidence supports, the first-hand example that helps deliver it, and any version or environment limits. For example, use Redis in a title about cache latency only when the article actually covers Redis.
- Propose a descriptive title, a short summary suitable for a meta description, and relevant headings or internal links where they help the reader. Verify link destinations when accessible. Preserve author voice, technical qualifications and established URLs.
- In a workflow, record the question, rationale and proposed or adopted wording in the existing editorial decisions. The composer owns the draft and the integrator maps adopted wording to the site's supported metadata.

## Audit an existing draft or integrated page

Flag title or description changes that introduce a factual promise. In a lifecycle run, include the exact wording for the independent verifier to check against the evidence.

- Check whether the opening answers the intended question and the body delivers the title's promise. Suggest precise replacements for vague or overstated wording. Preserve the author's argument and avoid keyword repetition.
- Inspect the actual preview, built HTML, or public response available for the target. Check the emitted title, meta description, main heading, useful crawlable internal links, and canonical destination against the intended public route. Check robots directives in HTML and response headers where available. A private preview may intentionally use `noindex`.
- Distinguish source observations, rendered checks, and live checks. With Markdown alone, evaluate the copy and mark rendered metadata and live directives unverified. A preview cannot establish Google’s indexing decision or a ranking.
- Return prioritized findings with the location, observation, proposed edit and reason. Identify the input inspected and checks that could not run. For a coordinated review, put findings in `review-report.md` and route them to the stage that owns the fix. Standalone, return the plan or audit directly and edit only when requested.

Use Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) and [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) when a recommendation needs clarification.
