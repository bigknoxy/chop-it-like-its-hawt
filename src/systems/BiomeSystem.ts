import { state, setCurrentTree } from '../core/State';
import { BIOMES } from '../data/Biomes';
import { TREES } from '../data/Trees';
import { ChopEvents } from './ChopSystem'; // Need to trigger re-renders if we switch biomes

export const BiomeEvents = {
    onBiomeUnlocked: (biomeId: string) => { },
    onBiomeChanged: (biomeId: string) => { },
};

export class BiomeSystem {
    public canAfford(biomeId: string): boolean {
        const def = BIOMES[biomeId];
        if (!def) return false;

        for (const cost of def.unlockCost) {
            const currentAmount = state.woodByType[cost.woodTypeId] || 0;
            if (currentAmount < cost.amount) return false;
        }
        return true;
    }

    public isUnlocked(biomeId: string): boolean {
        return state.unlockedBiomes.includes(biomeId);
    }

    public unlock(biomeId: string): boolean {
        if (this.isUnlocked(biomeId)) return false;
        if (!this.canAfford(biomeId)) return false;

        const def = BIOMES[biomeId];
        for (const cost of def.unlockCost) {
            state.woodByType[cost.woodTypeId] -= cost.amount;
        }

        state.unlockedBiomes.push(biomeId);
        BiomeEvents.onBiomeUnlocked(biomeId);

        // Auto travel? Let user travel manually to avoid confusion while chopping.
        return true;
    }

    public travelTo(biomeId: string): boolean {
        if (!this.isUnlocked(biomeId)) return false;
        if (state.activeBiomeId === biomeId) return false;

        state.activeBiomeId = biomeId;
        BiomeEvents.onBiomeChanged(biomeId);

        // Force spawn a new tree from the new biome immediately
        this.spawnTreeForBiome(biomeId);

        return true;
    }

    public spawnTreeForBiome(biomeId: string) {
        const biome = BIOMES[biomeId];
        if (!biome || biome.spawnableTrees.length === 0) return;

        // Filter trees based on biome spawn list
        const candidates = biome.spawnableTrees.map(tId => TREES[tId]).filter(Boolean);
        if (candidates.length === 0) return;

        const totalWeight = candidates.reduce((sum, def) => sum + def.spawnWeight, 0);
        let rand = Math.random() * totalWeight;

        let selectedId = candidates[0].id;
        for (const tree of candidates) {
            if (rand < tree.spawnWeight) {
                selectedId = tree.id;
                break;
            }
            rand -= tree.spawnWeight;
        }

        setCurrentTree({
            defId: selectedId,
            currentHP: TREES[selectedId].maxHP,
            isActive: true,
        });
    }
}

export const biomeSystem = new BiomeSystem();
