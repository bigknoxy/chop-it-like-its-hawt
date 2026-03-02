import { state, currentTree, setCurrentTree } from '../core/State';
import { TREES } from '../data/Trees';
import { AXES } from '../data/Axes';
import { UPGRADES } from '../data/Upgrades';
import { WOODS } from '../data/Woods';
import { prestigeSystem } from './PrestigeSystem';
import { biomeSystem } from './BiomeSystem';

export type SpecialMechanicResult = {
    type: 'chest' | 'timed' | 'multiPhase' | null;
    bonusWood?: number;
    isTimedBonus?: boolean;
    phaseReward?: number;
    phase?: number;
    maxPhases?: number;
};

// Events to notify UI
export const ChopEvents = {
    onDamage: (amount: number, isCrit: boolean) => { },
    onTreeFall: (woodGained: number, woodId: string, specialResult?: SpecialMechanicResult) => { },
    onWoodUpdate: () => { },
    onPhaseChange: (phase: number, maxPhases: number) => { },
    onChestOpen: () => { },
};

export class ChopSystem {
    private lastHitTime: number = 0;
    private baseHitIntervalMs: number = 100;
    private isHolding: boolean = false;

    private getDamage(): { amount: number; isCrit: boolean } {
        let baseDamage = 1;

        // Upgrades
        const upgStrengthLvl = state.upgrades['upg_strength'] || 0;
        baseDamage += upgStrengthLvl * UPGRADES.upg_strength.effectPerLevel;

        const upgAxeSizeLvl = state.upgrades['upg_axe_size'] || 0;
        const sizeMult = 1 + (upgAxeSizeLvl * UPGRADES.upg_axe_size.effectPerLevel);
        baseDamage *= sizeMult;

        // Axe
        const axe = AXES[state.equippedAxeId] || AXES['axe_rusty'];
        baseDamage *= axe.damageMultiplier;

        baseDamage *= prestigeSystem.getMultiplier();

        // Crit
        const upgLuckLvl = state.upgrades['upg_luck'] || 0;
        let critChance = upgLuckLvl * UPGRADES.upg_luck.effectPerLevel;
        critChance += axe.critBonus || 0;

        let isCrit = Math.random() < critChance;

        if (isCrit) {
            const upgSharpnessLvl = state.upgrades['upg_axe_sharpness'] || 0;
            let critMult = 2 + (upgSharpnessLvl * UPGRADES.upg_axe_sharpness.effectPerLevel);
            baseDamage *= critMult;
        }

        return { amount: Math.ceil(baseDamage), isCrit };
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
            this.applyDamage(autoDps * dt, false);
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
        const { amount, isCrit } = this.getDamage();
        this.applyDamage(amount, isCrit);
        ChopEvents.onDamage(amount, isCrit);
    }

    private getHitIntervalMs(): number {
        const axe = AXES[state.equippedAxeId] || AXES['axe_rusty'];
        if (axe.specialAbility === 'fastTick') {
            return this.baseHitIntervalMs * 0.5;
        }
        return this.baseHitIntervalMs;
    }

    private applyDamage(amount: number, isCrit: boolean) {
        if (!currentTree.isActive) return;
        const def = TREES[currentTree.defId];
        const maxPhases = def.phaseCount || 1;

        currentTree.currentHP -= amount;

        const axe = AXES[state.equippedAxeId] || AXES['axe_rusty'];
        if (axe.specialAbility === 'splashDamage') {
            // Placeholder: splash would affect other trees in biome (future multi-tree)
            // For now, just track that splash is active
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
        state.woodByType[def.woodTypeId] = (state.woodByType[def.woodTypeId] || 0) + phaseReward;
        const woodDef = WOODS[def.woodTypeId];
        state.totalWood += phaseReward * woodDef.valueMultiplier;
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

        const axe = AXES[state.equippedAxeId] || AXES['axe_rusty'];
        if (axe.specialAbility === 'doubleWood' && Math.random() < 0.2) {
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

        woodGain = Math.ceil(woodGain);

        state.woodByType[def.woodTypeId] = (state.woodByType[def.woodTypeId] || 0) + woodGain;

        const woodDef = WOODS[def.woodTypeId];
        const totalAdded = woodGain * woodDef.valueMultiplier;
        state.totalWood += totalAdded;

        prestigeSystem.addLifetimeWood(totalAdded);

        ChopEvents.onTreeFall(woodGain, def.woodTypeId, specialResult);
        ChopEvents.onWoodUpdate();

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
