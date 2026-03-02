import { state } from '../core/State';
import { BIOMES } from '../data/Biomes';
import { BiomeId } from '../core/types';
import { achievementSystem } from './AchievementSystem';

export const BiomeEvents = {
    onBiomeUnlock: (biomeId: BiomeId) => { },
    onBiomeChange: (biomeId: BiomeId) => { },
};

export class BiomeSystem {
    public getCurrentBiome(): BiomeId {
        return state.biome?.currentBiomeId || 'default';
    }

    public getUnlockedBiomes(): BiomeId[] {
        return state.biome?.unlockedBiomes || ['default'];
    }

    public isBiomeUnlocked(biomeId: BiomeId): boolean {
        return this.getUnlockedBiomes().includes(biomeId);
    }

    public canUnlockBiome(biomeId: BiomeId): boolean {
        const biome = BIOMES[biomeId];
        if (!biome) return false;
        if (this.isBiomeUnlocked(biomeId)) return false;

        const { wood, growthEssence } = biome.unlockCost;

        if (wood && state.totalWood >= wood.amount) return true;
        if (growthEssence && state.prestige.growthEssence >= growthEssence) return true;

        return false;
    }

    public unlockBiome(biomeId: BiomeId): boolean {
        if (!this.canUnlockBiome(biomeId)) return false;

        const biome = BIOMES[biomeId];
        const { wood, growthEssence } = biome.unlockCost;

        if (wood && state.totalWood >= wood.amount) {
            state.totalWood -= wood.amount;
        } else if (growthEssence && state.prestige.growthEssence >= growthEssence) {
            state.prestige.growthEssence -= growthEssence;
        } else {
            return false;
        }

        state.biome.unlockedBiomes.push(biomeId);
        achievementSystem.setProgress('biomesUnlocked', state.biome.unlockedBiomes.length);
        BiomeEvents.onBiomeUnlock(biomeId);
        return true;
    }

    public changeBiome(biomeId: BiomeId): boolean {
        if (!this.isBiomeUnlocked(biomeId)) return false;

        state.biome.currentBiomeId = biomeId;
        BiomeEvents.onBiomeChange(biomeId);
        return true;
    }

    public getAllowedTrees(): string[] {
        const currentBiome = this.getCurrentBiome();
        return BIOMES[currentBiome]?.allowedTrees || BIOMES.default.allowedTrees;
    }
}

export const biomeSystem = new BiomeSystem();
