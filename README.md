# 🪓 Chop It Like It's HAWT

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9.x-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7.x-purple?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/ES2022-target-green?style=flat-square" alt="ES2022">
</p>

An incremental clicker game where you chop trees, collect wood, upgrade your axe, and build an idle forest.

## 🎮 Gameplay

- **Chop trees** - Click or hold to chop down trees and collect wood
- **Upgrade your axe** - Improve your chopping power with new axes and abilities
- **Unlock upgrades** - Boost strength, crit chance, auto-chop, and more
- **Explore biomes** - Discover rare woods across unique regions
- **Prestige your forest** - Rebirth for Growth Essence bonuses
- **Build your forest** - Earn idle wood while you're away
- **Complete daily quests** - Claim rewards for chopping, collecting wood value, and upgrades
- **Earn achievements** - Stack permanent bonuses and skill tree upgrades

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

| Technology | Version |
|------------|---------|
| TypeScript | 5.9.x |
| Vite | 7.x |
| ES Target | ES2022 |

## 📁 Project Structure

```
src/
├── core/           # Game engine, state, types
├── data/           # Static data (trees, axes, upgrades, wood types)
├── systems/        # Game systems
│   ├── ChopSystem.ts
│   ├── AxeSystem.ts
│   ├── UpgradeSystem.ts
│   ├── ForestSystem.ts
│   ├── PrestigeSystem.ts
│   ├── BiomeSystem.ts
│   ├── AchievementSystem.ts
│   ├── QuestSystem.ts
│   ├── SkillSystem.ts
│   └── SaveSystem.ts
├── ui/             # UI management
├── main.ts         # Entry point
└── style.css       # Global styles
```

## 🎯 Features

- 🌲 Dynamic tree spawning with weighted randomness
- 🪓 Multiple axe types with unique abilities
- 💪 Upgrade system with progression
- 🌙 Idle forest income
- 🌲 Forest rebirth prestige bonuses
- 🧬 Growth Essence skill tree progression
- 🏆 Achievement system with permanent bonuses
- 📅 Daily quests and login rewards (7-day loop)
- 💎 Crystal Caverns biome and rare woods
- 🌋 Volcanic Grove biome and blazing woods
- 🗺️ Biome selection screen
- 📦 Wood inventory screen
- ✨ Axe abilities and tree special mechanics (timed rush, multi-phase, bonus chests)
- 💾 Auto-save functionality
- 📱 Mobile-friendly touch controls

## 📝 License

MIT
