/**
 * Metrics computation from parsed bundles.
 *
 * Computes summary statistics for display in the metrics panel.
 */

import type { ParsedBundle, TraceEvent } from './parser';

export interface BundleMetrics {
  totalEvents: number;
  eventTypeCounts: Record<string, number>;
  totalReceipts: number;
  totalArtifacts: number;
  policyDecisions: {
    allow: number;
    deny: number;
    require_approval: number;
  };
  durationMs: number;
  hasSignatures: boolean;
}

/**
 * Compute metrics from a parsed bundle.
 */
export function computeMetrics(bundle: ParsedBundle): BundleMetrics {
  const eventTypeCounts: Record<string, number> = {};
  for (const event of bundle.events) {
    eventTypeCounts[event.event_type] = (eventTypeCounts[event.event_type] || 0) + 1;
  }

  const policyEvents = bundle.events.filter((e) => e.event_type === 'policy_decision');
  const policyDecisions = { allow: 0, deny: 0, require_approval: 0 };
  for (const event of policyEvents) {
    const decision = (event.payload as Record<string, string>).decision;
    if (decision in policyDecisions) {
      policyDecisions[decision as keyof typeof policyDecisions]++;
    }
  }

  const timestamps = bundle.events.map((e) => new Date(e.timestamp).getTime());
  const durationMs =
    timestamps.length >= 2 ? Math.max(...timestamps) - Math.min(...timestamps) : 0;

  const hasSignatures = bundle.receipts.some((r) => r.signature != null);

  return {
    totalEvents: bundle.events.length,
    eventTypeCounts,
    totalReceipts: bundle.receipts.length,
    totalArtifacts: bundle.artifacts.length,
    policyDecisions,
    durationMs,
    hasSignatures,
  };
}
