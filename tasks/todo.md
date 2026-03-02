- [x] Restate goal + acceptance criteria
- [x] Locate existing implementation / patterns
- [x] Design: minimal approach + key decisions
- [x] Implement smallest safe slice
- [x] Add/adjust tests (if needed)
- [x] Run verification (build + Playwright checks)
- [x] Summarize changes + verification story
- [x] Record lessons (if any)

## Working Notes
- Task: Add Biomes UI accessible from Settings; list BIOMES, allow unlock/switch using BiomeSystem.
- Verify UI shows Crystal Caverns + Volcanic Grove.

## Acceptance Criteria
- Biomes screen exists with list of all BIOMES
- Current biome shown and switchable when unlocked
- Locked biomes show requirements (wood or Growth Essence)
- Unlock uses BiomeSystem.canUnlockBiome and BiomeSystem.unlockBiome
- Settings button opens Biomes screen
- npm run build succeeds
- Playwright verifies Crystal Caverns + Volcanic Grove entries

## Results
- Added Biomes screen with current biome summary and unlock/switch list.
- Wired Settings -> Biomes button and BiomeSystem events for refresh.
- Styled biome cards and action buttons.

## Verification
- `npm run build`
- Playwright: confirmed Biomes screen shows Crystal Caverns + Volcanic Grove in list.
