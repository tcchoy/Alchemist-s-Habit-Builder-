
import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { HistoryLog } from '../types';

const CalendarReview: React.FC = () => {
    const { historyLogs, stats } = useGame();

    const metrics = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const getStats = (logs: HistoryLog[]) => {
            let gold = 0;
            let xp = 0;
            let completed = 0;
            logs.forEach(l => {
                // Ignore shop purchases for "Earned" metrics (shop logs usually have negative values in rewardSummary like "-200g")
                // Or shop logs are type 'shop'. We want 'earned', so filter out 'shop'.
                if (l.type === 'shop') return;

                if (l.type === 'habit' || l.type === 'quest' || l.type === 'harvest') {
                     if(l.type === 'habit' || l.type === 'quest') completed++;
                     
                     if (l.rewardSummary) {
                        // Regex to capture positive integers before 'g' or 'XP'
                        // Matches "+50g", "50g", "+100XP"
                        const goldMatch = l.rewardSummary.match(/[+]?(\d+)g/);
                        const xpMatch = l.rewardSummary.match(/[+]?(\d+)XP/);
                        
                        if (goldMatch) gold += parseInt(goldMatch[1]);
                        if (xpMatch) xp += parseInt(xpMatch[1]);
                     }
                }
            });
            return { gold, xp, completed };
        };

        const weekly = getStats(historyLogs.filter(l => new Date(l.date) >= weekAgo));
        const monthly = getStats(historyLogs.filter(l => new Date(l.date) >= monthAgo));
        const allTime = getStats(historyLogs);

        return { weekly, monthly, allTime };
    }, [historyLogs]);

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
             <div className="mb-8">
                <h1 className="text-4xl font-bold text-white font-display mb-2">Performance Review</h1>
                <p className="text-gray-400">Analyze your productivity and earnings over time.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                    <h3 className="text-gray-400 font-bold uppercase text-xs mb-4">Last 7 Days</h3>
                    <div className="flex flex-col gap-2">
                         <div className="flex justify-between">
                             <span className="text-white">Tasks Completed</span>
                             <span className="font-bold text-primary">{metrics.weekly.completed}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-white">Gold Earned</span>
                             <span className="font-bold text-yellow-400">{metrics.weekly.gold}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-white">XP Gained</span>
                             <span className="font-bold text-green-400">{metrics.weekly.xp}</span>
                         </div>
                    </div>
                </div>

                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                    <h3 className="text-gray-400 font-bold uppercase text-xs mb-4">Last 30 Days</h3>
                    <div className="flex flex-col gap-2">
                         <div className="flex justify-between">
                             <span className="text-white">Tasks Completed</span>
                             <span className="font-bold text-primary">{metrics.monthly.completed}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-white">Gold Earned</span>
                             <span className="font-bold text-yellow-400">{metrics.monthly.gold}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-white">XP Gained</span>
                             <span className="font-bold text-green-400">{metrics.monthly.xp}</span>
                         </div>
                    </div>
                </div>

                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-surface-dark to-primary/10">
                    <h3 className="text-gray-400 font-bold uppercase text-xs mb-4">All Time</h3>
                    <div className="flex flex-col gap-2">
                         <div className="flex justify-between">
                             <span className="text-white">Tasks Completed</span>
                             <span className="font-bold text-primary">{metrics.allTime.completed}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-white">Total Gold</span>
                             <span className="font-bold text-yellow-400">{metrics.allTime.gold}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-white">Total XP</span>
                             <span className="font-bold text-green-400">{metrics.allTime.xp}</span>
                         </div>
                         <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                             <span className="text-white">Current Level</span>
                             <span className="font-bold text-white">{stats.level}</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Recent Logs Table */}
            <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">Activity Log</h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/20 text-gray-400 text-xs uppercase sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Activity</th>
                                <th className="p-4">Type</th>
                                <th className="p-4 text-right">Rewards</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-300">
                            {historyLogs.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center italic">No records yet.</td></tr>
                            )}
                            {historyLogs.slice(0, 50).map(log => {
                                const title = log.type === 'habit' ? log.message.split('|')[0] : log.message;
                                return (
                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-gray-500">{log.date}</td>
                                        <td className="p-4 font-medium text-white">{title}</td>
                                        <td className="p-4 capitalize">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                log.type === 'habit' ? 'bg-primary/20 text-primary' :
                                                log.type === 'quest' ? 'bg-yellow-500/20 text-yellow-400' :
                                                log.type === 'penalty' ? 'bg-red-500/20 text-red-400' :
                                                'bg-gray-700 text-gray-300'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono text-xs">{log.rewardSummary}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CalendarReview;
