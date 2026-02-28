import { UpgradeDefinition } from '../core/types';

export const UPGRADES: Record<string, Omit<UpgradeDefinition, 'level'>> = {
    upg_strength: {
        id: 'upg_strength',
        name: 'Lumberjack Strength',
        description: 'Increases your base chopping damage by 1.',
        effectType: 'strength',
        effectPerLevel: 1,
        maxLevel: 50,
        baseCost: 20, // 4 trees to get first upgrade (20-40s)
        costGrowthFactor: 1.5,
        prerequisites: [],
    },
    upg_axe_sharpness: {
        id: 'upg_axe_sharpness',
        name: 'Axe Sharpness',
        description: 'Increases critical hit damage by 20%.',
        effectType: 'critDamage',
        effectPerLevel: 0.2,
        maxLevel: 25,
        baseCost: 100,
        costGrowthFactor: 1.6,
        prerequisites: [{ upgradeId: 'upg_strength', minLevel: 5 }],
    },
    upg_luck: {
        id: 'upg_luck',
        name: 'Woodland Luck',
        description: 'Increases critical hit chance by 1%.',
        effectType: 'luck',
        effectPerLevel: 0.01,
        maxLevel: 25, // Max 25% crit chance from upgrades
        baseCost: 150,
        costGrowthFactor: 1.8,
        prerequisites: [],
    },
    upg_autochop: {
        id: 'upg_autochop',
        name: 'Auto-Chop',
        description: 'Automatically deals 1 DPS to the active tree.',
        effectType: 'autoChop',
        effectPerLevel: 1,
        maxLevel: 30,
        baseCost: 300,
        costGrowthFactor: 2.0,
        prerequisites: [{ upgradeId: 'upg_strength', minLevel: 10 }],
    },
    upg_forest_efficiency: {
        id: 'upg_forest_efficiency',
        name: 'Forest Efficiency',
        description: 'Increases idle wood generation by +5% per level.',
        effectType: 'idleGain',
        effectPerLevel: 0.05,
        maxLevel: 20,
        baseCost: 1000,
        costGrowthFactor: 2.5,
        prerequisites: [], // Real unlock is forest system unlock
    },
    upg_axe_size: {
        id: 'upg_axe_size',
        name: 'Axe Size',
        description: 'Swing wider! Damage +5% and slightly boosts yield.',
        effectType: 'axeSize',
        effectPerLevel: 0.05,
        maxLevel: 10,
        baseCost: 500,
        costGrowthFactor: 3.0,
        prerequisites: [{ upgradeId: 'upg_strength', minLevel: 15 }],
    }
};
