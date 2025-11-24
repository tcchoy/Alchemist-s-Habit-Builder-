
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Habit, PotionCategory } from '../types';
import { renderCategoryIcon, getCategoryStyle } from '../utils/categoryAssets';

const RECIPE_POOL = [
    { title: 'Morning Stretch', category: 'Fitness', description: 'Loosen muscles and wake up your body. Stretch for 1 minute.' },
    { title: 'Hydration Boost', category: 'Diet', description: 'Increase daily water intake. Drink one glass of water.' },
    { title: 'Evening Walk', category: 'Fitness', description: 'Light movement to reduce stiffness. Walk for 5 minutes.' },
    { title: 'Sleep Prep Routine', category: 'Health', description: 'Improve sleep quality. Do one sleep-prep step (e.g., brush teeth, dim lights).' },
    { title: 'Mindful Breathing', category: 'Mental Health', description: 'Reduce stress with controlled breathing. Do 3 slow deep breaths.' },
    { title: 'Gratitude Note', category: 'Mental Health', description: 'Shift mindset by recognizing positives. Write one sentence of gratitude.' },
    { title: 'Emotional Check-in', category: 'Mental Health', description: 'Increase emotional awareness. Pause and name your current emotion.' },
    { title: 'Short Meditation', category: 'Mental Health', description: 'Calm the mind through stillness. Meditate for 1 minute.' },
    { title: 'Read a Page', category: 'Learning', description: 'Build knowledge consistently. Read one page of any book.' },
    { title: 'Micro-Study Session', category: 'Learning', description: 'Review or learn a tiny amount daily. Study for 3 minutes.' },
    { title: 'Skill Practice', category: 'Learning', description: 'Progress a hobby or skill. Practice skill for 2 minutes.' },
    { title: 'Language Spark', category: 'Learning', description: 'Maintain language learning momentum. Learn one new word.' },
    { title: 'Dish Reset', category: 'Housework', description: 'Reduce clutter and prevent pile-up. Wash one dish.' },
    { title: 'Surface Swipe', category: 'Housework', description: 'Keep spaces clean with tiny resets. Wipe one small area.' },
    { title: 'Room Tidy Burst', category: 'Housework', description: 'Maintain order in living areas. Tidy for 2 minutes.' },
    { title: 'Laundry Step', category: 'Housework', description: 'Prevent laundry accumulation. Put one item into laundry bin or fold one item.' },
    { title: 'Healthy Bite Choice', category: 'Diet', description: 'Encourage better nutrition. Add one healthy food to a meal.' },
    { title: 'Digital Declutter', category: 'Mental Health', description: 'Reduce overwhelm from devices. Delete one unused file or photo.' },
    { title: 'Plan Tomorrow', category: 'Learning', description: 'Increase structure and intention. Write one task for tomorrow.' }
];

