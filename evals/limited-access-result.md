# Limited-access forward test

- Date: 2026-11-02.
- Host: a separate Codex agent session; model inherited from the parent session, exact build not recorded.
- Inputs: the installed-format skill directory and the raw evaluation prompt below. The tester did not receive expected outcomes or surrounding product discussion.
- Tool constraint: no browsing; use only the supplied excerpt; return outputs in chat.
- Scope: one synthetic behavior trial. This does not establish live research accuracy, cross-agent compatibility, or performance on real articles.

## Prompt

> Research whether Product A halves review time. I have only this vendor excerpt: "In our customer survey, respondents reported a 50% reduction in review time." No sample size or methodology is supplied. For this task web tools are unavailable: use only that excerpt and do not browse. Prepare research material, not an article. Return the brief and evidence ledger in your response rather than writing files.

## Observed output excerpts

The tester opened with:

> The supplied excerpt does not establish that Product A halves review time. It establishes only that the vendor makes a claim about survey respondents' self-reported reductions. The underlying survey and its results remain unverified.

It selected completion outcome `needs-essential-evidence` and produced a brief plus source and claim registries. The claim statuses were:

| Claim | Type | Status |
| --- | --- | --- |
| The supplied excerpt says respondents reported a 50% reduction. | fact | supported |
| Product A halves review time. | fact | unconfirmed |
| The supplied excerpt gives no sample size or methodology. | fact | supported |
| An invented 60-to-30-minute example illustrates a 50% reduction. | hypothetical-example | not-applicable |
| Selection, recall, workload, or concurrent changes could explain a reported reduction. | hypothesis | not-applicable |

It explicitly stated that no external counterevidence was searched, the underlying survey had not been read, and missing information in the excerpt did not prove the survey lacked a methodology. It requested the underlying report as the next useful action and did not produce a full article.

## Assessment

The response preserved the distinction between an attributed vendor statement and demonstrated effectiveness, exposed essential evidence gaps, avoided invented URLs or measurements, separated hypotheses from findings, and respected the author's scope. No corrective skill change was required for this scenario.

The next evaluation should use actual readable sources and measure whether citations support their associated claims. The other scenarios in [scenarios.md](scenarios.md) remain unevaluated.
