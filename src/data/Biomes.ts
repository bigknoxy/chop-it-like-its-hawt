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
    },
    frozen_tundra: {
        id: 'frozen_tundra',
        name: 'Frozen Tundra',
        description: 'An icy wasteland where ancient trees are preserved in eternal frost.',
        unlockCost: {
            wood: { amount: 2500 },
            growthEssence: 50
        },
        allowedTrees: ['frost_birch', 'glacier_willow', 'ancient_frost_pine'],
        emoji: '❄️'
    },
    haunted_grove: {
        id: 'haunted_grove',
        name: 'Haunted Grove',
        description: 'A cursed forest where ghostly trees whisper secrets of the damned.',
        unlockCost: {
            wood: { amount: 7500 },
            growthEssence: 100
        },
        allowedTrees: ['ghost_birch', 'cursed_willow', 'nightmare_oak'],
        emoji: '👻'
    },
    celestial_orchard: {
        id: 'celestial_orchard',
        name: 'Celestial Orchard',
        description: 'A divine grove where starlight crystallizes into precious wood.',
        unlockCost: {
            wood: { amount: 25000 },
            growthEssence: 250
        },
        allowedTrees: ['starlight_birch', 'divine_willow', 'world_tree_sapling'],
        emoji: '⭐'
    },
    abyssal_depths: {
        id: 'abyssal_depths',
        name: 'Abyssal Depths',
        description: 'The void between worlds, where eldritch trees feed on cosmic energy.',
        unlockCost: {
            wood: { amount: 100000 },
            growthEssence: 500
        },
        allowedTrees: ['void_touched_birch', 'eldritch_willow', 'primordial_tree'],
        emoji: '🌌'
    }
};
