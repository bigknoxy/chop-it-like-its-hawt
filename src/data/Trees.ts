import { TreeDefinition } from '../core/types';

export const TREES: Record<string, TreeDefinition> = {
    tree_basic: {
        id: 'tree_basic',
        name: 'Common Birch',
        maxHP: 10,  // Dies in ~2-5 seconds at start (1 dmg per 100ms = 10dps -> 1 sec) Wait, if 1 dmg per tap, 10 taps. If holding 100ms, 1 sec. Maybe 20 HP.
        // Let's make it 30 HP to hit 3 seconds of holding.
        baseWoodYield: 5,
        woodTypeId: 'basic',
        spawnWeight: 100,
        emoji: '🌲'
    },
    tree_sturdy: {
        id: 'tree_sturdy',
        name: 'Sturdy Pine',
        maxHP: 150,
        baseWoodYield: 15,
        woodTypeId: 'pine',
        spawnWeight: 40,
        emoji: '🌳'
    },
    tree_tough: {
        id: 'tree_tough',
        name: 'Ancient Oak',
        maxHP: 800,
        baseWoodYield: 30,
        woodTypeId: 'oak',
        spawnWeight: 15,
        emoji: '🍁'
    },
    tree_golden: {
        id: 'tree_golden',
        name: 'Amber Spire',
        maxHP: 2500,
        baseWoodYield: 5,
        woodTypeId: 'rare_amber',
        spawnWeight: 3,
        specialMechanic: 'chest',
        emoji: '✨'
    },
    tree_rush: {
        id: 'tree_rush',
        name: 'Rush Birch',
        maxHP: 60,
        baseWoodYield: 8,
        woodTypeId: 'basic',
        spawnWeight: 20,
        specialMechanic: 'timed',
        phaseCount: 1,
        emoji: '⚡'
    },
    tree_elder: {
        id: 'tree_elder',
        name: 'Elder Oak',
        maxHP: 600,
        baseWoodYield: 20,
        woodTypeId: 'oak',
        spawnWeight: 12,
        specialMechanic: 'multiPhase',
        phaseCount: 3,
        emoji: '🌳'
    },
    crystal_oak: {
        id: 'crystal_oak',
        name: 'Crystal Oak',
        maxHP: 500,
        baseWoodYield: 12,
        woodTypeId: 'crystal_shard',
        spawnWeight: 50,
        biome: 'crystal_caverns',
        emoji: '💎'
    },
    gem_willow: {
        id: 'gem_willow',
        name: 'Gem Willow',
        maxHP: 1200,
        baseWoodYield: 8,
        woodTypeId: 'gemstone',
        spawnWeight: 25,
        biome: 'crystal_caverns',
        emoji: '💠'
    },
    diamond_pine: {
        id: 'diamond_pine',
        name: 'Diamond Pine',
        maxHP: 3000,
        baseWoodYield: 6,
        woodTypeId: 'diamond_dust',
        spawnWeight: 10,
        biome: 'crystal_caverns',
        emoji: '🔷'
    },
    ember_oak: {
        id: 'ember_oak',
        name: 'Ember Oak',
        maxHP: 1400,
        baseWoodYield: 12,
        woodTypeId: 'ember_ash',
        spawnWeight: 45,
        biome: 'volcanic_grove',
        emoji: '🌲'
    },
    magma_willow: {
        id: 'magma_willow',
        name: 'Magma Willow',
        maxHP: 2400,
        baseWoodYield: 9,
        woodTypeId: 'magma_core',
        spawnWeight: 25,
        biome: 'volcanic_grove',
        emoji: '🌳'
    },
    phoenix_pine: {
        id: 'phoenix_pine',
        name: 'Phoenix Pine',
        maxHP: 4200,
        baseWoodYield: 7,
        woodTypeId: 'phoenix_feather',
        spawnWeight: 10,
        biome: 'volcanic_grove',
        emoji: '🌲'
    }
};

// Adjust basic tree hp
TREES.tree_basic.maxHP = 30;
