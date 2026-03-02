- [x] Restate goal + acceptance criteria
- [x] Locate conflicts and upstream changes
- [x] Resolve conflicts, keeping v1.1 features + main fixes
- [x] Ensure build/paths/mobile/nav fixes preserved
- [x] Run verification (npm run build)
- [x] Summarize changes + verification story
- [x] Record lessons (if any)

## Working Notes
- Merge main into feature/v1-1-clean; keep v1.1 features (biomes/skills/achievements/daily) while preserving upstream fixes (mobile touch, nav overlap, base path).
- Conflicts in index.html, core/state/types, data (biomes/trees/woods), systems (biome/chop), ui, css.

## Acceptance Criteria
- All conflict markers resolved.
- v1.1 feature content retained.
- Upstream main fixes preserved where not already present.
- `npm run build` succeeds.

## Results
- Resolved merge conflicts in HTML, core state/types, data, systems, UI, and styles while keeping v1.1 screens and mechanics.
- Dropped main-only map/pets content and companion system to avoid orphaned state.
- Preserved mobile touch handling, safe-area nav padding, and base path config.

## Verification
- `npm run build`
