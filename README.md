# agentic-evidence-viewer

A drag-drop viewer for **agent traces, receipts, policy decisions, and artifacts**.

This repo lets a reviewer open a bundle and see:
- Integrity status (PASS/FAIL) with reasons
- Trace timeline and event details
- Policy decisions and required gates
- Artifact manifests and previews (safe types)
- Summary metrics (cost/latency/errors)

Bundle and receipt standards:
- [agentic-receipts](https://github.com/cmangun/agentic-receipts)

## Quick Start

```bash
cd apps/viewer
npm install
npm run dev
```

Then drag-drop a bundle from `examples/bundles/`.

## Architecture

```
Bundle (dropped) → Parser → Verifier → Renderer
                              ↓
                    [schema + chain + signature]
                              ↓
                    Integrity Badge (PASS/FAIL)
```

### Views

| View | Description |
|------|-------------|
| **Timeline** | Chronological trace events with expandable details |
| **Policy** | Allow/deny decisions with rationale and policy hash |
| **Artifacts** | File explorer with safe previews (text/markdown/JSON) |
| **Metrics** | Cost, latency, error rates, tool call distribution |
| **Integrity** | Hash chain verification, signature status |

## Tech Stack

- **SvelteKit** — UI framework
- **TypeScript** — Type safety
- **WASM verifier** — Client-side hash chain and signature verification

## Suite

This repo is part of the **Agentic Evidence Suite**:
- [agentic-receipts](https://github.com/cmangun/agentic-receipts) (standard)
- [agentic-trace-cli](https://github.com/cmangun/agentic-trace-cli) (tooling)
- [agentic-artifacts](https://github.com/cmangun/agentic-artifacts) (outputs)
- [agentic-policy-engine](https://github.com/cmangun/agentic-policy-engine) (governance)
- [agentic-eval-harness](https://github.com/cmangun/agentic-eval-harness) (scenarios)
- [agentic-evidence-viewer](https://github.com/cmangun/agentic-evidence-viewer) (review UI)

## License

MIT
