# @agentic-evidence/verifier

TypeScript (or WASM) client-side verifier for agent evidence bundles.

## Features

- Hash chain verification
- Schema validation
- Signature verification (Ed25519 via WebCrypto)
- Bundle completeness checks

## Usage

```typescript
import { verifyBundle } from '@agentic-evidence/verifier';

const result = verifyBundle(parsedBundle);
console.log(result.passed ? 'PASS' : 'FAIL');
```

## Integration

Used by `agentic-evidence-viewer` for client-side verification.
Can also be used standalone in Node.js or browser environments.
