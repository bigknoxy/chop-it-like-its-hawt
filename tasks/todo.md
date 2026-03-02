- [x] Restate goal + acceptance criteria
- [x] Locate existing implementation / patterns
- [x] Design: minimal approach + key decisions
- [x] Implement smallest safe slice
- [x] Add/adjust tests (not expected)
- [x] Run verification (build + Playwright checks)
- [x] Summarize changes + verification story
- [x] Record lessons (if any)

## Working Notes
- Repo: /home/josh/projects/chopIt/chop-it-v1-1-clean
- Requirement: Volcanic Grove biome (volcanic_grove) with ember_oak, magma_willow, phoenix_pine and woods ember_ash, magma_core, phoenix_feather
- Unlock: 1000 total wood OR 20 Growth Essence; ensure UI list shows it
- Verification: build + Playwright forced biome to volcanic_grove (temporary tweak + revert)

## Acceptance Criteria
- Biome data present for volcanic_grove
- Trees and woods data present with correct ids
- BiomeSystem supports unlock/change and allowed trees
- Biome selection UI shows Volcanic Grove with correct unlock label
- `npm run build` succeeds
- Playwright verifies UI using forced volcanic_grove
- Docs updated if needed

## Results
- Added Volcanic Grove feature note to README.
- Verified biome selection UI shows Volcanic Grove and unlock label.

## Verification
- `npm run build`
- Playwright: opened Settings > Biomes, confirmed Volcanic Grove entry displays and marked Active (forced state during check).
