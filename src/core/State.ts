import { PlayerState, TreeInstance } from './types';

export const createInitialState = (): PlayerState => ({
    totalWood: 0,
    woodByType: {
        basic: 0,
        pine: 0,
        oak: 0,
        rare_amber: 0,
    },
    upgrades: {}, // e.g. { 'upg_strength': 1 }
    ownedAxes: ['axe_rusty'],
    equippedAxeId: 'axe_rusty',
    forest: {
        isUnlocked: false,
        baseWoodPerSecond: 1, // Will increase eventually
        multiplierFromUpgrades: 1,
        lastTickTimestamp: Date.now(),
    },

    // V2
    activeBiomeId: 'home_forest',
    unlockedBiomes: ['home_forest'],
    equippedCompanionId: null,
    companions: {},

    lastSaveTimestamp: Date.now(),
});

export let state: PlayerState = createInitialState();

export function loadState(savedState: PlayerState) {
    state = savedState;
}

export let currentTree: TreeInstance = {
    defId: 'tree_basic',
    currentHP: 30,
    isActive: true,
};

export function setCurrentTree(tree: TreeInstance) {
    currentTree = tree;
}
