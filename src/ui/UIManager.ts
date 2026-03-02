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
import { questSystem, QuestEvents } from '../systems/QuestSystem';
import { skillSystem, SkillEvents } from '../systems/SkillSystem';
import { biomeSystem, BiomeEvents } from '../systems/BiomeSystem';
import { BIOMES } from '../data/Biomes';

export class UIManager {
    private lastFocusedElement: HTMLElement | null = null;
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
    private readonly moreTargets = new Set([
        'screen-achievements',
        'screen-daily',
        'screen-skills',
        'screen-biomes'
    ]);
    private getAchievementsList(): HTMLElement | null {
        return document.getElementById('achievements-list');
    }

    private getApValueLabel(): HTMLElement | null {
        return document.getElementById('ap-total');
    }

    private getApBonusLabel(): HTMLElement | null {
        return document.getElementById('ap-bonus');
    }

    private getDailyQuestList(): HTMLElement | null {
        return document.getElementById('daily-quests-list');
    }

    private getDailyLoginDesc(): HTMLElement | null {
        return document.getElementById('daily-login-desc');
    }

    private getDailyLoginButton(): HTMLButtonElement | null {
        return document.getElementById('daily-login-claim') as HTMLButtonElement | null;
    }

    private getSkillsList(): HTMLElement | null {
        return document.getElementById('skills-list');
    }

    private getSkillEssenceLabel(): HTMLElement | null {
        return document.getElementById('skill-essence');
    }

