
export type Language = 'en' | 'zh-TW';

export interface UserStats {
    level: number;
    xp: number;
    maxXp: number;
    gold: number;
    gems: number;
    name: string;
    shopName: string;
    startDate: string;
    avatarUrl: string;
    title: string;
    habitSlots: number;
    loginStreak: number;
    lastLoginDate: string;
    rewardMultiplier: number;
    categoryMultipliers: Record<string, number>;
    customCategories: CategoryMeta[]; 
    purchasedDecorations: {
        shelves: 'none' | 'basic' | 'oak' | 'mahogany';
        cauldron: 'basic' | 'iron' | 'golden' | 'mythic';
        rug: 'none' | 'simple' | 'royal';
    };
    language: Language;
    harvestMapLevel: number; // 1-5
}

export interface CategoryMeta {
    name: string;
    type: 'potion' | 'book' | 'pen';
    color: string;
}

export type PotionCategory = 'General' | 'Learning' | 'Fitness' | 'Diet' | 'Mental Health' | 'Housework' | string;

// Expanded Frequency Options
export type FrequencyType = 'daily' | 'interval' | 'weekly' | 'monthly_date' | 'monthly_weekday';

export type QuestType = 'System' | 'Custom';
export type QuestCategory = PotionCategory;
export type HabitStatus = 'todo' | 'done';
export type QuestStatus = 'active' | 'completed' | 'claimed';

export interface Habit {
    id: string;
    title: string;
    description: string;
    category: PotionCategory;
    
    // Scheduling Logic
    frequency: FrequencyType;
    startDate: string; // ISO Date string
    interval: number; // "Every X..." (days/weeks/months)
    
    // Specific Configs
    weekDays?: number[]; // 0-6 (Sun-Sat) for 'weekly'
    monthDay?: number; // 1-31 for 'monthly_date'
    monthWeek?: number; // 1-4 or 5(last) for 'monthly_weekday'
    monthWeekDay?: number; // 0-6 for 'monthly_weekday'

    rewardGold: number;
    rewardXp: number;
    status: HabitStatus;
    streak: number;
    completions: number;
    lastCompletedDate?: string;
    icon?: string;
    
    // Legacy support (optional)
    days: number[]; 
    repeatInterval?: number; 
    monthlyDate?: number; 
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
    recurring?: boolean;
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
    effect: 'slot_upgrade' | 'cosmetic' | 'multiplier_upgrade' | 'unlock_category' | 'category_multiplier' | 'decoration' | 'map_upgrade';
    value: number;
    meta?: string;
    minLevel?: number;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    levels: { threshold: number; name: string }[];
    currentValue: number;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}
