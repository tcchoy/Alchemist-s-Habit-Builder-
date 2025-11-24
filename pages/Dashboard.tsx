
import React from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { renderCategoryIcon } from '../utils/categoryAssets';
import { getQuestAvatar } from '../utils/questAssets';

const Dashboard: React.FC = () => {
  const { stats, habits, quests, toggleHabit, claimQuestReward, resetDaily, LEVEL_TITLES } = useGame();

  const today = new Date().getDay();
  // Use context helper for isDue check
  const { isHabitDueToday } = useGame();
  const todayHabits = habits.filter(h => isHabitDueToday(h));
  
  const now = new Date();
  
  // Normalize dates for comparison (Start of day)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const sevenDaysFromNow = new Date(todayStart);
  sevenDaysFromNow.setDate(todayStart.getDate() + 7);

  const displayQuests = quests.filter(q => {
      const isClaimed = q.status === 'claimed';
      if (isClaimed) return false;

      // 1. Daily Commission (ID specific or Title specific)
      if (q.id === 'sq_daily_commission') return true;

      // 2. Custom Quests due in < 7 days (Active or Completed), Including Today
      if (q.type === 'Custom' && q.deadline) {
          const deadlineDate = new Date(q.deadline);
          // Normalize deadline to ignore time, ensuring "today" is included
          deadlineDate.setHours(0, 0, 0, 0); 
          
          return deadlineDate >= todayStart && deadlineDate <= sevenDaysFromNow;
      }
      
      return false;
  });

  const nextTitle = LEVEL_TITLES.find(t => t.level > stats.level)?.title || "Max Rank";
  const startDate = new Date(stats.startDate);
  const activeDays = Math.ceil(Math.abs(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      {/* Header Stats */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold text-white font-display">{stats.shopName}</h1>
          <div className="flex items-center gap-4 text-sm text-stone-400">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span> Est. {stats.startDate}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> Active: {activeDays} Days</span>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-1 md:flex-none gap-4">
            <div className="flex flex-1 min-w-[120px] flex-col gap-1 rounded-2xl bg-surface-dark p-4 border border-[#5d4a35]">
              <p className="text-xs font-bold uppercase text-stone-500">Gold</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">monetization_on</span>
                <p className="text-2xl font-bold text-white tracking-tight">{stats.gold}</p>
              </div>
            </div>
            <div className="flex flex-1 min-w-[120px] flex-col gap-1 rounded-2xl bg-surface-dark p-4 border border-[#5d4a35]">
              <p className="text-xs font-bold uppercase text-stone-500">Gems</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-pink-400">diamond</span>
                <p className="text-2xl font-bold text-white tracking-tight">{stats.gems}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SHOP SCENE */}
      <div className="w-full bg-surface-dark p-2 rounded-3xl border border-[#5d4a35] shadow-2xl">
          <div className="relative w-full aspect-[21/9] md:h-[500px] overflow-hidden rounded-2xl bg-black">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-105"
                style={{ backgroundImage: 'url("https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-/refs/heads/main/public/assets/shop-background.png")' }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            {/* Shelf Overlays based on purchase */}
            {stats.purchasedDecorations?.shelves === 'oak' && (
                 <div className="absolute top-10 right-10 w-32 h-64 bg-[url('https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-/refs/heads/main/public/assets/oak-shelf.png')] bg-contain bg-no-repeat opacity-90"></div>
            )}
            
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="bg-[#2a2218]/80 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4">
                     <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/50">
                         {stats.level}
                     </div>
                     <div>
                         <h2 className="text-xl font-bold text-white">{stats.title}</h2>
                         <div className="w-32 h-2 bg-stone-700 rounded-full mt-1 overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${(stats.xp / stats.maxXp) * 100}%` }}></div>
                         </div>
                         <p className="text-[10px] text-stone-400 mt-1">Next: {nextTitle}</p>
                     </div>
                </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Potions List */}
        <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">science</span>
                     Today's Brews
                 </h2>
                 <Link to="/habits" className="text-sm text-stone-400 hover:text-white">Manage Potions</Link>
             </div>
             <div className="flex flex-col gap-3">
                 {todayHabits.length === 0 && (
                     <div className="p-8 rounded-xl bg-surface-dark border border-[#5d4a35] text-center text-stone-500 italic border-dashed">
                         All brewing done for today!
                     </div>
                 )}
                 {todayHabits.map(h => (
                     <div key={h.id} className="group flex items-start justify-between p-4 rounded-xl bg-surface-dark border border-[#5d4a35] hover:border-primary/30 transition-all hover:bg-white/5">
                         <div className="flex gap-4">
                             {renderCategoryIcon(h.category, stats.customCategories, "size-12 shrink-0")}
                             <div className="flex flex-col">
                                 <div className="flex items-center gap-2">
                                    <span className={`font-bold text-white text-base ${h.status === 'done' ? 'line-through text-stone-500' : ''}`}>{h.title}</span>
                                    {h.status === 'done' && <span className="text-green-400 text-xs font-bold bg-green-400/10 px-1.5 py-0.5 rounded">BREWED</span>}
                                 </div>
                                 <span className="text-xs text-primary font-medium mb-1">{h.category}</span>
                                 <p className="text-xs text-stone-400 line-clamp-1">{h.description}</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => toggleHabit(h.id)}
                            className={`size-10 shrink-0 flex items-center justify-center rounded-full border transition-all ${h.status === 'done' ? 'bg-primary border-primary text-black' : 'border-stone-600 hover:border-primary text-transparent hover:text-primary'}`}
                         >
                             <span className="material-symbols-outlined text-xl font-bold">check</span>
                         </button>
                     </div>
                 ))}
             </div>
        </div>

        {/* Quest List */}
        <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <span className="material-symbols-outlined text-yellow-400">assignment</span>
                     Important Requests
                 </h2>
                 <Link to="/quests" className="text-sm text-stone-400 hover:text-white">View Board</Link>
             </div>
             <div className="flex flex-col gap-3">
                {displayQuests.length === 0 && <div className="p-6 text-center text-stone-500 italic">No urgent notices.</div>}
                {displayQuests.map(q => (
                    <div key={q.id} className={`p-4 rounded-xl bg-surface-dark border-l-4 ${q.status === 'completed' ? 'border-l-green-400 border-green-400/20' : 'border-l-yellow-500'} border-y border-r border-[#5d4a35] flex items-start gap-3 relative overflow-hidden`}>
                        <img src={getQuestAvatar(q.id)} alt="Customer" className="size-10 rounded-full bg-stone-700 border border-stone-600 object-cover" />
                        <div className="flex-1 min-w-0 flex flex-col gap-1 z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                        {q.title}
                                        {q.deadline && <span className="text-[10px] text-red-400 border border-red-400/30 px-1 rounded">Due: {q.deadline}</span>}
                                    </h3>
                                    <p className="text-xs text-stone-400 truncate">{q.description}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${q.status === 'completed' ? 'bg-green-400 text-black' : 'bg-white/10 text-yellow-200'}`}>
                                    {q.status === 'completed' ? 'Done' : `${q.progress}/${q.maxProgress}`}
                                </span>
                            </div>
                            
                            {q.status === 'completed' ? (
                                <button onClick={() => claimQuestReward(q.id)} className="relative z-10 mt-1 w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded shadow-lg shadow-yellow-500/20">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">celebration</span>
                                    Claim Reward
                                </button>
                            ) : (
                                <div className="w-full h-1.5 bg-black/40 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-yellow-500 transition-all duration-500" style={{width: `${(q.progress / q.maxProgress) * 100}%`}}></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;