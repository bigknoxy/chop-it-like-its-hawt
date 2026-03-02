import { state } from '../core/State';
import { DAILY_QUESTS, DAILY_LOGIN_REWARDS } from '../data/DailyQuests';
import { DailyQuestMetric, DailyQuestReward } from '../core/types';

export const QuestEvents = {
    onQuestProgress: () => { },
    onQuestCompleted: (questId: string) => { },
    onQuestClaimed: (questId: string) => { },
    onLoginRewardReady: () => { },
    onLoginRewardClaimed: () => { },
    onDailyReset: () => { },
};

const DAILY_CYCLE_DAYS = 7;

export class QuestSystem {
    public syncFromState(): void {
        if (!state.daily) {
            state.daily = this.createInitialDailyState();
            return;
        }

        if (!state.daily.progress) {
            state.daily.progress = this.createProgressMap();
        }
        if (!state.daily.claimed) {
            state.daily.claimed = {};
        }
        if (!state.daily.login) {
            state.daily.login = this.createLoginState();
        }
        if (!state.daily.lastResetDay) {
            state.daily.lastResetDay = this.getDayKey();
        }

        this.ensureQuestsPresent();
    }

    public update(): void {
        if (this.checkReset()) {
            QuestEvents.onDailyReset();
        }
    }

    public addProgress(metric: DailyQuestMetric, amount: number): void {
        if (amount <= 0) return;
        this.checkReset();
        const current = state.daily.progress[metric] || 0;
        state.daily.progress[metric] = current + amount;
        QuestEvents.onQuestProgress();

        for (const quest of DAILY_QUESTS) {
            if (quest.metric !== metric) continue;
            if (this.isQuestComplete(quest.id)) {
                QuestEvents.onQuestCompleted(quest.id);
            }
        }
    }

    public isQuestComplete(questId: string): boolean {
        const quest = DAILY_QUESTS.find((q) => q.id === questId);
        if (!quest) return false;
        return (state.daily.progress[quest.metric] || 0) >= quest.target;
    }

    public isQuestClaimed(questId: string): boolean {
        return Boolean(state.daily.claimed[questId]);
    }

    public claimQuest(questId: string): boolean {
        this.checkReset();
        if (!this.isQuestComplete(questId)) return false;
        if (this.isQuestClaimed(questId)) return false;

        const quest = DAILY_QUESTS.find((q) => q.id === questId);
        if (!quest) return false;

        this.applyReward(quest.reward);
        state.daily.claimed[questId] = true;
        QuestEvents.onQuestClaimed(questId);
        return true;
    }

    public getQuestProgress(questId: string): number {
        const quest = DAILY_QUESTS.find((q) => q.id === questId);
        if (!quest) return 0;
        return state.daily.progress[quest.metric] || 0;
    }

    public getDailyQuests() {
        return DAILY_QUESTS;
    }

    public getLoginRewardDayIndex(): number {
        return state.daily.login.dayIndex;
    }

    public getLoginReward(): DailyQuestReward {
        const idx = state.daily.login.dayIndex % DAILY_CYCLE_DAYS;
        return DAILY_LOGIN_REWARDS[idx];
    }

    public canClaimLoginReward(): boolean {
        this.checkReset();
        return !state.daily.login.claimedToday;
    }

    public claimLoginReward(): boolean {
        this.checkReset();
        if (state.daily.login.claimedToday) return false;
        this.applyReward(this.getLoginReward());
        state.daily.login.claimedToday = true;
        state.daily.login.lastClaimDay = this.getDayKey();
        QuestEvents.onLoginRewardClaimed();
        return true;
    }

    private applyReward(reward: DailyQuestReward): void {
        state.totalWood += reward.wood;
        state.woodByType.basic = (state.woodByType.basic || 0) + reward.wood;
        state.prestige.growthEssence += reward.growthEssence;
    }

    private checkReset(): boolean {
        const today = this.getDayKey();
        if (state.daily.lastResetDay === today) return false;

        state.daily.lastResetDay = today;
        state.daily.progress = this.createProgressMap();
        state.daily.claimed = {};

        if (state.daily.login.lastClaimDay !== today) {
            state.daily.login.claimedToday = false;
            state.daily.login.dayIndex = (state.daily.login.dayIndex + 1) % DAILY_CYCLE_DAYS;
        }

        QuestEvents.onLoginRewardReady();
        return true;
    }

    private ensureQuestsPresent(): void {
        for (const quest of DAILY_QUESTS) {
            if (state.daily.progress[quest.metric] === undefined) {
                state.daily.progress[quest.metric] = 0;
            }
        }
    }

    private createProgressMap(): Record<DailyQuestMetric, number> {
        return {
            treesChopped: 0,
            woodCollected: 0,
            upgradesPurchased: 0,
        };
    }

    private createLoginState() {
        return {
            dayIndex: 0,
            claimedToday: false,
            lastClaimDay: '',
        };
    }

    private createInitialDailyState() {
        return {
            lastResetDay: this.getDayKey(),
            progress: this.createProgressMap(),
            claimed: {},
            login: this.createLoginState(),
        };
    }

    private getDayKey(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

export const questSystem = new QuestSystem();
