/**
 * Bundle parser: reads trace JSONL, receipts JSONL, and manifests.
 *
 * Parses the contents of an agent evidence bundle into typed structures
 * for rendering in the viewer.
 */

export interface TraceEvent {
  event_id: string;
  event_type: string;
  timestamp: string;
  sequence: number;
  parent_event_id?: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface Receipt {
  receipt_id: string;
  event_id: string;
  hash: string;
  prev_hash: string;
  timestamp: string;
  event_type: string;
  signature?: {
    algorithm: string;
    public_key: string;
    value: string;
  };
  metadata?: Record<string, unknown>;
}

export interface Artifact {
  artifact_id: string;
  event_id: string;
  hash: string;
  path: string;
  artifact_type: string;
  content_type?: string;
  size_bytes?: number;
  provenance?: {
    trace_event_ids: string[];
    model?: string;
    tool?: string;
  };
}

export interface BundleManifest {
  bundle_id: string;
  version: string;
  created_at: string;
  trace_file: string;
  receipts_file: string;
  artifacts_manifest?: string;
  event_count: number;
  metadata?: Record<string, unknown>;
}

export interface ParsedBundle {
  manifest: BundleManifest;
  events: TraceEvent[];
  receipts: Receipt[];
  artifacts: Artifact[];
}

/**
 * Parse JSONL content into an array of objects.
 */
export function parseJsonl<T>(content: string): T[] {
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as T);
}

/**
 * Parse a complete bundle from file contents.
 */
export function parseBundle(files: Map<string, string>): ParsedBundle {
  const manifestContent = files.get('bundle.json') || files.get('manifest.json');
  if (!manifestContent) {
    throw new Error('Bundle manifest (bundle.json or manifest.json) not found');
  }

  const manifest: BundleManifest = JSON.parse(manifestContent);

  const traceContent = files.get(manifest.trace_file) || '';
  const receiptsContent = files.get(manifest.receipts_file) || '';
  const artifactsContent = manifest.artifacts_manifest
    ? files.get(manifest.artifacts_manifest) || ''
    : '';

  const events = traceContent ? parseJsonl<TraceEvent>(traceContent) : [];
  const receipts = receiptsContent ? parseJsonl<Receipt>(receiptsContent) : [];

  let artifacts: Artifact[] = [];
  if (artifactsContent) {
    const artifactManifest = JSON.parse(artifactsContent);
    artifacts = artifactManifest.artifacts || [];
  }

  return { manifest, events, receipts, artifacts };
}
