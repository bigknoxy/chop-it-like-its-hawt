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
        critBonus: 0.1, // +10% crit chance
        specialAbility: 'splashDamage', // Conceptual
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
        critBonus: 0.2, // +20% crit chance
        specialAbility: 'doubleWood',
        unlockCost: [
            { woodTypeId: 'oak', amount: 500 },
            { woodTypeId: 'rare_amber', amount: 50 },
        ],
    }
};
