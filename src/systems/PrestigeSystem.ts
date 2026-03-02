import { state, loadState, createInitialState, setCurrentTree } from '../core/State';
import { TREES } from '../data/Trees';
import { achievementSystem } from './AchievementSystem';

export const PrestigeEvents = {
    onRebirth: (essenceGained: number, newTotal: number) => { },
    onUnlock: () => { },
};

export class PrestigeSystem {
    private readonly UNLOCK_THRESHOLD = 200;
    private readonly MULTIPLIER_PER_ESSENCE = 0.01;

    public isUnlocked(): boolean {
        return state.prestige.lifetimeWood >= this.UNLOCK_THRESHOLD;
    }

    public canRebirth(): boolean {
        return this.isUnlocked() && this.calculateEssenceGain() > 0;
    }

    public calculateEssenceGain(): number {
        return Math.floor(Math.sqrt(state.prestige.lifetimeWood));
    }

    public getPreviewEssence(): number {
        return this.calculateEssenceGain();
    }

    public performRebirth(): boolean {
        if (!this.canRebirth()) return false;

        const essenceGained = this.calculateEssenceGain();

        state.prestige.growthEssence += essenceGained;
        state.prestige.totalRebirths++;
        state.prestige.lastRebirthTimestamp = Date.now();
        achievementSystem.addProgress('rebirths', 1);

        const preservedEssence = state.prestige.growthEssence;
        const preservedRebirths = state.prestige.totalRebirths;
        const preservedTimestamp = state.prestige.lastRebirthTimestamp;
        const preservedAxes = [...state.ownedAxes];
        const preservedAchievements = { ...state.achievements };
        const preservedForestUnlocked = state.forest.isUnlocked;

        const freshState = createInitialState();
        loadState(freshState);

        state.prestige.growthEssence = preservedEssence;
        state.prestige.totalRebirths = preservedRebirths;
        state.prestige.lastRebirthTimestamp = preservedTimestamp;
        state.ownedAxes = preservedAxes;
        state.forest.isUnlocked = preservedForestUnlocked;
        state.achievements = preservedAchievements;

        setCurrentTree({
            defId: 'tree_basic',
            currentHP: TREES['tree_basic'].maxHP,
            isActive: true,
        });

        PrestigeEvents.onRebirth(essenceGained, state.prestige.growthEssence);
        return true;
    }

    public getMultiplier(): number {
        return 1 + (state.prestige.growthEssence * this.MULTIPLIER_PER_ESSENCE);
    }

    public getLifetimeWood(): number {
        return state.prestige.lifetimeWood;
    }

    public addLifetimeWood(amount: number): void {
        state.prestige.lifetimeWood += amount;
    }
}

export const prestigeSystem = new PrestigeSystem();
