import { BiomeDefinition } from '../core/types';

export const BIOMES: Record<string, BiomeDefinition> = {
    default: {
        id: 'default',
        name: 'Forest',
        description: 'A peaceful forest with common trees.',
        unlockCost: {},
        allowedTrees: ['tree_basic', 'tree_sturdy', 'tree_tough', 'tree_golden'],
        emoji: '🌲'
    },
    crystal_caverns: {
        id: 'crystal_caverns',
        name: 'Crystal Caverns',
        description: 'Deep caves filled with crystalline trees and rare gems.',
        unlockCost: {
            wood: { amount: 500 },
            growthEssence: 5
        },
        allowedTrees: ['crystal_oak', 'gem_willow', 'diamond_pine'],
        emoji: '💎'
    }
};
