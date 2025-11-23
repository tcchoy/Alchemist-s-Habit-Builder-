
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStats, Habit, Quest, JournalEntry, ShopItem, HistoryLog, FrequencyType, PotionCategory, Language, CategoryMeta } from '../types';

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
    buyShopItem: (item: ShopItem, customParam?: string, metaParam?: any) => boolean;
    addJournalEntry: (entry: JournalEntry) => void;
    resetDaily: () => void;
    resetGame: () => void;
    claimHarvestReward: () => { gold: number, xp: number, gems: number };
    isHabitDueToday: (habit: Habit) => boolean;
    getNextDueDate: (habit: Habit) => string;
    exportSaveData: () => string;
    exportHistoryToCSV: () => string;
    importSaveData: (json: string) => boolean;
    saveToCloud: (url: string, token: string) => Promise<boolean>;
    loadFromCloud: (url: string, token: string) => Promise<boolean>;
    t: (key: string) => string;
    setLanguage: (lang: Language) => void;
    LEVEL_TITLES: {level: number, title: string}[];
    MAPS: { level: number, name: string, image: string, rewardRange: string }[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const LEVEL_TITLES = [
    { level: 1, title: "Apprentice Brewer" },
    { level: 2, title: "Novice Mixer" },
    { level: 3, title: "Village Alchemist" },
    { level: 4, title: "Herbalist" },
    { level: 5, title: "Potion Master" },
    { level: 6, title: "Glassblower" },
    { level: 7, title: "Essence Distiller" },
    { level: 8, title: "Cauldron Keeper" },
    { level: 9, title: "Elixir Smith" },
    { level: 10, title: "Royal Alchemist" },
    { level: 11, title: "Mystic Brewer" },
    { level: 12, title: "Arcane Researcher" },
    { level: 13, title: "Void Weaver" },
    { level: 14, title: "Time Binder" },
    { level: 15, title: "Grand Magister" },
    { level: 16, title: "Elementalist" },
    { level: 17, title: "Soul Infuser" },
    { level: 18, title: "Reality Shaper" },
    { level: 19, title: "Cosmic Alchemist" },
    { level: 20, title: "Arcane Legend" },
];

export const MAPS = [
    { level: 1, name: "Verdant Lowlands", image: "https://images.unsplash.com/photo-1625590188988-3327b6f60a1f?q=80&w=1470&auto=format&fit=crop", rewardRange: "10-50g" }, 
    { level: 2, name: "Whisperwood", image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=1374&auto=format&fit=crop", rewardRange: "20-100g" }, 
    { level: 3, name: "Azure Caverns", image: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1344&auto=format&fit=crop", rewardRange: "50-150g" }, 
    { level: 4, name: "Cinder Crag", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1511&auto=format&fit=crop", rewardRange: "100-250g" }, 
    { level: 5, name: "Starfall Summit", image: "https://images.unsplash.com/photo-1536604673633-37914cf2ed04?q=80&w=1374&auto=format&fit=crop", rewardRange: "200-500g" }, 
];

const DICTIONARY: Record<Language, Record<string, string>> = {
    'en': {
        'dashboard': 'Dashboard',
        'brewing': 'Brewing Station',
        'quests': 'Quest Board',
        'harvest': 'Wild Harvest',
        'market': 'Marketplace',
        'grimoire': 'Grimoire',
        'review': 'Review',
        'certificates': 'Certificates',
        'settings': 'Settings',
        'today_brews': "Today's Brews",
        'active_requests': "Active Requests",
    },
    'zh-TW': {
        'dashboard': '儀表板',
        'brewing': '煉藥台',
        'quests': '委託板',
        'harvest': '野外採集',
        'market': '商店',
        'grimoire': '魔導書',
        'review': '回顧',
        'certificates': '證書',
        'settings': '設定',
        'today_brews': "今日煉製",
        'active_requests': "進行中委託",
    }
};

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
    },
    language: 'en',
    harvestMapLevel: 1
};

const SEED_QUESTS: Quest[] = [
    { id: 'sq_first_recipe', title: 'First Recipe', description: 'Create your first habit in the Brewing Station', type: 'System', category: 'General', rewardGems: 2, rewardGold: 20, rewardXp: 50, status: 'active', progress: 0, maxProgress: 1, autoCheckKey: 'create_habit', recurring: false },
    { id: 'sq_daily_commission', title: 'Daily Commission', description: 'Complete 3 habits today', type: 'System', category: 'General', rewardGems: 1, rewardGold: 30, rewardXp: 50, status: 'active', progress: 0, maxProgress: 3, autoCheckKey: 'daily_habits', recurring: true },
    { id: 'sq_streak_7', title: 'Streak Alchemist', description: 'Maintain daily commission streak for 7 days', type: 'System', category: 'General', rewardGems: 10, rewardGold: 100, rewardXp: 200, status: 'active', progress: 0, maxProgress: 7, autoCheckKey: 'streak_commission', recurring: true },
    { id: 'sq_triple_essence', title: 'Triple Essence Day', description: 'Complete habits from 3 different categories in one day', type: 'System', category: 'General', rewardGems: 5, rewardGold: 50, rewardXp: 100, status: 'active', progress: 0, maxProgress: 3, autoCheckKey: 'unique_categories_today', recurring: true },
    { id: 'sq_creation_spark', title: 'Creation Spark', description: 'Create a new habit', type: 'System', category: 'General', rewardGems: 1, rewardGold: 10, rewardXp: 20, status: 'active', progress: 0, maxProgress: 1, autoCheckKey: 'create_habit', recurring: true },
    { id: 'sq_arcane_surge', title: 'Arcane Brew Surge', description: 'Complete 8 habits in one day', type: 'System', category: 'General', rewardGems: 5, rewardGold: 100, rewardXp: 150, status: 'active', progress: 0, maxProgress: 8, autoCheckKey: 'daily_habits_total', recurring: true },
    { id: 'sq_expert_harvester', title: 'Expert Harvester', description: 'Complete 10 harvests', type: 'System', category: 'General', rewardGems: 5, rewardGold: 50, rewardXp: 100, status: 'active', progress: 0, maxProgress: 10, autoCheckKey: 'harvest_complete', recurring: true },
    { id: 'sq_grimoire_scribe', title: 'Grimoire Scribe', description: 'Write your first entry in the Grimoire', type: 'System', category: 'General', rewardGems: 1, rewardGold: 20, rewardXp: 30, status: 'active', progress: 0, maxProgress: 1, autoCheckKey: 'journal_entry', recurring: false },
    { id: 'sq_gold_hoarder', title: 'Gold Hoarder', description: 'Amass 5000 Gold in your treasury', type: 'System', category: 'General', rewardGems: 10, rewardGold: 0, rewardXp: 200, status: 'active', progress: 0, maxProgress: 5000, autoCheckKey: 'total_gold', recurring: false },
    { id: 'sq_habit_explorer', title: 'Habit Explorer', description: 'Complete 10 different habits', type: 'System', category: 'General', rewardGems: 3, rewardGold: 50, rewardXp: 100, status: 'active', progress: 0, maxProgress: 10, autoCheckKey: 'unique_habits_done', recurring: false },
];

const INITIAL_HABITS: Habit[] = [
    { id: 'init_1', title: 'Morning Stretch', description: 'Loosen muscles and wake up your body. Stretch for 1 minute.', category: 'Fitness', frequency: 'daily', interval: 1, startDate: new Date().toISOString().split('T')[0], rewardGold: 10, rewardXp: 10, status: 'todo', streak: 0, completions: 0, days: [] },
    { id: 'init_2', title: 'Hydration Boost', description: 'Increase daily water intake. Drink one glass of water.', category: 'Diet', frequency: 'daily', interval: 1, startDate: new Date().toISOString().split('T')[0], rewardGold: 10, rewardXp: 10, status: 'todo', streak: 0, completions: 0, days: [] },
    { id: 'init_3', title: 'Read a Page', description: 'Build knowledge consistently. Read one page of any book.', category: 'Learning', frequency: 'daily', interval: 1, startDate: new Date().toISOString().split('T')[0], rewardGold: 10, rewardXp: 10, status: 'todo', streak: 0, completions: 0, days: [] },
];

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
    const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
    const [quests, setQuests] = useState<Quest[]>(SEED_QUESTS);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
    const [habitIdeas, setHabitIdeas] = useState<string>('');
    const [loaded, setLoaded] = useState(false);

    const t = (key: string) => DICTIONARY[stats.language]?.[key] || key;
    const setLanguage = (lang: Language) => setStats(prev => ({ ...prev, language: lang }));

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
                    customCategories: parsed.customCategories || [],
                    language: parsed.language || 'en',
                    harvestMapLevel: parsed.harvestMapLevel || 1
                });
            }
            const savedHabits = localStorage.getItem('pps_habits');
            if (savedHabits) setHabits(JSON.parse(savedHabits));
            const savedQuests = localStorage.getItem('pps_quests');
            if (savedQuests) setQuests(JSON.parse(savedQuests));
            // Only reset quests if no save found, otherwise use save
            // But here we want to ensure the system quests are updated if we change code.
            // A simple merge strategy for System Quests:
            const savedQuestsList = savedQuests ? JSON.parse(savedQuests) as Quest[] : SEED_QUESTS;
            // Add any new SEED quests that aren't in saved list
            SEED_QUESTS.forEach(sq => {
                if (!savedQuestsList.some(q => q.id === sq.id)) {
                    savedQuestsList.push(sq);
                }
            });
            setQuests(savedQuestsList);

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

    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem('pps_stats', JSON.stringify(stats));
        localStorage.setItem('pps_habits', JSON.stringify(habits));
        localStorage.setItem('pps_quests', JSON.stringify(quests));
        localStorage.setItem('pps_journal', JSON.stringify(journalEntries));
        localStorage.setItem('pps_logs', JSON.stringify(historyLogs));
        localStorage.setItem('pps_ideas', habitIdeas);
    }, [stats, habits, quests, journalEntries, historyLogs, habitIdeas, loaded]);

    // Check System Quests
    const checkSystemQuests = (triggerType: string, value?: number) => {
        setQuests(prev => prev.map(q => {
            if (q.status !== 'active' || q.type !== 'System' || !q.autoCheckKey) return q;

            // Handle Daily Logic
            if (q.autoCheckKey === 'daily_habits' && triggerType === 'daily_habits') {
                const completedToday = habits.filter(h => h.status === 'done').length;
                return { ...q, progress: completedToday };
            }
            if (q.autoCheckKey === 'daily_habits_total' && triggerType === 'daily_habits') {
                 const completedToday = habits.filter(h => h.status === 'done').length;
                 if (completedToday >= 8) return { ...q, status: 'completed', progress: 8 };
                 return { ...q, progress: completedToday };
            }
            if (q.autoCheckKey === 'unique_categories_today' && triggerType === 'daily_habits') {
                const categoriesDone = new Set(habits.filter(h => h.status === 'done').map(h => h.category));
                if (categoriesDone.size >= 3) return { ...q, status: 'completed', progress: 3 };
                return { ...q, progress: categoriesDone.size };
            }

            // Handle Simple Triggers
            if (q.autoCheckKey === triggerType) {
                 if (value !== undefined) {
                     // Check if max met
                     if (value >= q.maxProgress) return { ...q, status: 'completed', progress: q.maxProgress };
                     return { ...q, progress: value };
                 } else {
                     // Increment
                     const newProg = q.progress + 1;
                     if (newProg >= q.maxProgress) return { ...q, status: 'completed', progress: q.maxProgress };
                     return { ...q, progress: newProg };
                 }
            }
            
            return q;
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

            const titleObj = [...LEVEL_TITLES].reverse().find(t => t.level <= newLevel);
            const newTitle = titleObj ? titleObj.title : prev.title;

            return { ...prev, xp: newXp, level: newLevel, maxXp: newMaxXp, title: newTitle };
        });
    };

    const addHabit = (habit: Habit) => {
        setHabits(prev => [...prev, habit]);
        checkSystemQuests('create_habit');
    };
    const updateHabit = (h: Habit) => setHabits(prev => prev.map(old => old.id === h.id ? h : old));
    const deleteHabit = (id: string) => setHabits(prev => prev.filter(h => h.id !== id));
    
    const addQuest = (quest: Quest) => {
        setQuests(prev => [...prev, quest]);
        checkSystemQuests('create_quest');
    };
    const deleteQuest = (id: string) => setQuests(prev => prev.filter(q => q.id !== id));
    const completeQuest = (id: string) => {
        setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed', progress: q.maxProgress } : q));
        checkSystemQuests('complete_quest');
    };
    const claimQuestReward = (id: string) => {
        setQuests(prev => prev.map(q => {
            if (q.id === id && q.status === 'completed') {
                addGems(q.rewardGems);
                addGold(q.rewardGold);
                addXp(q.rewardXp);
                logHistory(`${q.title}`, 'quest', `+${q.rewardGold}g, +${q.rewardGems}gems, +${q.rewardXp}XP`);
                return { ...q, status: 'claimed' };
            }
            return q;
        }));
    };

    const toggleHabit = (id: string) => {
        setHabits(prev => {
            const habit = prev.find(h => h.id === id);
            if (!habit) return prev;
            
            const isDone = habit.status === 'done';
            if (!isDone) {
                let mult = stats.rewardMultiplier;
                if (stats.categoryMultipliers[habit.category]) mult *= stats.categoryMultipliers[habit.category];
                const gold = Math.floor(habit.rewardGold * mult);
                const xp = Math.floor(habit.rewardXp * mult);
                
                addGold(gold);
                addXp(xp);
                logHistory(`${habit.title}|${habit.category}`, 'habit', `+${gold}g, +${xp}XP`);
                
                setTimeout(() => {
                    checkSystemQuests('daily_habits');
                }, 0);

                return prev.map(h => h.id === id ? { ...h, status: 'done', streak: h.streak + 1, completions: (h.completions||0)+1, lastCompletedDate: new Date().toISOString().split('T')[0] } : h);
            } else {
                 return prev.map(h => h.id === id ? { ...h, status: 'todo', streak: Math.max(0, h.streak - 1), completions: Math.max(0, (h.completions||1)-1) } : h);
            }
        });
    };

    const buyShopItem = (item: ShopItem, customParam?: string, metaParam?: any): boolean => {
        if (item.minLevel && stats.level < item.minLevel) return false;
        if (stats.gold < item.costGold || stats.gems < item.costGems) return false;

        setStats(prev => {
            const newState = { ...prev, gold: prev.gold - item.costGold, gems: prev.gems - item.costGems };
            if (item.effect === 'slot_upgrade') newState.habitSlots += item.value;
            if (item.effect === 'multiplier_upgrade') newState.rewardMultiplier *= item.value;
            if (item.effect === 'map_upgrade') newState.harvestMapLevel = Math.min(5, newState.harvestMapLevel + 1);
            if (item.effect === 'unlock_category' && customParam && metaParam) {
                const newCats = [...(prev.customCategories || [])];
                if (!newCats.some(c => c.name === customParam)) {
                    newCats.push({ name: customParam, type: metaParam.type, color: metaParam.color });
                }
                newState.customCategories = newCats;
            }
            if (item.effect === 'category_multiplier' && customParam) {
                newState.categoryMultipliers = { ...newState.categoryMultipliers, [customParam]: (newState.categoryMultipliers[customParam] || 1) * item.value };
            }
            return newState;
        });
        logHistory(`Purchased: ${item.name}`, 'shop', `-${item.costGold}g, -${item.costGems}gems`);
        checkSystemQuests('shop_purchase');
        return true;
    };

    const claimHarvestReward = () => {
        const levelMult = stats.harvestMapLevel;
        const baseGold = (Math.floor(Math.random() * 40) + 10) * levelMult;
        const baseXp = (Math.floor(Math.random() * 40) + 10) * levelMult;
        const gemChance = Math.random();
        let gems = 0;
        if (gemChance < 0.10) {
            gems = Math.floor(Math.random() * levelMult) + 1;
        }

        addGold(baseGold);
        addXp(baseXp);
        if (gems > 0) addGems(gems);

        const rewardStr = gems > 0 ? `+${baseGold}g, +${gems}gems, +${baseXp}XP` : `+${baseGold}g, +${baseXp}XP`;
        logHistory('Wild Harvest Complete', 'harvest', rewardStr);
        checkSystemQuests('harvest_complete');
        return { gold: baseGold, xp: baseXp, gems };
    };

    const resetDaily = () => {
        setHabits(prev => prev.map(h => ({ ...h, status: 'todo' })));
        setQuests(prev => prev.map(q => {
             if (q.recurring || q.autoCheckKey === 'daily_habits' || q.autoCheckKey === 'daily_habits_total' || q.autoCheckKey === 'unique_categories_today') {
                 return { ...q, status: 'active', progress: 0 };
             }
             return q;
        }));
    };

    const resetGame = () => {
        localStorage.clear();
        window.location.reload();
    };

    const addJournalEntry = (entry: JournalEntry) => {
        setJournalEntries(prev => [entry, ...prev]);
        checkSystemQuests('journal_entry');
    };

    const saveToCloud = async (url: string, token: string) => {
        try {
            const data = exportSaveData();
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: data
            });
            return res.ok;
        } catch { return false; }
    };

    const loadFromCloud = async (url: string, token: string) => {
        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const text = await res.text();
                return importSaveData(text);
            }
            return false;
        } catch { return false; }
    };

    const isHabitDueToday = (habit: Habit): boolean => {
        if (habit.status === 'done') return false; 
        const today = new Date();
        const currentDay = today.getDay(); // 0-6
        const currentDate = today.getDate(); // 1-31
        const currentMonth = today.getMonth(); // 0-11
        
        const startDate = new Date(habit.startDate);
        // Reset time for accurate day calculation
        today.setHours(0,0,0,0);
        const startClone = new Date(habit.startDate);
        startClone.setHours(0,0,0,0);

        const diffTime = today.getTime() - startClone.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

        if (diffDays < 0) return false; // Not started yet

        if (habit.frequency === 'daily') return true;
        
        if (habit.frequency === 'interval') {
            return diffDays % habit.interval === 0;
        }

        if (habit.frequency === 'weekly') {
            // Check if current weekday is in allowed list
            if (!habit.weekDays?.includes(currentDay)) return false;
            // Check interval (Every X weeks)
            // Get week number difference?
            // Simple approximation: diffDays / 7
            const currentWeekDiff = Math.floor(diffDays / 7);
            return currentWeekDiff % habit.interval === 0;
        }

        if (habit.frequency === 'monthly_date') {
            if (!habit.monthDay) return false;
            if (currentDate !== habit.monthDay) return false;
            // Check interval (Every X months)
            // Need accurate month diff
            let months = (today.getFullYear() - startClone.getFullYear()) * 12;
            months -= startClone.getMonth();
            months += today.getMonth();
            return months % habit.interval === 0;
        }

        if (habit.frequency === 'monthly_weekday') {
             // e.g. 2nd Tuesday
             // Check if today is the correct weekday
             if (currentDay !== habit.monthWeekDay) return false;
             
             // Calculate which occurrence of this weekday it is in the month
             // e.g. 8th of month. 1st was Tuesday. 8th is 2nd Tuesday.
             // Math: ceil(date / 7) -> 1st week, 2nd week...
             const weekRank = Math.ceil(currentDate / 7);
             
             // Special case: Last weekday (habit.monthWeek === 5 or -1)
             // Check if adding 7 days puts us in next month
             const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
             const isLast = (currentDate + 7) > daysInMonth;

             if (habit.monthWeek === 5 || habit.monthWeek === -1) {
                 if (!isLast) return false;
             } else {
                 if (weekRank !== habit.monthWeek) return false;
             }

             // Check month interval
             let months = (today.getFullYear() - startClone.getFullYear()) * 12;
             months -= startClone.getMonth();
             months += today.getMonth();
             return months % habit.interval === 0;
        }

        // Legacy fallbacks
        if (habit.frequency === 'specific_days' && habit.days) return habit.days.includes(currentDay);
        if (habit.frequency === 'repeating' && habit.repeatInterval) return diffDays % habit.repeatInterval === 0;
        
        return false;
    };

    const getNextDueDate = (habit: Habit): string => {
        if (isHabitDueToday(habit)) return "Today";
        // Very basic future check - logic can be complex for recurrence
        if (habit.frequency === 'daily') return "Tomorrow";
        if (habit.frequency === 'interval') return `In ${habit.interval - (Math.floor((new Date().getTime() - new Date(habit.startDate).getTime())/(1000*3600*24)) % habit.interval)} days`;
        return "Soon";
    };

    const exportSaveData = () => JSON.stringify({ stats, habits, quests, journalEntries, historyLogs, habitIdeas, version: 1.5 });
    const exportHistoryToCSV = () => historyLogs.map(l => `${l.date},"${l.message}",${l.type},"${l.rewardSummary}"`).join('\n');
    const importSaveData = (json: string) => {
        try {
            const data = JSON.parse(json);
            if(data.stats) setStats(data.stats);
            if(data.habits) setHabits(data.habits);
            if(data.quests) setQuests(data.quests);
            if(data.journalEntries) setJournalEntries(data.journalEntries);
            if(data.historyLogs) setHistoryLogs(data.historyLogs);
            if(data.habitIdeas) setHabitIdeas(data.habitIdeas);
            return true;
        } catch { return false; }
    };

    return (
        <GameContext.Provider value={{
            stats, setStats, habits, quests, journalEntries, historyLogs, habitIdeas, setHabitIdeas,
            addGold, addGems, addXp, addHabit, updateHabit, deleteHabit, addQuest, deleteQuest,
            toggleHabit, completeQuest, claimQuestReward, buyShopItem, addJournalEntry, resetDaily, resetGame,
            claimHarvestReward, isHabitDueToday, getNextDueDate, exportSaveData, exportHistoryToCSV, importSaveData,
            saveToCloud, loadFromCloud, t, setLanguage, LEVEL_TITLES, MAPS
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
