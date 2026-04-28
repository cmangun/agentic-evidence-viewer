# Non-goals

What `agentic-evidence-viewer` deliberately does not try to be. The viewer is the auditor's read-only inspection surface; companion components own everything it doesn't.

## Not a server-backed application

The viewer runs entirely client-side, with no server, no account, and no telemetry. An auditor opens the viewer in a browser, drops a bundle on it, and verification happens locally. Network access during inspection is unnecessary and explicitly avoided to preserve the trust model.

## Not an authoring tool

The viewer is read-only by design. It does not edit, sign, redact, or re-emit bundles. Authoring belongs to the agent runtime; transformation belongs to `agentic-trace-cli`. The viewer's asymmetry — read-only by construction — is what makes "open this bundle and verify it" a safe operation.

## Not a runtime monitor

Bundles are inspected post-hoc, after a session completes and exports its bundle. Live monitoring of an in-flight agent run is a different problem, owned by observability tooling (OpenTelemetry, dashboards, alerting). The viewer does not stream from a running agent.

## Not a CI dashboard

CI integration — running scenarios, gating builds on regression results, surfacing pass/fail in pipelines — happens via `agentic-trace-cli` and `agentic-eval-harness` exit codes and CI runner output. The viewer is for human inspection, not pipeline automation.

## Not a multi-bundle library

The viewer opens one bundle at a time per import. It does not maintain a library, search across past imports, or correlate findings between bundles. Bundle organization — archiving, indexing, retention — is the operator's responsibility outside the viewer.
