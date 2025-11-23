
import React from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const Dashboard: React.FC = () => {
  const { stats, habits, quests, toggleHabit, claimQuestReward, resetDaily, LEVEL_TITLES } = useGame();

  const today = new Date().getDay();
  const todayHabits = habits.filter(h => h.days.includes(today));
  
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const displayQuests = quests.filter(q => {
      if (q.status === 'claimed') return false;
      if (q.type === 'System') return q.autoCheckKey === 'daily_habits' || q.autoCheckKey === 'daily_login';
      if (q.type === 'Custom' && q.deadline) {
          const deadline = new Date(q.deadline);
          return deadline >= now && deadline <= sevenDaysFromNow;
      }
      return false;
  });

  // Progression Info
  const nextTitle = LEVEL_TITLES.find(t => t.level > stats.level)?.title || "Max Rank";
  
  // Calculate Active Days
  const startDate = new Date(stats.startDate);
  const activeDays = Math.ceil(Math.abs(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <style>{`
            @keyframes bubble {
                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                20% { opacity: 0.8; }
                100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
            }
            .bubble {
                position: absolute;
                background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(167, 139, 250, 0.4));
                border-radius: 50%;
                bottom: 20%;
                left: 50%;
                pointer-events: none;
            }
            .bubble:nth-child(1) { width: 15px; height: 15px; animation: bubble 3s infinite ease-in; animation-delay: 0s; left: 45%; }
            .bubble:nth-child(2) { width: 25px; height: 25px; animation: bubble 4s infinite ease-in; animation-delay: 1s; left: 52%; }
            .bubble:nth-child(3) { width: 10px; height: 10px; animation: bubble 2.5s infinite ease-in; animation-delay: 2s; left: 48%; }
        `}</style>

      {/* Header Stats */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold text-white font-display">{stats.shopName}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span> Est. {stats.startDate}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> Active: {activeDays} Days</span>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <button onClick={resetDaily} className="text-xs text-gray-600 hover:text-primary underline">[Dev: Reset Daily]</button>
          <div className="flex flex-1 md:flex-none gap-4">
            <div className="flex flex-1 min-w-[120px] flex-col gap-1 rounded-2xl bg-surface-dark p-4 border border-white/5">
              <p className="text-xs font-bold uppercase text-gray-500">Gold</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">monetization_on</span>
                <p className="text-2xl font-bold text-white tracking-tight">{stats.gold}</p>
              </div>
            </div>
            <div className="flex flex-1 min-w-[120px] flex-col gap-1 rounded-2xl bg-surface-dark p-4 border border-white/5">
              <p className="text-xs font-bold uppercase text-gray-500">Gems</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">diamond</span>
                <p className="text-2xl font-bold text-white tracking-tight">{stats.gems}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* LARGE Potion Shop Scene with Decoration Overlays */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl group h-[450px]">
        {/* Background */}
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] group-hover:scale-105"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBq4xWpmQRt5lBVU85CAq7qk2dcSd9iFvSdzrHh3CUyyH23yDLJwjRPYMPoaOSdXX1mfoi0z0eFZCW2Muz-J-jcfuXgrydEmLqv1w7xcSHz5S2kacqpd8gybLf7vtTS34yVA3kJLJd_HettxeDdW1yKIVkf8Xk4EPk75mSLtbdcQlaoj5hKD4wabs8NchGkvC2XGpgaZERK4SSBnCtcv_djEO75XEPVm6lKlQzyfLkSMSwsQ2_IW06riearuBCmz8Fm0AiAJM-nEO4")' }}
        >
             <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-transparent to-transparent"></div>
        </div>

        {/* --- DECORATIONS --- */}
        {/* Shelves Overlay */}
        {stats.purchasedDecorations.shelves === 'oak' && (
            <div className="absolute top-10 right-10 w-64 h-64 bg-contain bg-no-repeat opacity-90 pointer-events-none drop-shadow-2xl" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAwAfIJZLrLZ7tKAtuC1-Lt0y-D7hCdmyMhkQ1VPEMKiSwq_9Ebd6sc6ekc6egKoTO1b1LxI9dvQam4T696nT9-gg5HKTXUGnQ5TMAdblHbeOutLVkcPrEzLsaOyK0j7t1n9Lg3AL-z3BSwPNutQJ-glco8jtZaJVfxb7uQfpz5ugaozDru1GKKfvdpAtbd26ydy4I2nIi8QN91i2869ROq5LxW4vPALzb45i2nQujHhVEzvSxGtzcEcaXPvZb_OZH2bsIYYOMt4UQ")'}}></div>
        )}
        
        {/* Cauldron / Pot Overlay */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-48 pointer-events-none">
             {/* Standard Cauldron Visual - Using emoji or simple shape if no image asset */}
             <div className={`w-full h-full bg-contain bg-center bg-no-repeat drop-shadow-[0_0_30px_rgba(167,139,250,0.6)] ${
                 stats.purchasedDecorations.cauldron === 'golden' ? 'hue-rotate-[40deg] brightness-125' : ''
             }`} style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCCFxXk_ynOYi58Di_5xkb4eAmBkD9jwVEuyIvAmibjS24khrBaDqm6M2U1tpZCyRy3uz3d1aDPnsR0muu7pZsIp-JeJ7Dp4EN5hUMPguznYXOlHTquzOVq5x0BGqOamk6Wm9uU6hbvoQn6DB4rrVvFfidXtldrrV1UlP0JdXIArw1vezdQy6WfiL9KMBSrQTEJNZMAGvrM1ql83a-rWKzeq1FRo00TdmSApRhMx4tBSV3BcxpMusMjuiKW08tJysTsitMJrUM9g2M")'}}></div>
             
             {/* Bubbles */}
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
        </div>

        {/* Foreground Info */}
        <div className="relative z-10 flex h-full flex-col justify-end p-8">
          <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
             <div className="flex items-center gap-6 mb-4">
                <div className="size-16 rounded-2xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary backdrop-blur-sm shadow-[0_0_15px_rgba(167,139,250,0.3)]">
                    <div className="flex flex-col items-center">
                         <span className="text-xs uppercase font-bold">Level</span>
                         <span className="text-3xl font-black">{stats.level}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                        <h2 className="text-2xl font-bold text-white">{stats.title}</h2>
                        <p className="text-xs text-gray-400">Next: <span className="text-white font-bold">{nextTitle}</span></p>
                    </div>
                    
                    <div className="h-4 w-full overflow-hidden rounded-full bg-black/50 border border-white/5">
                        <div className="h-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(167,139,250,0.5)]" style={{ width: `${(stats.xp / stats.maxXp) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs font-mono text-gray-400">
                        <span>{stats.xp} XP</span>
                        <span>{stats.maxXp} XP</span>
                    </div>
                </div>
             </div>
             
             {/* Multiplier Badge */}
             {Object.keys(stats.categoryMultipliers).length > 0 && (
                 <div className="flex gap-2 mt-2">
                     {Object.entries(stats.categoryMultipliers).map(([cat, mult]) => (
                         <span key={cat} className="text-[10px] bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded border border-yellow-500/30 font-bold">
                             {cat} x{mult} Active
                         </span>
                     ))}
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">potions</span>
                     Today's Brews
                 </h2>
                 <Link to="/habits" className="text-sm text-gray-400 hover:text-white">Manage</Link>
             </div>
             <div className="flex flex-col gap-3">
                 {todayHabits.length === 0 && (
                     <div className="p-6 rounded-xl bg-surface-dark border border-white/5 text-center text-gray-500 italic">
                         No potions scheduled for today.
                     </div>
                 )}
                 {todayHabits.map(h => (
                     <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-dark border border-white/5 hover:border-primary/30 transition-all">
                         <div className="flex items-center gap-3">
                             <div className={`size-10 rounded-lg bg-cover bg-center ${h.status === 'done' ? 'grayscale opacity-50' : ''}`} style={{backgroundImage: `url("${h.icon}")`}}></div>
                             <div className="flex flex-col">
                                 <span className={`font-bold text-white text-sm ${h.status === 'done' ? 'line-through text-gray-500' : ''}`}>{h.title}</span>
                                 <span className="text-xs text-gray-400">{h.category}</span>
                             </div>
                         </div>
                         <button 
                            onClick={() => toggleHabit(h.id)}
                            className={`size-8 flex items-center justify-center rounded-full border ${h.status === 'done' ? 'bg-primary border-primary text-black' : 'border-gray-600 hover:border-primary text-transparent'}`}
                         >
                             <span className="material-symbols-outlined text-base font-bold">check</span>
                         </button>
                     </div>
                 ))}
             </div>
        </div>

        <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <span className="material-symbols-outlined text-yellow-400">assignment</span>
                     Active Requests
                 </h2>
                 <Link to="/quests" className="text-sm text-gray-400 hover:text-white">View Board</Link>
             </div>
             <div className="flex flex-col gap-3">
                {displayQuests.map(q => (
                    <div key={q.id} className="p-4 rounded-xl bg-surface-dark border-l-4 border-l-yellow-500 border-y border-r border-white/5 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                    {q.title}
                                    {q.deadline && <span className="text-[10px] text-red-400 border border-red-400/30 px-1 rounded">Due: {q.deadline}</span>}
                                </h3>
                                <p className="text-xs text-gray-400">{q.description}</p>
                            </div>
                            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-yellow-200">
                                {q.progress}/{q.maxProgress}
                            </span>
                        </div>
                        {q.status === 'completed' ? (
                            <button onClick={() => claimQuestReward(q.id)} className="mt-1 w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded animate-pulse">
                                Claim Reward
                            </button>
                        ) : (
                            <div className="w-full h-1.5 bg-black/40 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{width: `${(q.progress / q.maxProgress) * 100}%`}}></div>
                            </div>
                        )}
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
