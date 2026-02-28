import { state, currentTree, setCurrentTree } from '../core/State';
import { TREES } from '../data/Trees';
import { AXES } from '../data/Axes';
import { UPGRADES } from '../data/Upgrades';
import { WOODS } from '../data/Woods';

// Events to notify UI
export const ChopEvents = {
    onDamage: (amount: number, isCrit: boolean) => { },
    onTreeFall: (woodGained: number, woodId: string) => { },
    onWoodUpdate: () => { },
};

export class ChopSystem {
    private lastHitTime: number = 0;
    private hitIntervalMs: number = 100; // 10 hits per second while holding
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
            if (now - this.lastHitTime >= this.hitIntervalMs) {
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

    private applyDamage(amount: number, isCrit: boolean) {
        if (!currentTree.isActive) return;

        currentTree.currentHP -= amount;

        if (currentTree.currentHP <= 0) {
            this.breakTree();
        }
    }

    private breakTree() {
        currentTree.currentHP = 0;
        currentTree.isActive = false;

        const def = TREES[currentTree.defId];

        // Calculate Reward
        let woodGain = def.baseWoodYield;
        const upgAxeSizeLvl = state.upgrades['upg_axe_size'] || 0;
        // axe size gives slight yield boost: 2% per level? PRD says "slightly boosts yield"
        woodGain *= 1 + (upgAxeSizeLvl * 0.02);

        // Wood value multiplier (handled at currency addition, or pre-calculated)
        // Actually PRD says woodGain = baseWoodYield * (1+bonus) * valueMultiplier.
        // valueMultiplier makes the amount bigger? Oh, "wood types act as currencies". The resource count goes up physically by the multiplier or it goes to `woodByType` container.
        // Let's just grant a quantity of that specific wood type. The valueMultiplier is typically for selling, but let's add raw amount.
        woodGain = Math.ceil(woodGain);

        // Add to state
        state.woodByType[def.woodTypeId] = (state.woodByType[def.woodTypeId] || 0) + woodGain;

        // Also increase total wood generically based on value multiplier?
        const woodDef = WOODS[def.woodTypeId];
        const totalAdded = woodGain * woodDef.valueMultiplier;
        state.totalWood += totalAdded;

        ChopEvents.onTreeFall(woodGain, def.woodTypeId);
        ChopEvents.onWoodUpdate();

        // Spawn next tree
        setTimeout(() => this.spawnNextTree(), 500); // Wait for fall animation
    }

    private spawnNextTree() {
        // Weighted random selection
        const totalWeight = Object.values(TREES).reduce((sum, def) => sum + def.spawnWeight, 0);
        let rand = Math.random() * totalWeight;

        let selectedId = 'tree_basic';
        for (const tree of Object.values(TREES)) {
            if (rand < tree.spawnWeight) {
                selectedId = tree.id;
                break;
            }
            rand -= tree.spawnWeight;
        }

        setCurrentTree({
            defId: selectedId,
            currentHP: TREES[selectedId].maxHP,
            isActive: true,
        });
    }
}

export const chopSystem = new ChopSystem();
