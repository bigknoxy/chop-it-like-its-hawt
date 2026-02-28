import { CompanionDefinition } from '../core/types';

export const COMPANIONS: Record<string, CompanionDefinition> = {
    beaver_bob: {
        id: 'beaver_bob',
        name: 'Bob the Beaver',
        description: 'A trusty beaver that loves to gnaw. Adds steady auto-DPS.',
        emoji: '🦫',
        unlockCost: [{ woodTypeId: 'basic', amount: 500 }],
        baseDps: 5,
        maxLevel: 25,
        levelCostMultiplier: 1.5,
    },
    woodpecker_willy: {
        id: 'woodpecker_willy',
        name: 'Willy the Woodpecker',
        description: 'Pecks furiously at the bark. Fast attacks, high auto-DPS.',
        emoji: '🐦',
        unlockCost: [
            { woodTypeId: 'pine', amount: 2000 },
            { woodTypeId: 'oak', amount: 500 }
        ],
        baseDps: 25,
        maxLevel: 20,
        levelCostMultiplier: 1.8,
    },
    bear_barry: {
        id: 'bear_barry',
        name: 'Barry the Bear',
        description: 'Swipes the tree with massive claws. Huge auto-DPS.',
        emoji: '🐻',
        unlockCost: [
            { woodTypeId: 'oak', amount: 5000 },
            { woodTypeId: 'spooky_wood', amount: 1500 }
        ],
        baseDps: 150,
        maxLevel: 10,
        levelCostMultiplier: 2.2,
    },
};
