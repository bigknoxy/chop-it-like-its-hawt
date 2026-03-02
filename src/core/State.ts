import { PlayerState, TreeInstance } from './types';

export const createInitialState = (): PlayerState => ({
    totalWood: 0,
    woodByType: {
        basic: 0,
        pine: 0,
        oak: 0,
        rare_amber: 0,
        crystal_shard: 0,
        gemstone: 0,
        diamond_dust: 0,
    },
    upgrades: {},
    ownedAxes: ['axe_rusty'],
    equippedAxeId: 'axe_rusty',
    forest: {
        isUnlocked: false,
        baseWoodPerSecond: 1,
        multiplierFromUpgrades: 1,
        lastTickTimestamp: Date.now(),
    },
    prestige: {
        growthEssence: 0,
        lifetimeWood: 0,
        totalRebirths: 0,
        lastRebirthTimestamp: Date.now(),
    },
    biome: {
        currentBiomeId: 'default',
        unlockedBiomes: ['default'],
    },
    achievements: {
        progress: {
            treesChopped: 0,
            woodCollected: 0,
            rebirths: 0,
            biomesUnlocked: 1,
        },
        unlocked: {},
        totalAP: 0,
    },
    daily: {
        lastResetDay: new Date().toISOString().slice(0, 10),
        progress: {
            treesChopped: 0,
            woodCollected: 0,
            upgradesPurchased: 0,
        },
        claimed: {},
        login: {
            dayIndex: 0,
            claimedToday: false,
            lastClaimDay: '',
        },
    },
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
