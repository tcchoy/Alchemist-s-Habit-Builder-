
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { PotionCategory } from '../types';

// Helper to get days in month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const Journal: React.FC = () => {
    const { journalEntries, historyLogs, addJournalEntry } = useGame();
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
        
        let totalGold = 0;
        let totalXp = 0;
        let totalGems = 0;
        const potionCounts: Record<string, number> = {};
        const completedQuests: string[] = [];

        logs.forEach(log => {
            // Parse reward string (e.g., "+10g, +5XP")
            if (log.rewardSummary) {
                const parts = log.rewardSummary.split(', ');
                parts.forEach(p => {
                    if (p.includes('g')) totalGold += parseInt(p) || 0;
                    if (p.includes('XP')) totalXp += parseInt(p) || 0;
                    if (p.includes('gem')) totalGems += parseInt(p) || 0;
                });
            }

            if (log.type === 'habit') {
                // Message format: "Title|Category|Icon"
                const [title, category, icon] = log.message.split('|');
                const key = `${category}|${icon || ''}`;
                potionCounts[key] = (potionCounts[key] || 0) + 1;
            } else if (log.type === 'quest') {
                completedQuests.push(log.message);
            }
        });
        
        // Find inscribed entry for this day
        const entry = journalEntries.find(e => e.date === selectedDate);

        return { totalGold, totalXp, totalGems, potionCounts, completedQuests, logs, entry };
    }, [historyLogs, journalEntries, selectedDate]);

    const handleSave = () => {
        if (!title || !content) return;
        addJournalEntry({
            id: Date.now().toString(),
            title,
            content,
            date: selectedDate,
            tags: []
        });
        setTitle('');
        setContent('');
    };

    // Calendar Logic
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' });

    const hasLog = (day: number) => {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return historyLogs.some(l => l.date === dateStr);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
             {/* Left Panel: Calendar & Summary */}
             <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Overall Stats Card */}
                <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                         <span className="material-symbols-outlined text-6xl">monitoring</span>
                    </div>
                    <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2">Lifetime Records</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs uppercase">Total Gold</p>
                            <p className="text-yellow-400 font-bold">{lifetimeStats.totalGold}</p>
                        </div>
                         <div>
                            <p className="text-gray-500 text-xs uppercase">Total XP</p>
                            <p className="text-green-400 font-bold">{lifetimeStats.totalXp}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase">Potions Brewed</p>
                            <p className="text-white font-bold">{lifetimeStats.totalPotions}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase">Quests Done</p>
                            <p className="text-white font-bold">{lifetimeStats.totalQuests}</p>
                        </div>
                    </div>
                </div>

                {/* Calendar Picker */}
                <div className="bg-surface-dark p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setViewMonth(m => m === 0 ? 11 : m - 1)} className="p-1 text-gray-400 hover:text-white"><span className="material-symbols-outlined">chevron_left</span></button>
                        <span className="font-bold text-white">{monthName} {viewYear}</span>
                        <button onClick={() => setViewMonth(m => m === 11 ? 0 : m + 1)} className="p-1 text-gray-400 hover:text-white"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-gray-500 font-bold">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {blanks.map(i => <div key={`blank-${i}`} />)}
                        {daysArray.map(day => {
                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = dateStr === selectedDate;
                            const active = hasLog(day);
                            
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`h-8 w-8 rounded-full flex flex-col items-center justify-center text-sm relative transition-all ${
                                        isSelected 
                                        ? 'bg-primary text-black font-bold' 
                                        : 'text-gray-300 hover:bg-white/10'
                                    }`}
                                >
                                    {day}
                                    {active && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Aggregated Summary Card */}
                <div className="bg-surface-dark rounded-2xl border border-white/5 p-6 flex-1 min-h-[300px]">
                    <h2 className="text-xl font-bold text-white font-serif mb-4 border-b border-white/10 pb-2">
                        {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>
                    
                    {dailySummary.logs.length === 0 && !dailySummary.entry ? (
                         <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm italic">
                             <span className="material-symbols-outlined text-3xl mb-2 opacity-50">history_edu</span>
                             No records found.
                         </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Text Entry for this day */}
                            {dailySummary.entry && (
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <h4 className="text-primary font-bold font-serif mb-1">{dailySummary.entry.title}</h4>
                                    <p className="text-gray-300 text-sm font-serif italic">"{dailySummary.entry.content}"</p>
                                </div>
                            )}

                            {/* Earnings */}
                            {(dailySummary.totalGold > 0 || dailySummary.totalXp > 0) && (
                                <div className="flex gap-4">
                                    <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-yellow-500 text-sm">monetization_on</span>
                                        <span className="text-yellow-200 font-bold text-sm">+{dailySummary.totalGold}</span>
                                    </div>
                                    <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 text-sm">psychology</span>
                                        <span className="text-green-200 font-bold text-sm">+{dailySummary.totalXp}</span>
                                    </div>
                                    {dailySummary.totalGems > 0 && (
                                        <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-purple-500 text-sm">diamond</span>
                                            <span className="text-purple-200 font-bold text-sm">+{dailySummary.totalGems}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Potions Brewed */}
                            {Object.keys(dailySummary.potionCounts).length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Potions Brewed</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(dailySummary.potionCounts).map(([key, count]) => {
                                            const [category, icon] = key.split('|');
                                            return (
                                                <div key={key} className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                                                    <div className="size-6 rounded bg-cover bg-center" style={{backgroundImage: `url("${icon}")`}}></div>
                                                    <span className="text-sm text-gray-200">{category}</span>
                                                    <span className="text-xs bg-primary/20 text-primary px-1.5 rounded font-bold">x{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Completed Quests */}
                            {dailySummary.completedQuests.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Quests Completed</h3>
                                    <ul className="flex flex-col gap-1">
                                        {dailySummary.completedQuests.map((q, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-xs text-green-500">check_circle</span>
                                                {q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
             </div>

             {/* Right Panel: Editor (Same as before) */}
             <div className="lg:col-span-2 flex flex-col gap-6 bg-surface-dark rounded-2xl border border-white/5 p-8 h-fit">
                <div>
                    <h1 className="text-4xl font-black text-white font-serif mb-2">The Grimoire</h1>
                    <p className="text-gray-400">Record your progress, thoughts, and magical discoveries.</p>
                </div>
                
                <div className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Entry Title..." 
                        className="w-full bg-transparent border-b border-white/10 py-4 text-2xl text-white placeholder-gray-600 focus:outline-none focus:border-primary font-serif"
                    />
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What did you accomplish today, Alchemist?" 
                        className="w-full h-96 bg-background-dark/50 rounded-xl p-6 text-gray-300 leading-relaxed placeholder-gray-600 border border-transparent focus:border-primary/30 focus:outline-none resize-none font-serif text-lg"
                    ></textarea>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                    <div className="flex gap-2">
                         <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5" title="Add Tag"><span className="material-symbols-outlined">label</span></button>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">edit_square</span>
                        Inscribe Entry
                    </button>
                </div>

                {/* Previous Entries List (Recent) */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-white font-bold mb-4">Recent Inscriptions</h3>
                    {journalEntries.slice(0, 3).map(entry => (
                         <div key={entry.id} className="mb-4 pb-4 border-b border-white/5 last:border-0">
                             <div className="flex justify-between mb-1">
                                 <span className="text-primary font-bold font-serif">{entry.title}</span>
                                 <span className="text-xs text-gray-500">{entry.date}</span>
                             </div>
                             <p className="text-sm text-gray-400 line-clamp-2 font-serif">{entry.content}</p>
                         </div>
                    ))}
                </div>
             </div>
        </div>
    );
};

export default Journal;
