export type WoodTypeId = 'basic' | 'pine' | 'oak' | 'rare_amber' | string;

export interface WoodType {
  id: WoodTypeId;
  name: string;
  valueMultiplier: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type BiomeId = 'home_forest' | 'frozen_tundra' | 'haunted_weald' | 'crystal_caverns' | string;

export interface BiomeDefinition {
  id: BiomeId;
  name: string;
  description: string;
  emoji: string;
  unlockCost: { woodTypeId: WoodTypeId; amount: number }[];
  // Which trees can spawn in this biome
  spawnableTrees: string[]; // tree IDs
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
  specialMechanic?: 'chest' | 'timed' | 'multiPhase' | string;
}

export interface TreeInstance {
  defId: string;
  currentHP: number;
  isActive: boolean;
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

export interface PlayerState {
  totalWood: number;
  woodByType: Record<WoodTypeId, number>;
  upgrades: Record<string, number>; // upgradeId -> level
  ownedAxes: string[];
  equippedAxeId: string;
  forest: ForestState;

  // V2 Additions
  activeBiomeId: BiomeId;
  unlockedBiomes: BiomeId[];
  equippedCompanionId: string | null;
  companions: Record<string, number>; // companionId -> level (0 means unlocked, undefined means locked)

  lastSaveTimestamp: number;
}
