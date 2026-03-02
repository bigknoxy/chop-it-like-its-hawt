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
import { prestigeSystem, PrestigeEvents } from '../systems/PrestigeSystem';
import { achievementSystem, AchievementEvents } from '../systems/AchievementSystem';

export class UIManager {
    private treeSprite = document.getElementById('tree-sprite')!;
    private hpBarFill = document.getElementById('hp-bar-fill')!;
    private woodAmountLabel = document.querySelector('.wood-amount')!;
    private axeNameLabel = document.getElementById('ui-equipped-axe')!;
    private axePowerLabel = document.getElementById('ui-axe-power')!;
    private specialIndicator = document.getElementById('special-indicator')!;
    private timerDisplay = document.getElementById('timer-display')!;
    private phaseDisplay = document.getElementById('phase-display')!;
    private curScreenId = 'screen-chop';
    private timerInterval: number | null = null;
    private chestTimeout: number | null = null;
    private getAchievementsList(): HTMLElement | null {
        return document.getElementById('achievements-list');
    }

    private getApValueLabel(): HTMLElement | null {
        return document.getElementById('ap-total');
    }

    private getApBonusLabel(): HTMLElement | null {
        return document.getElementById('ap-bonus');
    }

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
        this.renderAchievements();
        this.updateAPUI();
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

        ChopEvents.onTreeFall = (amt, woodId, specialResult) => {
            this.animateTreeFall();
            this.spawnRewardNumber(amt, woodId);
            this.playHaptic('success');
            this.clearTimer();
            if (specialResult?.type === 'timed' && specialResult.isTimedBonus) {
                this.showSpecialToast('Timed bonus! Extra wood!');
            }
            if (specialResult?.type === 'chest') {
                this.showSpecialToast('Chest jackpot!');
                this.triggerChestPulse();
            }
            // Delay rendering next tree
            setTimeout(() => this.renderTree(), 500);
            this.checkUnlocks();
        };

        ChopEvents.onWoodUpdate = () => {
            this.updateHUD();
            this.renderUpgrades();
            this.renderAxes();
            this.renderWoodInventory();
            if (this.curScreenId === 'screen-achievements') {
                this.renderAchievements();
            }
            this.updateAPUI();
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
            this.updateAPUI();
        };

        SaveEvents.onOfflineGains = (amount) => {
            alert(`Welcome back! Your idle workers collected ${amount} Basic Wood while you were away.`);
            this.updateHUD();
            this.updateAPUI();
        };

        ChopEvents.onPhaseChange = (phase, maxPhases) => {
            this.updatePhaseIndicator(phase, maxPhases);
            this.showSpecialToast(`Phase ${phase}/${maxPhases}!`);
        };

        ChopEvents.onChestOpen = () => {
            this.showSpecialToast('Chest opened! Bonus wood!');
            this.triggerChestPulse();
        };

        // Settings
        document.getElementById('btn-settings-open')!.addEventListener('click', () => {
            document.getElementById('settings-overlay')!.classList.remove('hidden');
            this.updatePrestigeUI();
        });

        document.getElementById('btn-wood-inventory')!.addEventListener('click', () => {
            this.renderWoodInventory();
            document.getElementById('wood-inventory-overlay')!.classList.remove('hidden');
        });

