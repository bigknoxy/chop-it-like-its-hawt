import { state } from '../core/State';
import { UPGRADES } from '../data/Upgrades';

export const ForestEvents = {
    onWoodGenerated: (amount: number) => { },
};

export class ForestSystem {
    private tickInterval: number = 1000; // Generate wood every 1s

    public getWoodPerSecond(): number {
        if (!state.forest.isUnlocked) return 0;

        let base = state.forest.baseWoodPerSecond;
        const effLevel = state.upgrades['upg_forest_efficiency'] || 0;
        const multiplier = 1 + (effLevel * UPGRADES.upg_forest_efficiency.effectPerLevel);

        return base * multiplier;
    }

    public update() {
        if (!state.forest.isUnlocked) return;

        const now = Date.now();
        const elapsedMs = now - state.forest.lastTickTimestamp;

        if (elapsedMs >= this.tickInterval) {
            // Calculate how many ticks passed (handles offline progress when app is minimized/bg)
            const ticks = Math.floor(elapsedMs / this.tickInterval);
            state.forest.lastTickTimestamp = now;

            const wps = this.getWoodPerSecond();
            const gained = wps * ticks;

            // Add to basic wood for idle gains (could expand to random wood types)
            state.woodByType['basic'] += gained;
            state.totalWood += gained;

            ForestEvents.onWoodGenerated(gained);
        }
    }

    // Called to process offline progress when the app loads
    public processOfflineGains(lastSaveTime: number) {
        if (!state.forest.isUnlocked) return 0;

        const now = Date.now();
        const elapsedMs = now - lastSaveTime;

        // Cap at 8 hours offline progress
        const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;
        const effectiveMs = Math.min(elapsedMs, MAX_OFFLINE_MS);

        const ticks = Math.floor(effectiveMs / this.tickInterval);
        if (ticks > 0) {
            const wps = this.getWoodPerSecond();
            const gained = wps * ticks;

            state.woodByType['basic'] += gained;
            state.totalWood += gained;
            state.forest.lastTickTimestamp = now;

            return gained; // Return amount to show offline modal
        }
        return 0;
    }

    public unlock() {
        state.forest.isUnlocked = true;
        state.forest.lastTickTimestamp = Date.now();
    }
}

export const forestSystem = new ForestSystem();
