
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
        const recent = harvests.slice(0, 10);
        
        harvests.forEach(l => {
            if (l.rewardSummary) {
                const parts = l.rewardSummary.split(', ');
                parts.forEach(p => {
                    if (p.includes('g')) totalGold += parseInt(p) || 0;
                    if (p.includes('XP')) totalXp += parseInt(p) || 0;
                });
            }
        });
        return { totalGold, totalXp, recent };
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
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white font-display">Wild Harvesting</h1>
                    <p className="text-gray-400">Focus to gather rare ingredients from the wilds.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400 font-bold uppercase">Total Yield</p>
                    <div className="flex gap-4">
                        <span className="text-yellow-400 font-bold">{harvestStats.totalGold}g</span>
                        <span className="text-green-400 font-bold">{harvestStats.totalXp} XP</span>
                    </div>
                </div>
            </header>

            {/* MAP SCROLL VIEW */}
            <div className="mb-8">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">map</span> Region Map</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
                    {MAPS.map((map) => {
                        const isUnlocked = stats.harvestMapLevel >= map.level;
                        const isCurrent = stats.harvestMapLevel === map.level;
                        return (
                            <div key={map.level} className={`snap-center shrink-0 w-64 h-80 rounded-2xl relative overflow-hidden border-2 transition-all group ${isUnlocked ? 'border-white/10' : 'border-white/5 grayscale opacity-60'} ${isCurrent ? 'border-primary ring-2 ring-primary/30 opacity-100 grayscale-0' : ''}`}>
                                <div className="absolute inset-0 bg-cover bg-center pixelated" style={{backgroundImage: `url("${map.image}")`}}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><span className="material-symbols-outlined text-4xl text-gray-500">lock</span></div>}
                                    <h4 className="text-xl font-bold text-white mb-1 font-serif">{map.name}</h4>
                                    <p className="text-xs text-gray-300 mb-2">Level {map.level}</p>
                                    
                                    <div className="bg-black/60 backdrop-blur rounded p-2 text-xs space-y-1">
                                        <p className="text-gray-400 uppercase text-[10px] font-bold">Expected</p>
                                        <p className="text-yellow-400 font-mono">{map.rewardRange}</p>
                                        <p className="text-purple-300 font-mono text-[10px]">1-{map.level} Gems (10%)</p>
                                    </div>
                                    
                                    {isCurrent && <div className="absolute top-4 right-4 bg-primary text-black text-xs font-bold px-2 py-1 rounded">Active</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TIMER SECTION */}
                <div className="lg:col-span-2 relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center shadow-2xl">
                     {/* Background Image based on Current Map */}
                     <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-[60s] ${isActive ? 'scale-110' : 'scale-100'}`} style={{backgroundImage: `url("${currentMap.image}")`, filter: 'brightness(0.5)'}}></div>
                     
                     <div className="relative z-10 flex flex-col items-center p-8 w-full max-w-md">
                         {!isFinished ? (
                             <>
                                <div className="text-9xl font-mono font-bold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] mb-8 tracking-tighter">{formatTime(timeLeft)}</div>
                                <div className="flex gap-4">
                                    <button onClick={() => setIsActive(!isActive)} className="px-10 py-4 bg-primary text-black font-bold rounded-full hover:bg-primary/90 shadow-[0_0_20px_rgba(167,139,250,0.4)] transition-all text-xl">{isActive ? 'Pause' : 'Start Focus'}</button>
                                    <button onClick={reset} className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur"><span className="material-symbols-outlined">restart_alt</span></button>
                                </div>
                             </>
                         ) : (
                             <div className="bg-surface-dark/90 p-8 rounded-2xl backdrop-blur-md border border-white/10 w-full text-center animate-in zoom-in duration-300">
                                 {lastReward ? (
                                     <>
                                        <span className="material-symbols-outlined text-6xl text-yellow-400 mb-4 animate-bounce">check_circle</span>
                                        <h3 className="text-2xl font-bold text-white mb-4">Harvest Successful!</h3>
                                        <div className="flex justify-center gap-6 text-xl mb-8">
                                            <span className="text-yellow-400 font-bold bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/20">+{lastReward.gold}g</span>
                                            <span className="text-green-400 font-bold bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20">+{lastReward.xp} XP</span>
                                            {lastReward.gems > 0 && (
                                                <span className="text-purple-400 font-bold bg-purple-400/10 px-4 py-2 rounded-lg border border-purple-400/20">+{lastReward.gems} Gems</span>
                                            )}
                                        </div>
                                        <button onClick={reset} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors">Return to Camp</button>
                                     </>
                                 ) : (
                                     <button onClick={handleClaim} className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform">
                                         <span className="material-symbols-outlined align-middle mr-2">inventory_2</span>
                                         Collect Resources
                                     </button>
                                 )}
                             </div>
                         )}
                     </div>
                </div>

                {/* LOGS */}
                <div className="bg-surface-dark rounded-2xl border border-white/5 p-6 h-full flex flex-col">
                    <h3 className="text-white font-bold mb-4">Recent Harvests</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {harvestStats.recent.length === 0 && <p className="text-gray-500 text-sm italic">No recent activity.</p>}
                        {harvestStats.recent.map(l => (
                            <div key={l.id} className="text-sm p-3 rounded bg-black/20 border border-white/5 flex justify-between items-center">
                                <span className="text-gray-400">{l.date}</span>
                                <span className="text-white font-mono text-xs">{l.rewardSummary}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Harvesting;
