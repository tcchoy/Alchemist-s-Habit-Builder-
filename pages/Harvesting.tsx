
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';

const HARVEST_TIME = 25 * 60;

const Harvesting: React.FC = () => {
    const { claimHarvestReward, stats, historyLogs, MAPS } = useGame();
    const [timeLeft, setTimeLeft] = useState(HARVEST_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [lastReward, setLastReward] = useState<{gold: number, xp: number, gems: number} | null>(null);
    const timerRef = useRef<number | null>(null);

    const currentMap = MAPS[Math.min(stats.harvestMapLevel - 1, 4)];
    
    const harvestStats = useMemo(() => {
        const harvests = historyLogs.filter(l => l.type === 'harvest');
        let totalGold = 0;
        let totalXp = 0;
        let totalGems = 0;
        const recent = harvests.slice(0, 10);
        
        harvests.forEach(l => {
            if (l.rewardSummary) {
                const parts = l.rewardSummary.split(', ');
                parts.forEach(p => {
                    if (p.includes('g')) totalGold += parseInt(p) || 0;
                    if (p.includes('XP')) totalXp += parseInt(p) || 0;
                    if (p.includes('gems')) totalGems += parseInt(p) || 0;
                });
            }
        });
        return { totalGold, totalXp, totalGems, recent };
    }, [historyLogs]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setInterval(() => setTimeLeft(p => p - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setIsFinished(true);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isActive, timeLeft]);

    const handleClaim = () => {
        setLastReward(claimHarvestReward());
    };

    const reset = () => {
        setTimeLeft(HARVEST_TIME);
        setIsFinished(false);
        setIsActive(false);
        setLastReward(null);
    };

    const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-[#5d4a35] pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-white font-display flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-400 text-4xl">forest</span>
                        Wild Harvesting
                    </h1>
                    <p className="text-stone-400 font-serif italic mt-1">"Venture into the unknown to gather essence."</p>
                </div>
                <div className="flex gap-6 bg-surface-dark p-4 rounded-xl border border-[#5d4a35] shadow-lg">
                    <div className="text-right">
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Total Gold</p>
                        <span className="text-yellow-400 font-bold text-lg flex items-center justify-end gap-1">
                            {harvestStats.totalGold} <span className="material-symbols-outlined text-sm">monetization_on</span>
                        </span>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div className="text-right">
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Total Gems</p>
                        <span className="text-pink-400 font-bold text-lg flex items-center justify-end gap-1">
                            {harvestStats.totalGems} <span className="material-symbols-outlined text-sm">diamond</span>
                        </span>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div className="text-right">
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Total XP</p>
                        <span className="text-green-400 font-bold text-lg flex items-center justify-end gap-1">
                            {harvestStats.totalXp} <span className="material-symbols-outlined text-sm">psychology</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* MAP SCROLL VIEW */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">map</span> 
                        Select Region
                    </h3>
                    <span className="text-xs text-stone-500 bg-black/30 px-2 py-1 rounded border border-white/5">Current Map Level: {stats.harvestMapLevel}</span>
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-8 pt-6 px-2 snap-x custom-scrollbar">
                    {MAPS.map((map) => {
                        const isUnlocked = stats.harvestMapLevel >= map.level;
                        const isCurrent = stats.harvestMapLevel === map.level;
                        
                        return (
                            <div key={map.level} className={`relative snap-center shrink-0 w-72 h-96 rounded-xl transition-all duration-300 group ${isUnlocked ? 'hover:-translate-y-2' : ''}`}>
                                {/* Active Cursor Indicator (RPG Style) */}
                                {isCurrent && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
                                        <span className="material-symbols-outlined text-yellow-400 text-4xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{ transform: 'rotate(90deg)' }}>double_arrow</span>
                                    </div>
                                )}

                                {/* Main Card Container */}
                                <div className={`h-full w-full rounded-xl overflow-hidden relative border-2 shadow-2xl ${isCurrent ? 'border-primary shadow-[0_0_25px_rgba(251,191,36,0.4)]' : isUnlocked ? 'border-white/20 hover:border-white/40' : 'border-white/5 grayscale'}`}>
                                    
                                    {/* Background Image with Zoom Effect */}
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: `url("${map.image}")`}}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                    
                                    {/* Locked Overlay */}
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-[2px] z-10">
                                            <span className="material-symbols-outlined text-5xl text-stone-600 mb-2">lock</span>
                                            <span className="text-stone-500 font-bold uppercase tracking-widest text-xs">Locked</span>
                                            <span className="text-stone-600 text-[10px] mt-1">Requires Level {map.level}</span>
                                        </div>
                                    )}

                                    {/* Content Overlay (RPG Stats Box) */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                        <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 p-3 shadow-lg transform transition-transform group-hover:translate-y-0 translate-y-2">
                                            <h4 className={`text-lg font-bold font-serif mb-1 ${isCurrent ? 'text-primary' : 'text-white'}`}>{map.name}</h4>
                                            
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-stone-300 font-mono border border-white/5">LVL {map.level}</span>
                                                {isCurrent && <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold border border-primary/20">ACTIVE</span>}
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-stone-500 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">monetization_on</span> Gold</span>
                                                    <span className="text-yellow-400 font-mono">{map.rewardRange}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-stone-500 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">psychology</span> XP</span>
                                                    <span className="text-green-400 font-mono">{map.xpRange}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-stone-500 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">diamond</span> Gems(rare)</span>
                                                    <span className="text-pink-300 font-mono">0-{map.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TIMER SECTION */}
                <div className="lg:col-span-2 relative aspect-video w-full rounded-2xl overflow-hidden border border-[#5d4a35] bg-black shadow-2xl group">
                     {/* Cinematic Background */}
                     <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-[60s] ease-linear ${isActive ? 'scale-125' : 'scale-100'}`} style={{backgroundImage: `url("${currentMap.image}")`, filter: isActive ? 'brightness(0.6)' : 'brightness(0.4) grayscale(0.5)'}}></div>
                     
                     {/* Cinematic Bars */}
                     <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black to-transparent z-0"></div>
                     <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-0"></div>

                     <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-8">
                         {!isFinished ? (
                             <div className="flex flex-col items-center">
                                <div className="mb-8 relative">
                                    <div className={`text-8xl md:text-9xl font-mono font-bold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-tighter ${isActive ? 'animate-pulse' : ''}`}>
                                        {formatTime(timeLeft)}
                                    </div>
                                    {isActive && <div className="absolute -bottom-4 left-0 right-0 text-center text-primary text-xs uppercase tracking-[0.3em] animate-pulse">Gathering Essence...</div>}
                                </div>
                                
                                <div className="flex gap-6">
                                    <button 
                                        onClick={() => setIsActive(!isActive)} 
                                        className={`px-12 py-4 font-bold rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all transform hover:scale-105 active:scale-95 text-xl flex items-center gap-3 ${isActive ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-primary text-black hover:bg-primary/90'}`}
                                    >
                                        <span className="material-symbols-outlined">{isActive ? 'pause' : 'play_arrow'}</span>
                                        {isActive ? 'Pause' : 'Start Focus'}
                                    </button>
                                    <button onClick={reset} className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur border border-white/10 hover:rotate-180 transition-all duration-500"><span className="material-symbols-outlined">restart_alt</span></button>
                                </div>
                             </div>
                         ) : (
                             <div className="bg-[#2a2218]/90 p-8 rounded-2xl backdrop-blur-md border border-primary/30 w-full max-w-md text-center animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(251,191,36,0.2)]">
                                 {lastReward ? (
                                     <>
                                        <div className="mb-4 inline-flex p-4 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                                            <span className="material-symbols-outlined text-6xl text-yellow-400 animate-bounce">check_circle</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-2 font-display">Harvest Complete</h3>
                                        <p className="text-stone-400 mb-6 italic">You have returned with bounty.</p>
                                        
                                        <div className="flex justify-center gap-4 text-lg mb-8">
                                            <div className="flex flex-col items-center bg-surface-dark p-3 rounded-lg border border-white/10 min-w-[80px]">
                                                <span className="text-yellow-400 font-bold">+{lastReward.gold}</span>
                                                <span className="text-[10px] text-stone-500 uppercase">Gold</span>
                                            </div>
                                            <div className="flex flex-col items-center bg-surface-dark p-3 rounded-lg border border-white/10 min-w-[80px]">
                                                <span className="text-green-400 font-bold">+{lastReward.xp}</span>
                                                <span className="text-[10px] text-stone-500 uppercase">XP</span>
                                            </div>
                                            {lastReward.gems > 0 && (
                                                <div className="flex flex-col items-center bg-primary/10 p-3 rounded-lg border border-primary/30 min-w-[80px]">
                                                    <span className="text-pink-400 font-bold">+{lastReward.gems}</span>
                                                    <span className="text-[10px] text-primary uppercase">Gems</span>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={reset} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors uppercase tracking-widest text-sm">Return to Camp</button>
                                     </>
                                 ) : (
                                     <button onClick={handleClaim} className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-3 text-lg">
                                         <span className="material-symbols-outlined text-2xl">inventory_2</span>
                                         Collect Resources
                                     </button>
                                 )}
                             </div>
                         )}
                     </div>
                </div>

                {/* LOGS */}
                <div className="bg-surface-dark rounded-2xl border border-[#5d4a35] p-0 overflow-hidden h-full flex flex-col">
                    <div className="p-4 border-b border-[#5d4a35] bg-black/20">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-stone-400">history</span>
                            Recent Harvests
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
                        {harvestStats.recent.length === 0 && <p className="text-stone-500 text-sm italic p-4 text-center">No recent activity recorded.</p>}
                        {harvestStats.recent.map((l, i) => (
                            <div key={l.id} className="text-sm p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 flex justify-between items-center transition-colors group">
                                <span className="text-stone-500 text-xs font-mono">{l.date}</span>
                                <span className="text-stone-300 font-mono text-xs group-hover:text-white transition-colors">{l.rewardSummary}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Harvesting;
