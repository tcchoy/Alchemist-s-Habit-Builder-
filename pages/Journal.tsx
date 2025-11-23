
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { renderCategoryIcon } from '../utils/categoryAssets';

// Helper to get days in month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const Journal: React.FC = () => {
    const { journalEntries, historyLogs, addJournalEntry, stats } = useGame();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());

    // Overall Lifetime Stats
    const lifetimeStats = useMemo(() => {
        let totalGold = 0;
        let totalXp = 0;
        let totalQuests = 0;
        let totalPotions = 0;

        historyLogs.forEach(log => {
            if (log.rewardSummary) {
                const parts = log.rewardSummary.split(', ');
                parts.forEach(p => {
                    if (p.includes('g')) totalGold += parseInt(p) || 0;
                    if (p.includes('XP')) totalXp += parseInt(p) || 0;
                });
            }
            if (log.type === 'habit') totalPotions++;
            if (log.type === 'quest') totalQuests++;
        });

        return { totalGold, totalXp, totalQuests, totalPotions };
    }, [historyLogs]);

    // Aggregated Daily Data
    const dailySummary = useMemo(() => {
        const logs = historyLogs.filter(log => log.date === selectedDate);
        let totalGold = 0, totalXp = 0, totalGems = 0;
        const potionCounts: Record<string, number> = {};
        const completedQuests: string[] = [];

        logs.forEach(log => {
            if (log.rewardSummary) {
                const parts = log.rewardSummary.split(', ');
                parts.forEach(p => {
                    if (p.includes('g')) totalGold += parseInt(p) || 0;
                    if (p.includes('XP')) totalXp += parseInt(p) || 0;
                    if (p.includes('gem')) totalGems += parseInt(p) || 0;
                });
            }
            if (log.type === 'habit') {
                const [title, category] = log.message.split('|');
                potionCounts[category] = (potionCounts[category] || 0) + 1;
            } else if (log.type === 'quest') {
                completedQuests.push(log.message);
            }
        });
        const entry = journalEntries.find(e => e.date === selectedDate);
        return { totalGold, totalXp, totalGems, potionCounts, completedQuests, logs, entry };
    }, [historyLogs, journalEntries, selectedDate]);

    const handleSave = () => {
        if (!title || !content) return;
        addJournalEntry({ id: Date.now().toString(), title, content, date: selectedDate, tags: [] });
        setTitle(''); setContent('');
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
             <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
                    <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2">Lifetime Records</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-500 text-xs uppercase">Gold</p><p className="text-yellow-400 font-bold">{lifetimeStats.totalGold}</p></div>
                        <div><p className="text-gray-500 text-xs uppercase">XP</p><p className="text-green-400 font-bold">{lifetimeStats.totalXp}</p></div>
                        <div><p className="text-gray-500 text-xs uppercase">Brews</p><p className="text-white font-bold">{lifetimeStats.totalPotions}</p></div>
                        <div><p className="text-gray-500 text-xs uppercase">Quests</p><p className="text-white font-bold">{lifetimeStats.totalQuests}</p></div>
                    </div>
                </div>

                <div className="bg-surface-dark p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setViewMonth(m => m === 0 ? 11 : m - 1)} className="p-1 text-gray-400 hover:text-white"><span className="material-symbols-outlined">chevron_left</span></button>
                        <span className="font-bold text-white">{monthName} {viewYear}</span>
                        <button onClick={() => setViewMonth(m => m === 11 ? 0 : m + 1)} className="p-1 text-gray-400 hover:text-white"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">{['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-gray-500 font-bold">{d}</span>)}</div>
                    <div className="grid grid-cols-7 gap-1">
                        {blanks.map(i => <div key={`blank-${i}`} />)}
                        {daysArray.map(day => {
                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = dateStr === selectedDate;
                            const hasLog = historyLogs.some(l => l.date === dateStr);
                            return (
                                <button key={day} onClick={() => setSelectedDate(dateStr)} className={`h-8 w-8 rounded-full flex flex-col items-center justify-center text-sm relative transition-all ${isSelected ? 'bg-primary text-black font-bold' : 'text-gray-300 hover:bg-white/10'}`}>
                                    {day}
                                    {hasLog && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-surface-dark rounded-2xl border border-white/5 p-6 flex-1 min-h-[300px]">
                    <h2 className="text-xl font-bold text-white font-serif mb-4 border-b border-white/10 pb-2">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                    
                    <div className="flex flex-col gap-6">
                        {dailySummary.entry && <div className="bg-black/20 p-4 rounded-xl border border-white/5"><h4 className="text-primary font-bold font-serif mb-1">{dailySummary.entry.title}</h4><p className="text-gray-300 text-sm font-serif italic">"{dailySummary.entry.content}"</p></div>}
                        {(dailySummary.totalGold > 0 || dailySummary.totalXp > 0) && (
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">+{dailySummary.totalGold}g</div>
                                <div className="flex items-center gap-1 text-green-400 font-bold text-sm">+{dailySummary.totalXp}xp</div>
                            </div>
                        )}
                        {Object.keys(dailySummary.potionCounts).length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Potions Brewed</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(dailySummary.potionCounts).map(([cat, count]) => (
                                        <div key={cat} className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                                            {renderCategoryIcon(cat, stats.customCategories, "size-6")}
                                            <span className="text-sm text-gray-200">{cat}</span>
                                            <span className="text-xs bg-primary/20 text-primary px-1.5 rounded font-bold">x{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {dailySummary.completedQuests.length > 0 && <div><h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Quests</h3><ul className="text-sm text-gray-300">{dailySummary.completedQuests.map((q,i) => <li key={i}>• {q}</li>)}</ul></div>}
                    </div>
                </div>
             </div>

             <div className="lg:col-span-2 flex flex-col gap-6 bg-surface-dark rounded-2xl border border-white/5 p-8 h-fit">
                <h1 className="text-4xl font-black text-white font-serif mb-2">The Grimoire</h1>
                <div className="flex flex-col gap-4">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry Title..." className="w-full bg-transparent border-b border-white/10 py-4 text-2xl text-white placeholder-gray-600 focus:outline-none focus:border-primary font-serif" />
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Record your thoughts..." className="w-full h-96 bg-background-dark/50 rounded-xl p-6 text-gray-300 leading-relaxed placeholder-gray-600 border border-transparent focus:border-primary/30 focus:outline-none resize-none font-serif text-lg"></textarea>
                </div>
                <div className="flex justify-end pt-6"><button onClick={handleSave} className="bg-primary text-black px-6 py-3 rounded-xl font-bold hover:bg-primary/90">Inscribe Entry</button></div>
             </div>
        </div>
    );
};
export default Journal;
