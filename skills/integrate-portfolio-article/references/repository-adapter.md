# Repository integration adapter

Record observed contracts instead of guessing a framework from the repository name. A missing fact is `unknown`; an unexecuted command is `not-run`.

| Contract | Inspect | Record |
| --- | --- | --- |
| Content discovery | Existing article, content loader or collection config | Exact directory, extension, collection registration, ordering |
| Metadata | Schema and a representative current article | Required keys, types, allowed values, defaults, date and draft behavior |
| Routes | Existing content routes and link helpers | Slug derivation, canonical URL rule, image/link path resolution |
| Markdown/MDX | Renderer/compiler configuration, component registry, working article | Supported syntax, import/exports, registered components, lead styling, code highlighting, footnote/reference transforms |
| Components | Relevant source and working use site | Import path, exported name, required props, styles, accessibility constraints |
| Interactive code | Existing client component, lazy wrapper, or island | Hydration convention, bundle-loading scope, server/client boundary, data serialization, static/feed fallback |
| Assets | Existing image component and asset config | Public/source asset distinction, optimization, dimensions, alt text |
| Validation | Package scripts, CI configuration, content tests | Exact commands, package manager, environment requirements, scope |
| Publication | Deployment config and author instruction | What action actually publishes; do not infer permission from its existence |

For React/MDX repositories, confirm whether React is actually used for content components and whether the page is server-rendered, statically generated, or client-rendered. An interactive component may require a client directive or framework-specific hydration syntax; the adapter must cite an existing working example. Do not copy conventions from another framework. A custom content compiler may reject unregistered components or transform footnotes into a references section, and a production build may run content validation first. Discover the actual checks; do not assume a generic test script exists. When documentation conflicts with current configuration, record the mismatch and verify the current implementation before applying a convention.

When producing an unapplied patch, include target paths relative to the verified repository root, the inspected commit, changes needed, asset placement, and application instructions. Keep private source excerpts within the authorized run workspace. A plan does not count as a successful repository build or preview.