    private getBiomeList(): HTMLElement | null {
        return document.getElementById('biomes-list');
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
        this.renderDaily();
        this.updateDailyLogin();
        this.renderSkills();
        this.updateSkillSummary();
        this.renderBiomes();
        this.closeMoreSheet();
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
                if (target === 'screen-more') {
                    this.toggleMoreSheet();
                    return;
                }
                this.switchScreen(target);
            });
        });

        document.querySelectorAll('[data-action="close-more"]').forEach(el => {
            el.addEventListener('click', () => {
                this.closeMoreSheet();
            });
        });

        document.querySelectorAll('.more-sheet-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = (e.currentTarget as HTMLElement).getAttribute('data-target');
                if (!target) return;
                this.switchScreen(target);
                this.closeMoreSheet();
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

        PrestigeEvents.onRebirth = () => {
            this.updatePrestigeUI();
            this.updateSkillSummary();
            this.renderSkills();
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
            this.openOverlay('settings-overlay');
            this.updatePrestigeUI();
        });

        document.getElementById('btn-wood-inventory')!.addEventListener('click', () => {
            this.renderWoodInventory();
            this.openOverlay('wood-inventory-overlay');
        });

        document.getElementById('btn-close-wood-inventory')!.addEventListener('click', () => {
            this.closeOverlay('wood-inventory-overlay');
        });

        document.getElementById('btn-close-settings')!.addEventListener('click', () => {
            this.closeOverlay('settings-overlay');
        });

        document.getElementById('btn-about')!.addEventListener('click', () => {
            this.closeOverlay('settings-overlay');
            document.getElementById('game-version')!.textContent = window.__GAME_VERSION__ || '1.0.0';
            this.openOverlay('about-overlay');
        });

        document.getElementById('btn-close-about')!.addEventListener('click', () => {
            this.closeOverlay('about-overlay');
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
            this.closeOverlay('rebirth-confirm-overlay');
        });

        document.getElementById('btn-achievements-open')!.addEventListener('click', () => {
            this.closeOverlay('settings-overlay');
            this.switchScreen('screen-achievements');
        });

        document.getElementById('btn-daily-open')!.addEventListener('click', () => {
            this.closeOverlay('settings-overlay');
            this.switchScreen('screen-daily');
        });

        const skillsBtn = document.getElementById('btn-skills-open');
        if (skillsBtn) {
            skillsBtn.addEventListener('click', () => {
                this.closeOverlay('settings-overlay');
                this.switchScreen('screen-skills');
            });
        }

        const biomesBtn = document.getElementById('btn-biomes-open');
        if (biomesBtn) {
            biomesBtn.addEventListener('click', () => {
                this.closeOverlay('settings-overlay');
                this.switchScreen('screen-biomes');
            });
        }

        const loginBtn = this.getDailyLoginButton();
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (questSystem.claimLoginReward()) {
                    this.updateHUD();
                    this.updateDailyLogin();
                }
            });
        }


        AchievementEvents.onAchievementUnlocked = () => {
            this.renderAchievements();
            this.updateAPUI();
        };

        AchievementEvents.onAPUpdated = () => {
            this.updateAPUI();
        };

        QuestEvents.onQuestProgress = () => {
            if (this.curScreenId === 'screen-daily') {
                this.renderDaily();
            }
        };

        QuestEvents.onQuestCompleted = () => {
            if (this.curScreenId === 'screen-daily') {
                this.renderDaily();
            }
        };

        QuestEvents.onQuestClaimed = () => {
            this.updateHUD();
            if (this.curScreenId === 'screen-daily') {
                this.renderDaily();
            }
        };

        QuestEvents.onLoginRewardReady = () => {
            this.updateDailyLogin();
        };

        QuestEvents.onLoginRewardClaimed = () => {
            this.updateHUD();
            this.updateDailyLogin();
        };

        QuestEvents.onDailyReset = () => {
            if (this.curScreenId === 'screen-daily') {
                this.renderDaily();
            }
            this.updateDailyLogin();
        };

        SkillEvents.onSkillUnlocked = () => {
            this.updateHUD();
            this.renderSkills();
            this.updateSkillSummary();
        };

        SkillEvents.onSkillPointsUpdated = () => {
            this.updateSkillSummary();
        };

        BiomeEvents.onBiomeUnlock = () => {
            if (this.curScreenId === 'screen-biomes') {
                this.renderBiomes();
            }
            this.updateBiomeSummary();
        };

        BiomeEvents.onBiomeChange = () => {
            if (this.curScreenId === 'screen-biomes') {
                this.renderBiomes();
            }
            this.updateBiomeSummary();
            this.renderTree();
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
        if (this.moreTargets.has(id)) {
            document.getElementById('nav-btn-more')?.classList.add('active');
        } else {
            document.querySelector(`[data-target="${id}"]`)?.classList.add('active');
        }

        this.curScreenId = id;
        this.closeMoreSheet();
        if (id === 'screen-upgrades') this.renderUpgrades();
        if (id === 'screen-axes') this.renderAxes();
        if (id === 'screen-forest') this.updateForestUI();
        if (id === 'screen-achievements') {
            this.renderAchievements();
            this.updateAPUI();
        }
        if (id === 'screen-daily') {
            this.renderDaily();
            this.updateDailyLogin();
        }
        if (id === 'screen-skills') {
            this.renderSkills();
            this.updateSkillSummary();
        }
        if (id === 'screen-biomes') {
            this.renderBiomes();
        }
    }

    private updateHUD() {
        this.woodAmountLabel.textContent = this.formatNum(state.totalWood);

        const axe = AXES[state.equippedAxeId];
        this.axeNameLabel.textContent = axe.name;

        let baseDmg = 1 + (state.upgrades['upg_strength'] || 0) * UPGRADES.upg_strength.effectPerLevel;
        const skillBonuses = skillSystem.getTotalBonuses();
        baseDmg *= 1 + (skillBonuses.damagePct || 0);
        let critChance = (state.upgrades['upg_luck'] || 0) * UPGRADES.upg_luck.effectPerLevel + (axe.critBonus || 0);
        critChance += skillBonuses.critChancePct || 0;
        this.axePowerLabel.textContent = `Base Dmg: ${Math.floor(baseDmg)} | Crit: ${Math.floor(critChance * 100)}%`;
        if (this.curScreenId === 'screen-achievements') {
            this.updateAPUI();
        }
        if (this.curScreenId === 'screen-skills') {
            this.updateSkillSummary();
        }
        if (this.curScreenId === 'screen-daily') {
            this.updateDailyLogin();
        }
        if (this.curScreenId === 'screen-biomes') {
            this.updateBiomeSummary();
        }
    }

    private updateBiomeSummary() {
        const label = document.getElementById('biome-current');
        if (!label) return;
        const biome = BIOMES[biomeSystem.getCurrentBiome()];
        label.textContent = biome ? `${biome.emoji} ${biome.name}` : 'Unknown';
    }

    private renderDaily() {
        const list = this.getDailyQuestList();
        if (!list) return;
        list.innerHTML = '';

        const defs = questSystem.getDailyQuests();
        for (const def of defs) {
            const progress = questSystem.getQuestProgress(def.id);
            const isComplete = questSystem.isQuestComplete(def.id);
            const isClaimed = questSystem.isQuestClaimed(def.id);
            const clamped = Math.min(progress, def.target);
            const pct = Math.max(0, Math.min(100, (clamped / def.target) * 100));

            const el = document.createElement('div');
            const itemState = isClaimed ? 'complete' : isComplete ? 'complete' : '';
            el.className = `daily-quest-item ${itemState}`;

            const rewardText = `${this.formatNum(def.reward.wood)} Wood + ${this.formatNum(def.reward.growthEssence)} Growth Essence`;
            el.innerHTML = `
                <div class="daily-quest-info">
                    <span class="daily-quest-title">${def.title}</span>
                    <span class="daily-quest-desc">${def.description}</span>
                    <div class="daily-quest-progress">
                        <div class="daily-quest-progress-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="daily-quest-progress-text">${this.formatNum(clamped)} / ${this.formatNum(def.target)}</span>
                </div>
                <div class="daily-quest-reward">
                    <span>${rewardText}</span>
                    <button class="daily-claim-btn" ${!isComplete || isClaimed ? 'disabled' : ''}>${isClaimed ? 'Claimed' : 'Claim'}</button>
                </div>
            `;

            const claimBtn = el.querySelector('button');
            if (claimBtn && isComplete && !isClaimed) {
                claimBtn.addEventListener('click', () => {
                    if (questSystem.claimQuest(def.id)) {
                        this.updateHUD();
                        this.renderDaily();
                    }
                });
            }

            list.appendChild(el);
        }
    }

    private updateDailyLogin() {
        const desc = this.getDailyLoginDesc();
        const btn = this.getDailyLoginButton();
        if (!desc || !btn) return;

        const reward = questSystem.getLoginReward();
        const day = questSystem.getLoginRewardDayIndex() + 1;
        desc.textContent = `Day ${day}: ${this.formatNum(reward.wood)} Wood + ${this.formatNum(reward.growthEssence)} Growth Essence`;

        const canClaim = questSystem.canClaimLoginReward();
        btn.disabled = !canClaim;
        btn.textContent = canClaim ? 'Claim' : 'Claimed';
    }

    private updateAPUI() {
        const ap = achievementSystem.getAP();
        const bonusPct = (achievementSystem.getAPBonusMultiplier() - 1) * 100;
        const apValue = this.getApValueLabel();
        const apBonus = this.getApBonusLabel();
        if (apValue) apValue.textContent = this.formatNum(ap);
        if (apBonus) apBonus.textContent = `+${bonusPct.toFixed(1)}%`;
    }

    private updateSkillSummary() {
        const label = this.getSkillEssenceLabel();
        if (!label) return;
        label.textContent = this.formatNum(skillSystem.getAvailableEssence());
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

    private renderSkills() {
        const list = this.getSkillsList();
        if (!list) return;
        list.innerHTML = '';

        const branches = ['chopping', 'collection', 'automation', 'luck'] as const;
        for (const branch of branches) {
            const group = document.createElement('div');
            group.className = 'skill-branch';

            const header = document.createElement('div');
            header.className = 'skill-branch-header';
            header.textContent = branch.charAt(0).toUpperCase() + branch.slice(1);
            group.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'skill-grid';

            for (const skill of skillSystem.getByBranch(branch)) {
                const isUnlocked = skillSystem.isUnlocked(skill.id);
                const canUnlock = skillSystem.canUnlock(skill.id);
                const node = document.createElement('button');
                node.className = `skill-node ${isUnlocked ? 'unlocked' : ''}`;
                node.disabled = !canUnlock;
                node.innerHTML = `
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-desc">${skill.description}</span>
                    <span class="skill-cost">${skill.cost} Essence</span>
                `;

                if (!isUnlocked && canUnlock) {
                    node.addEventListener('click', () => {
                        if (skillSystem.unlock(skill.id)) {
                            this.updateHUD();
                            this.renderSkills();
                            this.updateSkillSummary();
                        }
                    });
                }

                grid.appendChild(node);
            }

            group.appendChild(grid);
            list.appendChild(group);
        }
    }

    private renderBiomes() {
        const list = this.getBiomeList();
        if (!list) return;
        list.innerHTML = '';

        this.updateBiomeSummary();

        const currentBiomeId = biomeSystem.getCurrentBiome();

        for (const biome of Object.values(BIOMES)) {
            const isUnlocked = biomeSystem.isBiomeUnlocked(biome.id);
            const isActive = currentBiomeId === biome.id;
            const canUnlock = biomeSystem.canUnlock(biome.id);

            const el = document.createElement('div');
            el.className = `biome-item ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}`;

            const requirementText = this.getBiomeRequirementText(biome);

            el.innerHTML = `
                <div class="biome-info">
                    <span class="biome-name">${biome.emoji} ${biome.name}</span>
                    <span class="biome-desc">${biome.description}</span>
                    ${isUnlocked ? '' : `<span class="biome-requirements">Requires: ${requirementText}</span>`}
                </div>
                <button class="biome-action-btn" ${isActive ? 'disabled' : (isUnlocked ? '' : (!canUnlock ? 'disabled' : ''))}>
                    ${isActive ? 'ACTIVE' : (isUnlocked ? 'SWITCH' : 'UNLOCK')}
                </button>
            `;

            const actionBtn = el.querySelector('button');
            if (actionBtn) {
                actionBtn.addEventListener('click', () => {
                    if (isUnlocked) {
                        if (!isActive && biomeSystem.changeBiome(biome.id)) {
                            this.renderBiomes();
                        }
                        return;
                    }

                    if (biomeSystem.unlockBiome(biome.id)) {
                        biomeSystem.changeBiome(biome.id);
                        this.renderBiomes();
                        this.updateHUD();
                    }
                });
            }

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

        this.openOverlay('rebirth-confirm-overlay');
    }

    private handleRebirth(): void {
        const essenceGain = prestigeSystem.getPreviewEssence();
        if (prestigeSystem.performRebirth()) {
            this.closeOverlay('rebirth-confirm-overlay');
            this.closeOverlay('settings-overlay');
            alert(`Forest Reborn! Gained ${this.formatNum(essenceGain)} Growth Essence.`);
            this.updateHUD();
            this.renderTree();
            this.renderUpgrades();
            this.renderAxes();
            this.updatePrestigeUI();
            this.checkUnlocks();
            this.renderAchievements();
            this.updateAPUI();
            this.renderSkills();
            this.updateSkillSummary();
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

    private getBiomeRequirementText(biome: typeof BIOMES[string]): string {
        const { wood, growthEssence } = biome.unlockCost;
        if (wood && growthEssence) {
            return `${this.formatNum(wood.amount)} Wood or ${this.formatNum(growthEssence)} Growth Essence`;
        }
        if (wood) {
            return `${this.formatNum(wood.amount)} Wood`;
        }
        if (growthEssence) {
            return `${this.formatNum(growthEssence)} Growth Essence`;
        }
        return 'Unknown requirements';
    }

    private formatNum(n: number) {
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
        return Math.floor(n).toString();
    }

    private toggleMoreSheet() {
        const sheet = document.getElementById('more-sheet');
        if (!sheet) return;
        if (sheet.classList.contains('hidden')) {
            this.openMoreSheet();
            return;
        }
        this.closeMoreSheet();
    }

    private openMoreSheet() {
        this.openOverlay('more-sheet');
        document.getElementById('nav-btn-more')?.classList.add('active');
    }

    private closeMoreSheet() {
        this.closeOverlay('more-sheet');
        if (!this.moreTargets.has(this.curScreenId)) {
            document.getElementById('nav-btn-more')?.classList.remove('active');
        }
    }

    private openOverlay(id: string) {
        const overlay = document.getElementById(id);
        if (!overlay) return;
        this.lastFocusedElement = document.activeElement as HTMLElement | null;
        overlay.classList.remove('hidden');
        const focusTarget = this.findFirstFocusable(overlay) || overlay;
        focusTarget.focus();
    }

    private closeOverlay(id: string) {
        const overlay = document.getElementById(id);
        if (!overlay) return;
        overlay.classList.add('hidden');
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
            this.lastFocusedElement = null;
        }
    }

    private findFirstFocusable(container: HTMLElement): HTMLElement | null {
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(container.querySelectorAll<HTMLElement>(selector));
        for (const el of focusable) {
            if (!el.hasAttribute('disabled')) {
                return el;
            }
        }
        return null;
    }
}

export const uiManager = new UIManager();
