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
    },
    volcanic_grove: {
        id: 'volcanic_grove',
        name: 'Volcanic Grove',
        description: 'Smoldering groves where embers cling to every branch.',
        unlockCost: {
            wood: { amount: 1000 },
            growthEssence: 20
        },
        allowedTrees: ['ember_oak', 'magma_willow', 'phoenix_pine'],
        emoji: '🌲'
    }
};
