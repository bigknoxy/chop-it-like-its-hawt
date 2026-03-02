# Forest Rebirth - Prestige System Design Document

## Overview

**System Name**: Forest Rebirth  
**Currency**: Growth Essence  
**Purpose**: Provide long-term progression via permanent multipliers in exchange for resetting progress.

---

## 1. New Types (`src/core/types.ts`)

```typescript
export interface PrestigeState {
    growthEssence: number;           // Current owned essence (persisted)
    lifetimeWood: number;            // Cumulative wood ever earned (persisted)
    totalRebirths: number;           // Number of times rebirthed (persisted)
    lastRebirthTimestamp: number;    // For tracking time since last rebirth
}

export interface PrestigeConfig {
    unlockThreshold: number;         // 200 total wood to unlock
    essenceFormula: (lifetimeWood: number) => number;  // sqrt(lifetimeWood)
    multiplierPerEssence: number;    // 0.01 (1% per essence)
}
```

---

## 2. State Changes (`src/core/State.ts`)

### Add to `PlayerState`:

```typescript
export interface PlayerState {
    // ... existing fields ...
    prestige: PrestigeState;
}
```

### Update `createInitialState()`:

```typescript
export const createInitialState = (): PlayerState => ({
    // ... existing fields ...
    prestige: {
        growthEssence: 0,
        lifetimeWood: 0,
        totalRebirths: 0,
        lastRebirthTimestamp: Date.now(),
    },
});
```

## 3. PrestigeSystem Class (`src/systems/PrestigeSystem.ts`)

### Class Structure:

```typescript
export const PrestigeEvents = {
    onRebirth: (essenceGained: number, newTotal: number) => {},
    onUnlock: () => {},
};

export class PrestigeSystem {
    // Constants
    private readonly UNLOCK_THRESHOLD = 200;
    private readonly MULTIPLIER_PER_ESSENCE = 0.01;

    // Core Methods
    public isUnlocked(): boolean;
    public canRebirth(): boolean;
    public calculateEssenceGain(): number;
    public getPreviewEssence(): number;
    public performRebirth(): boolean;
    
    // Utility
    public getMultiplier(): number;
    public getLifetimeWood(): number;
    
    // Integration
    public addLifetimeWood(amount: number): void;  // Called from ChopSystem
}
```

### Method Details:

#### `isUnlocked(): boolean`
- Returns `state.prestige.lifetimeWood >= UNLOCK_THRESHOLD`
- UI shows locked state until unlocked

#### `canRebirth(): boolean`
- Returns `isUnlocked() && calculateEssenceGain() > 0`
- Player must gain at least 1 essence to rebirth

#### `calculateEssenceGain(): number`
```typescript
public calculateEssenceGain(): number {
    return Math.floor(Math.sqrt(state.prestige.lifetimeWood));
}
```
- Uses `Math.floor` to ensure integer essence
- Example: 400 lifetime wood = 20 essence, 10,000 = 100 essence

#### `getPreviewEssence(): number`
- Shows essence player would earn if they rebirth now
- Used for UI preview before confirmation

#### `performRebirth(): boolean`
```typescript
public performRebirth(): boolean {
    if (!this.canRebirth()) return false;
    
    const essenceGained = this.calculateEssenceGain();
    
    // 1. Add essence BEFORE reset
    state.prestige.growthEssence += essenceGained;
    state.prestige.totalRebirths++;
    state.prestige.lastRebirthTimestamp = Date.now();
    
    // 2. Reset progress (keep certain values)
    const preservedEssence = state.prestige.growthEssence;
    const preservedRebirths = state.prestige.totalRebirths;
    const preservedTimestamp = state.prestige.lastRebirthTimestamp;
    const preservedAxes = [...state.ownedAxes];
    
    // 3. Reset to initial state
    const freshState = createInitialState();
    loadState(freshState);
    
    // 4. Restore preserved values
    state.prestige.growthEssence = preservedEssence;
    state.prestige.totalRebirths = preservedRebirths;
    state.prestige.lastRebirthTimestamp = preservedTimestamp;
    state.ownedAxes = preservedAxes;
    
    // 5. Reset tree
    setCurrentTree({
        defId: 'tree_basic',
        currentHP: TREES['tree_basic'].maxHP,
        isActive: true,
    });
    
    PrestigeEvents.onRebirth(essenceGained, state.prestige.growthEssence);
    return true;
}
```

#### `getMultiplier(): number`
```typescript
public getMultiplier(): number {
    return 1 + (state.prestige.growthEssence * this.MULTIPLIER_PER_ESSENCE);
}
```
- Returns `1.0` if no essence (no penalty)
- Returns `2.0` at 100 essence (100% bonus)

