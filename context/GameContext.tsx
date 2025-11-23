
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStats, Habit, Quest, JournalEntry, ShopItem, HistoryLog, FrequencyType, PotionCategory } from '../types';

interface GameContextType {
    stats: UserStats;
    setStats: React.Dispatch<React.SetStateAction<UserStats>>;
    habits: Habit[];
    quests: Quest[];
    journalEntries: JournalEntry[];
    historyLogs: HistoryLog[];
    habitIdeas: string;
    setHabitIdeas: (text: string) => void;
    addGold: (amount: number) => void;
    addGems: (amount: number) => void;
    addXp: (amount: number) => void;
    addHabit: (habit: Habit) => void;
    updateHabit: (habit: Habit) => void;
    deleteHabit: (id: string) => void;
    addQuest: (quest: Quest) => void;
    deleteQuest: (id: string) => void;
    toggleHabit: (id: string) => void;
    completeQuest: (id: string) => void;
    claimQuestReward: (id: string) => void;
    buyShopItem: (item: ShopItem, customParam?: string) => boolean;
    addJournalEntry: (entry: JournalEntry) => void;
    resetDaily: () => void;
    claimHarvestReward: () => { gold: number, xp: number };
    isHabitDueToday: (habit: Habit) => boolean;
    getNextDueDate: (habit: Habit) => string;
    exportSaveData: () => string;
    exportHistoryToCSV: () => string;
    importSaveData: (json: string) => boolean;
    LEVEL_TITLES: {level: number, title: string}[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const LEVEL_TITLES = [
    { level: 1, title: "Apprentice Brewer" },
    { level: 3, title: "Village Alchemist" },
    { level: 5, title: "Potion Master" },
    { level: 10, title: "Royal Alchemist" },
    { level: 15, title: "Grand Magister" },
    { level: 20, title: "Arcane Legend" },
    { level: 30, title: "Demigod of Brews" },
];

const INITIAL_STATS: UserStats = {
    level: 1,
    xp: 0,
    maxXp: 500,
    gold: 100,
    gems: 5,
    name: "Novice Alchemist",
    shopName: "The Rusty Cauldron",
    startDate: new Date().toISOString().split('T')[0],
    title: "Apprentice Brewer",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGKEfRIsnxljeWeqdQC3OoOKKBiZQ30GglKUt6bqH4iiKRqOnmzR2OAAkrmkw-r6nQ91d9WTy8j8iLAeR5wCsjMvkOiFos1AzR7npRzc_bjUVSUmM-BmlAS_oqlzrMr9s79WFza09QMoTge4WigM8G1eNSM3A1XmTLjhYAIFb2qa2J-AVWCYLAQaJrGUPEwo3JRUQwyWNYWuwihv7b2VXpuJLHGIxgPYeVegW5Gjb-HsawEfZ588SShTP0SA1VpRyq1ipGQMChGIU",
    habitSlots: 5,
    loginStreak: 1,
    lastLoginDate: new Date().toISOString().split('T')[0],
    rewardMultiplier: 1,
    categoryMultipliers: {},
    customCategories: [],
    purchasedDecorations: {
        shelves: 'none',
        cauldron: 'basic',
        rug: 'none'
    }
};

const SEED_HABITS: Habit[] = [];

// 10 System Quests (One-off and Recurring)
const SEED_QUESTS: Quest[] = [
    // Daily
    {
        id: 'sq_daily_commission',
        title: 'Daily Commission',
        description: 'Brew at least 3 potions (Complete 3 Habits) today.',
        type: 'System',
        category: 'Work',
        rewardGems: 1,
        rewardGold: 30,
        rewardXp: 50,
        status: 'active',
        progress: 0,
        maxProgress: 3,
        autoCheckKey: 'daily_habits'
    },
    // Streaks
    {
        id: 'sq_streak_3',
        title: 'Consistent Brewer',
        description: 'Log in for 3 consecutive days.',
        type: 'System',
        category: 'General',
        rewardGems: 5,
        rewardGold: 50,
        rewardXp: 100,
        status: 'active',
        progress: 1,
        maxProgress: 3,
        autoCheckKey: 'login_streak'
    },
    {
        id: 'sq_streak_7',
        title: 'Dedicated Alchemist',
        description: 'Log in for 7 consecutive days.',
        type: 'System',
        category: 'General',
        rewardGems: 10,
        rewardGold: 150,
        rewardXp: 300,
        status: 'active',
        progress: 1,
        maxProgress: 7,
        autoCheckKey: 'login_streak'
    },
    // One-offs
    {
        id: 'sq_first_habit',
        title: 'First Recipe',
        description: 'Create your first habit in the Brewing Station.',
        type: 'System',
        category: 'General',
        rewardGems: 2,
        rewardGold: 20,
        rewardXp: 50,
        status: 'active',
        progress: 0,
        maxProgress: 1,
        autoCheckKey: 'create_habit'
    },
    {
        id: 'sq_first_brew',
        title: 'First Brew',
        description: 'Complete a habit for the first time.',
        type: 'System',
        category: 'General',
        rewardGems: 2,
        rewardGold: 20,
        rewardXp: 50,
        status: 'active',
        progress: 0,
        maxProgress: 1,
        autoCheckKey: 'complete_habit'
    },
    {
        id: 'sq_gold_hoarder',
        title: 'Gold Hoarder',
        description: 'Amass 500 Gold in your treasury.',
        type: 'System',
        category: 'Work',
        rewardGems: 5,
        rewardGold: 0,
        rewardXp: 100,
        status: 'active',
        progress: 0,
        maxProgress: 500,
        autoCheckKey: 'total_gold'
    },
    {
        id: 'sq_grimoire_scribe',
        title: 'Grimoire Scribe',
        description: 'Write your first entry in the Grimoire.',
        type: 'System',
        category: 'Knowledge',
        rewardGems: 2,
        rewardGold: 30,
        rewardXp: 50,
        status: 'active',
        progress: 0,
        maxProgress: 1,
        autoCheckKey: 'journal_entry'
    },
    {
        id: 'sq_shop_patron',
        title: 'Shop Patron',
        description: 'Purchase an upgrade or decoration from the Marketplace.',
        type: 'System',
        category: 'General',
        rewardGems: 0,
        rewardGold: 0,
        rewardXp: 100,
        status: 'active',
        progress: 0,
        maxProgress: 1,
        autoCheckKey: 'shop_purchase'
    },
    {
        id: 'sq_mastery_initiate',
        title: 'Mastery Initiate',
        description: 'Complete any single habit 10 times.',
        type: 'System',
        category: 'Productivity',
        rewardGems: 5,
        rewardGold: 50,
        rewardXp: 150,
        status: 'active',
        progress: 0,
        maxProgress: 10,
        autoCheckKey: 'habit_mastery'
    },
    {
        id: 'sq_level_5',
        title: 'Rising Star',
        description: 'Reach Level 5.',
        type: 'System',
        category: 'General',
        rewardGems: 20,
        rewardGold: 200,
        rewardXp: 0,
        status: 'active',
        progress: 1,
        maxProgress: 5,
        autoCheckKey: 'level_up'
    }
];

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
    const [habits, setHabits] = useState<Habit[]>(SEED_HABITS);
    const [quests, setQuests] = useState<Quest[]>(SEED_QUESTS);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
    const [habitIdeas, setHabitIdeas] = useState<string>('');
    const [loaded, setLoaded] = useState(false);

    const logHistory = (message: string, type: HistoryLog['type'], rewardSummary?: string) => {
        const newLog: HistoryLog = {
            id: Date.now().toString() + Math.random(),
            date: new Date().toISOString().split('T')[0],
            message,
            type,
            rewardSummary
        };
        setHistoryLogs(prev => [newLog, ...prev]);
    };

    // Persistence
    useEffect(() => {
        const loadData = () => {
            const savedStats = localStorage.getItem('pps_stats');
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                setStats({ 
                    ...INITIAL_STATS, 
                    ...parsed,
                    categoryMultipliers: parsed.categoryMultipliers || {},
                    customCategories: parsed.customCategories || [],
                    purchasedDecorations: parsed.purchasedDecorations || INITIAL_STATS.purchasedDecorations,
                    shopName: parsed.shopName || INITIAL_STATS.shopName,
                    startDate: parsed.startDate || INITIAL_STATS.startDate
                });
            }
            
            const savedHabits = localStorage.getItem('pps_habits');
            if (savedHabits) setHabits(JSON.parse(savedHabits));
            
            const savedQuests = localStorage.getItem('pps_quests');
            if (savedQuests) setQuests(JSON.parse(savedQuests));
            else setQuests(SEED_QUESTS);
            
            const savedJournal = localStorage.getItem('pps_journal');
            if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
            
            const savedLogs = localStorage.getItem('pps_logs');
            if (savedLogs) setHistoryLogs(JSON.parse(savedLogs));
            
            const savedIdeas = localStorage.getItem('pps_ideas');
            if (savedIdeas) setHabitIdeas(savedIdeas);

            setLoaded(true);
        };
        loadData();
    }, []);

