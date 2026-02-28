import { state, currentTree } from '../core/State';
import { TREES } from '../data/Trees';
import { WOODS } from '../data/Woods';
import { UPGRADES } from '../data/Upgrades';
import { AXES } from '../data/Axes';
import { chopSystem, ChopEvents } from '../systems/ChopSystem';
import { upgradeSystem, UpgradeEvents } from '../systems/UpgradeSystem';
import { axeSystem, AxeEvents } from '../systems/AxeSystem';
import { forestSystem, ForestEvents } from '../systems/ForestSystem';
import { saveSystem, SaveEvents } from '../systems/SaveSystem';
import { biomeSystem, BiomeEvents } from '../systems/BiomeSystem';
import { BIOMES } from '../data/Biomes';
import { companionSystem, CompanionEvents } from '../systems/CompanionSystem';
import { COMPANIONS } from '../data/Pets';

export class UIManager {
    private treeSprite = document.getElementById('tree-sprite')!;
    private hpBarFill = document.getElementById('hp-bar-fill')!;
    private woodAmountLabel = document.querySelector('.wood-amount')!;
    private axeNameLabel = document.getElementById('ui-equipped-axe')!;
    private axePowerLabel = document.getElementById('ui-axe-power')!;

    private curScreenId = 'screen-chop';

    // Settings
    public hapticsEnabled = true;
    public soundEnabled = true;

    public init() {
        this.bindEvents();
        this.updateHUD();
        this.renderTree();
        this.renderUpgrades();
        this.renderAxes();
        this.updateForestUI();
    }

    public update(dt: number) {
        // Update HP bar smoothly if we want, but doing it on hit is fine.
        // Update forest idle label if active
        if (this.curScreenId === 'screen-forest') {
            this.updateForestUI();
        }
    }

