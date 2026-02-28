export type WoodTypeId = 'basic' | 'pine' | 'oak' | 'rare_amber' | 'spooky_wood' | 'glacier_sap' | string;

import { WoodType } from '../core/types';

export const WOODS: Record<string, WoodType> = {
    basic: {
        id: 'basic',
        name: 'Birch Wood',
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
        valueMultiplier: 100,
        rarity: 'legendary',
    },
    spooky_wood: {
        id: 'spooky_wood',
        name: 'Ghostwood',
        valueMultiplier: 500,
        rarity: 'rare',
    },
    glacier_sap: {
        id: 'glacier_sap',
        name: 'Glacier Sap',
        valueMultiplier: 2500,
        rarity: 'epic',
    },
};
