import { state, currentTree, setCurrentTree } from '../core/State';
import { TREES } from '../data/Trees';
import { AXES } from '../data/Axes';
import { UPGRADES } from '../data/Upgrades';
import { WOODS } from '../data/Woods';
import { prestigeSystem } from './PrestigeSystem';
import { biomeSystem } from './BiomeSystem';
import { achievementSystem } from './AchievementSystem';
import { questSystem } from './QuestSystem';
import { skillSystem } from './SkillSystem';

export type SpecialMechanicResult = {
    type: 'chest' | 'timed' | 'multiPhase' | 'frostShield' | 'soulDrain' | 'blessing' | 'chaosChop' | null;
    bonusWood?: number;
    isTimedBonus?: boolean;
    phaseReward?: number;
    phase?: number;
    maxPhases?: number;
    isFrozen?: boolean;
    damageVariance?: number;
    essenceGained?: number;
};

// Events to notify UI
export const ChopEvents = {
    onDamage: (amount: number, isCrit: boolean, special?: { frozen?: boolean; variance?: number }) => { },
    onTreeFall: (woodGained: number, woodId: string, specialResult?: SpecialMechanicResult) => { },
    onWoodUpdate: () => { },
    onPhaseChange: (phase: number, maxPhases: number) => { },
    onChestOpen: () => { },
    onFreeze: () => { },
    onSoulHarvest: (essenceGained: number) => { },
    onVoidTear: () => { },
};

export class ChopSystem {
    private lastHitTime: number = 0;
    private baseHitIntervalMs: number = 100;
    private isHolding: boolean = false;
    private hitCount: number = 0;
    private isFrozen: boolean = false;

    private hasAxeAbility(ability: string): boolean {
        const axe = AXES[state.equippedAxeId] || AXES['axe_rusty'];
        if (axe.specialAbility === ability) return true;
        if (axe.specialAbility === 'apocalypse') return true;
        return false;
    }

    private getDamage(): { amount: number; isCrit: boolean; variance?: number } {
        let baseDamage = 1;
        let variance: number | undefined;

        const def = TREES[currentTree.defId];
        if (!def) {
            return { amount: 1, isCrit: false };
        }
        
        if (def.specialMechanic === 'chaosChop') {
            variance = 0.5 + Math.random() * 1.5;
            baseDamage *= variance;
        }

        const upgStrengthLvl = state.upgrades['upg_strength'] || 0;
        baseDamage += upgStrengthLvl * UPGRADES.upg_strength.effectPerLevel;

        const upgAxeSizeLvl = state.upgrades['upg_axe_size'] || 0;
        const sizeMult = 1 + (upgAxeSizeLvl * UPGRADES.upg_axe_size.effectPerLevel);
        baseDamage *= sizeMult;

        const axe = AXES[state.equippedAxeId] || AXES['axe_rusty'];
        baseDamage *= axe.damageMultiplier;

        baseDamage *= prestigeSystem.getMultiplier();

        const skillBonuses = skillSystem.getTotalBonuses();
        baseDamage *= 1 + (skillBonuses.damagePct || 0);

        const upgLuckLvl = state.upgrades['upg_luck'] || 0;
        let critChance = upgLuckLvl * UPGRADES.upg_luck.effectPerLevel;
        critChance += axe.critBonus || 0;
        critChance += skillBonuses.critChancePct || 0;

        let isCrit = Math.random() < critChance;

        if (isCrit) {
            const upgSharpnessLvl = state.upgrades['upg_axe_sharpness'] || 0;
            let critMult = 2 + (upgSharpnessLvl * UPGRADES.upg_axe_sharpness.effectPerLevel);
            
            if (this.hasAxeAbility('divineStrike')) {
                critMult *= 2;
            }
            baseDamage *= critMult;
        }

        if (this.isFrozen) {
            baseDamage *= 3;
            this.isFrozen = false;
        }

        this.hitCount++;
        if (this.hasAxeAbility('cosmicFury') && this.hitCount % 10 === 0) {
            baseDamage *= 10;
        }

        return { amount: Math.ceil(baseDamage), isCrit, variance };
    }

    public handleInput(isDown: boolean) {
        this.isHolding = isDown;
        if (isDown) {
            // Immediate hit on tap
            const now = performance.now();
            if (now - this.lastHitTime > 50) { // Slight debounce to prevent macro spam
                this.hit();
            }
        }
    }

