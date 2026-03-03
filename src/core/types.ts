export type WoodTypeId = 
    | 'basic' | 'pine' | 'oak' | 'rare_amber' 
    | 'spooky_wood' | 'glacier_sap' 
    | 'crystal_shard' | 'gemstone' | 'diamond_dust' 
    | 'ember_ash' | 'magma_core' | 'phoenix_feather'
    | 'ice_crystal' | 'glacier_core' | 'permafrost_heart'
    | 'spectral_wood' | 'cursed_essence' | 'nightmare_heart'
    | 'star_dust' | 'celestial_core' | 'divine_essence'
    | 'void_crystal' | 'eldritch_essence' | 'primordial_heart'
    | string;

export type BiomeId = 
    | 'default' 
    | 'crystal_caverns' 
    | 'volcanic_grove' 
    | 'frozen_tundra' 
    | 'haunted_grove' 
    | 'celestial_orchard' 
    | 'abyssal_depths' 
    | string;

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

export type CompanionId = 'beaver_bob' | 'woodpecker_willy' | 'bear_barry' | string;

export interface CompanionDefinition {
  id: CompanionId;
  name: string;
  description: string;
  emoji: string;
  unlockCost: { woodTypeId: WoodTypeId; amount: number }[];
  baseDps: number;
  maxLevel: number;
  levelCostMultiplier: number; // How much wood the next level costs
}

export interface TreeDefinition {
  id: string;
  name: string;
  maxHP: number;
  baseWoodYield: number;
  woodTypeId: WoodTypeId;
  spawnWeight: number;
  emoji: string;
  specialMechanic?: 'chest' | 'timed' | 'multiPhase' | 'frostShield' | 'soulDrain' | 'blessing' | 'chaosChop' | string;
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
  specialAbility?: 'doubleWood' | 'splashDamage' | 'fastTick' | 'chillEffect' | 'soulHarvest' | 'divineStrike' | 'voidTear' | 'cosmicFury' | 'apocalypse' | string;
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

export type SkillBranch = 'chopping' | 'collection' | 'automation' | 'luck';

export interface SkillBonuses {
  damagePct?: number;
  woodValuePct?: number;
  autoChopPct?: number;
  critChancePct?: number;
}

export type SkillId = string;

export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
  branch: SkillBranch;
  cost: number;
  requires?: SkillId[];
  bonuses: SkillBonuses;
}

export interface SkillState {
  unlocked: Record<SkillId, boolean>;
  totalSpent: number;
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
  skills: SkillState;
  daily: DailyState;
  lastSaveTimestamp: number;
}
