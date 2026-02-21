# UX Notes

## Design Principles

1. **Zero-install**: Single HTML page that works from `file://` or GitHub Pages
2. **Drag-and-drop**: No file picker dialogs; drop a bundle directory
3. **Integrity first**: Verification badge visible before any content
4. **Progressive disclosure**: Summary → timeline → details on click
5. **Safe previews**: Only render text/markdown/JSON; sandbox everything else

## Layout

```
┌─────────────────────────────────────────┐
│  [PASS/FAIL Badge]  Bundle: demo-001    │
├────────┬────────────────────────────────┤
│ Nav    │ Content                        │
│        │                                │
│ ▸ Timeline │  [Selected view renders   │
│ ▸ Policy   │   here based on nav]      │
│ ▸ Artifacts│                            │
│ ▸ Metrics  │                            │
│ ▸ Integrity│                            │
│        │                                │
└────────┴────────────────────────────────┘
```

## Color System

- **Pass**: Green badge (#22c55e)
- **Fail**: Red badge (#ef4444)
- **Warning**: Yellow badge (#eab308)
- **Neutral**: Gray for metadata

## Redaction Display

Redacted fields shown as:
- Strikethrough placeholder
- "REDACTED (PHI)" label
- Hash tooltip showing the original hash for verification
