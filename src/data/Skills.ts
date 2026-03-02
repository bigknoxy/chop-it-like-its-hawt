import { SkillDefinition } from '../core/types';

export const SKILLS: SkillDefinition[] = [
    {
        id: 'skill_chop_power_1',
        name: 'Chop Power I',
        description: '+5% chopping damage.',
        branch: 'chopping',
        cost: 3,
        bonuses: {
            damagePct: 0.05,
        },
    },
    {
        id: 'skill_chop_power_2',
        name: 'Chop Power II',
        description: '+10% chopping damage.',
        branch: 'chopping',
        cost: 6,
        requires: ['skill_chop_power_1'],
        bonuses: {
            damagePct: 0.10,
        },
    },
    {
        id: 'skill_chop_power_3',
        name: 'Chop Power III',
        description: '+15% chopping damage.',
        branch: 'chopping',
        cost: 10,
        requires: ['skill_chop_power_2'],
        bonuses: {
            damagePct: 0.15,
        },
    },
    {
        id: 'skill_value_1',
        name: 'Timber Value I',
        description: '+10% wood value.',
        branch: 'collection',
        cost: 3,
        bonuses: {
            woodValuePct: 0.10,
        },
    },
    {
        id: 'skill_value_2',
        name: 'Timber Value II',
        description: '+15% wood value.',
        branch: 'collection',
        cost: 6,
        requires: ['skill_value_1'],
        bonuses: {
            woodValuePct: 0.15,
        },
    },
    {
        id: 'skill_value_3',
        name: 'Timber Value III',
        description: '+20% wood value.',
        branch: 'collection',
        cost: 10,
        requires: ['skill_value_2'],
        bonuses: {
            woodValuePct: 0.20,
        },
    },
    {
        id: 'skill_auto_1',
        name: 'Auto Engine I',
        description: '+5% auto-chop power.',
        branch: 'automation',
        cost: 3,
        bonuses: {
            autoChopPct: 0.05,
        },
    },
    {
        id: 'skill_auto_2',
        name: 'Auto Engine II',
        description: '+10% auto-chop power.',
        branch: 'automation',
        cost: 6,
        requires: ['skill_auto_1'],
        bonuses: {
            autoChopPct: 0.10,
        },
    },
    {
        id: 'skill_auto_3',
        name: 'Auto Engine III',
        description: '+15% auto-chop power.',
        branch: 'automation',
        cost: 10,
        requires: ['skill_auto_2'],
        bonuses: {
            autoChopPct: 0.15,
        },
    },
    {
        id: 'skill_luck_1',
        name: 'Lucky Edge I',
        description: '+1% crit chance.',
        branch: 'luck',
        cost: 3,
        bonuses: {
            critChancePct: 0.01,
        },
    },
    {
        id: 'skill_luck_2',
        name: 'Lucky Edge II',
        description: '+2% crit chance.',
        branch: 'luck',
        cost: 6,
        requires: ['skill_luck_1'],
        bonuses: {
            critChancePct: 0.02,
        },
    },
    {
        id: 'skill_luck_3',
        name: 'Lucky Edge III',
        description: '+3% crit chance.',
        branch: 'luck',
        cost: 10,
        requires: ['skill_luck_2'],
        bonuses: {
            critChancePct: 0.03,
        },
    },
];
