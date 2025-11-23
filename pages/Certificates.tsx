
import React from 'react';
import { useGame } from '../context/GameContext';
import { Milestone } from '../types';

const Certificates: React.FC = () => {
    const { historyLogs, stats } = useGame();

    // Calculate current values
    const dailyCommissionCount = historyLogs.filter(l => l.message === 'Daily Commission').length; // or check quests
    const totalHarvests = historyLogs.filter(l => l.type === 'harvest').length;
    const totalGoldEarned = historyLogs.reduce((acc, l) => {
        if (!l.rewardSummary) return acc;
        const match = l.rewardSummary.match(/(\d+)g/);
        return acc + (match ? parseInt(match[1]) : 0);
    }, 0);

    const MILESTONES: Milestone[] = [
        {
            id: 'consistent_brewer',
            title: 'Consistent Brewer',
            description: 'Total daily commissions completed.',
            levels: [
                { threshold: 30, name: 'Novice' },
                { threshold: 90, name: 'Specialist' },
                { threshold: 180, name: 'Expert' },
                { threshold: 365, name: 'Master' },
            ],
            currentValue: dailyCommissionCount
        },
        {
            id: 'wild_gatherer',
            title: 'Wild Gatherer',
            description: 'Total wild harvests completed.',
            levels: [
                { threshold: 25, name: 'Novice' },
                { threshold: 50, name: 'Specialist' },
                { threshold: 100, name: 'Expert' },
                { threshold: 200, name: 'Master' },
            ],
            currentValue: totalHarvests
        },
        {
            id: 'wealth_accumulator',
            title: 'Wealth Accumulator',
            description: 'Total Gold earned (Lifetime).',
            levels: [
                { threshold: 1000, name: 'Novice' },
                { threshold: 5000, name: 'Specialist' },
                { threshold: 20000, name: 'Expert' },
                { threshold: 100000, name: 'Master' },
            ],
            currentValue: totalGoldEarned
        },
        // Add placeholders for other 6 milestones to reach 9 total
        ...Array.from({length: 6}, (_, i) => ({
            id: `milestone_${i}`,
            title: `Mystery Achievement ${i+1}`,
            description: 'Unlock more secrets to reveal.',
            levels: [{threshold: 100, name: 'Novice'}],
            currentValue: 0
        }))
    ];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-white font-display">Certificates of Mastery</h1>
                <p className="text-gray-400">Track your long-term achievements and milestones.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MILESTONES.map(m => {
                    // Find current level
                    let currentLevelName = "Unranked";
                    let nextThreshold = m.levels[0].threshold;
                    let progress = 0;
                    
                    for (let i = 0; i < m.levels.length; i++) {
                        if (m.currentValue >= m.levels[i].threshold) {
                            currentLevelName = m.levels[i].name;
                            nextThreshold = m.levels[i+1]?.threshold || m.levels[i].threshold;
                        } else {
                            nextThreshold = m.levels[i].threshold;
                            break;
                        }
                    }
                    
                    const isMaster = m.currentValue >= m.levels[m.levels.length - 1].threshold;
                    const prevThreshold = m.levels.find(l => l.threshold <= m.currentValue)?.threshold || 0;
                    const range = nextThreshold - prevThreshold;
                    const currentInRange = m.currentValue - prevThreshold;
                    const percent = isMaster ? 100 : Math.min(100, Math.max(0, (currentInRange / range) * 100));

                    return (
                        <div key={m.id} className="bg-surface-dark border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
                             <div className="absolute top-0 right-0 p-4 opacity-5">
                                 <span className="material-symbols-outlined text-8xl">military_tech</span>
                             </div>
                             
                             <div className="relative z-10">
                                 <h3 className="text-white font-bold text-lg mb-1">{m.title}</h3>
                                 <p className="text-gray-400 text-xs mb-4">{m.description}</p>
                                 
                                 <div className="flex items-center justify-between mb-2">
                                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                         currentLevelName === 'Master' ? 'bg-purple-500/20 text-purple-300' :
                                         currentLevelName === 'Expert' ? 'bg-yellow-500/20 text-yellow-300' :
                                         currentLevelName === 'Specialist' ? 'bg-blue-500/20 text-blue-300' :
                                         currentLevelName === 'Novice' ? 'bg-green-500/20 text-green-300' :
                                         'bg-gray-700 text-gray-400'
                                     }`}>{currentLevelName}</span>
                                     <span className="text-xs text-white font-mono">{m.currentValue} / {isMaster ? 'MAX' : nextThreshold}</span>
                                 </div>
                                 
                                 <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                                     <div className="h-full bg-primary transition-all duration-1000" style={{width: `${percent}%`}}></div>
                                 </div>
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Certificates;
