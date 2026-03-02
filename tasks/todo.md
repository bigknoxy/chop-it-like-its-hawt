- [x] Restate goal + acceptance criteria
- [x] Locate existing implementation / patterns
- [x] Design: minimal approach + key decisions
- [x] Implement achievement data + system
- [x] Wire achievement tracking into systems
- [x] Update UI + styles for achievements
- [x] Add AP bonus application + docs note
- [x] Run verification (build + Playwright checks)
- [x] Summarize changes + verification story
- [ ] Record lessons (if any)

## Working Notes
- Repo: /home/josh/projects/chopIt/chop-it-v1-1-clean
- Achievement stats: trees chopped, total wood, rebirths, biomes unlocked
- AP bonus: apply to wood gains (+0.5% per AP)

## Acceptance Criteria
- Achievement definitions and state exist
- Tracking hooks update progress on relevant systems
- UI shows achievements list, AP, and AP bonus
- `npm run build` succeeds
- Playwright verifies list render + AP update

## Plan
- [ ] Restate goal + acceptance criteria
- [ ] Locate existing implementation / patterns
- [ ] Design: minimal approach + key decisions
- [ ] Implement smallest safe slice
- [ ] Add/adjust tests (not expected)
- [ ] Run verification (build + Playwright checks)
- [ ] Summarize changes + verification story
- [ ] Record lessons (if any)

## Results
- Added achievement definitions, state, and tracking across chop/forest/prestige/biome flows.
- Added achievements UI screen, AP summary, and AP bonus copy.
- Applied AP bonus multiplier to wood gains from chopping and idle forest.

## Verification
- `npm run build`
- Playwright: opened Achievements screen and confirmed AP display updates after simulated unlock.
