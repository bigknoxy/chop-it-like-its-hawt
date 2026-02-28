import { state } from '../core/State';
import { UPGRADES } from '../data/Upgrades';

export const UpgradeEvents = {
    onUpgradePurchased: (upgradeId: string, newLevel: number) => { },
};

export class UpgradeSystem {
    public getUpgradeCost(upgradeId: string): number {
        const def = UPGRADES[upgradeId];
        if (!def) return Infinity;
        const level = state.upgrades[upgradeId] || 0;
        return Math.floor(def.baseCost * Math.pow(def.costGrowthFactor, level));
    }

    public canAfford(upgradeId: string): boolean {
        return state.totalWood >= this.getUpgradeCost(upgradeId);
    }

    public isMaxLevel(upgradeId: string): boolean {
        const level = state.upgrades[upgradeId] || 0;
        return level >= UPGRADES[upgradeId].maxLevel;
    }

    public isUnlocked(upgradeId: string): boolean {
        const def = UPGRADES[upgradeId];
        for (const prereq of def.prerequisites) {
            const lvl = state.upgrades[prereq.upgradeId] || 0;
            if (lvl < prereq.minLevel) return false;
        }
        return true;
    }

    public purchase(upgradeId: string): boolean {
        if (!this.isUnlocked(upgradeId)) return false;
        if (this.isMaxLevel(upgradeId)) return false;

        const cost = this.getUpgradeCost(upgradeId);
        if (!this.canAfford(upgradeId)) return false;

        // Deduct cost
        state.totalWood -= cost;

        // Level up
        const currentLvl = state.upgrades[upgradeId] || 0;
        state.upgrades[upgradeId] = currentLvl + 1;

        UpgradeEvents.onUpgradePurchased(upgradeId, state.upgrades[upgradeId]);
        return true;
    }
}

export const upgradeSystem = new UpgradeSystem();
