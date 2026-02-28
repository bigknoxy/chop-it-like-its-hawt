import { BiomeDefinition } from '../core/types';

export const BIOMES: Record<string, BiomeDefinition> = {
    home_forest: {
        id: 'home_forest',
        name: 'The Home Forest',
        description: 'A peaceful starting area with basic trees.',
        emoji: '🏞️',
        unlockCost: [], // Unlocked by default
        spawnableTrees: ['tree_basic', 'tree_sturdy', 'tree_tough', 'tree_golden'],
    },
    haunted_weald: {
        id: 'haunted_weald',
        name: 'Haunted Weald',
        description: 'Spooky woods where tougher variants spawn frequently.',
        emoji: '🕸️',
        unlockCost: [
            { woodTypeId: 'pine', amount: 1500 },
            { woodTypeId: 'oak', amount: 500 },
        ],
        spawnableTrees: ['tree_tough', 'tree_golden', 'tree_spooky', 'tree_cursed_ash'],
    },
    frozen_tundra: {
        id: 'frozen_tundra',
        name: 'Frozen Tundra',
        description: 'Brittle, ice-hardened trees that drop frozen sap.',
        emoji: '❄️',
        unlockCost: [
            { woodTypeId: 'oak', amount: 2500 },
            { woodTypeId: 'spooky_wood', amount: 1000 },
        ],
        spawnableTrees: ['tree_glacier_pine', 'tree_crystal_birch', 'tree_golden'],
    },
};