    private bindEvents() {
        // Nav
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = (e.currentTarget as HTMLElement).getAttribute('data-target')!;
                this.switchScreen(target);
            });
        });

        // Chopping
        const treeContainer = document.getElementById('tree-container')!;

        // Mouse and Touch events
        const startChop = (e: Event) => {
            e.preventDefault();
            chopSystem.handleInput(true);
        };

        const endChop = (e: Event) => {
            const target = e.target as Node;
            if (target && treeContainer.contains(target)) {
                e.preventDefault();
            }
            chopSystem.handleInput(false);
        };

        treeContainer.addEventListener('mousedown', startChop);
        treeContainer.addEventListener('touchstart', startChop, { passive: false });

        window.addEventListener('mouseup', endChop);
        window.addEventListener('touchend', endChop);
        window.addEventListener('touchcancel', endChop);

        // Systems Events
        ChopEvents.onDamage = (amt, isCrit) => {
            this.updateHPBar();
            this.spawnDamageNumber(amt, isCrit);
            this.shakeTree();
            this.playHaptic(isCrit ? 'heavy' : 'light');
        };

        ChopEvents.onTreeFall = (amt, woodId) => {
            this.animateTreeFall();
            this.spawnRewardNumber(amt, woodId);
            this.playHaptic('success');
            // Delay rendering next tree
            setTimeout(() => this.renderTree(), 500);
            this.checkUnlocks();
        };

        ChopEvents.onWoodUpdate = () => {
            this.updateHUD();
            this.renderUpgrades(); // Re-render to update disabled states
            this.renderAxes();
        };

        UpgradeEvents.onUpgradePurchased = () => {
            this.updateHUD();
            this.renderUpgrades();
            this.checkUnlocks();
        };

        AxeEvents.onAxePurchased = () => {
            this.updateHUD();
            this.renderAxes();
        };

        AxeEvents.onAxeEquipped = () => {
            this.updateHUD();
            this.renderAxes();
        };

        ForestEvents.onWoodGenerated = () => {
            this.updateHUD();
        };

        SaveEvents.onOfflineGains = (amount) => {
            alert(`Welcome back! Your idle workers collected ${amount} Basic Wood while you were away.`);
            this.updateHUD();
        };

        BiomeEvents.onBiomeUnlocked = () => {
            this.renderMap();
        };

        BiomeEvents.onBiomeChanged = () => {
            this.renderMap();
            this.renderTree(); // The tree immediately changes to the new biome's tree
        };

        CompanionEvents.onCompanionUnlocked = () => {
            this.renderPets();
            this.updateHUD();
        };

        CompanionEvents.onCompanionLeveledUp = () => {
            this.renderPets();
            this.updateHUD();
        };

        CompanionEvents.onCompanionEquipped = () => {
            this.renderPets();
            this.updateHUD();
        };

        // Settings
        document.getElementById('btn-settings-open')!.addEventListener('click', () => {
            document.getElementById('settings-overlay')!.classList.remove('hidden');
        });

        document.getElementById('btn-close-settings')!.addEventListener('click', () => {
            document.getElementById('settings-overlay')!.classList.add('hidden');
        });

        document.getElementById('btn-about')!.addEventListener('click', () => {
            document.getElementById('settings-overlay')!.classList.add('hidden');
            document.getElementById('game-version')!.textContent = window.__GAME_VERSION__ || '1.0.0';
            document.getElementById('about-overlay')!.classList.remove('hidden');
        });

        document.getElementById('btn-close-about')!.addEventListener('click', () => {
            document.getElementById('about-overlay')!.classList.add('hidden');
        });

        document.getElementById('btn-toggle-sfx')!.addEventListener('click', (e) => {
            this.soundEnabled = !this.soundEnabled;
            (e.currentTarget as HTMLElement).innerText = `Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`;
        });

        document.getElementById('btn-toggle-haptics')!.addEventListener('click', (e) => {
            this.hapticsEnabled = !this.hapticsEnabled;
            (e.currentTarget as HTMLElement).innerText = `Haptics: ${this.hapticsEnabled ? 'ON' : 'OFF'}`;
        });

        document.getElementById('btn-hard-reset')!.addEventListener('click', () => {
            if (confirm('Are you sure you want to wipe all progress?')) {
                saveSystem.hardReset();
            }
        });

    }

    private switchScreen(id: string) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-target="${id}"]`)?.classList.add('active');

        this.curScreenId = id;
        if (id === 'screen-upgrades') this.renderUpgrades();
        if (id === 'screen-axes') this.renderAxes();
        if (id === 'screen-forest') this.updateForestUI();
        if (id === 'screen-map') this.renderMap();
        if (id === 'screen-pets') this.renderPets();
    }

    private updateHUD() {
        this.woodAmountLabel.textContent = this.formatNum(state.totalWood);

        const axe = AXES[state.equippedAxeId];
        this.axeNameLabel.textContent = axe.name;

        let baseDmg = 1 + (state.upgrades['upg_strength'] || 0) * UPGRADES.upg_strength.effectPerLevel;
        let critChance = (state.upgrades['upg_luck'] || 0) * UPGRADES.upg_luck.effectPerLevel + (axe.critBonus || 0);

        let powerText = `Base Dmg: ${Math.floor(baseDmg)} | Crit: ${Math.floor(critChance * 100)}%`;
        if (state.equippedCompanionId) {
            const petDps = companionSystem.getActiveDPS();
            powerText += ` | Pet DPS: ${Math.floor(petDps)}`;
        }

        this.axePowerLabel.textContent = powerText;
    }

    private renderTree() {
        const def = TREES[currentTree.defId];

        // Set colors based on tree type
        this.treeSprite.innerText = def.emoji;

        // Let's add an optional hue-rotate for specific tree varieties
        let hueRotate = '0deg';
        if (def.woodTypeId === 'pine') hueRotate = '120deg'; // Green/Blue shift
        if (def.woodTypeId === 'oak') hueRotate = '-40deg'; // Reddish shift
        if (def.woodTypeId === 'rare_amber') hueRotate = '40deg'; // Golden shift

        this.treeSprite.style.filter = `hue-rotate(${hueRotate})`;
        this.treeSprite.classList.remove('tree-fall');
        this.treeSprite.style.opacity = '1';

        this.updateHPBar();
    }

    private updateHPBar() {
        const def = TREES[currentTree.defId];
        const pct = Math.max(0, currentTree.currentHP / def.maxHP) * 100;
        this.hpBarFill.style.width = `${pct}%`;
    }

    private checkUnlocks() {
        // Unlock forest if total wood >= 500 or got enough strength
        if (!state.forest.isUnlocked && state.totalWood >= 200) {
            forestSystem.unlock();
            alert('Forest Unlocked! Idle workers will now gather wood for you.');
            document.getElementById('nav-btn-forest')!.style.visibility = 'visible';
        } else if (state.forest.isUnlocked) {
            document.getElementById('nav-btn-forest')!.style.visibility = 'visible';
        }
    }

    // --- RENDERING LISTS ---

    private renderUpgrades() {
        const list = document.getElementById('upgrades-list')!;
        list.innerHTML = '';

        for (const upg of Object.values(UPGRADES)) {
            if (!upgradeSystem.isUnlocked(upg.id)) continue;

            const level = state.upgrades[upg.id] || 0;
            const isMax = level >= upg.maxLevel;
            const cost = upgradeSystem.getUpgradeCost(upg.id);
            const canAfford = upgradeSystem.canAfford(upg.id);

            const el = document.createElement('div');
            el.className = 'upgrade-item';

            el.innerHTML = `
        <div class="upgrade-info">
          <span class="upgrade-name">${upg.name} <span class="upgrade-level">Lv.${level}/${upg.maxLevel}</span></span>
          <span class="upgrade-desc">${upg.description}</span>
        </div>
        <button class="upgrade-buy-btn" ${(!canAfford || isMax) ? 'disabled' : ''}>
          ${isMax ? 'MAXED' : cost + ' 🪵'}
        </button>
      `;

            if (!isMax && canAfford) {
                el.querySelector('button')!.addEventListener('click', () => {
                    if (upgradeSystem.purchase(upg.id)) {
                        // Re-render UI
                        this.playHaptic('light');
                    }
                });
            }

            list.appendChild(el);
        }
    }

    private renderAxes() {
        const list = document.getElementById('axes-list')!;
        list.innerHTML = '';

        for (const axe of Object.values(AXES)) {
            const isOwned = axeSystem.isOwned(axe.id);
            const isEquipped = state.equippedAxeId === axe.id;
            const canAfford = axeSystem.canAfford(axe.id);

            const el = document.createElement('div');
            el.className = 'upgrade-item';

            let costStr = '';
            if (!isOwned) {
                costStr = axe.unlockCost.map(c => `${c.amount} ${WOODS[c.woodTypeId].name}`).join(', ');
                if (costStr === '') costStr = 'Free';
            }

            el.innerHTML = `
        <div class="upgrade-info">
          <span class="upgrade-name">${axe.name}</span>
          <span class="upgrade-desc">x${axe.damageMultiplier} Dmg${axe.critBonus ? `, +${axe.critBonus * 100}% Crit` : ''}</span>
          ${!isOwned ? `<span class="upgrade-level">Cost: ${costStr}</span>` : ''}
        </div>
        <button class="upgrade-buy-btn" ${(isEquipped || (!isOwned && !canAfford)) ? 'disabled' : ''}>
          ${isEquipped ? 'EQUIPPED' : (isOwned ? 'EQUIP' : 'CRAFT')}
        </button>
      `;

            if (!isEquipped) {
                el.querySelector('button')!.addEventListener('click', () => {
                    if (isOwned) {
                        axeSystem.equip(axe.id);
                        this.playHaptic('light');
                    } else if (axeSystem.purchase(axe.id)) {
                        this.playHaptic('success');
                    }
                });
            }

            list.appendChild(el);
        }
    }

    private updateForestUI() {
        const rateLabel = document.getElementById('ui-idle-rate')!;
        if (state.forest.isUnlocked) {
            rateLabel.textContent = `${this.formatNum(forestSystem.getWoodPerSecond())} 🪵 / sec`;
        } else {
            rateLabel.textContent = 'Locked (Collect 200 Wood)';
        }
    }

    private renderMap() {
        const list = document.getElementById('map-list')!;
        list.innerHTML = '';

        for (const biome of Object.values(BIOMES)) {
            const isUnlocked = biomeSystem.isUnlocked(biome.id);
            const isActive = state.activeBiomeId === biome.id;
            const canAfford = biomeSystem.canAfford(biome.id);

            const el = document.createElement('div');
            el.className = `map-item ${isUnlocked ? 'unlocked' : ''} ${isActive ? 'active-biome' : ''}`;

            let costStr = '';
            if (!isUnlocked) {
                costStr = biome.unlockCost.map(c => `${c.amount} ${WOODS[c.woodTypeId].name}`).join(', ');
                if (costStr === '') costStr = 'Free';
            }

            el.innerHTML = `
        <div class="upgrade-info">
          <span class="upgrade-name">${biome.emoji} ${biome.name}</span>
          <span class="upgrade-desc">${biome.description}</span>
          ${!isUnlocked ? `<span class="upgrade-level">Cost: ${costStr}</span>` : ''}
        </div>
        <button class="upgrade-buy-btn" ${(isActive || (!isUnlocked && !canAfford)) ? 'disabled' : ''}>
          ${isActive ? 'CURRENT' : (isUnlocked ? 'TRAVEL' : 'UNLOCK')}
        </button>
      `;

            if (!isActive) {
                el.querySelector('button')!.addEventListener('click', () => {
                    if (isUnlocked) {
                        if (biomeSystem.travelTo(biome.id)) {
                            this.playHaptic('heavy');
                            this.switchScreen('screen-chop'); // Auto close map!
                        }
                    } else if (biomeSystem.unlock(biome.id)) {
                        this.playHaptic('success');
                        this.renderMap();
                    }
                });
            }

            list.appendChild(el);
        }
    }

    private renderPets() {
        const list = document.getElementById('pets-list')!;
        list.innerHTML = '';

        for (const comp of Object.values(COMPANIONS)) {
            const isUnlocked = companionSystem.isUnlocked(comp.id);
            const isEquipped = state.equippedCompanionId === comp.id;
            const level = companionSystem.getLevel(comp.id);
            const isMax = level >= comp.maxLevel;

            const canAffordUnlock = !isUnlocked && companionSystem.canAffordUnlock(comp.id);
            const canAffordLevel = isUnlocked && !isMax && companionSystem.canAffordLevelUp(comp.id);

            const el = document.createElement('div');
            el.className = `upgrade-item ${isEquipped ? 'active-biome' : ''}`;

            let costStr = '';
            if (!isUnlocked) {
                costStr = comp.unlockCost.map(c => `${c.amount} ${WOODS[c.woodTypeId].name}`).join(', ');
            } else if (!isMax) {
                costStr = `${companionSystem.getCostToLevelUp(comp.id)} 🪵`;
            }

            el.innerHTML = `
        <div class="upgrade-info">
          <span class="upgrade-name">${comp.emoji} ${comp.name} ${isUnlocked ? `<span class="upgrade-level">Lv.${level}/${comp.maxLevel}</span>` : ''}</span>
          <span class="upgrade-desc">${comp.description}</span>
          ${(!isUnlocked || !isMax) ? `<span class="upgrade-level">Cost: ${costStr}</span>` : ''}
        </div>
        <div style="display: flex; gap: 5px; flex-direction: column;">
            ${isUnlocked ? `
                <button class="upgrade-buy-btn" ${isEquipped ? 'disabled' : ''} data-action="equip">
                ${isEquipped ? 'EQUIPPED' : 'EQUIP'}
                </button>
            ` : ''}
            <button class="upgrade-buy-btn" ${(!isUnlocked && !canAffordUnlock) || (isUnlocked && (!canAffordLevel || isMax)) ? 'disabled' : ''} data-action="upgrade">
            ${isUnlocked ? (isMax ? 'MAXED' : 'LEVEL UP') : 'UNLOCK'}
            </button>
        </div>
      `;

            if (isUnlocked && !isEquipped) {
                el.querySelector('button[data-action="equip"]')!.addEventListener('click', () => {
                    companionSystem.equip(comp.id);
                    this.playHaptic('light');
                });
            }

            const upgBtn = el.querySelector('button[data-action="upgrade"]');
            if (upgBtn && !upgBtn.hasAttribute('disabled')) {
                upgBtn.addEventListener('click', () => {
                    if (!isUnlocked) {
                        if (companionSystem.unlock(comp.id)) this.playHaptic('success');
                    } else if (!isMax) {
                        if (companionSystem.levelUp(comp.id)) this.playHaptic('light');
                    }
                });
            }

            list.appendChild(el);
        }
    }

    // --- FX ---

    private shakeTree() {
        this.treeSprite.classList.remove('tree-shake');
        // trigger reflow
        void this.treeSprite.offsetWidth;
        this.treeSprite.classList.add('tree-shake');
    }

    private animateTreeFall() {
        this.treeSprite.classList.add('tree-fall');
    }

    private spawnDamageNumber(amount: number, isCrit: boolean) {
        const layer = document.getElementById('damage-numbers-layer')!;
        const el = document.createElement('div');
        el.className = `damage-number ${isCrit ? 'crit' : ''}`;
        el.textContent = `-${amount}`;

        // Random jitter
        const x = 50 + (Math.random() * 40 - 20);
        const y = 30 + (Math.random() * 40 - 20);
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;

        layer.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }

    private spawnRewardNumber(amount: number, woodId: string) {
        const layer = document.getElementById('damage-numbers-layer')!;
        const el = document.createElement('div');
        el.className = 'damage-number reward';
        const numAdd = Math.ceil(amount * WOODS[woodId].valueMultiplier);
        el.textContent = `+${numAdd}`;

        el.style.left = `50%`;
        el.style.top = `20%`;

        layer.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    private playHaptic(type: 'light' | 'heavy' | 'success') {
        if (!this.hapticsEnabled || !navigator.vibrate) return;
        if (type === 'light') navigator.vibrate(10);
        if (type === 'heavy') navigator.vibrate([20, 10, 20]);
        if (type === 'success') navigator.vibrate([10, 30, 10, 30, 10]);
    }

    private formatNum(n: number) {
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
        return Math.floor(n).toString();
    }
}

export const uiManager = new UIManager();