        document.getElementById('btn-close-wood-inventory')!.addEventListener('click', () => {
            document.getElementById('wood-inventory-overlay')!.classList.add('hidden');
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

        document.getElementById('btn-rebirth')!.addEventListener('click', () => {
            this.showRebirthConfirm();
        });

        document.getElementById('btn-confirm-rebirth')!.addEventListener('click', () => {
            this.handleRebirth();
        });

        document.getElementById('btn-cancel-rebirth')!.addEventListener('click', () => {
            document.getElementById('rebirth-confirm-overlay')!.classList.add('hidden');
        });

        document.getElementById('btn-achievements-open')!.addEventListener('click', () => {
            document.getElementById('settings-overlay')!.classList.add('hidden');
            this.switchScreen('screen-achievements');
        });


        PrestigeEvents.onRebirth = (gained, total) => {
            this.updatePrestigeUI();
        };

        AchievementEvents.onAchievementUnlocked = () => {
            this.renderAchievements();
            this.updateAPUI();
        };

        AchievementEvents.onAPUpdated = () => {
            this.updateAPUI();
        };

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
        if (id === 'screen-achievements') {
            this.renderAchievements();
            this.updateAPUI();
        }
    }

    private updateHUD() {
        this.woodAmountLabel.textContent = this.formatNum(state.totalWood);

        const axe = AXES[state.equippedAxeId];
        this.axeNameLabel.textContent = axe.name;

        let baseDmg = 1 + (state.upgrades['upg_strength'] || 0) * UPGRADES.upg_strength.effectPerLevel;
        let critChance = (state.upgrades['upg_luck'] || 0) * UPGRADES.upg_luck.effectPerLevel + (axe.critBonus || 0);
        this.axePowerLabel.textContent = `Base Dmg: ${Math.floor(baseDmg)} | Crit: ${Math.floor(critChance * 100)}%`;
        if (this.curScreenId === 'screen-achievements') {
            this.updateAPUI();
        }
    }

    private updateAPUI() {
        const ap = achievementSystem.getAP();
        const bonusPct = (achievementSystem.getAPBonusMultiplier() - 1) * 100;
        const apValue = this.getApValueLabel();
        const apBonus = this.getApBonusLabel();
        if (apValue) apValue.textContent = this.formatNum(ap);
        if (apBonus) apBonus.textContent = `+${bonusPct.toFixed(1)}%`;
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
        this.treeSprite.classList.remove('chest-pulse');
        this.treeSprite.style.opacity = '1';

        this.updateHPBar();
        this.resetSpecialIndicators();
        this.startSpecialUI(def);
    }

    private updateHPBar() {
        const def = TREES[currentTree.defId];
        const pct = Math.max(0, currentTree.currentHP / def.maxHP) * 100;
        this.hpBarFill.style.width = `${pct}%`;
    }

    private startSpecialUI(def: typeof TREES[string]) {
        this.clearTimer();
        this.timerDisplay.classList.add('hidden');
        this.phaseDisplay.classList.add('hidden');

        if (def.specialMechanic === 'timed') {
            if (!currentTree.spawnTime) {
                currentTree.spawnTime = Date.now();
            }
            this.timerDisplay.classList.remove('hidden');
            this.timerDisplay.textContent = '15.0s';
            this.startTimerCountdown();
        }

        if (def.specialMechanic === 'multiPhase') {
            const maxPhases = def.phaseCount || 1;
            const phase = currentTree.currentPhase || maxPhases;
            this.updatePhaseIndicator(phase, maxPhases);
            this.phaseDisplay.classList.remove('hidden');
        }
    }

    private startTimerCountdown() {
        if (!currentTree.spawnTime) return;
        const durationMs = 15000;

        const update = () => {
            if (!currentTree.spawnTime) return;
            const elapsed = Date.now() - currentTree.spawnTime;
            const remaining = Math.max(0, durationMs - elapsed);
            const seconds = (remaining / 1000).toFixed(1);
            this.timerDisplay.textContent = `${seconds}s`;

            if (remaining <= 0) {
                this.timerDisplay.classList.add('expired');
                this.clearTimer();
                return;
            }

            this.timerDisplay.classList.remove('expired');
        };

        update();
        this.timerInterval = window.setInterval(update, 100);
    }

    private updatePhaseIndicator(phase: number, maxPhases: number) {
        this.phaseDisplay.textContent = `Phase ${phase}/${maxPhases}`;
    }

    private showSpecialToast(message: string) {
        this.specialIndicator.textContent = message;
        this.specialIndicator.classList.remove('hidden');
        this.specialIndicator.classList.remove('special-toast-show');

        void this.specialIndicator.offsetWidth;
        this.specialIndicator.classList.add('special-toast-show');

        if (this.chestTimeout) {
            window.clearTimeout(this.chestTimeout);
        }

        this.chestTimeout = window.setTimeout(() => {
            this.specialIndicator.classList.add('hidden');
        }, 2000);
    }

    private triggerChestPulse() {
        this.treeSprite.classList.remove('chest-pulse');
        void this.treeSprite.offsetWidth;
        this.treeSprite.classList.add('chest-pulse');
    }

    private resetSpecialIndicators() {
        this.timerDisplay.classList.remove('expired');
        this.specialIndicator.classList.add('hidden');
        this.phaseDisplay.classList.add('hidden');
        this.clearTimer();
    }

    private clearTimer() {
        if (this.timerInterval !== null) {
            window.clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
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

            const abilityDesc = this.getAbilityDescription(axe.specialAbility);

            el.innerHTML = `
        <div class="upgrade-info">
          <span class="upgrade-name">${axe.name}</span>
          <span class="upgrade-desc">x${axe.damageMultiplier} Dmg${axe.critBonus ? `, +${axe.critBonus * 100}% Crit` : ''}${abilityDesc ? ` | ${abilityDesc}` : ''}</span>
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

    private renderAchievements() {
        const list = this.getAchievementsList();
        if (!list) return;
        list.innerHTML = '';
        const defs = achievementSystem.getDefinitions();

        for (const def of defs) {
            const progress = achievementSystem.getProgress(def.metric);
            const isUnlocked = achievementSystem.isUnlocked(def.id);
            const clamped = Math.min(progress, def.target);
            const pct = Math.max(0, Math.min(100, (clamped / def.target) * 100));

            const el = document.createElement('div');
            el.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            el.innerHTML = `
                <div class="achievement-info">
                    <span class="achievement-name">${def.name}</span>
                    <span class="achievement-desc">${def.description}</span>
                    <div class="achievement-progress">
                        <div class="achievement-progress-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="achievement-progress-text">${this.formatNum(clamped)} / ${this.formatNum(def.target)}</span>
                </div>
                <div class="achievement-reward">
                    <span class="achievement-ap">+${def.apReward} AP</span>
                    <span class="achievement-status">${isUnlocked ? 'Unlocked' : 'Locked'}</span>
                </div>
            `;

            list.appendChild(el);
        }
    }

    private renderWoodInventory() {
        const list = document.getElementById('wood-inventory-list')!;
        list.innerHTML = '';

        const rarityOrder = ['legendary', 'epic', 'rare', 'common'];
        const sortedWoods = Object.values(WOODS).sort((a, b) => {
            return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        });

        for (const wood of sortedWoods) {
            const amount = state.woodByType[wood.id] || 0;
            const el = document.createElement('div');
            el.className = `wood-item rarity-${wood.rarity}`;

            el.innerHTML = `
                <div class="wood-item-info">
                    <span class="wood-item-name">${wood.name}</span>
                    <span class="wood-item-value">x${wood.valueMultiplier} value</span>
                </div>
                <div class="wood-item-amount">${this.formatNum(amount)}</div>
            `;

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

    private updatePrestigeUI(): void {
        const locked = document.getElementById('prestige-locked-msg')!;
        const unlocked = document.getElementById('prestige-unlocked')!;

        if (!prestigeSystem.isUnlocked()) {
            locked.classList.remove('hidden');
            unlocked.classList.add('hidden');
            document.getElementById('prestige-progress')!.textContent =
                `Lifetime Wood: ${this.formatNum(state.prestige.lifetimeWood)} / 200`;
            return;
        }

        locked.classList.add('hidden');
        unlocked.classList.remove('hidden');

        document.getElementById('prestige-essence')!.textContent =
            this.formatNum(state.prestige.growthEssence);
        document.getElementById('prestige-bonus')!.textContent =
            `+${Math.floor((prestigeSystem.getMultiplier() - 1) * 100)}%`;
        document.getElementById('prestige-preview')!.textContent =
            this.formatNum(prestigeSystem.getPreviewEssence());
    }

    private showRebirthConfirm(): void {
        const essenceGain = prestigeSystem.getPreviewEssence();
        const newMultiplier = 1 + ((state.prestige.growthEssence + essenceGain) * 0.01);

        document.getElementById('rebirth-essence-gain')!.textContent =
            this.formatNum(essenceGain);
        document.getElementById('rebirth-new-bonus')!.textContent =
            `+${Math.floor((newMultiplier - 1) * 100)}%`;

        document.getElementById('rebirth-confirm-overlay')!.classList.remove('hidden');
    }

    private handleRebirth(): void {
        const essenceGain = prestigeSystem.getPreviewEssence();
        if (prestigeSystem.performRebirth()) {
            document.getElementById('rebirth-confirm-overlay')!.classList.add('hidden');
            document.getElementById('settings-overlay')!.classList.add('hidden');
            alert(`Forest Reborn! Gained ${this.formatNum(essenceGain)} Growth Essence.`);
            this.updateHUD();
            this.renderTree();
            this.renderUpgrades();
            this.renderAxes();
            this.updatePrestigeUI();
            this.checkUnlocks();
            this.renderAchievements();
            this.updateAPUI();
        }
    }

    private getAbilityDescription(ability?: string): string {
        switch (ability) {
            case 'doubleWood': return '20% double yield';
            case 'splashDamage': return '10% splash damage';
            case 'fastTick': return '50% faster';
            default: return '';
        }
    }

    private formatNum(n: number) {
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
        return Math.floor(n).toString();
    }
}

export const uiManager = new UIManager();