    public update(dt: number) {
        // Handle Auto-Chop
        const autoChopLvl = state.upgrades['upg_autochop'] || 0;
        if (autoChopLvl > 0) {
            const autoDps = autoChopLvl * UPGRADES.upg_autochop.effectPerLevel;
            const skillBonuses = skillSystem.getTotalBonuses();
            const bonusMultiplier = 1 + (skillBonuses.autoChopPct || 0);
            this.applyDamage(autoDps * dt * bonusMultiplier, false);
        }

        // Handle Holding
        if (this.isHolding) {
            const now = performance.now();
            const hitIntervalMs = this.getHitIntervalMs();
            if (now - this.lastHitTime >= hitIntervalMs) {
                this.hit();
            }
        }
    }

    private hit() {
        this.lastHitTime = performance.now();
        const { amount, isCrit, variance } = this.getDamage();
        
        if (this.hasAxeAbility('chillEffect') && Math.random() < 0.15 && !this.isFrozen) {
            this.isFrozen = true;
            ChopEvents.onFreeze();
        }
        
        this.applyDamage(amount, isCrit);
        ChopEvents.onDamage(amount, isCrit, { frozen: this.isFrozen, variance });
    }

    private getHitIntervalMs(): number {
        if (this.hasAxeAbility('fastTick')) {
            return this.baseHitIntervalMs * 0.5;
        }
        return this.baseHitIntervalMs;
    }

    private applyDamage(amount: number, isCrit: boolean) {
        if (!currentTree.isActive) return;
        const def = TREES[currentTree.defId];
        const maxPhases = def.phaseCount || 1;

        let finalDamage = amount;

        if (def.specialMechanic === 'frostShield') {
            const shieldThreshold = def.maxHP * 0.2;
            if (currentTree.currentHP > def.maxHP - shieldThreshold) {
                finalDamage *= 0.5;
            }
        }

        if (this.hasAxeAbility('voidTear') && Math.random() < 0.05) {
            if (def.specialMechanic !== 'chest' && def.specialMechanic !== 'multiPhase') {
                currentTree.currentHP = 0;
                ChopEvents.onVoidTear();
                this.breakTree();
                return;
            }
        }

        currentTree.currentHP -= finalDamage;

        if (def.specialMechanic === 'soulDrain' && isCrit) {
            if (Math.random() < 0.1) {
                const healAmount = Math.ceil(def.baseWoodYield * 0.5);
                const bonusReward = Math.ceil(achievementSystem.applyWoodBonus(healAmount));
                state.woodByType[def.woodTypeId] = (state.woodByType[def.woodTypeId] || 0) + bonusReward;
                const woodDef = WOODS[def.woodTypeId];
                const totalAdded = bonusReward * woodDef.valueMultiplier;
                state.totalWood += totalAdded;
                ChopEvents.onWoodUpdate();
            }
        }

        const axe = AXES[state.equippedAxeId] || AXES['axe_rusty'];
        if (axe.specialAbility === 'splashDamage') {
        }

        if (def.specialMechanic === 'multiPhase' && maxPhases > 1) {
            const phaseHP = def.maxHP / maxPhases;
            const newPhase = Math.ceil(currentTree.currentHP / phaseHP);
            const currentPhase = currentTree.currentPhase || maxPhases;

            if (newPhase < currentPhase && newPhase >= 1) {
                currentTree.currentPhase = newPhase;
                this.givePhaseReward(def, newPhase);
                ChopEvents.onPhaseChange(newPhase, maxPhases);
            }
        }

        if (currentTree.currentHP <= 0) {
            this.breakTree();
        }
    }

    private givePhaseReward(def: typeof TREES[string], phase: number) {
        const phaseReward = Math.ceil(def.baseWoodYield * 0.3);
        const bonusReward = Math.ceil(achievementSystem.applyWoodBonus(phaseReward));
        state.woodByType[def.woodTypeId] = (state.woodByType[def.woodTypeId] || 0) + bonusReward;
        const woodDef = WOODS[def.woodTypeId];
        const totalAdded = bonusReward * woodDef.valueMultiplier;
        state.totalWood += totalAdded;
        achievementSystem.addProgress('woodCollected', totalAdded);
        questSystem.addProgress('woodCollected', totalAdded);
        ChopEvents.onWoodUpdate();
    }

