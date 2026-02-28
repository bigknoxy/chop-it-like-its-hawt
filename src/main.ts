import { Game } from './core/Game';
import { saveSystem } from './systems/SaveSystem';
import { uiManager } from './ui/UIManager';
import { chopSystem } from './systems/ChopSystem';
import { upgradeSystem } from './systems/UpgradeSystem';
import { forestSystem } from './systems/ForestSystem';

import packageJson from '../package.json?raw';

declare global {
    interface Window {
        __GAME_VERSION__?: string;
    }
}

// Application entry point
document.addEventListener('DOMContentLoaded', () => {
  // Expose version globally
  const parsed = JSON.parse(packageJson);
  window.__GAME_VERSION__ = parsed.version;

  // Load save before UI initialization
  saveSystem.load();

  // Initialize UI
  uiManager.init();

  // Register Systems to Game Loop
  Game.registerUpdate((dt) => chopSystem.update(dt));
  Game.registerUpdate((dt) => forestSystem.update());
  Game.registerUpdate((dt) => saveSystem.update(dt));

  // Start the loop
  Game.start();
});
