import { AxeDefinition } from '../core/types';

export const AXES: Record<string, AxeDefinition> = {
    axe_rusty: {
        id: 'axe_rusty',
        name: 'Rusty Axe',
        tier: 1,
        damageMultiplier: 1,
        critBonus: 0,
        unlockCost: [], // default
    },
    axe_iron: {
        id: 'axe_iron',
        name: 'Iron Axe',
        tier: 2,
        damageMultiplier: 2,
        critBonus: 0.05, // +5% crit chance
        unlockCost: [
            { woodTypeId: 'basic', amount: 500 },
            { woodTypeId: 'pine', amount: 50 },
        ],
    },
    axe_steel: {
        id: 'axe_steel',
        name: 'Steel Double-Bit',
        tier: 3,
        damageMultiplier: 5,
        critBonus: 0.1,
        specialAbility: 'doubleWood',
        unlockCost: [
            { woodTypeId: 'pine', amount: 500 },
            { woodTypeId: 'oak', amount: 100 },
        ],
    },
    axe_amber: {
        id: 'axe_amber',
        name: 'Amber Edged Heavy Axe',
        tier: 4,
        damageMultiplier: 15,
        critBonus: 0.2,
        specialAbility: 'fastTick',
        unlockCost: [
            { woodTypeId: 'oak', amount: 500 },
            { woodTypeId: 'rare_amber', amount: 50 },
        ],
    },
    axe_frostbite: {
        id: 'axe_frostbite',
        name: 'Frostbite Cleaver',
        tier: 5,
        damageMultiplier: 40,
        critBonus: 0.25,
        specialAbility: 'chillEffect',
        unlockCost: [
            { woodTypeId: 'ember_ash', amount: 500 },
            { woodTypeId: 'ice_crystal', amount: 100 },
            { woodTypeId: 'glacier_core', amount: 25 },
        ],
    },
    axe_reaper: {
        id: 'axe_reaper',
        name: "Reaper's Edge",
        tier: 6,
        damageMultiplier: 100,
        critBonus: 0.30,
        specialAbility: 'soulHarvest',
        unlockCost: [
            { woodTypeId: 'crystal_shard', amount: 500 },
            { woodTypeId: 'spectral_wood', amount: 100 },
            { woodTypeId: 'nightmare_heart', amount: 25 },
        ],
    },
    axe_divine: {
        id: 'axe_divine',
        name: "Heaven's Splitter",
        tier: 7,
        damageMultiplier: 250,
        critBonus: 0.35,
        specialAbility: 'divineStrike',
        unlockCost: [
            { woodTypeId: 'gemstone', amount: 500 },
            { woodTypeId: 'star_dust', amount: 100 },
            { woodTypeId: 'celestial_core', amount: 25 },
        ],
    },
    axe_void: {
        id: 'axe_void',
        name: 'Void Reaper',
        tier: 8,
        damageMultiplier: 600,
        critBonus: 0.40,
        specialAbility: 'voidTear',
        unlockCost: [
            { woodTypeId: 'diamond_dust', amount: 500 },
            { woodTypeId: 'void_crystal', amount: 100 },
            { woodTypeId: 'eldritch_essence', amount: 25 },
        ],
    },
    axe_cosmic: {
        id: 'axe_cosmic',
        name: 'Cosmic Annihilator',
        tier: 9,
        damageMultiplier: 1500,
        critBonus: 0.50,
        specialAbility: 'cosmicFury',
        unlockCost: [
            { woodTypeId: 'primordial_heart', amount: 500 },
            { woodTypeId: 'divine_essence', amount: 100 },
            { woodTypeId: 'phoenix_feather', amount: 50 },
        ],
    },
    axe_ragnarok: {
        id: 'axe_ragnarok',
        name: 'Ragnarok',
        tier: 10,
        damageMultiplier: 5000,
        critBonus: 0.75,
        specialAbility: 'apocalypse',
        unlockCost: [
            { woodTypeId: 'primordial_heart', amount: 1000 },
            { woodTypeId: 'divine_essence', amount: 500 },
            { woodTypeId: 'nightmare_heart', amount: 250 },
        ],
    }
};
