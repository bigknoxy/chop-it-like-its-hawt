import { state } from '../core/State';
import { COMPANIONS } from '../data/Pets';
import { ChopEvents } from './ChopSystem'; // To apply damage or trigger updates

export const CompanionEvents = {
    onCompanionUnlocked: (compId: string) => { },
    onCompanionLeveledUp: (compId: string, newLevel: number) => { },
    onCompanionEquipped: (compId: string) => { },
};

export class CompanionSystem {

    public getLevel(compId: string): number {
        return state.companions[compId] !== undefined ? state.companions[compId] : -1;
    }

    public isUnlocked(compId: string): boolean {
        return this.getLevel(compId) >= 0;
    }

    public getCostToUnlock(compId: string) {
        return COMPANIONS[compId].unlockCost;
    }

    public getCostToLevelUp(compId: string): number {
        const comp = COMPANIONS[compId];
        const currentLevel = this.getLevel(compId);
        if (currentLevel < 0 || currentLevel >= comp.maxLevel) return Infinity;

        // Base cost for leveling up is always basic wood for simplicity, 
        // scaling up by levelCostMultiplier
        const baseWoodCost = 100;
        return Math.floor(baseWoodCost * Math.pow(comp.levelCostMultiplier, currentLevel));
    }

    public canAffordUnlock(compId: string): boolean {
        const costs = this.getCostToUnlock(compId);
        for (const cost of costs) {
            if ((state.woodByType[cost.woodTypeId] || 0) < cost.amount) return false;
        }
        return true;
    }

    public canAffordLevelUp(compId: string): boolean {
        const cost = this.getCostToLevelUp(compId);
        return state.totalWood >= cost;
    }

    public unlock(compId: string): boolean {
        if (this.isUnlocked(compId)) return false;
        if (!this.canAffordUnlock(compId)) return false;

        const costs = this.getCostToUnlock(compId);
        for (const cost of costs) {
            state.woodByType[cost.woodTypeId] -= cost.amount;
        }

        state.companions[compId] = 0; // Unlocked at level 0
        CompanionEvents.onCompanionUnlocked(compId);

        // Auto equip if first companion
        if (!state.equippedCompanionId) {
            this.equip(compId);
        }

        return true;
    }

    public levelUp(compId: string): boolean {
        if (!this.isUnlocked(compId)) return false;
        if (!this.canAffordLevelUp(compId)) return false;

        const cost = this.getCostToLevelUp(compId);
        state.woodByType['basic'] -= cost;
        state.totalWood -= cost; // Deplete total generic wood or basic wood

        state.companions[compId] += 1;
        CompanionEvents.onCompanionLeveledUp(compId, state.companions[compId]);
        return true;
    }

    public equip(compId: string): boolean {
        if (!this.isUnlocked(compId)) return false;
        state.equippedCompanionId = compId;
        CompanionEvents.onCompanionEquipped(compId);
        return true;
    }

    public getActiveDPS(): number {
        if (!state.equippedCompanionId) return 0;
        const comp = COMPANIONS[state.equippedCompanionId];
        if (!comp) return 0;

        const level = this.getLevel(state.equippedCompanionId);
        // DPS scales linearly with level
        return comp.baseDps * (1 + (level * 0.5));
    }

    // Called every frame from Game loop
    public update(dt: number) {
        const dps = this.getActiveDPS();
        if (dps > 0 && state.equippedCompanionId) {
            // We need a way to apply this damage. 
            // We can expose a public applyDamage method on ChopSystem.
            // For now, we'll let Game loop or Chop system query this.
        }
    }
}

export const companionSystem = new CompanionSystem();