    // Check Login Streak on Load
    useEffect(() => {
        if (!loaded) return;
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastLoginDate !== today) {
            const last = new Date(stats.lastLoginDate);
            const current = new Date(today);
            const diffTime = Math.abs(current.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = stats.loginStreak;
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
                // Penalty for missing days
                const penalty = Math.min(stats.gold, 50);
                if (penalty > 0) {
                    setStats(prev => ({ ...prev, gold: prev.gold - penalty }));
                    logHistory(`Missed ${diffDays - 1} days`, 'penalty', `-${penalty}g`);
                }
            }
            
            setStats(prev => ({ ...prev, loginStreak: newStreak, lastLoginDate: today }));
            checkSystemQuests('login_streak', newStreak);
        }
    }, [loaded, stats.lastLoginDate]);

    // Auto-Save
    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem('pps_stats', JSON.stringify(stats));
        localStorage.setItem('pps_habits', JSON.stringify(habits));
        localStorage.setItem('pps_quests', JSON.stringify(quests));
        localStorage.setItem('pps_journal', JSON.stringify(journalEntries));
        localStorage.setItem('pps_logs', JSON.stringify(historyLogs));
        localStorage.setItem('pps_ideas', habitIdeas);
    }, [stats, habits, quests, journalEntries, historyLogs, habitIdeas, loaded]);

    const checkSystemQuests = (triggerType: string, value?: number) => {
        setQuests(prev => prev.map(q => {
            if (q.status !== 'active' || q.type !== 'System' || q.autoCheckKey !== triggerType) return q;
            
            let newProgress = q.progress;
            
            if (triggerType === 'daily_habits') {
                newProgress = q.progress + 1;
            } else if (triggerType === 'login_streak' && value) {
                newProgress = value;
            } else if (triggerType === 'total_gold' && value) {
                newProgress = value;
            } else if (triggerType === 'create_habit' || triggerType === 'complete_habit' || triggerType === 'journal_entry' || triggerType === 'shop_purchase') {
                newProgress = 1;
            } else if (triggerType === 'habit_mastery' && value) {
                newProgress = Math.max(q.progress, value);
            } else if (triggerType === 'level_up' && value) {
                newProgress = value;
            }

            if (newProgress >= q.maxProgress) return { ...q, progress: q.maxProgress, status: 'completed' };
            return { ...q, progress: newProgress };
        }));
    };

    const addGold = (amount: number) => {
        setStats(prev => {
            const newGold = Math.max(0, prev.gold + amount);
            checkSystemQuests('total_gold', newGold);
            return { ...prev, gold: newGold };
        });
    };

    const addGems = (amount: number) => setStats(prev => ({ ...prev, gems: Math.max(0, prev.gems + amount) }));
    
    const addXp = (amount: number) => {
        setStats(prev => {
            let newXp = Math.max(0, prev.xp + amount);
            let newLevel = prev.level;
            let newMaxXp = prev.maxXp;
            while (newXp >= newMaxXp) {
                newXp -= newMaxXp;
                newLevel += 1;
                newMaxXp = Math.floor(newMaxXp * 1.5);
            }
            if (newLevel > prev.level) checkSystemQuests('level_up', newLevel);
            return { ...prev, xp: newXp, level: newLevel, maxXp: newMaxXp };
        });
    };

    const addHabit = (habit: Habit) => {
        setHabits(prev => [...prev, habit]);
        checkSystemQuests('create_habit');
    };

    const updateHabit = (updatedHabit: Habit) => setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
    const deleteHabit = (id: string) => setHabits(prev => prev.filter(h => h.id !== id));
    const addQuest = (quest: Quest) => setQuests(prev => [...prev, quest]);
    const deleteQuest = (id: string) => setQuests(prev => prev.filter(q => q.id !== id));

    const toggleHabit = (id: string) => {
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                const isDone = h.status === 'done';
                if (!isDone) {
                    // Calculate Multiplier
                    let mult = stats.rewardMultiplier;
                    if (stats.categoryMultipliers[h.category]) {
                        mult *= stats.categoryMultipliers[h.category];
                    }

                    const gold = Math.floor(h.rewardGold * mult);
                    const xp = Math.floor(h.rewardXp * mult);
                    
                    addGold(gold);
                    addXp(xp);
                    logHistory(`${h.title}|${h.category}|${h.icon}`, 'habit', `+${gold}g, +${xp}XP`);
                    checkSystemQuests('daily_habits');
                    checkSystemQuests('complete_habit');
                    
                    const newCompletions = (h.completions || 0) + 1;
                    checkSystemQuests('habit_mastery', newCompletions);
                    
                    if (newCompletions % 20 === 0) {
                         addGems(10);
                         logHistory(`Mastery: ${h.title} (x${newCompletions})`, 'quest', `+10gems`);
                    }

                    return { 
                        ...h, 
                        status: 'done', 
                        streak: h.streak + 1, 
                        completions: newCompletions,
                        lastCompletedDate: new Date().toISOString().split('T')[0] 
                    };
                } else {
                     // Undo
                    return { ...h, status: 'todo', streak: Math.max(0, h.streak - 1), completions: Math.max(0, (h.completions || 1) - 1) };
                }
            }
            return h;
        }));
    };

    const completeQuest = (id: string) => {
        setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed', progress: q.maxProgress } : q));
    };

    const claimQuestReward = (id: string) => {
        setQuests(prev => prev.map(q => {
            if (q.id === id && q.status === 'completed') {
                addGems(q.rewardGems);
                addGold(q.rewardGold);
                addXp(q.rewardXp);
                // Fix: Explicitly adding +XP to string so logs catch it
                logHistory(`${q.title}`, 'quest', `+${q.rewardGold}g, +${q.rewardGems}gems, +${q.rewardXp}XP`);
                return { ...q, status: 'claimed' };
            }
            return q;
        }));
    };

    const buyShopItem = (item: ShopItem, customParam?: string): boolean => {
        if (item.minLevel && stats.level < item.minLevel) return false;
        if (stats.gold < item.costGold || stats.gems < item.costGems) return false;

        setStats(prev => {
            const newState = {
                ...prev,
                gold: prev.gold - item.costGold,
                gems: prev.gems - item.costGems
            };

            if (item.effect === 'slot_upgrade') {
                newState.habitSlots += item.value;
            } else if (item.effect === 'multiplier_upgrade') {
                newState.rewardMultiplier *= item.value;
            } else if (item.effect === 'unlock_category' && customParam) {
                if (!newState.customCategories.includes(customParam)) {
                    newState.customCategories = [...newState.customCategories, customParam];
                }
            } else if (item.effect === 'category_multiplier' && customParam) {
                const currentMult = newState.categoryMultipliers[customParam] || 1;
                newState.categoryMultipliers = {
                    ...newState.categoryMultipliers,
                    [customParam]: currentMult * item.value
                };
            } else if (item.effect === 'decoration' && item.meta) {
                newState.purchasedDecorations = {
                    ...newState.purchasedDecorations,
                    [item.meta]: item.value === 1 ? 'oak' : item.value === 2 ? 'golden' : 'basic'
                };
                if (item.id === 'dec_shelf_oak') newState.purchasedDecorations.shelves = 'oak';
                if (item.id === 'dec_cauldron_gold') newState.purchasedDecorations.cauldron = 'golden';
            }

            return newState;
        });

        logHistory(`Purchased: ${item.name}`, 'shop', `-${item.costGold}g, -${item.costGems}gems`);
        checkSystemQuests('shop_purchase');
        return true;
    };

    const claimHarvestReward = () => {
        const baseGold = Math.floor(Math.random() * 40) + 10;
        const baseXp = Math.floor(Math.random() * 40) + 10;
        const gold = Math.floor(baseGold * stats.rewardMultiplier);
        const xp = Math.floor(baseXp * stats.rewardMultiplier);
        addGold(gold);
        addXp(xp);
        logHistory('Wild Harvest Complete', 'harvest', `+${gold}g, +${xp}XP`);
        return { gold, xp };
    };

    const resetDaily = () => {
        setHabits(prev => prev.map(h => ({ ...h, status: 'todo' })));
        setQuests(prev => prev.map(q => {
            if (q.type === 'System' && q.autoCheckKey) {
                if (q.autoCheckKey === 'daily_habits') return { ...q, status: 'active', progress: 0 };
            }
            return q;
        }));
    };

    const addJournalEntry = (entry: JournalEntry) => {
        setJournalEntries(prev => [entry, ...prev]);
        checkSystemQuests('journal_entry');
    };

    const isHabitDueToday = (habit: Habit): boolean => {
        const today = new Date();
        const dayOfWeek = today.getDay(); 
        const dateOfMonth = today.getDate(); 
        
        if ((habit.frequency as string) === 'monthly_1st') return dateOfMonth === 1;
        if ((habit.frequency as string) === 'quarterly_1st') return dateOfMonth === 1 && (today.getMonth() % 3 === 0);
        if (habit.frequency === 'daily') return true;
        if (habit.frequency === 'specific_days') return habit.days.includes(dayOfWeek);
        if (habit.frequency === 'monthly_date') return dateOfMonth === (habit.monthlyDate || 1);
        if (habit.frequency === 'repeating' && habit.startDate && habit.repeatInterval) {
            const start = new Date(habit.startDate);
            start.setHours(0,0,0,0);
            const now = new Date();
            now.setHours(0,0,0,0);
            const diffTime = now.getTime() - start.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && (diffDays % habit.repeatInterval === 0);
        }
        return true;
    };

    const getNextDueDate = (habit: Habit): string => {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        for(let i = 0; i <= 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            
            // Mock logic for habit due checking relative to checkDate instead of today
            // Since isHabitDueToday relies on "today", we need to refactor isHabitDueToday to accept a date
            // For now, returning simple placeholder for daily/specific
            if (i === 0 && isHabitDueToday(habit)) return "Today";
            if (i === 1) return "Tomorrow";
        }
        return "Upcoming";
    };

    const exportSaveData = () => JSON.stringify({ stats, habits, quests, journalEntries, historyLogs, habitIdeas, version: 1.2 }, null, 2);

    const exportHistoryToCSV = () => {
        const headers = ['Date', 'Activity', 'Type', 'Rewards'];
        const rows = historyLogs.map(l => {
            const msg = `"${l.message.replace(/"/g, '""')}"`;
            const rewards = `"${(l.rewardSummary || '').replace(/"/g, '""')}"`;
            return [l.date, msg, l.type, rewards].join(',');
        });
        return [headers.join(','), ...rows].join('\n');
    };

    const importSaveData = (json: string): boolean => {
        try {
            const data = JSON.parse(json);
            if (!data.stats || !data.habits) return false;
            setStats(data.stats);
            setHabits(data.habits);
            setQuests(data.quests || []);
            setJournalEntries(data.journalEntries || []);
            setHistoryLogs(data.historyLogs || []);
            setHabitIdeas(data.habitIdeas || '');
            return true;
        } catch (e) {
            return false;
        }
    };

    return (
        <GameContext.Provider value={{
            stats, setStats, habits, quests, journalEntries, historyLogs, habitIdeas, setHabitIdeas,
            addGold, addGems, addXp, addHabit, updateHabit, deleteHabit, addQuest, deleteQuest,
            toggleHabit, completeQuest, claimQuestReward, buyShopItem, addJournalEntry, resetDaily,
            claimHarvestReward, isHabitDueToday, getNextDueDate, exportSaveData, exportHistoryToCSV, importSaveData,
            LEVEL_TITLES
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within a GameProvider");
    return context;
};
