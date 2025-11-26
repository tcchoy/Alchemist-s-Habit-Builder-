
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { UserStats, Habit, Quest, JournalEntry, ShopItem, HistoryLog, FrequencyType, PotionCategory, Language, CategoryMeta, Toast } from '../types';
import { auth, db, googleProvider } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

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
    importSaveData: (json: string) => void;
    saveToCloud: () => Promise<boolean>;
    loadFromCloud: () => Promise<boolean>;
    login: () => void;
    logout: () => void;
    user: User | null;
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
    { level: 1, name: "Whisperwind Woodland", image: "https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-Images/refs/heads/main/Whisperwind%20Woodland.png", rewardRange: "10-50g", xpRange: "10-50XP" }, 
    { level: 2, name: "Gloomrot Bog", image: "https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-Images/refs/heads/main/Gloomrot%20Bog.png", rewardRange: "20-100g", xpRange: "20-100XP" },
    { level: 3, name: "Leviathan Sea", image: "https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-Images/refs/heads/main/Leviathan%20Sea.png", rewardRange: "50-150g", xpRange: "50-150XP" },
    { level: 4, name: "Crimson Volcano", image: "https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-Images/refs/heads/main/Crimson%20Volcano.png", rewardRange: "100-250g", xpRange: "100-250XP" },
    { level: 5, name: "Voidlight Caverns", image: "https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-Images/refs/heads/main/Voidlight%20Caverns.png", rewardRange: "200-500g", xpRange: "200-500XP" },
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
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
    const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
    const [quests, setQuests] = useState<Quest[]>(SEED_QUESTS);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
    const [habitIdeas, setHabitIdeas] = useState<string>('');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [loaded, setLoaded] = useState(false);
    
    const isResetting = useRef(false);
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

    // Firebase Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Load from Firestore
                const userRef = doc(db, 'users', currentUser.uid);
                getDoc(userRef).then(snap => {
                    if (snap.exists()) {
                        const data = snap.data();
                        setStats(data.stats || INITIAL_STATS);
                        setHabits(data.habits || []);
                        setQuests(data.quests || SEED_QUESTS);
                        setJournalEntries(data.journalEntries || []);
                        setHistoryLogs(data.historyLogs || []);
                        setHabitIdeas(data.habitIdeas || '');
                        showToast(`Welcome back, ${data.stats?.name || 'Alchemist'}`, 'success');
                    } else {
                        // New user in Cloud, maybe sync local data?
                        // For now, just use current local state and save it to cloud next
                        showToast('Cloud profile created.', 'info');
                    }
                    setLoaded(true);
                });
            } else {
                // Fallback to LocalStorage if not logged in
                loadLocalData();
            }
        });
        return () => unsubscribe();
    }, []);

    const loadLocalData = () => {
        try {
            const savedStats = localStorage.getItem('pps_stats');
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                setStats({ ...INITIAL_STATS, ...parsed, customCategories: parsed.customCategories || [], language: parsed.language || 'en', harvestMapLevel: parsed.harvestMapLevel || 1 });
            }
            const savedHabits = localStorage.getItem('pps_habits');
            if (savedHabits) setHabits(JSON.parse(savedHabits));
            const savedQuests = localStorage.getItem('pps_quests');
            if (savedQuests) setQuests(JSON.parse(savedQuests));
            const savedJournal = localStorage.getItem('pps_journal');
            if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
            const savedLogs = localStorage.getItem('pps_logs');
            if (savedLogs) setHistoryLogs(JSON.parse(savedLogs));
            const savedIdeas = localStorage.getItem('pps_ideas');
            if (savedIdeas) setHabitIdeas(savedIdeas);
        } catch (e) {
            console.error("Local load failed", e);
        } finally {
            setLoaded(true);
        }
    };

    // Data Sync (Local + Firestore)
    useEffect(() => {
        if (!loaded || isResetting.current) return;

        const dataToSave = { stats, habits, quests, journalEntries, historyLogs, habitIdeas, lastSaved: new Date().toISOString() };

        // 1. Local Storage (Always backup)
        localStorage.setItem('pps_stats', JSON.stringify(stats));
        localStorage.setItem('pps_habits', JSON.stringify(habits));
        localStorage.setItem('pps_quests', JSON.stringify(quests));
        localStorage.setItem('pps_journal', JSON.stringify(journalEntries));
        localStorage.setItem('pps_logs', JSON.stringify(historyLogs));
        localStorage.setItem('pps_ideas', habitIdeas);

        // 2. Firestore (If logged in)
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            setDoc(userRef, dataToSave, { merge: true });
        }
    }, [stats, habits, quests, journalEntries, historyLogs, habitIdeas, loaded, user]);

    // Daily Reset & Penalty Logic
    useEffect(() => {
        if (!loaded) return;
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastLoginDate !== today) {
            performDailyCheck(today);
        }
    }, [loaded, stats.lastLoginDate]);

    const performDailyCheck = (today: string) => {
        // 1. Penalty Check
        const lastLogin = new Date(stats.lastLoginDate);
        const currentDay = new Date(today);
        const diffTime = currentDay.getTime() - lastLogin.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

        let newStats = { ...stats, lastLoginDate: today };

        if (diffDays > 1) {
            // Missed days > 1 means they skipped at least yesterday
            const penalty = Math.min(newStats.gold, (diffDays - 1) * 10);
            if (penalty > 0) {
                newStats.gold -= penalty;
                logHistory(`Shop neglected for ${diffDays - 1} days`, 'penalty', `-${penalty}g`);
                showToast(`Neglected shop! Paid ${penalty}g maintenance.`, 'error');
            }
            newStats.loginStreak = 1; // Reset streak
        } else if (diffDays === 1) {
            // Consecutive day
            newStats.loginStreak += 1;
            checkSystemQuests('streak_commission', undefined, newStats.loginStreak);
        }

        setStats(newStats);

        // 2. Smart Habit Reset
        setHabits(prev => prev.map(h => {
            // If it's done, check if it is due TODAY. If so, reset to todo.
            // If it's todo, it stays todo (overdue).
            if (h.status === 'done') {
                if (checkHabitSchedule(h, new Date(today))) {
                    return { ...h, status: 'todo' };
                }
            }
            return h;
        }));

        // 3. Recurring Quest Reset
        setQuests(prev => prev.map(q => {
            if (q.recurring && (q.status === 'completed' || q.status === 'claimed')) {
                return { ...q, status: 'active', progress: 0 };
            }
            return q;
        }));
    };

    // Revised Scheduling Logic
    const checkHabitSchedule = (habit: Habit, targetDate: Date): boolean => {
        const tDate = new Date(targetDate);
        tDate.setHours(0,0,0,0);
        
        // Frequency: Interval (Every X Days)
        // Floating logic: based on lastCompletedDate if exists, else startDate
        if (habit.frequency === 'interval') {
            let refDate = new Date(habit.startDate);
            if (habit.lastCompletedDate) {
                refDate = new Date(habit.lastCompletedDate);
            }
            refDate.setHours(0,0,0,0);
            
            const diffTime = tDate.getTime() - refDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
            
            if (diffDays < 0) return false; // Before start/last completion
            
            // Due if enough days have passed since last completion
            return diffDays >= habit.interval;
        }

        // Calendar Anchored Logic (Daily, Weekly, Monthly)
        const dayOfWeek = tDate.getDay();
        const dateOfMonth = tDate.getDate();

        if (habit.frequency === 'daily') return true;

        if (habit.frequency === 'weekly') {
            if (!habit.weekDays?.includes(dayOfWeek)) return false;
            // Optional: Interval for weeks (e.g. every 2nd week)
            // Simplified: If weekDays matches, it's due.
            return true;
        }

        if (habit.frequency === 'monthly_date') {
            return dateOfMonth === habit.monthDay;
        }

        if (habit.frequency === 'monthly_weekday') {
            if (dayOfWeek !== habit.monthWeekDay) return false;
            const weekRank = Math.ceil(dateOfMonth / 7);
            const daysInMonth = new Date(tDate.getFullYear(), tDate.getMonth() + 1, 0).getDate();
            const isLast = (dateOfMonth + 7) > daysInMonth;

            if (habit.monthWeek === 5) return isLast;
            return weekRank === habit.monthWeek;
        }

        return false;
    };

    const isHabitDueToday = (habit: Habit): boolean => {
        if (habit.status === 'done') return false;
        return checkHabitSchedule(habit, new Date());
    };

    const getNextDueDate = (habit: Habit): string => {
        if (habit.status === 'todo' && isHabitDueToday(habit)) return "Today";
        
        // Look ahead 365 days to find next due date
        const d = new Date();
        for(let i=1; i<=365; i++) {
            d.setDate(d.getDate() + 1);
            if (checkHabitSchedule(habit, d)) {
                if (i === 1) return "Tomorrow";
                return `In ${i} days`;
            }
        }
        return "Future";
    };

    // Actions
    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (e) {
            console.error("Login failed", e);
            showToast("Login failed", 'error');
        }
    };

    const logout = async () => {
        await signOut(auth);
        setStats(INITIAL_STATS); // Reset to defaults or handle gracefully
        window.location.reload();
    };

    // ... (Rest of the actions: addHabit, buyShopItem, etc. - keeping logic same but ensuring they use current state which auto-syncs)
    
    // System Quest Checker
    const checkSystemQuests = (triggerType: string, value?: number, overrideValue?: number) => {
        setQuests(prev => prev.map(q => {
            if (q.status !== 'active' || q.type !== 'System' || !q.autoCheckKey) return q;

            if (q.autoCheckKey === 'daily_habits' && triggerType === 'daily_habits') {
                const val = value !== undefined ? value : habits.filter(h => h.status === 'done').length;
                if (val >= 3) return { ...q, status: 'completed', progress: 3 };
                return { ...q, progress: val };
            }
            if (q.autoCheckKey === 'streak_commission' && triggerType === 'streak_commission') {
                 const streak = overrideValue || stats.loginStreak;
                 if (streak >= q.maxProgress) return { ...q, status: 'completed', progress: q.maxProgress };
                 return { ...q, progress: streak };
            }
            // ... other checks
            if (q.autoCheckKey === triggerType) {
                 const newProg = (value !== undefined ? value : q.progress + 1);
                 if (newProg >= q.maxProgress) return { ...q, status: 'completed', progress: q.maxProgress };
                 return { ...q, progress: newProg };
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

    const addHabit = (habit: Habit) => { setHabits(prev => [...prev, habit]); checkSystemQuests('create_habit'); showToast(`Recipe created`, 'success'); };
    const updateHabit = (h: Habit) => { setHabits(prev => prev.map(old => old.id === h.id ? h : old)); showToast(`Recipe updated`, 'success'); };
    const deleteHabit = (id: string) => { setHabits(prev => prev.filter(h => h.id !== id)); showToast(`Recipe discarded`, 'info'); };
    const addQuest = (q: Quest) => { setQuests(prev => [...prev, q]); checkSystemQuests('create_quest'); showToast(`New notice posted`, 'success'); };
    const updateQuest = (q: Quest) => { setQuests(prev => prev.map(old => old.id === q.id ? q : old)); showToast(`Notice updated`, 'success'); };
    const deleteQuest = (id: string) => { setQuests(prev => prev.filter(q => q.id !== id)); showToast(`Notice removed`, 'info'); };
    const completeQuest = (id: string) => { setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed', progress: q.maxProgress } : q)); checkSystemQuests('complete_quest'); showToast(`Quest completed!`, 'success'); };
    
    const claimQuestReward = (id: string) => {
        setQuests(prev => prev.map(q => {
            if (q.id === id && q.status === 'completed') {
                addGems(q.rewardGems); addGold(q.rewardGold); addXp(q.rewardXp);
                logHistory(`${q.title}`, 'quest', `+${q.rewardGold}g, +${q.rewardGems}gems, +${q.rewardXp}XP`);
                showToast(`Rewards claimed`, 'success');
                return { ...q, status: 'claimed' };
            }
            return q;
        }));
    };

    const toggleHabit = (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;
        const isDone = habit.status === 'done';
        if (!isDone) { setPendingHabitId(id); setIsBrewing(true); }
        else {
             setHabits(prev => {
                 const count = prev.filter(h => h.status === 'done').length;
                 setTimeout(() => checkSystemQuests('daily_habits', Math.max(0, count - 1)), 0);
                 return prev.map(h => h.id === id ? { ...h, status: 'todo', streak: Math.max(0, h.streak - 1), completions: Math.max(0, (h.completions||1)-1) } : h);
            });
        }
    };

    const finishBrewing = () => {
        setIsBrewing(false);
        if (pendingHabitId) {
            setHabits(prev => {
                const habit = prev.find(h => h.id === pendingHabitId);
                if (!habit) return prev;
                let mult = stats.rewardMultiplier;
                if (stats.categoryMultipliers[habit.category]) mult *= stats.categoryMultipliers[habit.category];
                const gold = Math.floor(habit.rewardGold * mult);
                const xp = Math.floor(habit.rewardXp * mult);
                addGold(gold); addXp(xp);
                logHistory(`${habit.title}|${habit.category}`, 'habit', `+${gold}g, +${xp}XP`);
                const newCount = (habit.completions || 0) + 1;
                if (newCount > 0 && newCount % 20 === 0) { addGems(10); showToast(`Mastery! +10 Gems`, 'success'); }
                const count = prev.filter(h => h.status === 'done').length;
                setTimeout(() => checkSystemQuests('daily_habits', count + 1), 0);
                showToast(`Brewed ${habit.title}!`, 'success');
                return prev.map(h => h.id === pendingHabitId ? { ...h, status: 'done', streak: h.streak + 1, completions: newCount, lastCompletedDate: new Date().toISOString().split('T')[0] } : h);
            });
            setPendingHabitId(null);
        }
    };

    const buyShopItem = (item: ShopItem, customParam?: string, metaParam?: any): boolean => {
        if (item.minLevel && stats.level < item.minLevel) { showToast(`Level ${item.minLevel} required!`, 'error'); return false; }
        if (stats.gold < item.costGold || stats.gems < item.costGems) { showToast("Insufficient funds", 'error'); return false; }
        setStats(prev => {
            const newState = { ...prev, gold: prev.gold - item.costGold, gems: prev.gems - item.costGems };
            if (item.effect === 'slot_upgrade') newState.habitSlots += item.value;
            if (item.effect === 'multiplier_upgrade') newState.rewardMultiplier *= item.value;
            if (item.effect === 'map_upgrade') newState.harvestMapLevel = Math.min(5, newState.harvestMapLevel + 1);
            if (item.effect === 'unlock_category' && customParam && metaParam) {
                const newCats = [...(prev.customCategories || [])];
                if (!newCats.some(c => c.name === customParam)) newCats.push({ name: customParam, type: metaParam.type, color: metaParam.color });
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
        const gemRoll = Math.random();
        let gems = 0;
        if (gemRoll < 0.5) gems = Math.floor(Math.random() * levelMult) + 1;
        addGold(baseGold); addXp(baseXp);
        if (gems > 0) addGems(gems);
        const rewardStr = gems > 0 ? `+${baseGold}g, +${gems}gems, +${baseXp}XP` : `+${baseGold}g, +${baseXp}XP`;
        logHistory('Wild Harvest Complete', 'harvest', rewardStr);
        checkSystemQuests('harvest_complete');
        return { gold: baseGold, xp: baseXp, gems };
    };

    const addJournalEntry = (entry: JournalEntry) => { setJournalEntries(prev => [entry, ...prev]); checkSystemQuests('journal_entry'); showToast("Journal entry inscribed", 'success'); };
    const resetGame = () => { isResetting.current = true; localStorage.clear(); window.location.reload(); };
    const exportSaveData = () => JSON.stringify({ stats, habits, quests, journalEntries, historyLogs, habitIdeas, version: 1.7 });
    const exportHistoryToCSV = () => {
        const header = "Date,Message,Type,RewardSummary\n";
        const rows = historyLogs.map(l => `${l.date},"${(l.message || '').replace(/"/g, '""')}",${l.type},"${(l.rewardSummary || '').replace(/"/g, '""')}"`).join('\n');
        return header + rows;
    };
    const importSaveData = (json: string) => {
        try {
            const data = JSON.parse(json);
            isResetting.current = true;
            localStorage.clear();
            if(data.stats) localStorage.setItem('pps_stats', JSON.stringify({ ...INITIAL_STATS, ...(data.stats || {}) }));
            if(data.habits) localStorage.setItem('pps_habits', JSON.stringify(data.habits || []));
            if(data.quests) localStorage.setItem('pps_quests', JSON.stringify(data.quests || []));
            if(data.journalEntries) localStorage.setItem('pps_journal', JSON.stringify(data.journalEntries || []));
            if(data.historyLogs) localStorage.setItem('pps_logs', JSON.stringify(data.historyLogs || []));
            if(data.habitIdeas !== undefined) localStorage.setItem('pps_ideas', data.habitIdeas);
            window.location.reload();
        } catch (e) { isResetting.current = false; showToast("Import Failed", 'error'); }
    };

    // Stubbed Cloud functions (replaced by Firebase)
    const saveToCloud = async () => { showToast("Use Firebase Login", 'info'); return false; };
    const loadFromCloud = async () => { showToast("Use Firebase Login", 'info'); return false; };

    return (
        <GameContext.Provider value={{
            stats, setStats, habits, quests, journalEntries, historyLogs, habitIdeas, setHabitIdeas,
            addGold, addGems, addXp, addHabit, updateHabit, deleteHabit, addQuest, updateQuest, deleteQuest,
            toggleHabit, completeQuest, claimQuestReward, buyShopItem, addJournalEntry, resetDaily: () => {}, resetGame,
            claimHarvestReward, isHabitDueToday, getNextDueDate, exportSaveData, exportHistoryToCSV, importSaveData,
            saveToCloud, loadFromCloud, t, setLanguage, showToast, toasts, 
            isBrewing, finishBrewing, LEVEL_TITLES, MAPS,
            login, logout, user
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
