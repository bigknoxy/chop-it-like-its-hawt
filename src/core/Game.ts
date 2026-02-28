import { state } from './State';

type SystemUpdateFn = (dt: number) => void;

class GameEngine {
    private lastTime: number = 0;
    private isRunning: boolean = false;
    private updateSystems: SystemUpdateFn[] = [];
    private renderSystems: SystemUpdateFn[] = [];

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    public stop() {
        this.isRunning = false;
    }

    public registerUpdate(sys: SystemUpdateFn) {
        this.updateSystems.push(sys);
    }

    public registerRender(sys: SystemUpdateFn) {
        this.renderSystems.push(sys);
    }

    private loop(time: number) {
        if (!this.isRunning) return;

        // Delta time in seconds
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // Constrain large delta times (e.g. returning from background)
        // Offline progress will be handled separately in ForestSystem/SaveSystem.
        const clampedDt = Math.min(dt, 0.1);

        // Update
        for (const sys of this.updateSystems) {
            sys(clampedDt);
        }

        // Render
        for (const sys of this.renderSystems) {
            sys(clampedDt);
        }

        requestAnimationFrame(this.loop.bind(this));
    }
}

export const Game = new GameEngine();
