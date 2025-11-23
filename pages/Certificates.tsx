
import React from 'react';
import { useGame } from '../context/GameContext';
import { Milestone } from '../types';

const Certificates: React.FC = () => {
    const { historyLogs, stats, quests } = useGame();

    // -------------------------------------------------------------------------
    // LOGIC CALCULATION
    // -------------------------------------------------------------------------
    
    // 1. Consistent Alchemist: Daily Commissions Completed
    // We look at historyLogs for Quest completions where message is "Daily Commission"
    const dailyCommissions = new Set(
        historyLogs
            .filter(l => l.type === 'quest' && l.message.includes('Daily Commission'))
            .map(l => l.date)
    ).size;

    // 2. Heavy Alchemist: Total Potions (Habits) Brewed
    const totalPotions = historyLogs.filter(l => l.type === 'habit').length;

    // 3. Diversity Alchemist: Distinct Habits
    const distinctHabits = new Set(
        historyLogs
            .filter(l => l.type === 'habit')
            .map(l => l.message.split('|')[0]) // message is "Title|Category"
    ).size;

    // 4. Potion Expert: Max single habit count
    const habitCounts: Record<string, number> = {};
    historyLogs
        .filter(l => l.type === 'habit')
        .forEach(l => {
            const name = l.message.split('|')[0];
            habitCounts[name] = (habitCounts[name] || 0) + 1;
        });
    const maxSingleHabit = Math.max(0, ...Object.values(habitCounts));

    // 5. Category Mastery: Categories with >= 1 completion
    const distinctCategories = new Set(
        historyLogs
            .filter(l => l.type === 'habit')
            .map(l => l.message.split('|')[1])
    ).size;

    // 6. Economist: Total Gold Earned
    const totalGoldEarned = historyLogs.reduce((acc, l) => {
        if (!l.rewardSummary) return acc;
        const match = l.rewardSummary.match(/(\d+)g/);
        return acc + (match ? parseInt(match[1]) : 0);
    }, 0);

    // 7. Wild Gatherer: Total Harvests
    const totalHarvests = historyLogs.filter(l => l.type === 'harvest').length;

    // 8. Quest Champion: Total Quests Completed
    const totalQuests = historyLogs.filter(l => l.type === 'quest').length;

    // 9. All-Rounder Alchemist
    // Simplified Logic: Count distinct days where user completed at least 3 different habits
    // This represents versatility/consistency across the board.
    const habitsByDate: Record<string, Set<string>> = {};
    historyLogs
        .filter(l => l.type === 'habit')
        .forEach(l => {
            const date = l.date;
            const habitName = l.message.split('|')[0];
            if (!habitsByDate[date]) habitsByDate[date] = new Set();
            habitsByDate[date].add(habitName);
        });
    const versatileDays = Object.values(habitsByDate).filter(s => s.size >= 3).length;


    // -------------------------------------------------------------------------
    // MILESTONE DEFINITIONS
    // -------------------------------------------------------------------------
    const MILESTONES: Milestone[] = [
        {
            id: 'consistent_alchemist',
            title: 'Consistent Alchemist',
            description: 'Complete daily commissions to maintain your brewing discipline.',
            levels: [
                { threshold: 7, name: 'Novice' },
                { threshold: 30, name: 'Specialist' },
                { threshold: 90, name: 'Expert' },
                { threshold: 180, name: 'Master' },
            ],
            currentValue: dailyCommissions
        },
        {
            id: 'heavy_alchemist',
            title: 'Heavy Alchemist',
            description: 'Brew potions regularly to hone your alchemical craft.',
            levels: [
                { threshold: 20, name: 'Novice' },
                { threshold: 80, name: 'Specialist' },
                { threshold: 200, name: 'Expert' },
                { threshold: 500, name: 'Master' },
            ],
            currentValue: totalPotions
        },
        {
            id: 'diversity_alchemist',
            title: 'Diversity Alchemist',
            description: 'Expand your customer base by brewing many different kinds of potions.',
            levels: [
                { threshold: 5, name: 'Novice' },
                { threshold: 10, name: 'Specialist' },
                { threshold: 20, name: 'Expert' },
                { threshold: 40, name: 'Master' },
            ],
            currentValue: distinctHabits
        },
        {
            id: 'potion_expert',
            title: 'Potion Expert',
            description: 'Master a single habit by brewing its potion repeatedly.',
            levels: [
                { threshold: 10, name: 'Novice' },
                { threshold: 30, name: 'Specialist' },
                { threshold: 80, name: 'Expert' },
                { threshold: 150, name: 'Master' },
            ],
            currentValue: maxSingleHabit
        },
        {
            id: 'category_mastery',
            title: 'Category Mastery',
            description: 'Channel your alchemical prowess across multiple fields.',
            levels: [
                { threshold: 3, name: 'Novice' },
                { threshold: 5, name: 'Specialist' },
                { threshold: 7, name: 'Expert' },
                { threshold: 9, name: 'Master' },
            ],
            currentValue: distinctCategories
        },
        {
            id: 'economist',
            title: 'Economist',
            description: 'Earn gold through consistent successful brewing.',
            levels: [
                { threshold: 200, name: 'Novice' },
                { threshold: 1000, name: 'Specialist' },
                { threshold: 3000, name: 'Expert' },
                { threshold: 10000, name: 'Master' },
            ],
            currentValue: totalGoldEarned
        },
        {
            id: 'wild_gatherer',
            title: 'Wild Gatherer',
            description: 'Harvest natural materials essential for potion brewing.',
            levels: [
                { threshold: 5, name: 'Novice' },
                { threshold: 20, name: 'Specialist' },
                { threshold: 50, name: 'Expert' },
                { threshold: 100, name: 'Master' },
            ],
            currentValue: totalHarvests
        },
        {
            id: 'quest_champion',
            title: 'Quest Champion',
            description: 'Complete quests to assist others and refine your craft.',
            levels: [
                { threshold: 10, name: 'Novice' },
                { threshold: 40, name: 'Specialist' },
                { threshold: 100, name: 'Expert' },
                { threshold: 250, name: 'Master' },
            ],
            currentValue: totalQuests
        },
        {
            id: 'all_rounder',
            title: 'All-Rounder Alchemist',
            description: 'Demonstrate versatility (Days with 3+ distinct habits completed).',
            levels: [
                { threshold: 1, name: 'Novice' },
                { threshold: 5, name: 'Specialist' },
                { threshold: 20, name: 'Expert' },
                { threshold: 50, name: 'Master' },
            ],
            currentValue: versatileDays
        },
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
                    
                    // Progress Calculation for Bar
                    // If Unranked, range is 0 to Level 1.
                    // If Level 1, range is Level 1 to Level 2.
                    const rangeBottom = currentLevelName === "Unranked" ? 0 : prevThreshold;
                    const rangeTop = isMaster ? m.currentValue : nextThreshold; 
                    const range = Math.max(1, rangeTop - rangeBottom);
                    const currentInRange = m.currentValue - rangeBottom;
                    const percent = isMaster ? 100 : Math.min(100, Math.max(0, (currentInRange / range) * 100));

                    return (
                        <div key={m.id} className="bg-surface-dark border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
                             <div className="absolute top-0 right-0 p-4 opacity-5">
                                 <span className="material-symbols-outlined text-8xl">military_tech</span>
                             </div>
                             
                             <div className="relative z-10">
                                 <h3 className="text-white font-bold text-lg mb-1">{m.title}</h3>
                                 <p className="text-gray-400 text-xs mb-4 min-h-[32px]">{m.description}</p>
                                 
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
