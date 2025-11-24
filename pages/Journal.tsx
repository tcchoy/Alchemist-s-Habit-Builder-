
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-20">
             
             {/* LEFT COLUMN: CALENDAR & SUMMARY */}
             <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* CALENDAR WIDGET */}
                <div className="bg-[#fff9f0] p-6 rounded-sm border-2 border-[#8b7355] shadow-[4px_4px_0px_0px_rgba(93,74,53,0.1)] relative">
                    {/* Decorative Binding */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-4 bg-[#5d4a35] rounded-full shadow-sm"></div>

                    <div className="flex items-center justify-between mb-6 border-b border-[#d4c5a9] pb-4 border-dashed">
                        <button onClick={() => setViewMonth(m => m === 0 ? 11 : m - 1)} className="p-1 text-[#8b7355] hover:text-[#5d4a35] transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
                        <span className="font-bold text-[#3e3223] font-serif text-lg">{monthName} {viewYear}</span>
                        <button onClick={() => setViewMonth(m => m === 11 ? 0 : m + 1)} className="p-1 text-[#8b7355] hover:text-[#5d4a35] transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 font-mono uppercase tracking-widest text-[#8b7355]">
                        {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                        {blanks.map(i => <div key={`blank-${i}`} />)}
                        {daysArray.map(day => {
                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = dateStr === selectedDate;
                            const hasLog = historyLogs.some(l => l.date === dateStr);
                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                            return (
                                <button 
                                    key={day} 
                                    onClick={() => setSelectedDate(dateStr)} 
                                    className={`
                                        h-8 w-8 rounded-full flex flex-col items-center justify-center text-sm relative transition-all font-serif
                                        ${isSelected 
                                            ? 'bg-[#3e3223] text-[#fdf6e3] font-bold shadow-md scale-110' 
                                            : isToday 
                                                ? 'bg-primary/20 text-[#3e3223] border border-primary'
                                                : 'text-[#5d4a35] hover:bg-[#ede0c9]'
                                        }
                                    `}
                                >
                                    {day}
                                    {/* Ink Dot Indicator */}
                                    {hasLog && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DAILY SUMMARY CARD */}
                <div className="bg-[#fdf6e3] rounded-sm border border-[#d4c5a9] p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 size-16 bg-gradient-to-bl from-[#ede0c9] to-transparent pointer-events-none"></div>
                    
                    <h2 className="text-xl font-bold text-[#3e3223] font-serif mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8b7355]">history_edu</span>
                        {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </h2>
                    
                    <div className="flex flex-col gap-4 relative z-10">
                        {/* Recorded Entry */}
                        {dailySummary.entry ? (
                             <div className="bg-white/60 p-4 rounded border border-[#d4c5a9] shadow-sm transform rotate-1 transition-transform group-hover:rotate-0">
                                 <div className="flex items-center gap-2 mb-2 text-[#b58900]">
                                     <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                     <h4 className="font-bold font-serif text-sm">{dailySummary.entry.title}</h4>
                                 </div>
                                 <p className="text-[#5d4a35] text-sm font-serif italic leading-relaxed">"{dailySummary.entry.content}"</p>
                             </div>
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed border-[#d4c5a9] rounded text-[#8b7355] text-xs font-serif italic">
                                No written entry for this day.
                            </div>
                        )}

                        {/* Earnings Stats */}
                        {(dailySummary.totalGold > 0 || dailySummary.totalXp > 0 || dailySummary.totalGems > 0) && (
                            <div className="flex gap-3 justify-center border-t border-[#d4c5a9] pt-4 border-dashed">
                                {dailySummary.totalGold > 0 && <span className="flex items-center gap-1 text-[#b58900] font-bold text-xs font-mono"><span className="material-symbols-outlined text-[14px]">monetization_on</span> {dailySummary.totalGold}</span>}
                                {dailySummary.totalGems > 0 && <span className="flex items-center gap-1 text-pink-500 font-bold text-xs font-mono"><span className="material-symbols-outlined text-[14px]">diamond</span> {dailySummary.totalGems}</span>}
                                {dailySummary.totalXp > 0 && <span className="flex items-center gap-1 text-[#5b7c25] font-bold text-xs font-mono"><span className="material-symbols-outlined text-[14px]">psychology</span> {dailySummary.totalXp}</span>}
                            </div>
                        )}

                        {/* Potions Brewed List */}
                        {Object.keys(dailySummary.potionCounts).length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-bold text-[#8b7355] uppercase tracking-widest mb-2 text-center">-- Potions Brewed --</h3>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {Object.entries(dailySummary.potionCounts).map(([cat, count]) => (
                                        <div key={cat} className="flex items-center gap-1 bg-[#ede0c9] px-2 py-1 rounded-full border border-[#d4c5a9] shadow-sm">
                                            {renderCategoryIcon(cat, stats.customCategories, "size-5")}
                                            <span className="text-xs text-[#5d4a35] font-serif pl-1">{cat}</span>
                                            <span className="text-[10px] bg-[#3e3223] text-[#fdf6e3] px-1 rounded-full font-bold ml-1">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quests Completed List */}
                        {dailySummary.completedQuests.length > 0 && (
                            <div className="border-t border-[#d4c5a9] pt-3 border-dashed">
                                <h3 className="text-[10px] font-bold text-[#8b7355] uppercase tracking-widest mb-2">Requests Fulfilled</h3>
                                <ul className="text-xs text-[#5d4a35] space-y-1 font-serif">
                                    {dailySummary.completedQuests.map((q,i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-[14px] text-green-600">check</span>
                                            {q}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
             </div>

             {/* RIGHT COLUMN: WRITING AREA (THE BOOK PAGE) */}
             <div className="lg:col-span-8">
                <div className="bg-[#fdf6e3] min-h-[600px] rounded-r-xl rounded-l-sm border border-[#5d4a35] shadow-2xl relative p-8 lg:p-12 flex flex-col">
                    {/* Page Binding Effects */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#e3ded1] to-transparent pointer-events-none rounded-l-sm"></div>
                    <div className="absolute left-2 top-0 bottom-0 border-l border-[#d4c5a9] border-dashed"></div>

                    {/* Header */}
                    <div className="mb-8 flex justify-between items-end border-b-2 border-[#3e3223] pb-2">
                        <div className="flex flex-col">
                            <span className="text-[#8b7355] font-serif italic text-sm">Date: {selectedDate}</span>
                            <h1 className="text-4xl font-black text-[#3e3223] font-serif">The Grimoire</h1>
                        </div>
                        <div className="size-16 opacity-10">
                             <span className="material-symbols-outlined text-6xl text-[#3e3223]">menu_book</span>
                        </div>
                    </div>

                    {/* Writing Inputs */}
                    <div className="flex flex-col gap-6 flex-1 relative z-10">
                        <input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Title of Entry..." 
                            className="w-full bg-transparent border-b border-[#d4c5a9] py-2 text-2xl text-[#3e3223] placeholder-[#a89f91] focus:outline-none focus:border-primary font-serif font-bold transition-colors" 
                        />
                        
                        <div className="relative flex-1">
                            {/* Lined Paper Background Effect */}
                            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(#000000_1px,transparent_1px)] bg-[size:100%_2rem]"></div>
                            
                            <textarea 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                placeholder="Inscribe your thoughts, discoveries, and reflections..." 
                                className="w-full h-full min-h-[400px] bg-transparent p-1 text-[#4a3b2a] leading-[2rem] placeholder-[#a89f91] border-none focus:outline-none resize-none font-serif text-lg custom-scrollbar"
                                style={{ lineHeight: '2rem' }}
                            ></textarea>
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="flex justify-end pt-8 mt-4 border-t border-[#d4c5a9]">
                        <button 
                            onClick={handleSave} 
                            className="group relative px-8 py-3 bg-[#3e3223] text-[#fdf6e3] font-serif font-bold rounded-sm shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="material-symbols-outlined">edit_square</span>
                                Inscribe Record
                            </span>
                            <div className="absolute inset-0 bg-[#5d4a35] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
};
export default Journal;
