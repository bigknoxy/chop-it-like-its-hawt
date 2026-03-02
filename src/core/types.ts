export type WoodTypeId = 'basic' | 'pine' | 'oak' | 'rare_amber' | 'crystal_shard' | 'gemstone' | 'diamond_dust' | string;

export type BiomeId = 'default' | 'crystal_caverns' | string;

export interface BiomeDefinition {
    id: BiomeId;
    name: string;
    description: string;
    unlockCost: {
        wood?: { amount: number };
        growthEssence?: number;
    };
    allowedTrees: string[];
    emoji: string;
}

export interface WoodType {
  id: WoodTypeId;
  name: string;
  valueMultiplier: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TreeDefinition {
  id: string;
  name: string;
  maxHP: number;
  baseWoodYield: number;
  woodTypeId: WoodTypeId;
  spawnWeight: number;
  emoji: string;
  specialMechanic?: 'chest' | 'timed' | 'multiPhase' | string;
  biome?: BiomeId;
  phaseCount?: number;
}

export interface TreeInstance {
  defId: string;
  currentHP: number;
  isActive: boolean;
  spawnTime?: number;
  currentPhase?: number;
}

export type UpgradeEffectType =
  | 'strength'
  | 'axeSize'
  | 'luck'
  | 'autoChop'
  | 'idleGain'
  | 'critDamage';

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  effectType: UpgradeEffectType;
  effectPerLevel: number;
  level: number;
  maxLevel: number;
  baseCost: number;
  costGrowthFactor: number;
  prerequisites: { upgradeId: string; minLevel: number }[];
}

export interface AxeDefinition {
  id: string;
  name: string;
  tier: number;
  damageMultiplier: number;
  critBonus?: number;
  specialAbility?: 'doubleWood' | 'splashDamage' | 'fastTick' | string;
  unlockCost: { woodTypeId: WoodTypeId; amount: number }[];
}

export interface ForestState {
  isUnlocked: boolean;
  baseWoodPerSecond: number;
  multiplierFromUpgrades: number;
  lastTickTimestamp: number;
}

export interface PrestigeState {
  growthEssence: number;
  lifetimeWood: number;
  totalRebirths: number;
  lastRebirthTimestamp: number;
}

export interface BiomeState {
  currentBiomeId: BiomeId;
  unlockedBiomes: BiomeId[];
}

export type AchievementId = string;
export type AchievementMetric = 'treesChopped' | 'woodCollected' | 'rebirths' | 'biomesUnlocked';

export type DailyQuestMetric = 'treesChopped' | 'woodCollected' | 'upgradesPurchased';

export interface AchievementDefinition {
  id: AchievementId;
  name: string;
  description: string;
  metric: AchievementMetric;
  target: number;
  apReward: number;
}

export interface AchievementState {
  progress: Record<AchievementMetric, number>;
  unlocked: Record<AchievementId, boolean>;
  totalAP: number;
}

export interface DailyQuestReward {
  wood: number;
  growthEssence: number;
}

export interface DailyQuestDefinition {
  id: string;
  title: string;
  description: string;
  metric: DailyQuestMetric;
  target: number;
  reward: DailyQuestReward;
}

export interface DailyLoginState {
  dayIndex: number;
  claimedToday: boolean;
  lastClaimDay: string;
}

export interface DailyState {
  lastResetDay: string;
  progress: Record<DailyQuestMetric, number>;
  claimed: Record<string, boolean>;
  login: DailyLoginState;
}

export interface PlayerState {
  totalWood: number;
  woodByType: Record<WoodTypeId, number>;
  upgrades: Record<string, number>; // upgradeId -> level
  ownedAxes: string[];
  equippedAxeId: string;
  forest: ForestState;
  prestige: PrestigeState;
  biome: BiomeState;
  achievements: AchievementState;
  daily: DailyState;
  lastSaveTimestamp: number;
}
