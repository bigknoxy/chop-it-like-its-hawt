import { state } from '../core/State';
import { AXES } from '../data/Axes';

export const AxeEvents = {
    onAxeEquipped: (axeId: string) => { },
    onAxePurchased: (axeId: string) => { },
};

export class AxeSystem {
    public canAfford(axeId: string): boolean {
        const def = AXES[axeId];
        if (!def) return false;

        for (const cost of def.unlockCost) {
            const currentAmount = state.woodByType[cost.woodTypeId] || 0;
            if (currentAmount < cost.amount) return false;
        }
        return true;
    }

    public isOwned(axeId: string): boolean {
        return state.ownedAxes.includes(axeId);
    }

    public purchase(axeId: string): boolean {
        if (this.isOwned(axeId)) return false;
        if (!this.canAfford(axeId)) return false;

        const def = AXES[axeId];
        // Deduct costs
        for (const cost of def.unlockCost) {
            state.woodByType[cost.woodTypeId] -= cost.amount;
        }

        state.ownedAxes.push(axeId);
        AxeEvents.onAxePurchased(axeId);

        // Auto equip if it's the first purchase? Or let user equip.
        // Let's just auto-equip if they bought a new tier axe
        this.equip(axeId);
        return true;
    }

    public equip(axeId: string): boolean {
        if (!this.isOwned(axeId)) return false;

        state.equippedAxeId = axeId;
        AxeEvents.onAxeEquipped(axeId);
        return true;
    }
}

export const axeSystem = new AxeSystem();
