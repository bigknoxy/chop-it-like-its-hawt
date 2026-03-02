import { state } from '../core/State';
import { SKILLS } from '../data/Skills';
import { SkillBonuses, SkillBranch, SkillDefinition, SkillId } from '../core/types';

export const SkillEvents = {
    onSkillUnlocked: (id: SkillId) => { },
    onSkillPointsUpdated: () => { },
};

const EMPTY_BONUSES: Required<SkillBonuses> = {
    damagePct: 0,
    woodValuePct: 0,
    autoChopPct: 0,
    critChancePct: 0,
};

export class SkillSystem {
    public getDefinitions(): SkillDefinition[] {
        return SKILLS;
    }

    public getByBranch(branch: SkillBranch): SkillDefinition[] {
        return SKILLS.filter((skill) => skill.branch === branch);
    }

    public isUnlocked(id: SkillId): boolean {
        return Boolean(state.skills?.unlocked?.[id]);
    }

    public canUnlock(id: SkillId): boolean {
        const skill = SKILLS.find((def) => def.id === id);
        if (!skill) return false;
        if (this.isUnlocked(id)) return false;
        if (!this.hasPrerequisites(skill)) return false;
        return this.getAvailableEssence() >= skill.cost;
    }

    public unlock(id: SkillId): boolean {
        const skill = SKILLS.find((def) => def.id === id);
        if (!skill) return false;
        if (!this.canUnlock(id)) return false;

        this.ensureState();
        state.skills.unlocked[id] = true;
        state.skills.totalSpent += skill.cost;

        SkillEvents.onSkillUnlocked(id);
        SkillEvents.onSkillPointsUpdated();
        return true;
    }

    public getAvailableEssence(): number {
        return Math.max(0, state.prestige.growthEssence - (state.skills?.totalSpent || 0));
    }

    public getTotalBonuses(): SkillBonuses {
        this.ensureState();
        const totals: Required<SkillBonuses> = { ...EMPTY_BONUSES };

        for (const skill of SKILLS) {
            if (!state.skills.unlocked[skill.id]) continue;
            totals.damagePct += skill.bonuses.damagePct || 0;
            totals.woodValuePct += skill.bonuses.woodValuePct || 0;
            totals.autoChopPct += skill.bonuses.autoChopPct || 0;
            totals.critChancePct += skill.bonuses.critChancePct || 0;
        }

        return totals;
    }

    public syncFromState(): void {
        this.ensureState();
    }

    private ensureState(): void {
        if (!state.skills) {
            state.skills = { unlocked: {}, totalSpent: 0 };
        }
        if (!state.skills.unlocked) {
            state.skills.unlocked = {};
        }
        state.skills.totalSpent ||= 0;
    }

    private hasPrerequisites(skill: SkillDefinition): boolean {
        if (!skill.requires || skill.requires.length === 0) return true;
        return skill.requires.every((id) => this.isUnlocked(id));
    }
}

export const skillSystem = new SkillSystem();
