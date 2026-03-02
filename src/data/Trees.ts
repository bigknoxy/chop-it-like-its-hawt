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
        emoji: '✨'
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
    }
};

// Adjust basic tree hp
TREES.tree_basic.maxHP = 30;
