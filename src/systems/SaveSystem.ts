import { state, loadState, createInitialState } from '../core/State';
import { forestSystem } from './ForestSystem';

export const SaveEvents = {
    onOfflineGains: (amount: number) => { },
};

const SAVE_KEY = 'chop_it_save_v1';

export class SaveSystem {
    private autosaveIntervalMs: number = 15000; // 15 seconds
    private timeSinceLastSave: number = 0;

    public load() {
        const data = localStorage.getItem(SAVE_KEY);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                // Merge with initial state to catch any missing fields from updates
                loadState({ ...createInitialState(), ...parsed });

                // Process offline gains
                const gained = forestSystem.processOfflineGains(state.lastSaveTimestamp);
                if (gained > 0) {
                    setTimeout(() => SaveEvents.onOfflineGains(gained), 500);
                }
            } catch (e) {
                console.error("Failed to load save:", e);
            }
        }
    }

    public save() {
        state.lastSaveTimestamp = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }

    public hardReset() {
        localStorage.removeItem(SAVE_KEY);
        window.location.reload();
    }

    public update(dt: number) {
        this.timeSinceLastSave += dt * 1000;
        if (this.timeSinceLastSave >= this.autosaveIntervalMs) {
            this.timeSinceLastSave = 0;
            this.save();
        }
    }
}

export const saveSystem = new SaveSystem();
