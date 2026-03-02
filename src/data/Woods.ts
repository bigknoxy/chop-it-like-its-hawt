import { WoodType } from '../core/types';

export const WOODS: Record<string, WoodType> = {
    basic: {
        id: 'basic',
        name: 'Basic Wood',
        valueMultiplier: 1,
        rarity: 'common',
    },
    pine: {
        id: 'pine',
        name: 'Pine Wood',
        valueMultiplier: 3,
        rarity: 'common',
    },
    oak: {
        id: 'oak',
        name: 'Oak Wood',
        valueMultiplier: 10,
        rarity: 'rare',
    },
    rare_amber: {
        id: 'rare_amber',
        name: 'Amber',
        valueMultiplier: 50,
        rarity: 'epic',
    },
    crystal_shard: {
        id: 'crystal_shard',
        name: 'Crystal Shard',
        valueMultiplier: 2,
        rarity: 'rare',
    },
    gemstone: {
        id: 'gemstone',
        name: 'Gemstone',
        valueMultiplier: 5,
        rarity: 'epic',
    },
    diamond_dust: {
        id: 'diamond_dust',
        name: 'Diamond Dust',
        valueMultiplier: 10,
        rarity: 'legendary',
    },
    ember_ash: {
        id: 'ember_ash',
        name: 'Ember Ash',
        valueMultiplier: 4,
        rarity: 'rare',
    },
    magma_core: {
        id: 'magma_core',
        name: 'Magma Core',
        valueMultiplier: 12,
        rarity: 'epic',
    },
    phoenix_feather: {
        id: 'phoenix_feather',
        name: 'Phoenix Feather',
        valueMultiplier: 20,
        rarity: 'legendary',
    }
};
