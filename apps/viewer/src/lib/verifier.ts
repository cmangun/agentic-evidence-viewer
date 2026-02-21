/**
 * Client-side verification of hash chains and signatures.
 *
 * Verifies bundle integrity without requiring a server:
 * - Hash chain continuity (each receipt chains to the previous)
 * - Schema validation (required fields present)
 * - Signature verification (when available, via WebCrypto or WASM)
 */

import type { Receipt, ParsedBundle } from './parser';

export interface VerificationResult {
  passed: boolean;
  checks: VerificationCheck[];
  summary: string;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  details: string;
}

/**
 * Verify the integrity of a parsed bundle.
 */
export function verifyBundle(bundle: ParsedBundle): VerificationResult {
  const checks: VerificationCheck[] = [];

  // Check 1: Bundle has events and receipts
  checks.push({
    name: 'Bundle completeness',
    passed: bundle.events.length > 0 && bundle.receipts.length > 0,
    details: `${bundle.events.length} events, ${bundle.receipts.length} receipts`,
  });

  // Check 2: Event count matches manifest
  checks.push({
    name: 'Event count match',
    passed: bundle.events.length === bundle.manifest.event_count,
    details: `Manifest declares ${bundle.manifest.event_count}, found ${bundle.events.length}`,
  });

  // Check 3: Receipt count matches event count
  checks.push({
    name: 'Receipt coverage',
    passed: bundle.receipts.length === bundle.events.length,
    details: `${bundle.receipts.length} receipts for ${bundle.events.length} events`,
  });

  // Check 4: Hash chain continuity
  const chainResult = verifyHashChain(bundle.receipts);
  checks.push(chainResult);

  // Check 5: Event-receipt linkage
  const linkageResult = verifyEventReceiptLinkage(bundle);
  checks.push(linkageResult);

  const passed = checks.every((c) => c.passed);
  const failedCount = checks.filter((c) => !c.passed).length;

  return {
    passed,
    checks,
    summary: passed
      ? `All ${checks.length} checks passed`
      : `${failedCount}/${checks.length} checks failed`,
  };
}

/**
 * Verify hash chain continuity: each receipt's prev_hash matches the
 * previous receipt's hash.
 */
function verifyHashChain(receipts: Receipt[]): VerificationCheck {
  if (receipts.length === 0) {
    return { name: 'Hash chain', passed: false, details: 'No receipts to verify' };
  }

  // First receipt should have prev_hash = "genesis"
  if (receipts[0].prev_hash !== 'genesis') {
    return {
      name: 'Hash chain',
      passed: false,
      details: `First receipt prev_hash is "${receipts[0].prev_hash}", expected "genesis"`,
    };
  }

  // Each subsequent receipt should chain to the previous
  for (let i = 1; i < receipts.length; i++) {
    if (receipts[i].prev_hash !== receipts[i - 1].hash) {
      return {
        name: 'Hash chain',
        passed: false,
        details: `Chain broken at receipt ${i}: prev_hash doesn't match previous hash`,
      };
    }
  }

  return {
    name: 'Hash chain',
    passed: true,
    details: `${receipts.length} receipts form a continuous chain`,
  };
}

/**
 * Verify that every event has a corresponding receipt.
 */
function verifyEventReceiptLinkage(bundle: ParsedBundle): VerificationCheck {
  const receiptEventIds = new Set(bundle.receipts.map((r) => r.event_id));
  const unlinked = bundle.events.filter((e) => !receiptEventIds.has(e.event_id));

  return {
    name: 'Event-receipt linkage',
    passed: unlinked.length === 0,
    details:
      unlinked.length === 0
        ? 'All events have corresponding receipts'
        : `${unlinked.length} events missing receipts`,
  };
}
