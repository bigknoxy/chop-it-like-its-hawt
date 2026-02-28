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
    }
};

// Adjust basic tree hp
TREES.tree_basic.maxHP = 30;
