# Chop It Like It's HAWT - v1.1.0 Implementation Plan

## Research Summary

Based on market research of incremental games in 2024-2025, including analysis of:
- Cookie Clicker, Idle Slayer, Melvor Idle, AFK Arena/Journey
- Reddit r/incremental_games Best of 2024
- Mobile-specific incremental game patterns

## Priority Matrix

| Priority | Feature | Effort | Impact | For Version |
|----------|---------|--------|--------|-------------|
| **1** | Prestige/Rebirth system (Forest Rebirth) | Medium | Critical | v1.1.0 |
| **2** | Crystal Caverns biome | Low | High | v1.1.0 |
| **3** | Wood type inventory UI | Low | Medium | v1.1.0 |
| **4** | Axe special abilities | Medium | High | v1.1.0 |
| **5** | Tree special mechanics | Medium | High | v1.1.0 |
| **6** | Achievement system | Medium | Medium | v1.1.0 |
| **7** | Volcanic Grove biome | Medium | Medium | v1.1.0 |
| **8** | Daily quests/rewards | Medium | Medium | v1.1.0 |
| **9** | Skill tree | High | High | v1.1.0 |

---

## Priority 1: Prestige/Rebirth System (Forest Rebirth)

### Design
- **Name:** Forest Rebirth
- **Currency:** Growth Essence (earned on rebirth)
- **Formula:** √(lifetime_wood) = Growth Essence earned
- **Unlock:** Available after reaching 200 total wood or 30 min playtime
- **Keeps:** Unlocked biomes, achievements, axe skins, Growth Essence
- **Resets:** Wood, upgrades, trees, axe equipment
- **Rewards:** 
  - Permanent production multiplier (1% per Growth Essence)
  - Unlock new biomes at milestones

### Implementation Files
- `src/core/types.ts` - Add PrestigeState, GrowthEssence types
- `src/systems/PrestigeSystem.ts` - New system for rebirth logic
- `src/ui/UIManager.ts` - Add prestige UI button/modal
- `src/core/State.ts` - Add prestige state
- `index.html` - Add prestige UI elements

---

## Priority 2: Crystal Caverns Biome

### Design
- **Name:** Crystal Caverns
- **Trees:** crystal_oak, gem_willow, diamond_pine
- **Wood Types:** crystal_shard, gemstone, diamond_dust
- **Unlock Cost:** 500 total wood OR 5 Growth Essence
- **Special:** Trees have higher HP but drop rare materials

### Implementation Files
- `src/data/Biomes.ts` - Add crystal_caverns entry
- `src/data/Trees.ts` - Add crystal trees
- `src/data/Woods.ts` - Add crystal wood types
- `src/core/types.ts` - Add BiomeId for crystal_caverns

---

## Priority 3: Wood Type Inventory UI

### Design
- Display all wood types collected
- Show quantity and value multiplier
- Collapsible panel in header or separate screen
- Visual indicators for rare/legendary woods

### Implementation Files
- `index.html` - Add wood inventory panel
- `src/ui/UIManager.ts` - Render wood inventory
- `src/style.css` - Style the inventory panel

---

## Priority 4: Axe Special Abilities

### Design
- **doubleWood:** 20% chance to double wood yield on tree break
- **splashDamage:** 10% of damage dealt to all trees in biome
- **fastTick:** 50% faster attack speed

### Implementation Files
- `src/systems/ChopSystem.ts` - Add ability logic
- `src/data/Axes.ts` - Assign abilities to axes

---

## Priority 5: Tree Special Mechanics (Complete)

### Design
- **chest:** Drops random bonus resources (golden acorns, rare seeds)
- **timed:** Bonus 2x wood if killed within time limit (15 seconds)
- **multiPhase:** Multiple HP phases, each phase gives partial reward

### Implementation Files
- `src/systems/ChopSystem.ts` - Special mechanic logic + events
- `src/data/Trees.ts` - Assign specialMechanic to trees
- `src/ui/UIManager.ts` - Timer/phase/chest UI feedback
- `src/style.css` - Special mechanic visuals

---

## Priority 6: Achievement System (Complete)

### Design
- Track milestones: trees chopped, wood collected, prestiges completed
- Reward: Achievement points that give permanent bonuses
- Categories: Chopping, Collection, Prestige, Exploration

### Implementation Files
- `src/data/Achievements.ts` - Achievement definitions
- `src/systems/AchievementSystem.ts` - Track and reward
- `src/ui/UIManager.ts` - Achievement display

---

## Priority 7: Volcanic Grove Biome (Complete)

### Design
- **Name:** Volcanic Grove
- **Trees:** ember_oak, magma_willow, phoenix_pine
- **Wood Types:** ember_ash, magma_core, phoenix_feather
- **Special:** Fire damage over time to axes (durability system?)

### Implementation Files
- `src/data/Biomes.ts` - Add volcanic_grove entry
- `src/data/Trees.ts` - Add volcanic trees
- `src/data/Woods.ts` - Add volcanic wood types

---

## Priority 8: Daily Quests/Rewards (Complete)

### Design
- 3 daily quests (chop trees, collect wood value, purchase upgrades)
- Daily login reward calendar (7-day loop)
- Rewards grant wood + Growth Essence

### Implementation Files
- `src/data/DailyQuests.ts` - Quest definitions
- `src/systems/QuestSystem.ts` - Track completion
- `src/ui/UIManager.ts` - Quest display

---

## Priority 9: Skill Tree (Complete)

### Design
- Permanent upgrades via Growth Essence
- Branches: Chopping, Collection, Automation, Luck
- Unlock new abilities and bonuses

### Implementation Files
- `src/data/Skills.ts` - Skill definitions
- `src/systems/SkillSystem.ts` - Manage skill points
- `src/ui/UIManager.ts` - Skill tree display
- `src/core/types.ts` - Skill types/state
- `src/core/State.ts` - Skill state initialization
- `index.html` - Skill tree screen + navigation
- `src/style.css` - Skill tree styles

---

## Current Game State

### Implemented Features
- Core chop loop with HP bar, damage numbers
- 6 upgrades with prerequisites
- 4 axes with damage multipliers and special abilities
- 5 biomes (Home Forest, Haunted Weald, Frozen Tundra, Crystal Caverns, Volcanic Grove)
- 3 pets (Bob, Willy, Barry)
- Wood inventory screen
- Biomes screen with unlock/switch flow
- Tree special mechanics (chest, timed, multi-phase)
- Achievement system with permanent bonuses
- Daily quests and login rewards (7-day loop)
- Growth Essence skill tree
- Prestige (Forest Rebirth) with Growth Essence bonuses
- Offline progress (8hr cap)
- Save system with autosave

### Ready to Expand (Already Defined)
- More biomes and wood types
- Additional axe abilities and upgrade tiers
- Expanded achievement sets and quest pools