    private breakTree() {
        currentTree.currentHP = 0;
        currentTree.isActive = false;

        const def = TREES[currentTree.defId];
        let specialResult: SpecialMechanicResult = { type: null };

        let woodGain = def.baseWoodYield;
        const upgAxeSizeLvl = state.upgrades['upg_axe_size'] || 0;
        woodGain *= 1 + (upgAxeSizeLvl * 0.02);

        if (this.hasAxeAbility('doubleWood') && Math.random() < 0.2) {
            woodGain *= 2;
        }

        if (def.specialMechanic === 'chest') {
            if (Math.random() < 0.10) {
                const bonusWood = Math.ceil(woodGain * 2);
                woodGain += bonusWood;
                specialResult = { type: 'chest', bonusWood };
                ChopEvents.onChestOpen();
            }
        }

        if (def.specialMechanic === 'timed' && currentTree.spawnTime) {
            const elapsedMs = Date.now() - currentTree.spawnTime;
            if (elapsedMs <= 15000) {
                const bonusWood = Math.ceil(woodGain);
                woodGain += bonusWood;
                specialResult = { type: 'timed', bonusWood, isTimedBonus: true };
            }
        }

        if (def.specialMechanic === 'multiPhase') {
            const maxPhases = def.phaseCount || 3;
            specialResult = {
                type: 'multiPhase',
                phase: 0,
                maxPhases
            };
        }

        if (def.specialMechanic === 'frostShield') {
            specialResult = { type: 'frostShield' };
        }

        if (def.specialMechanic === 'soulDrain') {
            specialResult = { type: 'soulDrain' };
        }

        if (def.specialMechanic === 'blessing') {
            if (Math.random() < 0.10) {
                const originalGain = woodGain;
                woodGain *= 3;
                specialResult = { type: 'blessing', bonusWood: originalGain * 2 };
            }
        }

        if (def.specialMechanic === 'chaosChop') {
            specialResult = { type: 'chaosChop' };
        }

        if (this.hasAxeAbility('soulHarvest') && Math.random() < 0.1) {
            state.prestige.growthEssence += 1;
            specialResult.essenceGained = 1;
            ChopEvents.onSoulHarvest(1);
        }

        woodGain = Math.ceil(woodGain);
        woodGain = Math.ceil(achievementSystem.applyWoodBonus(woodGain));

        state.woodByType[def.woodTypeId] = (state.woodByType[def.woodTypeId] || 0) + woodGain;

        const woodDef = WOODS[def.woodTypeId];
        if (!woodDef) {
            console.warn(`Unknown wood type: ${def.woodTypeId}`);
            return;
        }
        const skillBonuses = skillSystem.getTotalBonuses();
        const valueMultiplier = woodDef.valueMultiplier * (1 + (skillBonuses.woodValuePct || 0));
        const totalAdded = woodGain * valueMultiplier;
        state.totalWood += totalAdded;
        achievementSystem.addProgress('woodCollected', totalAdded);
        questSystem.addProgress('woodCollected', totalAdded);

        prestigeSystem.addLifetimeWood(totalAdded);
        achievementSystem.addProgress('treesChopped', 1);
        questSystem.addProgress('treesChopped', 1);

        ChopEvents.onTreeFall(woodGain, def.woodTypeId, specialResult);
        ChopEvents.onWoodUpdate();

        this.hitCount = 0;
        this.isFrozen = false;

        setTimeout(() => this.spawnNextTree(), 500);
    }

    private spawnNextTree() {
        const allowedTrees = biomeSystem.getAllowedTrees();

        const totalWeight = allowedTrees.reduce((sum, treeId) => {
            const tree = TREES[treeId];
            return sum + (tree ? tree.spawnWeight : 0);
        }, 0);

        let rand = Math.random() * totalWeight;

        let selectedId = allowedTrees[0] || 'tree_basic';
        for (const treeId of allowedTrees) {
            const tree = TREES[treeId];
            if (!tree) continue;
            if (rand < tree.spawnWeight) {
                selectedId = tree.id;
                break;
            }
            rand -= tree.spawnWeight;
        }

        const def = TREES[selectedId];
        setCurrentTree({
            defId: selectedId,
            currentHP: def.maxHP,
            isActive: true,
            spawnTime: Date.now(),
            currentPhase: def.phaseCount || 1,
        });
    }
}

export const chopSystem = new ChopSystem();
