import { state } from '../core/State';
import { ACHIEVEMENTS } from '../data/Achievements';
import { AchievementMetric } from '../core/types';

export const AchievementEvents = {
    onAchievementUnlocked: (id: string, apReward: number) => { },
    onAPUpdated: () => { },
};

const AP_BONUS_PER_POINT = 0.005;

export class AchievementSystem {
    public getAP(): number {
        return state.achievements.totalAP;
    }

    public getAPBonusMultiplier(): number {
        return 1 + (this.getAP() * AP_BONUS_PER_POINT);
    }

    public applyWoodBonus(amount: number): number {
        return amount * this.getAPBonusMultiplier();
    }

    public addProgress(metric: AchievementMetric, amount: number): void {
        if (amount <= 0) return;
        const current = state.achievements.progress[metric] || 0;
        state.achievements.progress[metric] = current + amount;
        this.checkAchievements(metric);
    }

    public setProgress(metric: AchievementMetric, value: number): void {
        if (value < 0) return;
        state.achievements.progress[metric] = value;
        this.checkAchievements(metric);
    }

    public isUnlocked(id: string): boolean {
        return Boolean(state.achievements.unlocked[id]);
    }

    public getProgress(metric: AchievementMetric): number {
        return state.achievements.progress[metric] || 0;
    }

    public getDefinitions() {
        return ACHIEVEMENTS;
    }

    public syncFromState(): void {
        if (!state.achievements) {
            state.achievements = {
                progress: {
                    treesChopped: 0,
                    woodCollected: 0,
                    rebirths: 0,
                    biomesUnlocked: state.biome?.unlockedBiomes?.length || 1,
                },
                unlocked: {},
                totalAP: 0,
            };
        }

        if (!state.achievements.progress) {
            state.achievements.progress = {
                treesChopped: 0,
                woodCollected: 0,
                rebirths: 0,
                biomesUnlocked: state.biome?.unlockedBiomes?.length || 1,
            };
        }

        if (!state.achievements.unlocked) {
            state.achievements.unlocked = {};
        }

        state.achievements.progress.treesChopped ||= 0;
        state.achievements.progress.woodCollected = Math.max(
            state.achievements.progress.woodCollected || 0,
            state.prestige?.lifetimeWood || 0
        );
        state.achievements.progress.rebirths = Math.max(
            state.achievements.progress.rebirths || 0,
            state.prestige?.totalRebirths || 0
        );
        state.achievements.progress.biomesUnlocked = state.biome?.unlockedBiomes?.length || 1;

        for (const def of ACHIEVEMENTS) {
            if (state.achievements.unlocked[def.id]) continue;
            const progress = state.achievements.progress[def.metric] || 0;
            if (progress >= def.target) {
                this.unlock(def.id, def.apReward);
            }
        }
    }

    private checkAchievements(metric: AchievementMetric): void {
        for (const def of ACHIEVEMENTS) {
            if (def.metric !== metric) continue;
            if (state.achievements.unlocked[def.id]) continue;
            const progress = state.achievements.progress[metric] || 0;
            if (progress >= def.target) {
                this.unlock(def.id, def.apReward);
            }
        }
    }

    private unlock(id: string, apReward: number): void {
        state.achievements.unlocked[id] = true;
        state.achievements.totalAP += apReward;
        AchievementEvents.onAchievementUnlocked(id, apReward);
        AchievementEvents.onAPUpdated();
    }
}

export const achievementSystem = new AchievementSystem();