#### `addLifetimeWood(amount: number): void`
```typescript
public addLifetimeWood(amount: number): void {
    state.prestige.lifetimeWood += amount;
}
```
- Called whenever wood is earned (ChopSystem, ForestSystem)
- Tracks cumulative wood for essence calculation

---

## 4. Integration Points

### ChopSystem Integration (`src/systems/ChopSystem.ts`)

**Location**: `breakTree()` method, after adding wood to state:

```typescript
// In breakTree(), after: state.totalWood += totalAdded;
import { prestigeSystem } from './PrestigeSystem';
prestigeSystem.addLifetimeWood(totalAdded);
```

### ForestSystem Integration (`src/systems/ForestSystem.ts`)

**Location**: `update()` and `processOfflineGains()`, after adding wood:

```typescript
// After: state.totalWood += gained;
import { prestigeSystem } from './PrestigeSystem';
prestigeSystem.addLifetimeWood(gained);
```

### Damage/Production Multiplier Integration

**ChopSystem.getDamage()** - Apply multiplier to base damage:
```typescript
// After calculating baseDamage, before crit:
import { prestigeSystem } from './PrestigeSystem';
baseDamage *= prestigeSystem.getMultiplier();
```

**ForestSystem.getWoodPerSecond()** - Apply multiplier:
```typescript
// After calculating wps:
return wps * prestigeSystem.getMultiplier();
```

### SaveSystem Integration (`src/systems/SaveSystem.ts`)

- No changes needed - `prestige` field in state saves automatically
- Ensure `lastRebirthTimestamp` included for potential future features

---

## 5. UI Design (`src/ui/UIManager.ts`)

### Location: Settings Modal (New Section)

**Why Settings?**
- Prestige is a major decision, should be deliberate
- Avoids cluttering main gameplay UI
- Consistent with "Hard Reset" placement

### UI Elements:

```html
<!-- Add to settings-overlay, after existing buttons -->
<div id="prestige-section" class="settings-section">
    <h3>🌲 Forest Rebirth</h3>
    <div id="prestige-locked-msg" class="hidden">
        <p>Unlock at 200 total wood earned</p>
        <p id="prestige-progress">Lifetime Wood: 0 / 200</p>
    </div>
    <div id="prestige-unlocked" class="hidden">
        <p>💎 Growth Essence: <span id="prestige-essence">0</span></p>
        <p>📈 Production Bonus: <span id="prestige-bonus">+0%</span></p>
        <p>⚡ Essence on Rebirth: <span id="prestige-preview">0</span></p>
        <button id="btn-rebirth" class="danger-btn">
            Rebirth Forest
        </button>
    </div>
</div>
```

### Confirmation Modal:

```html
<div id="rebirth-confirm-overlay" class="overlay hidden">
    <div class="modal">
        <h2>🌲 Forest Rebirth</h2>
        <p>You will gain <span id="rebirth-essence-gain">0</span> Growth Essence.</p>
        <p>Your production multiplier will increase to <span id="rebirth-new-bonus">+0%</span>.</p>
        <div class="warning-box">
            <p>⚠️ This will reset:</p>
            <ul>
                <li>All wood</li>
                <li>All upgrades</li>
                <li>Current tree progress</li>
                <li>Equipped axe (returns to Rusty)</li>
            </ul>
            <p>✅ You keep:</p>
            <ul>
                <li>Unlocked axes</li>
                <li>Growth Essence</li>
                <li>Forest unlock status</li>
            </ul>
        </div>
        <div class="modal-buttons">
            <button id="btn-confirm-rebirth">Confirm Rebirth</button>
            <button id="btn-cancel-rebirth">Cancel</button>
        </div>
    </div>
</div>
```

### UIManager Methods:

```typescript
// Add to UIManager class:
private updatePrestigeUI(): void {
    const locked = document.getElementById('prestige-locked-msg')!;
    const unlocked = document.getElementById('prestige-unlocked')!;
    
    if (!prestigeSystem.isUnlocked()) {
        locked.classList.remove('hidden');
        unlocked.classList.add('hidden');
        document.getElementById('prestige-progress')!.textContent = 
            `Lifetime Wood: ${formatNum(state.prestige.lifetimeWood)} / 200`;
        return;
    }
    
    locked.classList.add('hidden');
    unlocked.classList.remove('hidden');
    
    document.getElementById('prestige-essence')!.textContent = 
        formatNum(state.prestige.growthEssence);
    document.getElementById('prestige-bonus')!.textContent = 
        `+${(prestigeSystem.getMultiplier() - 1) * 100}%`;
    document.getElementById('prestige-preview')!.textContent = 
        formatNum(prestigeSystem.getPreviewEssence());
}

private showRebirthConfirm(): void {
    const essenceGain = prestigeSystem.getPreviewEssence();
    const newMultiplier = 1 + ((state.prestige.growthEssence + essenceGain) * 0.01);
    
    document.getElementById('rebirth-essence-gain')!.textContent = 
        formatNum(essenceGain);
    document.getElementById('rebirth-new-bonus')!.textContent = 
        `+${(newMultiplier - 1) * 100}%`;
    
    document.getElementById('rebirth-confirm-overlay')!.classList.remove('hidden');
}

private handleRebirth(): void {
    if (prestigeSystem.performRebirth()) {
        document.getElementById('rebirth-confirm-overlay')!.classList.add('hidden');
        document.getElementById('settings-overlay')!.classList.add('hidden');
        // Show success notification
        alert(`Forest Reborn! Gained ${prestigeSystem.calculateEssenceGain()} Growth Essence.`);
        this.updateHUD();
        this.renderTree();
        this.renderUpgrades();
        this.renderAxes();
        this.updatePrestigeUI();
    }
}
```

### Event Bindings:

```typescript
// Add to bindEvents():
document.getElementById('btn-rebirth')!.addEventListener('click', () => {
    this.showRebirthConfirm();
});

document.getElementById('btn-confirm-rebirth')!.addEventListener('click', () => {
    this.handleRebirth();
});

document.getElementById('btn-cancel-rebirth')!.addEventListener('click', () => {
    document.getElementById('rebirth-confirm-overlay')!.classList.add('hidden');
});

// Update prestige UI when settings opens
document.getElementById('btn-settings-open')!.addEventListener('click', () => {
    this.updatePrestigeUI();
});

// Event listener for rebirth completion
PrestigeEvents.onRebirth = (gained, total) => {
    this.updatePrestigeUI();
};
```

---

## 6. Main Entry Point (`src/main.ts`)

```typescript
import { prestigeSystem } from './systems/PrestigeSystem';

// Register in game loop if needed (not strictly necessary, but good for future)
// Game.registerUpdate((dt) => prestigeSystem.update(dt));
```

---

## 7. File Summary

| File | Changes |
|------|---------|
| `src/core/types.ts` | Add `PrestigeState`, `PrestigeConfig` interfaces |
| `src/core/State.ts` | Add `prestige` field to `PlayerState`, update `createInitialState()` |
| `src/systems/PrestigeSystem.ts` | **NEW** - Full prestige system implementation |
| `src/systems/ChopSystem.ts` | Add `prestigeSystem.addLifetimeWood()` call, apply multiplier |
| `src/systems/ForestSystem.ts` | Add `prestigeSystem.addLifetimeWood()` call, apply multiplier |
| `src/ui/UIManager.ts` | Add prestige UI section, confirmation modal, event handlers |
| `index.html` | Add prestige HTML elements |
| `style.css` | Add styles for prestige UI |

---

## 8. Essence Calculation Examples

| Lifetime Wood | Essence Earned | Multiplier Bonus |
|---------------|----------------|------------------|
| 200 | 14 | +14% |
| 400 | 20 | +20% |
| 1,000 | 31 | +31% |
| 5,000 | 70 | +70% |
| 10,000 | 100 | +100% |
| 50,000 | 223 | +223% |
| 100,000 | 316 | +316% |

---

## 9. Implementation Checklist

- [ ] Add types to `types.ts`
- [ ] Update `State.ts` with prestige field
- [ ] Create `PrestigeSystem.ts`
- [ ] Integrate lifetime wood tracking in ChopSystem
- [ ] Integrate lifetime wood tracking in ForestSystem
- [ ] Apply multiplier to damage calculation
- [ ] Apply multiplier to forest production
- [ ] Add HTML elements for prestige UI
- [ ] Add CSS styles
- [ ] Implement UIManager prestige methods
- [ ] Test rebirth flow end-to-end
- [ ] Verify save/load preserves prestige correctly

---

## 10. Open Questions

1. **Should Forest unlock persist?** Current design says YES (as "unlocked biomes")
2. **Should achievements exist?** Not yet implemented, but prestige should track them when added
3. **Animation on rebirth?** Could add tree respawn animation or screen flash
4. **Sound effect?** Add satisfying rebirth sound if audio system exists

---

## 11. Future Enhancements (Out of Scope)

- Prestige upgrades purchasable with Growth Essence
- Milestone rewards at certain essence thresholds
- Prestige-specific axes that require essence to unlock
- Leaderboard showing highest essence players
