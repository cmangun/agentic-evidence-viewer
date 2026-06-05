<script lang="ts">
  import { computeMetrics, type BundleMetrics } from '../lib/metrics';
  import { parseBundle, type ParsedBundle } from '../lib/parser';
  import { verifyBundle, type VerificationResult } from '../lib/verifier';

  let bundle: ParsedBundle | null = null;
  let metrics: BundleMetrics | null = null;
  let verification: VerificationResult | null = null;
  let error = '';

  async function loadFiles(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    const files = new Map<string, string>();

    error = '';
    bundle = null;
    metrics = null;
    verification = null;

    try {
      await Promise.all(
        selected.map(async (file) => {
          files.set(file.name, await file.text());
        }),
      );
      bundle = parseBundle(files);
      metrics = computeMetrics(bundle);
      verification = verifyBundle(bundle);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : 'Unable to parse bundle';
    }
  }
</script>

<svelte:head>
  <title>Agentic Evidence Viewer</title>
  <meta
    name="description"
    content="Inspect agent traces, receipts, policy decisions, and artifact manifests."
  />
</svelte:head>

<main>
  <header>
    <p>Agentic Evidence</p>
    <h1>Execution Bundle Viewer</h1>
    <span>Inspect trace coverage, receipt integrity, policy decisions, and artifacts locally.</span>
  </header>

  <section class="upload">
    <label for="bundle-files">Open bundle files</label>
    <input
      id="bundle-files"
      type="file"
      multiple
      accept=".json,.jsonl,application/json"
      onchange={loadFiles}
    />
    <small>Select the manifest, trace, receipts, and optional artifact manifest together.</small>
  </section>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#if bundle && metrics && verification}
    <section class="status" class:passed={verification.passed}>
      <div>
        <p>Integrity</p>
        <h2>{verification.passed ? 'PASS' : 'FAIL'}</h2>
      </div>
      <span>{verification.summary}</span>
    </section>

    <section class="metrics">
      <article><strong>{metrics.totalEvents}</strong><span>Trace events</span></article>
      <article><strong>{metrics.totalReceipts}</strong><span>Receipts</span></article>
      <article><strong>{metrics.totalArtifacts}</strong><span>Artifacts</span></article>
      <article><strong>{metrics.durationMs} ms</strong><span>Trace duration</span></article>
    </section>

    <section>
      <h2>Verification Checks</h2>
      <div class="checks">
        {#each verification.checks as check}
          <article>
            <strong>{check.passed ? 'Pass' : 'Fail'}: {check.name}</strong>
            <span>{check.details}</span>
          </article>
        {/each}
      </div>
    </section>

    <section>
      <h2>Trace Timeline</h2>
      <div class="checks">
        {#each bundle.events as event}
          <article>
            <strong>{event.sequence}. {event.event_type}</strong>
            <span>{event.timestamp}</span>
          </article>
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; background: #f4f5f3; color: #171917; font-family: Inter, Arial, sans-serif; }
  main { width: min(1040px, calc(100% - 40px)); margin: 0 auto; padding: 72px 0; }
  header { border-bottom: 1px solid #cfd2cc; padding-bottom: 32px; }
  header p, .status p { margin: 0 0 10px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
  h1 { max-width: 700px; margin: 0 0 16px; font-size: clamp(42px, 7vw, 76px); line-height: 1; }
  header span, small, article span, .status span { color: #5d625d; line-height: 1.6; }
  section { margin-top: 40px; }
  .upload { display: grid; gap: 12px; padding: 24px; background: white; border: 1px solid #d9dcd6; }
  .upload label { font-size: 20px; font-weight: 700; }
  .status { display: flex; align-items: center; justify-content: space-between; padding: 24px; background: #2a1717; color: white; }
  .status.passed { background: #173124; }
  .status h2 { margin: 0; font-size: 36px; }
  .status span { color: #d6ddd7; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .metrics article, .checks article { display: grid; gap: 6px; padding: 20px; background: white; border: 1px solid #d9dcd6; }
  .metrics strong { font-size: 28px; }
  .checks { display: grid; gap: 10px; }
  .error { padding: 16px; background: #fff0f0; border: 1px solid #d6aaaa; }
  @media (max-width: 700px) {
    main { width: min(100% - 28px, 1040px); padding: 44px 0; }
    .metrics { grid-template-columns: repeat(2, 1fr); }
    .status { align-items: flex-start; flex-direction: column; gap: 12px; }
  }
</style>
