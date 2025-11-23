
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const HARVEST_TIME = 25 * 60; // 25 minutes

const Harvesting: React.FC = () => {
    const { claimHarvestReward } = useGame();
    const [timeLeft, setTimeLeft] = useState(HARVEST_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [lastReward, setLastReward] = useState<{gold: number, xp: number} | null>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setIsFinished(true);
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setIsFinished(false);
        setTimeLeft(HARVEST_TIME);
        setLastReward(null);
    };

    const handleClaim = () => {
        const reward = claimHarvestReward();
        setLastReward(reward);
        // Delay reset so user sees reward, or just show it and let them click reset
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
            <div className="relative min-h-[80vh] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                {/* Dynamic Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear"
                    style={{ 
                        backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                    }}
                >
                     <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                </div>

                <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center">
                    <div className="mb-8">
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight mb-2 drop-shadow-lg">
                            Wild Harvesting
                        </h1>
                        <p className="text-xl text-primary font-medium">
                            {isActive ? 'Gathering ingredients...' : 'Ready to venture into the woods?'}
                        </p>
                    </div>

                    {/* Timer Circle */}
                    <div className="relative flex items-center justify-center mb-12">
                        <svg className="size-80 md:size-96 -rotate-90 transform">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className="stroke-white/10 fill-none"
                                strokeWidth="12"
                            />
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className={`fill-none transition-all duration-1000 ease-linear ${isActive ? 'stroke-primary' : 'stroke-gray-500'}`}
                                strokeWidth="12"
                                strokeDasharray="283" 
                                strokeDashoffset={283 - (283 * timeLeft) / HARVEST_TIME} 
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl md:text-8xl font-mono font-bold text-white tracking-widest">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    {!isFinished ? (
                        <div className="flex gap-6">
                            <button 
                                onClick={toggleTimer}
                                className={`h-16 px-12 rounded-full text-xl font-bold transition-all transform hover:scale-105 ${
                                    isActive 
                                    ? 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20' 
                                    : 'bg-primary text-background-dark shadow-[0_0_30px_rgba(25,230,111,0.4)]'
                                }`}
                            >
                                {isActive ? 'Pause' : 'Start Harvest'}
                            </button>
                            <button 
                                onClick={resetTimer}
                                className="h-16 w-16 rounded-full bg-white/5 text-white border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition-colors flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-2xl">restart_alt</span>
                            </button>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                             {lastReward ? (
                                 <div className="text-center">
                                     <p className="text-white text-2xl font-bold mb-2">You found:</p>
                                     <div className="flex gap-4 text-xl">
                                         <span className="text-yellow-400 font-bold">+{lastReward.gold} Gold</span>
                                         <span className="text-green-400 font-bold">+{lastReward.xp} XP</span>
                                     </div>
                                     <button 
                                        onClick={resetTimer}
                                        className="mt-6 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold"
                                     >
                                         Harvest Again
                                     </button>
                                 </div>
                             ) : (
                                <button 
                                    onClick={handleClaim}
                                    className="h-16 px-12 rounded-full bg-yellow-400 text-black text-xl font-bold shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-bounce"
                                >
                                    Claim Random Loot
                                </button>
                             )}
                         </div>
                    )}

                    <div className="mt-12 p-4 bg-black/40 rounded-xl border border-white/10 backdrop-blur-md max-w-md">
                        <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-primary">info</span> Harvest Guide
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Focus for 25 minutes. Rewards are randomized (10-50 Gold/XP). Don't leave the clearing!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Harvesting;