const HabitCard: React.FC<{ habit: Habit }> = ({ habit }) => {
    const { toggleHabit, deleteHabit, isHabitDueToday, getNextDueDate, stats } = useGame();
    const navigate = useNavigate();
    const isDone = habit.status === 'done';
    const isDue = isHabitDueToday(habit);
    const nextDate = getNextDueDate(habit);
    
    const catStyle = getCategoryStyle(habit.category, stats.customCategories);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to discard the recipe for "${habit.title}"?`)) {
            deleteHabit(habit.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/create?edit=${habit.id}`);
    };

    return (
        <div 
            onClick={() => isDue && toggleHabit(habit.id)}
            className={`group relative flex flex-col gap-3 rounded-xl border border-[#5d4a35] bg-surface-dark/40 p-4 transition-all hover:bg-surface-dark hover:shadow-lg hover:border-primary/30 cursor-pointer ${isDone ? 'opacity-60 bg-surface-dark/20' : ''}`}
        >
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <button onClick={handleEdit} className="p-1.5 text-stone-400 hover:text-white bg-black/80 rounded-full border border-white/10 shadow-lg relative z-50"><span className="material-symbols-outlined text-sm">edit</span></button>
                <button onClick={handleDelete} className="p-1.5 text-red-400 hover:text-red-200 bg-black/80 rounded-full border border-red-900/50 shadow-lg relative z-50"><span className="material-symbols-outlined text-sm">delete</span></button>
            </div>
            
            <div className="flex items-start gap-3">
                {renderCategoryIcon(habit.category, stats.customCategories, "size-12 shrink-0")}
                
                <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold text-white truncate ${isDone ? 'line-through text-stone-500' : ''}`}>{habit.title}</h3>
                    <p className="text-xs text-stone-400 line-clamp-1 mb-1" style={{ color: catStyle.color }}>{habit.category} • {habit.frequency === 'daily' ? 'Daily' : nextDate}</p>
                    <p className="text-xs text-stone-500 italic line-clamp-2">{habit.description}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                 <div className="flex gap-3">
                     <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold"><span className="material-symbols-outlined text-xs">monetization_on</span> {habit.rewardGold}</span>
                     <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><span className="material-symbols-outlined text-xs">psychology</span> {habit.rewardXp}</span>
                 </div>
                 <div className={`size-8 flex items-center justify-center rounded-full border transition-all ${isDone ? 'bg-primary border-primary text-black' : isDue ? 'bg-transparent border-stone-500 text-stone-400 group-hover:border-primary group-hover:text-primary' : 'border-white/5 text-stone-700'}`}>
                     <span className="material-symbols-outlined text-lg font-bold">check</span>
                 </div>
            </div>
        </div>
    );
};

const HabitManager: React.FC = () => {
    const { habits, stats, addHabit, habitIdeas, setHabitIdeas, showToast } = useGame();
    const [filter, setFilter] = useState<PotionCategory | 'All'>('All');
    const navigate = useNavigate();
    
    const recommendedRecipes = useMemo(() => {
        const unused = RECIPE_POOL.filter(recipe => !habits.some(h => h.title === recipe.title));
        return unused.slice(0, 5); 
    }, [habits]);

    const filteredHabits = filter === 'All' ? habits : habits.filter(h => h.category === filter);
    const allCategories = ['All', 'General', 'Learning', 'Fitness', 'Diet', 'Mental Health', 'Housework', ...stats.customCategories.map(c => c.name)];

    const quickAdd = (recipe: typeof RECIPE_POOL[0]) => {
        if (habits.length >= stats.habitSlots) { showToast("Shelf is full! Expand in Marketplace.", 'error'); return; }
        addHabit({
            id: Date.now().toString(),
            title: recipe.title,
            description: recipe.description,
            category: recipe.category as PotionCategory,
            frequency: 'daily',
            interval: 1,
            startDate: new Date().toISOString().split('T')[0],
            rewardGold: 10,
            rewardXp: 10,
            status: 'todo',
            streak: 0,
            completions: 0,
            days: []
        });
    };

    const handleCreateClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (habits.length >= stats.habitSlots) {
            showToast("Potion Shelf is full! Unlock more slots in the Shop.", 'error');
        } else {
            navigate('/create');
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
            <div className="xl:col-span-3 flex flex-col gap-8">
                <div className="flex items-end justify-between">
                    <div><h1 className="text-4xl font-bold text-white font-display">Brewing Station</h1></div>
                    <div className="text-primary font-bold">{habits.length} / {stats.habitSlots} Slots</div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {allCategories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-colors ${filter === cat ? 'bg-primary text-black border-primary' : 'bg-transparent text-stone-400 border-[#5d4a35] hover:border-white/30'}`}>{cat}</button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHabits.map(h => <HabitCard key={h.id} habit={h} />)}
                    
                    <div className="flex flex-col gap-4">
                         <button onClick={handleCreateClick} className="flex-1 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#5d4a35] bg-white/5 p-6 hover:border-primary hover:text-primary transition-colors min-h-[140px]">
                            <span className="material-symbols-outlined text-3xl">add_circle</span>
                            <span className="text-sm font-bold">Brew New Potion</span>
                        </button>
                        {habits.length >= stats.habitSlots && (
                            <Link to="/shop" className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-center text-sm font-bold hover:bg-yellow-500/20">
                                <span className="material-symbols-outlined align-middle mr-2">storefront</span>
                                Expand Shelf in Marketplace
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="bg-surface-dark p-6 rounded-xl border border-[#5d4a35]">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-400">menu_book</span>
                        Recipe Book
                    </h3>
                    <div className="flex flex-col gap-2">
                        {recommendedRecipes.length === 0 && <p className="text-stone-500 text-sm italic">No new recipes found.</p>}
                        {recommendedRecipes.map((r, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/20 hover:bg-white/5 border border-transparent hover:border-white/10 group transition-all">
                                <div className="flex flex-col">
                                    <span className="text-sm text-stone-200 font-bold">{r.title}</span>
                                    <span className="text-[10px] text-stone-500 uppercase">{r.category}</span>
                                </div>
                                <button onClick={() => quickAdd(r)} className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-black flex items-center justify-center transition-colors">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#2a2218] p-6 rounded-xl border border-[#5d4a35] flex-1 flex flex-col min-h-[300px]">
                    <h3 className="text-[#dcd0bc] font-bold font-serif mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">edit_note</span>
                        Alchemist's Notes
                    </h3>
                    <textarea value={habitIdeas} onChange={e => setHabitIdeas(e.target.value)} className="flex-1 w-full bg-transparent resize-none outline-none text-[#dcd0bc] font-serif placeholder-[#5c4d3c] text-sm leading-relaxed" placeholder="Jot down future potion ideas or formula tweaks..."/>
                </div>
            </div>
        </div>
    );
};

export default HabitManager;
