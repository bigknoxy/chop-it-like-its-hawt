# Chop It Like It's HAWT

A Vite + TypeScript incremental clicker game where you chop trees, collect wood, upgrade your axe, and build an idle forest.

## Tech Stack

- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.9.x (strict mode)
- **Target**: ES2022, DOM

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Run TypeScript check + Vite build |
| `npm run preview` | Preview production build |

### Running TypeScript Check

```bash
npx tsc --noEmit
```

---

## Project Structure

```
src/
├── core/           # Game engine, state, types
├── data/           # Static data (trees, axes, upgrades, wood types)
├── systems/        # Game systems (chop, upgrade, forest, axe, save)
├── ui/             # UI management
├── main.ts         # Entry point
└── style.css       # Global styles
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - all type checks on
- **No `any`** - avoid unless absolutely necessary
- Use **interfaces** for data shapes, **types** for unions/aliases
- Prefer **explicit return types** on complex functions

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `class GameEngine` |
| Functions/Variables | lowerCamelCase | `handleInput()`, `isRunning` |
| Constants | lowerCamelCase | `maxHP`, `baseDamage` |
| Interfaces/Types | PascalCase | `interface TreeDefinition` |
| Enums | PascalCase | `enum Direction` |
| Files | kebab-case | `chop-system.ts` |

### Imports

- **Named imports** preferred: `import { state } from './State'`
- **Relative paths** for internal modules
- **Group order**: external → internal → types

### Class Patterns

- Use **`private`** fields for encapsulation
- **Singleton pattern** for systems:
  ```typescript
  class ChopSystem { ... }
  export const chopSystem = new ChopSystem();
  ```
- **Dependency injection** via constructor or direct import

### Code Structure

- **Single responsibility** - each file/module does one thing
- **No magic numbers** - use named constants
- **Early returns** - reduce nesting
- **No comments** unless explaining complex logic (project convention)

### Error Handling

- **Throw errors** for invalid state, not silent failures
- **Graceful degradation** for non-critical errors
- **Type guards** for runtime type narrowing

### HTML/CSS

- Semantic HTML elements
- Data attributes for JS hooks: `data-target`, `id`
- CSS variables for theming

---

## Working with this Project

### Adding a New System

1. Create `src/systems/NewSystem.ts`
2. Implement the system class with an `update(dt: number)` method
3. Register in `src/main.ts` via `Game.registerUpdate()`
4. Add static data in `src/data/` if needed

### Adding New Data

1. Define type in `src/core/types.ts`
2. Add data in appropriate `src/data/*.ts` file
3. Export the data object

---

## Versioning & Releases

This project uses **Conventional Commits** + **release-please** for fully automated versioning.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]
[optional footer(s)]
```

### Commit Types

| Type | Description | Version Impact |
|------|-------------|----------------|
| `fix:` | Bug fix | Patch bump (v1.0.1) |
| `feat:` | New feature | Minor bump (v1.1.0) |
| `feat!:` | Breaking change | Major bump (v2.0.0) |
| `refactor:` | Code refactor | No version change |
| `docs:` | Documentation | No version change |
| `chore:` | Maintenance (default) | No version change |
| `perf:` | Performance improvement | Patch bump |
| `style:` | Code style changes | No version change |
| `test:` | Adding/updating tests | No version change |

### Examples

```
fix: correct HP bar calculation for large trees
feat: add oak wood type with 2x value
feat!: change upgrade cost formula
docs: update README with new commands
refactor: extract damage calculation to separate function
chore: update dependencies
```

### Release Workflow

1. Developer commits with conventional commit messages
2. PR approved and merged to `main`
3. release-please creates a version PR with changelog
4. Merge the version PR → Git tag created (v1.0.0)
5. CI builds and deploys to GitHub Pages

### Version Display

The game version is injected at build time and displayed in:
- Settings modal → About button

---

## Git Branching Strategy

| Branch | Purpose | Deployment |
|--------|---------|------------|
| `main` | Production code | GitHub Pages (/) |
| `dev` | Development code | GitHub Pages (/dev/) |

### Workflow

```bash
# Feature development
git checkout -b feat/add-new-axe
git commit -m "feat: add diamond axe"
git push origin feat/add-new-axe
# Create PR → review → merge to main

# Hotfix
git checkout -b fix/chop-animation-bug
git commit -m "fix: resolve chop animation issue"
git push origin fix/chop-animation-bug
# Create PR → review → merge to main
```

---

## Documentation Commit Workflow

> **Important**: Every time a commit is made, a subagent must review all documentation files (README.md, AGENTS.md, etc.) and update them automatically to reflect the current state of the codebase. This ensures documentation stays accurate and up-to-date.

---

## Notes

- No test framework configured
- No ESLint/Prettier - follow existing code style (4-space indentation)
- Uses `erasableSyntaxOnly` TypeScript feature
