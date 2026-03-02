import { DailyQuestDefinition, DailyQuestReward } from '../core/types';

export const DAILY_QUESTS: DailyQuestDefinition[] = [
    {
        id: 'daily_chop_25',
        title: 'Fresh Cuts',
        description: 'Chop 25 trees today.',
        metric: 'treesChopped',
        target: 25,
        reward: { wood: 120, growthEssence: 0 },
    },
    {
        id: 'daily_wood_500',
        title: 'Stock the Shed',
        description: 'Collect 500 total wood value today.',
        metric: 'woodCollected',
        target: 500,
        reward: { wood: 180, growthEssence: 1 },
    },
    {
        id: 'daily_upgrades_2',
        title: 'Tool Time',
        description: 'Purchase 2 upgrades today.',
        metric: 'upgradesPurchased',
        target: 2,
        reward: { wood: 150, growthEssence: 1 },
    },
];

export const DAILY_LOGIN_REWARDS: DailyQuestReward[] = [
    { wood: 60, growthEssence: 0 },
    { wood: 90, growthEssence: 0 },
    { wood: 120, growthEssence: 1 },
    { wood: 150, growthEssence: 0 },
    { wood: 180, growthEssence: 1 },
    { wood: 220, growthEssence: 1 },
    { wood: 300, growthEssence: 2 },
];
