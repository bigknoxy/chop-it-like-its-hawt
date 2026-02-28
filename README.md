# 🪓 Chop It Like It's HAWT

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9.x-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7.x-purple?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/ES2022-target-green?style=flat-square" alt="ES2022">
</p>

An incremental clicker game where you chop trees, collect wood, upgrade your axe, and build an idle forest.

## 🎮 Gameplay

- **Chop trees** - Click or hold to chop down trees and collect wood
- **Upgrade your axe** - Improve your chopping power with new axes
- **Unlock upgrades** - Boost strength, crit chance, auto-chop, and more
- **Build your forest** - Earn idle wood while you're away

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
- 💾 Auto-save functionality
- 📱 Mobile-friendly touch controls

## 📝 License

MIT
