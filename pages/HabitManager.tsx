
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

const HabitRecipeCard: React.FC<{ habit: Habit }> = ({ habit }) => {
    const { toggleHabit, deleteHabit, isHabitDueToday, getNextDueDate, stats } = useGame();
    const navigate = useNavigate();
    const isDone = habit.status === 'done';
    const isDue = isHabitDueToday(habit);
    const nextDate = getNextDueDate(habit);
    
    const catStyle = getCategoryStyle(habit.category, stats.customCategories);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Discard the formula for "${habit.title}"? This cannot be undone.`)) {
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
            className={`group relative flex flex-col p-5 rounded-sm transition-all duration-300 cursor-pointer 
            ${isDone 
                ? 'opacity-70 grayscale-[0.5] bg-[#e3ded1] border-2 border-dashed border-[#a89f91]' 
                : 'bg-[#fff9f0] border-2 border-[#8b7355] shadow-[4px_4px_0px_0px_rgba(93,74,53,0.15)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(93,74,53,0.2)]'
            }`}
        >
            {/* Corner Fold Effect */}
            <div className="absolute top-0 right-0 border-t-[16px] border-r-[16px] border-t-[#f3ebd9] border-r-transparent shadow-sm"></div>

            {/* Edit/Delete Overlay (Hover) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={handleEdit} className="p-1 text-[#8b7355] hover:text-[#5d4a35] hover:bg-[#ede0c9] rounded"><span className="material-symbols-outlined text-base">edit</span></button>
                <button onClick={handleDelete} className="p-1 text-red-400 hover:text-red-600 hover:bg-[#ede0c9] rounded"><span className="material-symbols-outlined text-base">delete</span></button>
            </div>
            
            {/* Header: Icon & Title */}
            <div className="flex items-start gap-4 mb-3 border-b border-[#d4c5a9] pb-3 border-dashed">
                <div className="relative">
                    {renderCategoryIcon(habit.category, stats.customCategories, "size-14 shadow-inner bg-[#fdf6e3] border border-[#d4c5a9]")}
                    {isDone && <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-[#fff9f0]"><span className="material-symbols-outlined text-sm font-bold">check</span></div>}
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                    <h3 className={`text-lg font-bold text-[#4a3b2a] truncate font-serif leading-tight ${isDone ? 'line-through decoration-[#8b7355]' : ''}`}>{habit.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b7355]">{habit.category}</span>
                        {habit.frequency === 'daily' && <span className="text-[10px] bg-[#ede0c9] text-[#5d4a35] px-1 rounded">Daily</span>}
                    </div>
                </div>
            </div>

            {/* Body: Description */}
            <div className="flex-1 mb-4">
                <p className="text-sm text-[#5d4a35] font-serif italic leading-relaxed line-clamp-2">"{habit.description}"</p>
                <div className="mt-2 text-xs text-[#8b7355] flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">event</span>
                    <span className="font-medium">Next Batch: {isDone ? 'Completed' : nextDate}</span>
                </div>
            </div>

            {/* Footer: Rewards & Brew Button */}
            <div className="flex items-center justify-between mt-auto bg-[#f8f1e3] p-2 rounded border border-[#ede0c9]">
                 <div className="flex gap-3">
                     <span className="flex items-center gap-1 text-[#b58900] text-xs font-bold font-mono"><span className="material-symbols-outlined text-[14px]">monetization_on</span> {habit.rewardGold}</span>
                     <span className="flex items-center gap-1 text-[#5b7c25] text-xs font-bold font-mono"><span className="material-symbols-outlined text-[14px]">psychology</span> {habit.rewardXp}</span>
                 </div>
                 
                 {/* Brew Status Indicator */}
                 <div className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${isDone ? 'bg-[#d4c5a9] text-white border-transparent' : isDue ? 'bg-primary text-[#3e3223] border-primary animate-pulse' : 'text-[#a89f91] border-transparent'}`}>
                     {isDone ? 'Brewed' : isDue ? 'Brew Ready' : 'Cooldown'}
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
        return RECIPE_POOL.filter(recipe => !habits.some(h => h.title === recipe.title));
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
            showToast("Formula Book is full! Buy pages in the Shop.", 'error');
        } else {
            navigate('/create');
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-20">
            {/* LEFT PAGE: ACTIVE RECIPES */}
            <div className="xl:col-span-9 flex flex-col gap-6">
                
                {/* Header Section */}
                <div className="flex items-center justify-between border-b-4 border-double border-[#5d4a35] pb-4 bg-[#fdf6e3] p-6 rounded-t-xl shadow-sm relative">
                    {/* Decorative Binding Holes */}
                    <div className="absolute top-4 left-2 flex flex-col gap-2">
                        {[1,2,3].map(i => <div key={i} className="size-3 rounded-full bg-[#2a2218] shadow-inner"></div>)}
                    </div>

                    <div className="pl-6">
                        <h1 className="text-4xl font-black text-[#3e3223] font-serif tracking-tight">Grimoire of Formulas</h1>
                        <p className="text-[#8b7355] font-serif italic">"A disciplined alchemist documents every brew."</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                        <div className="bg-[#fff9f0] px-4 py-2 rounded border border-[#8b7355] text-[#5d4a35] font-bold font-mono text-xs shadow-sm">
                            <span className="uppercase tracking-widest text-[#8b7355] mr-2">Page Capacity</span>
                            <span className="text-lg">{habits.length} / {stats.habitSlots}</span>
                        </div>
                    </div>
                </div>
                
                {/* Tabs / Bookmarks */}
                <div className="flex gap-1 overflow-x-auto px-4 -mb-2 z-10 custom-scrollbar pb-2">
                    {allCategories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setFilter(cat)} 
                            className={`
                                px-5 py-2 rounded-t-lg text-sm font-bold font-serif border-t border-x relative top-[1px] whitespace-nowrap transition-all
                                ${filter === cat 
                                    ? 'bg-[#fdf6e3] text-[#3e3223] border-[#5d4a35] h-11 translate-y-0 z-20 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]' 
                                    : 'bg-[#2a2218] text-[#8b7355] border-[#3e3223] h-9 mt-2 hover:bg-[#3e3223] z-10'
                                }
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Main Content Area (The Page) */}
                <div className="bg-[#fdf6e3] min-h-[600px] p-8 rounded-b-xl rounded-tr-xl border border-[#5d4a35] shadow-xl relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {filteredHabits.map(h => <HabitRecipeCard key={h.id} habit={h} />)}
                        
                        {/* New Formula Button */}
                        <button 
                            onClick={handleCreateClick} 
                            className="group flex flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-[#a89f91] bg-[#f8f1e3]/50 p-6 hover:border-primary hover:bg-[#fff9f0] hover:shadow-md transition-all min-h-[200px]"
                        >
                            <div className="size-12 rounded-full bg-[#ede0c9] flex items-center justify-center text-[#8b7355] group-hover:bg-primary group-hover:text-black transition-colors">
                                <span className="material-symbols-outlined text-3xl">edit_square</span>
                            </div>
                            <span className="text-[#5d4a35] font-bold font-serif text-lg">Inscribe New Formula</span>
                            <span className="text-[#8b7355] text-xs">Add a custom habit</span>
                        </button>

                        {habits.length >= stats.habitSlots && (
                            <Link to="/shop" className="col-span-full mt-4 p-4 rounded bg-[#fff9f0] border border-yellow-600/30 text-yellow-700 text-center font-serif italic hover:bg-yellow-50 transition-colors">
                                "The grimoire is full. Acquire more pages at the Marketplace."
                            </Link>
                        )}
                    </div>

                    {/* Background Lines for "Paper" effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(#000000_1px,transparent_1px)] bg-[size:100%_32px]"></div>
                </div>
            </div>

            {/* RIGHT PAGE: SIDEBAR / DISCOVERY */}
            <div className="xl:col-span-3 flex flex-col gap-6">
                
                {/* Recipe Discovery (Scroll) */}
                <div className="bg-[#fff9f0] p-1 rounded-sm shadow-lg border border-[#d4c5a9] rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="border border-dashed border-[#8b7355] p-4 rounded-sm h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#d4c5a9]">
                            <span className="material-symbols-outlined text-[#b58900]">lightbulb</span>
                            <h3 className="text-[#3e3223] font-bold font-serif text-lg">Discovery</h3>
                        </div>
                        
                        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {recommendedRecipes.length === 0 && <p className="text-[#8b7355] text-sm italic">You have learned all basic formulas.</p>}
                            {recommendedRecipes.map((r, i) => (
                                <div key={i} className="group relative p-3 bg-white border border-[#ede0c9] shadow-sm hover:border-primary transition-all">
                                    <h4 className="font-bold text-[#4a3b2a] font-serif text-sm">{r.title}</h4>
                                    <span className="text-[10px] text-[#8b7355] uppercase tracking-wide block mb-2">{r.category}</span>
                                    <button onClick={() => quickAdd(r)} className="w-full py-1.5 bg-[#fdf6e3] text-[#5d4a35] text-xs font-bold border border-[#d4c5a9] hover:bg-primary hover:text-black hover:border-primary transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">add</span> Learn
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sticky Notes */}
                <div className="bg-[#fefce8] p-6 shadow-lg rotate-[-1deg] hover:rotate-0 transition-transform duration-300 border-t-8 border-[#eab308]/20 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-12 bg-[#eab308]/20 rotate-12 backdrop-blur-sm"></div>
                    <h3 className="text-[#713f12] font-bold font-serif mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">edit_note</span>
                        Field Notes
                    </h3>
                    <textarea 
                        value={habitIdeas} 
                        onChange={e => setHabitIdeas(e.target.value)} 
                        className="w-full h-40 bg-transparent resize-none outline-none text-[#422006] font-handwriting text-sm leading-6 placeholder-[#ca8a04]/50 custom-scrollbar" 
                        placeholder="Scribble brewing ideas here..."
                        style={{ backgroundImage: 'linear-gradient(transparent 1.5rem, #fde04720 1.5rem)', backgroundSize: '100% 1.55rem', lineHeight: '1.55rem' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default HabitManager;
