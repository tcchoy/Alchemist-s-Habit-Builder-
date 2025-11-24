
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStats, Habit, Quest, JournalEntry, ShopItem, HistoryLog, FrequencyType, PotionCategory, Language, CategoryMeta, Toast } from '../types';

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
    updateQuest: (quest: Quest) => void;
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
    showToast: (message: string, type: Toast['type']) => void;
    toasts: Toast[];
    isBrewing: boolean;
    finishBrewing: () => void;
    LEVEL_TITLES: {level: number, title: string}[];
    MAPS: { level: number, name: string, image: string, rewardRange: string, xpRange: string }[];
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

// JRPG Style Maps
export const MAPS = [
    { level: 1, name: "Whisperwind Woodland", image: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1632&auto=format&fit=crop", rewardRange: "10-50g", xpRange: "10-50XP" }, // Forest
    { level: 2, name: "Gloomrot Bog", image: "https://images.unsplash.com/photo-1542226601-5bc4df3d0859?q=80&w=1470&auto=format&fit=crop", rewardRange: "20-100g", xpRange: "20-100XP" }, // Misty/Swampy
    { level: 3, name: "Leviathan Sea", image: "https://images.unsplash.com/photo-1496099580453-33237194883c?q=80&w=1472&auto=format&fit=crop", rewardRange: "50-150g", xpRange: "50-150XP" }, // Ocean
    { level: 4, name: "Crimson Volcano", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1511&auto=format&fit=crop", rewardRange: "100-250g", xpRange: "100-250XP" }, // Lava/Volcano (Abstract)
    { level: 5, name: "Voidlight Caverns", image: "https://images.unsplash.com/photo-1516934024742-b461fba47600?q=80&w=1374&auto=format&fit=crop", rewardRange: "200-500g", xpRange: "200-500XP" }, // Cave
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
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Alchemist",
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
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [loaded, setLoaded] = useState(false);
    
    // Brewing Animation State
    const [isBrewing, setIsBrewing] = useState(false);
    const [pendingHabitId, setPendingHabitId] = useState<string | null>(null);

    const t = (key: string) => DICTIONARY[stats.language]?.[key] || key;
    const setLanguage = (lang: Language) => setStats(prev => ({ ...prev, language: lang }));

    const showToast = (message: string, type: Toast['type']) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

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

    // Persistence & Penalties
    useEffect(() => {
        const loadData = () => {
            const savedStats = localStorage.getItem('pps_stats');
            let currentStats = INITIAL_STATS;
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                currentStats = { 
                    ...INITIAL_STATS, 
                    ...parsed,
                    customCategories: parsed.customCategories || [],
                    language: parsed.language || 'en',
                    harvestMapLevel: parsed.harvestMapLevel || 1
                };
                setStats(currentStats);
            }
            const savedHabits = localStorage.getItem('pps_habits');
            if (savedHabits) setHabits(JSON.parse(savedHabits));
            const savedQuests = localStorage.getItem('pps_quests');
            if (savedQuests) setQuests(JSON.parse(savedQuests));
            
            // Merge System Quests if new ones were added
            const savedQuestsList = savedQuests ? JSON.parse(savedQuests) as Quest[] : SEED_QUESTS;
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

            // PENALTY CHECK
            // Check if user missed yesterday and didn't complete daily commission
            const today = new Date().toISOString().split('T')[0];
            const lastLogin = currentStats.lastLoginDate;
            
            if (lastLogin !== today) {
                 const lastLoginDate = new Date(lastLogin);
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1);
                 const yesterdayStr = yesterday.toISOString().split('T')[0];

                 // If last login was strictly before yesterday, they missed a day
                 if (lastLoginDate < new Date(yesterdayStr)) {
                     // Check if daily commission was done on the last active day? 
                     // Simplified: Just deduct a "maintenance fee" for missing days
                     const missedDays = Math.floor((new Date(today).getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24)) - 1;
                     if (missedDays > 0) {
                         const penalty = Math.min(currentStats.gold, missedDays * 10);
                         if (penalty > 0) {
                             setStats(prev => ({ ...prev, gold: prev.gold - penalty, loginStreak: 0, lastLoginDate: today }));
                             logHistory(`Shop neglected for ${missedDays} days`, 'penalty', `-${penalty}g`);
                             // We show toast in a timeout to ensure UI is ready
                             setTimeout(() => showToast(`Shop neglected! Paid ${penalty}g maintenance.`, 'error'), 1000);
                         } else {
                             setStats(prev => ({ ...prev, loginStreak: 0, lastLoginDate: today }));
                         }
                     } else {
                         // Consecutive login
                         setStats(prev => ({ ...prev, loginStreak: prev.loginStreak + 1, lastLoginDate: today }));
                         checkSystemQuests('streak_commission');
                     }
                 } else {
                     // Logged in yesterday
                     setStats(prev => ({ ...prev, loginStreak: prev.loginStreak + 1, lastLoginDate: today }));
                     checkSystemQuests('streak_commission');
                 }
            }

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

            if (q.autoCheckKey === 'daily_habits' && triggerType === 'daily_habits') {
                const completedToday = value !== undefined ? value : habits.filter(h => h.status === 'done').length;
                if (completedToday >= 3) return { ...q, status: 'completed', progress: 3 };
                return { ...q, progress: completedToday };
            }
            if (q.autoCheckKey === 'daily_habits_total' && triggerType === 'daily_habits') {
                 const completedToday = value !== undefined ? value : habits.filter(h => h.status === 'done').length;
                 if (completedToday >= 8) return { ...q, status: 'completed', progress: 8 };
                 return { ...q, progress: completedToday };
            }
            if (q.autoCheckKey === 'unique_categories_today' && triggerType === 'daily_habits') {
                const categoriesDone = new Set(habits.filter(h => h.status === 'done').map(h => h.category));
                if (categoriesDone.size >= 3) return { ...q, status: 'completed', progress: 3 };
                return { ...q, progress: categoriesDone.size };
            }

            if (q.autoCheckKey === 'streak_commission' && triggerType === 'streak_commission') {
                // Check stats.loginStreak for simpler streak logic or use specialized logic
                 const streak = stats.loginStreak;
                 if (streak >= q.maxProgress) return { ...q, status: 'completed', progress: q.maxProgress };
                 return { ...q, progress: streak };
            }

            if (q.autoCheckKey === triggerType) {
                 if (value !== undefined) {
                     if (value >= q.maxProgress) return { ...q, status: 'completed', progress: q.maxProgress };
                     return { ...q, progress: value };
                 } else {
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
        showToast(`Recipe created: ${habit.title}`, 'success');
    };
    const updateHabit = (h: Habit) => {
        setHabits(prev => prev.map(old => old.id === h.id ? h : old));
        showToast(`Recipe updated: ${h.title}`, 'success');
    };
    const deleteHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        showToast(`Recipe discarded`, 'info');
    };
    
    const addQuest = (quest: Quest) => {
        setQuests(prev => [...prev, quest]);
        checkSystemQuests('create_quest');
        showToast(`New notice posted`, 'success');
    };
    const updateQuest = (quest: Quest) => {
        setQuests(prev => prev.map(q => q.id === quest.id ? quest : q));
        showToast(`Notice updated`, 'success');
    };
    const deleteQuest = (id: string) => {
        setQuests(prev => prev.filter(q => q.id !== id));
        showToast(`Notice removed`, 'info');
    };
    const completeQuest = (id: string) => {
        setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed', progress: q.maxProgress } : q));
        checkSystemQuests('complete_quest');
        showToast(`Quest completed!`, 'success');
    };
    const claimQuestReward = (id: string) => {
        setQuests(prev => prev.map(q => {
            if (q.id === id && q.status === 'completed') {
                addGems(q.rewardGems);
                addGold(q.rewardGold);
                addXp(q.rewardXp);
                logHistory(`${q.title}`, 'quest', `+${q.rewardGold}g, +${q.rewardGems}gems, +${q.rewardXp}XP`);
                showToast(`Rewards claimed: ${q.rewardGold}g, ${q.rewardGems}gems`, 'success');
                return { ...q, status: 'claimed' };
            }
            return q;
        }));
    };

    const processHabitCompletion = (id: string) => {
        setHabits(prev => {
            const habit = prev.find(h => h.id === id);
            if (!habit) return prev;
            
            let mult = stats.rewardMultiplier;
            if (stats.categoryMultipliers[habit.category]) mult *= stats.categoryMultipliers[habit.category];
            const gold = Math.floor(habit.rewardGold * mult);
            const xp = Math.floor(habit.rewardXp * mult);
            
            addGold(gold);
            addXp(xp);
            logHistory(`${habit.title}|${habit.category}`, 'habit', `+${gold}g, +${xp}XP`);

            // Check if habit reached a mastery milestone (multiple of 20)
            const newCompletions = (habit.completions || 0) + 1;
            if (newCompletions > 0 && newCompletions % 20 === 0) {
                 addGems(10);
                 showToast(`Mastery! ${habit.title} brewed ${newCompletions} times! +10 Gems`, 'success');
            }
            
            // Calculate completed count *after* this one is marked done
            // NOTE: 'prev' still has old status. We need to count old done + 1
            const currentDoneCount = prev.filter(h => h.status === 'done').length;
            setTimeout(() => {
                checkSystemQuests('daily_habits', currentDoneCount + 1);
            }, 0);
            
            showToast(`Brewed ${habit.title}! +${gold}g`, 'success');
            return prev.map(h => h.id === id ? { ...h, status: 'done', streak: h.streak + 1, completions: (h.completions||0)+1, lastCompletedDate: new Date().toISOString().split('T')[0] } : h);
        });
    };

    const toggleHabit = (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;
        
        const isDone = habit.status === 'done';

        if (!isDone) {
            // Start Brewing Animation
            setPendingHabitId(id);
            setIsBrewing(true);
            // Completion Logic happens in finishBrewing()
        } else {
            // Undo (no animation needed for undo)
             setHabits(prev => {
                 const currentDoneCount = prev.filter(h => h.status === 'done').length;
                 setTimeout(() => {
                    checkSystemQuests('daily_habits', Math.max(0, currentDoneCount - 1));
                }, 0);

                 return prev.map(h => h.id === id ? { ...h, status: 'todo', streak: Math.max(0, h.streak - 1), completions: Math.max(0, (h.completions||1)-1) } : h);
            });
        }
    };

    const finishBrewing = () => {
        setIsBrewing(false);
        if (pendingHabitId) {
            processHabitCompletion(pendingHabitId);
            setPendingHabitId(null);
        }
    };

    const buyShopItem = (item: ShopItem, customParam?: string, metaParam?: any): boolean => {
        if (item.minLevel && stats.level < item.minLevel) {
            showToast(`Level ${item.minLevel} required!`, 'error');
            return false;
        }
        if (stats.gold < item.costGold || stats.gems < item.costGems) {
            showToast("Insufficient funds", 'error');
            return false;
        }

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
        showToast(`Purchased ${item.name}`, 'success');
        return true;
    };

    const claimHarvestReward = () => {
        const levelMult = stats.harvestMapLevel;
        const baseGold = (Math.floor(Math.random() * 40) + 10) * levelMult;
        const baseXp = (Math.floor(Math.random() * 40) + 10) * levelMult;
        
        // Gem Logic: 50% chance 0, 50% chance 1-level
        const gemRoll = Math.random();
        let gems = 0;
        if (gemRoll < 0.5) { // 50% chance
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
        localStorage.removeItem('pps_stats');
        localStorage.removeItem('pps_habits');
        localStorage.removeItem('pps_quests');
        localStorage.removeItem('pps_journal');
        localStorage.removeItem('pps_logs');
        localStorage.removeItem('pps_ideas');
        localStorage.clear();
        window.location.reload();
    };

    const addJournalEntry = (entry: JournalEntry) => {
        setJournalEntries(prev => [entry, ...prev]);
        checkSystemQuests('journal_entry');
        showToast("Journal entry inscribed", 'success');
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
        const currentDay = today.getDay(); 
        const currentDate = today.getDate(); 
        
        const startDate = new Date(habit.startDate);
        today.setHours(0,0,0,0);
        const startClone = new Date(habit.startDate);
        startClone.setHours(0,0,0,0);

        const diffTime = today.getTime() - startClone.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

        if (diffDays < 0) return false;

        if (habit.frequency === 'daily') return true;
        
        if (habit.frequency === 'interval') {
            return diffDays % habit.interval === 0;
        }

        if (habit.frequency === 'weekly') {
            if (!habit.weekDays?.includes(currentDay)) return false;
            const currentWeekDiff = Math.floor(diffDays / 7);
            return currentWeekDiff % habit.interval === 0;
        }

        if (habit.frequency === 'monthly_date') {
            if (!habit.monthDay) return false;
            if (currentDate !== habit.monthDay) return false;
            let months = (today.getFullYear() - startClone.getFullYear()) * 12;
            months -= startClone.getMonth();
            months += today.getMonth();
            return months % habit.interval === 0;
        }

        if (habit.frequency === 'monthly_weekday') {
             if (currentDay !== habit.monthWeekDay) return false;
             const weekRank = Math.ceil(currentDate / 7);
             const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
             const isLast = (currentDate + 7) > daysInMonth;

             if (habit.monthWeek === 5 || habit.monthWeek === -1) {
                 if (!isLast) return false;
             } else {
                 if (weekRank !== habit.monthWeek) return false;
             }

             let months = (today.getFullYear() - startClone.getFullYear()) * 12;
             months -= startClone.getMonth();
             months += today.getMonth();
             return months % habit.interval === 0;
        }
        
        if (habit.frequency === 'specific_days' && habit.days) return habit.days.includes(currentDay);
        if (habit.frequency === 'repeating' && habit.repeatInterval) return diffDays % habit.repeatInterval === 0;

        return false;
    };

    const getNextDueDate = (habit: Habit): string => {
        if (isHabitDueToday(habit)) return "Today";
        if (habit.frequency === 'daily') return "Tomorrow";
        if (habit.frequency === 'interval') return `In ${habit.interval - (Math.floor((new Date().getTime() - new Date(habit.startDate).getTime())/(1000*3600*24)) % habit.interval)} days`;
        return "Soon";
    };

    const exportSaveData = () => JSON.stringify({ stats, habits, quests, journalEntries, historyLogs, habitIdeas, version: 1.6 });
    const exportHistoryToCSV = () => {
        const header = "Date,Message,Type,RewardSummary\n";
        const rows = historyLogs.map(l => `${l.date},"${l.message.replace(/"/g, '""')}",${l.type},"${l.rewardSummary?.replace(/"/g, '""') || ''}"`).join('\n');
        return header + rows;
    };
    const importSaveData = (json: string) => {
        try {
            const data = JSON.parse(json);
            if(data.stats) setStats(data.stats);
            if(data.habits) setHabits(data.habits);
            if(data.quests) setQuests(data.quests);
            if(data.journalEntries) setJournalEntries(data.journalEntries);
            if(data.historyLogs) setHistoryLogs(data.historyLogs);
            if(data.habitIdeas) setHabitIdeas(data.habitIdeas);
            showToast("Save data loaded successfully", 'success');
            return true;
        } catch { 
            showToast("Failed to load save data", 'error');
            return false; 
        }
    };

    return (
        <GameContext.Provider value={{
            stats, setStats, habits, quests, journalEntries, historyLogs, habitIdeas, setHabitIdeas,
            addGold, addGems, addXp, addHabit, updateHabit, deleteHabit, addQuest, updateQuest, deleteQuest,
            toggleHabit, completeQuest, claimQuestReward, buyShopItem, addJournalEntry, resetDaily, resetGame,
            claimHarvestReward, isHabitDueToday, getNextDueDate, exportSaveData, exportHistoryToCSV, importSaveData,
            saveToCloud, loadFromCloud, t, setLanguage, showToast, toasts, 
            isBrewing, finishBrewing, LEVEL_TITLES, MAPS
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
