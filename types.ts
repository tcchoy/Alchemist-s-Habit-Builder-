
export interface UserStats {
    level: number;
    xp: number;
    maxXp: number;
    gold: number;
    gems: number;
    name: string;
    shopName: string; // New
    startDate: string; // New
    avatarUrl: string;
    title: string;
    habitSlots: number;
    loginStreak: number;
    lastLoginDate: string;
    rewardMultiplier: number; // Global multiplier
    categoryMultipliers: Record<string, number>; // Category specific
    customCategories: string[]; // User defined categories
    purchasedDecorations: {
        shelves: 'none' | 'basic' | 'oak' | 'mahogany';
        cauldron: 'basic' | 'iron' | 'golden' | 'mythic';
        rug: 'none' | 'simple' | 'royal';
    };
}

export type PotionCategory = 'Health' | 'Knowledge' | 'Housework' | 'Productivity' | string; // string allows custom
export type FrequencyType = 'daily' | 'specific_days' | 'repeating' | 'monthly_date';
export type QuestType = 'System' | 'Custom';
export type QuestCategory = PotionCategory; // Unified categories
export type HabitStatus = 'todo' | 'done';
export type QuestStatus = 'active' | 'completed' | 'claimed';

export interface Habit {
    id: string;
    title: string;
    description: string;
    category: PotionCategory;
    frequency: FrequencyType;
    days: number[];
    repeatInterval?: number;
    monthlyDate?: number;
    startDate?: string;
    rewardGold: number;
    rewardXp: number;
    status: HabitStatus;
    streak: number;
    completions: number;
    lastCompletedDate?: string;
    icon?: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    category: QuestCategory;
    rewardGems: number;
    rewardGold: number;
    rewardXp: number;
    status: QuestStatus;
    deadline?: string;
    progress: number;
    maxProgress: number;
    autoCheckKey?: string;
}

export interface HistoryLog {
    id: string;
    date: string;
    message: string;
    type: 'habit' | 'quest' | 'harvest' | 'shop' | 'penalty';
    rewardSummary?: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    title: string;
    content: string;
    tags: string[];
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    costGold: number;
    costGems: number;
    effect: 'slot_upgrade' | 'cosmetic' | 'multiplier_upgrade' | 'unlock_category' | 'category_multiplier' | 'decoration';
    value: number; // Generic value
    meta?: string; // specific target like 'shelves' or 'cauldron'
    minLevel?: number;
}
