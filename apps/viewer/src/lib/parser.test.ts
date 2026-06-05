import { describe, expect, it } from 'vitest';

import { computeMetrics } from './metrics';
import { parseBundle, parseJsonl } from './parser';
import { verifyBundle } from './verifier';

const manifest = {
  bundle_id: 'bundle-1',
  version: '1.0',
  created_at: '2026-01-01T00:00:00Z',
  trace_file: 'trace.jsonl',
  receipts_file: 'receipts.jsonl',
  event_count: 2,
};

const trace = [
  {
    event_id: 'event-1',
    event_type: 'prompt',
    timestamp: '2026-01-01T00:00:00Z',
    sequence: 1,
    payload: {},
  },
  {
    event_id: 'event-2',
    event_type: 'policy_decision',
    timestamp: '2026-01-01T00:00:01Z',
    sequence: 2,
    payload: { decision: 'allow' },
  },
];

const receipts = [
  {
    receipt_id: 'receipt-1',
    event_id: 'event-1',
    hash: 'hash-1',
    prev_hash: 'genesis',
    timestamp: trace[0].timestamp,
    event_type: trace[0].event_type,
  },
  {
    receipt_id: 'receipt-2',
    event_id: 'event-2',
    hash: 'hash-2',
    prev_hash: 'hash-1',
    timestamp: trace[1].timestamp,
    event_type: trace[1].event_type,
  },
];

function bundleFiles() {
  return new Map([
    ['bundle.json', JSON.stringify(manifest)],
    ['trace.jsonl', trace.map((item) => JSON.stringify(item)).join('\n')],
    ['receipts.jsonl', receipts.map((item) => JSON.stringify(item)).join('\n')],
  ]);
}

describe('bundle evidence processing', () => {
  it('parses JSONL while ignoring blank lines', () => {
    expect(parseJsonl<{ id: number }>('{"id":1}\n\n{"id":2}\n')).toEqual([
      { id: 1 },
      { id: 2 },
    ]);
  });

  it('parses and verifies a complete hash-linked bundle', () => {
    const bundle = parseBundle(bundleFiles());
    const verification = verifyBundle(bundle);

    expect(verification.passed).toBe(true);
    expect(verification.checks).toHaveLength(5);
  });

  it('detects a broken receipt chain', () => {
    const files = bundleFiles();
    const broken = [...receipts];
    broken[1] = { ...broken[1], prev_hash: 'wrong-hash' };
    files.set('receipts.jsonl', broken.map((item) => JSON.stringify(item)).join('\n'));

    expect(verifyBundle(parseBundle(files)).passed).toBe(false);
  });

  it('computes policy and duration metrics', () => {
    const metrics = computeMetrics(parseBundle(bundleFiles()));

    expect(metrics.totalEvents).toBe(2);
    expect(metrics.policyDecisions.allow).toBe(1);
    expect(metrics.durationMs).toBe(1000);
  });
});
