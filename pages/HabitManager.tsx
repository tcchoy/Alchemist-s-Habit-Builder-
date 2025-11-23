
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Habit, PotionCategory } from '../types';

const FULL_RECIPE_LIST = [
    { title: 'Morning Stretch', category: 'Health', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5mh2v5kr11p8hovg5_FqGVIsJT7EzKZylWrS6O0Ma-Zfy2nyh77usuVB0pEDY0xVO66QTHjxnw2pG60HVPJdEneUxRWkQnvgF9Ucd1vuxYtCVdlNGxFNpV2uMpwS_olnDusoZDDJqgVzvOlZ1iiUwcCDr01uVl9j9yEQ5Nwi2S6ZMbZ70qAZTYM0o1QDv_BBRFVKNWSrnEi9SsQ9Ql8G_VooDLkGbpgoFQe7vo097ph9eTvZUIjvulfGDpyEJxTT5Xh6HhJpRGls', description: 'Loosen muscles and wake up your body. Stretch for 1 minute.' },
    { title: 'Hydration Boost', category: 'Health', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCFxXk_ynOYi58Di_5xkb4eAmBkD9jwVEuyIvAmibjS24khrBaDqm6M2U1tpZCyRy3uz3d1aDPnsR0muu7pZsIp-JeJ7Dp4EN5hUMPguznYXOlHTquzOVq5x0BGqOamk6Wm9uU6hbvoQn6DB4rrVvFfidXtldrrV1UlP0JdXIArw1vezdQy6WfiL9KMBSrQTEJNZMAGvrM1ql83a-rWKzeq1FRo00TdmSApRhMx4tBSV3BcxpMusMjuiKW08tJysTsitMJrUM9g2M', description: 'Increase daily water intake. Drink one glass of water.' },
    { title: 'Evening Walk', category: 'Health', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5mh2v5kr11p8hovg5_FqGVIsJT7EzKZylWrS6O0Ma-Zfy2nyh77usuVB0pEDY0xVO66QTHjxnw2pG60HVPJdEneUxRWkQnvgF9Ucd1vuxYtCVdlNGxFNpV2uMpwS_olnDusoZDDJqgVzvOlZ1iiUwcCDr01uVl9j9yEQ5Nwi2S6ZMbZ70qAZTYM0o1QDv_BBRFVKNWSrnEi9SsQ9Ql8G_VooDLkGbpgoFQe7vo097ph9eTvZUIjvulfGDpyEJxTT5Xh6HhJpRGls', description: 'Light movement to reduce stiffness. Walk for 5 minutes.' },
    { title: 'Sleep Prep Routine', category: 'Health', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq4xWpmQRt5lBVU85CAq7qk2dcSd9iFvSdzrHh3CUyyH23yDLJwjRPYMPoaOSdXX1mfoi0z0eFZCW2Muz-J-jcfuXgrydEmLqv1w7xcSHz5S2kacqpd8gybLf7vtTS34yVA3kJLJd_HettxeDdW1yKIVkf8Xk4EPk75mSLtbdcQlaoj5hKD4wabs8NchGkvC2XGpgaZERK4SSBnCtcv_djEO75XEPVm6lKlQzyfLkSMSwsQ2_IW06riearuBCmz8Fm0AiAJM-nEO4', description: 'Improve sleep quality. Do one sleep-prep step.' },
    { title: 'Mindful Breathing', category: 'Mental Health', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwAfIJZLrLZ7tKAtuC1-Lt0y-D7hCdmyMhkQ1VPEMKiSwq_9Ebd6sc6ekc6egKoTO1b1LxI9dvQam4T696nT9-gg5HKTXUGnQ5TMAdblHbeOutLVkcPrEzLsaOyK0j7t1n9Lg3AL-z3BSwPNutQJ-glco8jtZaJVfxb7uQfpz5ugaozDru1GKKfvdpAtbd26ydy4I2nIi8QN91i2869ROq5LxW4vPALzb45i2nQujHhVEzvSxGtzcEcaXPvZb_OZH2bsIYYOMt4UQ', description: 'Reduce stress with controlled breathing. 3 slow deep breaths.' },
    { title: 'Gratitude Note', category: 'Mental Health', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwAfIJZLrLZ7tKAtuC1-Lt0y-D7hCdmyMhkQ1VPEMKiSwq_9Ebd6sc6ekc6egKoTO1b1LxI9dvQam4T696nT9-gg5HKTXUGnQ5TMAdblHbeOutLVkcPrEzLsaOyK0j7t1n9Lg3AL-z3BSwPNutQJ-glco8jtZaJVfxb7uQfpz5ugaozDru1GKKfvdpAtbd26ydy4I2nIi8QN91i2869ROq5LxW4vPALzb45i2nQujHhVEzvSxGtzcEcaXPvZb_OZH2bsIYYOMt4UQ', description: 'Shift mindset by recognizing positives. Write one sentence.' },
    { title: 'Read a Page', category: 'Knowledge', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIAHQRBkP1IjAfa7MRyVBULw68qIX6C2i-WEzsIhF_SCGFa_fdNg1X8IfGHyA-Y_NNmuJEJs7YHIFQ0PStC9yXT4JrPSa_IDdScsmhbhMWMtHRCcB_nb2IYoZKDDx4JV0SDXm7MzYmnt4rA4dB6jzZfBnev4vJ9GL3YsdFVNVN7L4g_J-WLOgz1j8GYtnR6ffpd5jgmkVq_Y9ke6HWKQkDTajDUcBKA_GBu9kffJKLRLe-1v1YPlGQBg0eqKO4kV876vPC0OIB5fQ', description: 'Build knowledge consistently. Read one page.' },
    { title: 'Dish Reset', category: 'Housework', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIAHQRBkP1IjAfa7MRyVBULw68qIX6C2i-WEzsIhF_SCGFa_fdNg1X8IfGHyA-Y_NNmuJEJs7YHIFQ0PStC9yXT4JrPSa_IDdScsmhbhMWMtHRCcB_nb2IYoZKDDx4JV0SDXm7MzYmnt4rA4dB6jzZfBnev4vJ9GL3YsdFVNVN7L4g_J-WLOgz1j8GYtnR6ffpd5jgmkVq_Y9ke6HWKQkDTajDUcBKA_GBu9kffJKLRLe-1v1YPlGQBg0eqKO4kV876vPC0OIB5fQ', description: 'Reduce clutter. Wash one dish.' },
    { title: 'Surface Swipe', category: 'Housework', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIAHQRBkP1IjAfa7MRyVBULw68qIX6C2i-WEzsIhF_SCGFa_fdNg1X8IfGHyA-Y_NNmuJEJs7YHIFQ0PStC9yXT4JrPSa_IDdScsmhbhMWMtHRCcB_nb2IYoZKDDx4JV0SDXm7MzYmnt4rA4dB6jzZfBnev4vJ9GL3YsdFVNVN7L4g_J-WLOgz1j8GYtnR6ffpd5jgmkVq_Y9ke6HWKQkDTajDUcBKA_GBu9kffJKLRLe-1v1YPlGQBg0eqKO4kV876vPC0OIB5fQ', description: 'Keep spaces clean. Wipe one small area.' },
    { title: 'Healthy Bite', category: 'Health', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5mh2v5kr11p8hovg5_FqGVIsJT7EzKZylWrS6O0Ma-Zfy2nyh77usuVB0pEDY0xVO66QTHjxnw2pG60HVPJdEneUxRWkQnvgF9Ucd1vuxYtCVdlNGxFNpV2uMpwS_olnDusoZDDJqgVzvOlZ1iiUwcCDr01uVl9j9yEQ5Nwi2S6ZMbZ70qAZTYM0o1QDv_BBRFVKNWSrnEi9SsQ9Ql8G_VooDLkGbpgoFQe7vo097ph9eTvZUIjvulfGDpyEJxTT5Xh6HhJpRGls', description: 'Encourage better nutrition. Add one healthy food.' },
    { title: 'Plan Tomorrow', category: 'Productivity', icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCFxXk_ynOYi58Di_5xkb4eAmBkD9jwVEuyIvAmibjS24khrBaDqm6M2U1tpZCyRy3uz3d1aDPnsR0muu7pZsIp-JeJ7Dp4EN5hUMPguznYXOlHTquzOVq5x0BGqOamk6Wm9uU6hbvoQn6DB4rrVvFfidXtldrrV1UlP0JdXIArw1vezdQy6WfiL9KMBSrQTEJNZMAGvrM1ql83a-rWKzeq1FRo00TdmSApRhMx4tBSV3BcxpMusMjuiKW08tJysTsitMJrUM9g2M', description: 'Increase structure. Write one task for tomorrow.' },
];

const HabitCard: React.FC<{ habit: Habit }> = ({ habit }) => {
    const { toggleHabit, deleteHabit, isHabitDueToday, getNextDueDate } = useGame();
    const navigate = useNavigate();
    const isDone = habit.status === 'done';
    const isDue = isHabitDueToday(habit);
    const nextDate = getNextDueDate(habit);
    const daysSinceCompletion = habit.lastCompletedDate 
        ? Math.ceil(Math.abs(new Date().getTime() - new Date(habit.lastCompletedDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const isNeglected = daysSinceCompletion > 3 && !isDone;

    return (
        <div className={`group relative flex flex-col gap-4 rounded-xl border border-white/10 bg-surface-dark/40 p-4 transition-all hover:bg-surface-dark hover:shadow-lg hover:border-primary/30 ${isDone ? 'opacity-60 bg-surface-dark/20' : ''}`}>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/create?edit=${habit.id}`); }} className="p-1 text-gray-400 hover:text-white bg-black/50 rounded-full"><span className="material-symbols-outlined text-sm">edit</span></button>
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete this habit?')) deleteHabit(habit.id); }} className="p-1 text-red-400 hover:text-red-200 bg-black/50 rounded-full"><span className="material-symbols-outlined text-sm">delete</span></button>
            </div>
            {isNeglected && <div className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-black/20 shadow-sm z-10">Neglected!</div>}
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                    <div className={`size-12 rounded-xl bg-cover bg-center border border-white/10 shadow-inner transition-all ${isDone ? 'grayscale' : ''}`} style={{ backgroundImage: `url("${habit.icon}")` }}></div>
                    <div>
                        <p className={`text-base font-bold text-white ${isDone ? 'line-through text-gray-500' : ''}`}>{habit.title}</p>
                        <div className="flex flex-col">
                             <p className="text-xs text-gray-500">{habit.category} • {habit.frequency}</p>
                             <p className={`text-[10px] font-mono mt-0.5 ${isDue && !isDone ? 'text-primary font-bold' : 'text-gray-600'}`}>Next: {nextDate}</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => toggleHabit(habit.id)} disabled={!isDue} className={`size-8 flex items-center justify-center rounded-full border transition-all ${isDone ? 'bg-primary border-primary text-black' : isDue ? 'bg-transparent border-gray-500 text-transparent hover:border-primary cursor-pointer' : 'bg-transparent border-white/5 text-gray-700 cursor-not-allowed'}`}><span className="material-symbols-outlined text-lg font-bold">check</span></button>
            </div>
            <div className="mt-auto flex items-center gap-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold"><span className="material-symbols-outlined text-sm">monetization_on</span> {habit.rewardGold}</div>
                <div className="flex items-center gap-1 text-purple-400 text-xs font-bold"><span className="material-symbols-outlined text-sm">psychology</span> {habit.rewardXp} XP</div>
            </div>
        </div>
    );
};

const LockedSlot: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-black/20 p-4 min-h-[160px] text-gray-600">
        <span className="material-symbols-outlined text-3xl">lock</span>
        <p className="text-sm font-bold">Shelf Locked</p>
        <Link to="/shop" className="text-xs text-primary underline hover:text-white">Expand in Shop</Link>
    </div>
);

const HabitManager: React.FC = () => {
    const { habits, stats, addHabit, habitIdeas, setHabitIdeas } = useGame();
    const [filter, setFilter] = useState<PotionCategory | 'All'>('All');
    
    const availableRecommendations = useMemo(() => FULL_RECIPE_LIST.filter(recipe => !habits.some(h => h.title === recipe.title)), [habits]);
    const filteredHabits = filter === 'All' ? habits : habits.filter(h => h.category === filter);
    const maxSlots = stats.habitSlots;
    const usedSlots = habits.length;
    
    const slots: React.ReactNode[] = filteredHabits.map(h => <HabitCard key={h.id} habit={h} />);
    
    if (filter === 'All') {
        const availableSlots = maxSlots - usedSlots;
        for (let i = 0; i < availableSlots; i++) {
            slots.push(
                <Link key={`empty-${i}`} to="/create" className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-surface-dark/10 p-4 transition-all hover:border-primary hover:text-primary min-h-[160px] group cursor-pointer">
                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 group-hover:bg-primary/20"><span className="material-symbols-outlined text-xl">add</span></div>
                    <p className="text-sm font-bold text-gray-400 group-hover:text-primary">Brew New Recipe</p>
                </Link>
            );
        }
        const lockedToShow = Math.min(3, Math.max(0, 5 - availableSlots));
        for(let i = 0; i < lockedToShow; i++) slots.push(<LockedSlot key={`locked-${i}`} />);
    }

    const defaultCategories: PotionCategory[] = ['Health', 'Knowledge', 'Housework', 'Productivity', 'Mental Health'];
    const allCategories = ['All', ...defaultCategories, ...stats.customCategories];

    const quickAdd = (recipe: typeof FULL_RECIPE_LIST[0]) => {
        if (habits.length >= maxSlots) { alert("No space for new potions!"); return; }
        addHabit({
            id: Date.now().toString(),
            title: recipe.title,
            description: recipe.description,
            category: recipe.category as PotionCategory,
            frequency: 'daily',
            days: [0,1,2,3,4,5,6],
            rewardGold: 10,
            rewardXp: 10,
            status: 'todo',
            streak: 0,
            completions: 0,
            icon: recipe.icon
        });
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="xl:col-span-3 flex flex-col gap-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-2"><h1 className="text-4xl font-bold text-white font-display">Brewing Station</h1><p className="text-gray-400">Manage your potion production schedule.</p></div>
                    <div className="bg-surface-dark px-4 py-2 rounded-full border border-white/10 flex items-center gap-2"><span className="text-sm text-gray-400">Capacity:</span><span className="text-primary font-bold">{usedSlots} / {maxSlots}</span></div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allCategories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === cat ? 'bg-primary text-black' : 'bg-surface-dark text-gray-400 hover:text-white border border-white/5'}`}>{cat}</button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{slots}</div>
            </div>
            <div className="flex flex-col gap-6">
                <div className="bg-surface-dark p-6 rounded-xl border border-white/5 max-h-[500px] overflow-y-auto">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-yellow-400">tips_and_updates</span>Recommended Recipes</h3>
                    <div className="flex flex-col gap-3">
                        {availableRecommendations.length === 0 ? <p className="text-sm text-gray-500 italic">You have mastered all basic recipes!</p> : availableRecommendations.slice(0, 10).map((r, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-black/20 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2"><div className="size-8 rounded bg-cover" style={{backgroundImage: `url('${r.icon}')`}}></div><div className="flex flex-col"><span className="text-sm text-gray-300">{r.title}</span><span className="text-[10px] text-gray-500">{r.category}</span></div></div>
                                <button onClick={() => quickAdd(r)} className="p-1 hover:text-primary"><span className="material-symbols-outlined">add_circle</span></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#2a2218] p-6 rounded-xl border border-white/5 flex-1 flex flex-col">
                    <h3 className="text-[#dcd0bc] font-bold font-serif mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-sm">edit_note</span>Alchemist's Notes</h3>
                    <textarea value={habitIdeas} onChange={e => setHabitIdeas(e.target.value)} className="flex-1 w-full bg-transparent resize-none outline-none text-[#dcd0bc] font-serif placeholder-[#5c4d3c] text-sm leading-relaxed" placeholder="- New habit: 100 pushups..."/>
                </div>
            </div>
        </div>
    );
};

export default HabitManager;
