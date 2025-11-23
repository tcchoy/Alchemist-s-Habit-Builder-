
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { PotionCategory, FrequencyType } from '../types';

const CreateHabit: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const { addHabit, updateHabit, stats, habits } = useGame();

    const [formData, setFormData] = useState({
        title: '',
        category: 'General' as PotionCategory,
        description: '',
        rewardGold: 20,
        rewardXp: 10,
        startDate: new Date().toISOString().split('T')[0],
        
        // Schedule Configs
        frequency: 'daily' as FrequencyType,
        interval: 1, // Every X...
        weekDays: [] as number[], // For Weekly
        monthDay: 1, // For Monthly Date
        monthWeek: 1, // For Monthly Weekday (1st, 2nd...)
        monthWeekDay: 1, // For Monthly Weekday (Monday...)
    });

    const allCategories = ['General', 'Learning', 'Fitness', 'Diet', 'Mental Health', 'Housework', ...stats.customCategories.map(c => c.name)];

    useEffect(() => {
        if (editId) {
            const existing = habits.find(h => h.id === editId);
            if (existing) {
                setFormData({
                    title: existing.title,
                    category: existing.category,
                    description: existing.description,
                    rewardGold: existing.rewardGold,
                    rewardXp: existing.rewardXp,
                    startDate: existing.startDate || new Date().toISOString().split('T')[0],
                    frequency: existing.frequency,
                    interval: existing.interval || 1,
                    weekDays: existing.weekDays || existing.days || [],
                    monthDay: existing.monthDay || 1,
                    monthWeek: existing.monthWeek || 1,
                    monthWeekDay: existing.monthWeekDay || 1,
                });
            }
        }
    }, [editId, habits]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Clean up legacy fields and ensure types
        const data = { 
            ...formData, 
            id: editId || Date.now().toString(), 
            status: 'todo' as const, 
            streak: 0, 
            completions: 0,
            // legacy fallbacks
            days: formData.weekDays,
            repeatInterval: formData.interval
        };
        if (editId) updateHabit(data as any);
        else addHabit(data as any);
        navigate('/habits');
    };

    const toggleWeekDay = (day: number) => {
        setFormData(p => ({
            ...p, 
            weekDays: p.weekDays.includes(day) ? p.weekDays.filter(d => d !== day) : [...p.weekDays, day]
        }));
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-white mb-6 font-display">{editId ? 'Edit Habit' : 'New Habit'}</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-dark p-8 rounded-xl border border-white/5">
                
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm border-b border-white/10 pb-2">Basic Info</h3>
                    <input required placeholder="Habit Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white" />
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white">
                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <textarea placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white h-20 resize-none" />
                </div>

                {/* Scheduling */}
                <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm border-b border-white/10 pb-2">Schedule</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Start Date</label>
                            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Pattern</label>
                            <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value as FrequencyType})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm">
                                <option value="daily">Daily</option>
                                <option value="interval">Every X Days</option>
                                <option value="weekly">Weekly Pattern</option>
                                <option value="monthly_date">Monthly (Specific Date)</option>
                                <option value="monthly_weekday">Monthly (Specific Weekday)</option>
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Inputs based on Frequency */}
                    <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-3">
                        {formData.frequency === 'daily' && (
                            <p className="text-gray-400 text-sm italic">Repeat every day.</p>
                        )}

                        {formData.frequency === 'interval' && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300 text-sm">Repeat every</span>
                                <input type="number" min="1" value={formData.interval} onChange={e => setFormData({...formData, interval: parseInt(e.target.value)})} className="w-20 bg-black/30 border border-white/10 rounded p-1 text-white text-center" />
                                <span className="text-gray-300 text-sm">days.</span>
                            </div>
                        )}

                        {formData.frequency === 'weekly' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">Repeat every</span>
                                    <input type="number" min="1" value={formData.interval} onChange={e => setFormData({...formData, interval: parseInt(e.target.value)})} className="w-20 bg-black/30 border border-white/10 rounded p-1 text-white text-center" />
                                    <span className="text-gray-300 text-sm">weeks on:</span>
                                </div>
                                <div className="flex gap-2">
                                    {['S','M','T','W','T','F','S'].map((d, i) => (
                                        <button type="button" key={i} onClick={() => toggleWeekDay(i)} className={`size-8 rounded-full text-xs font-bold ${formData.weekDays.includes(i) ? 'bg-primary text-black' : 'bg-white/10 text-gray-400'}`}>{d}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.frequency === 'monthly_date' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">Repeat every</span>
                                    <input type="number" min="1" value={formData.interval} onChange={e => setFormData({...formData, interval: parseInt(e.target.value)})} className="w-20 bg-black/30 border border-white/10 rounded p-1 text-white text-center" />
                                    <span className="text-gray-300 text-sm">months on day:</span>
                                    <input type="number" min="1" max="31" value={formData.monthDay} onChange={e => setFormData({...formData, monthDay: parseInt(e.target.value)})} className="w-16 bg-black/30 border border-white/10 rounded p-1 text-white text-center" />
                                </div>
                            </div>
                        )}

                        {formData.frequency === 'monthly_weekday' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">Repeat every</span>
                                    <input type="number" min="1" value={formData.interval} onChange={e => setFormData({...formData, interval: parseInt(e.target.value)})} className="w-20 bg-black/30 border border-white/10 rounded p-1 text-white text-center" />
                                    <span className="text-gray-300 text-sm">months on the:</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <select value={formData.monthWeek} onChange={e => setFormData({...formData, monthWeek: parseInt(e.target.value)})} className="bg-black/30 border border-white/10 rounded p-2 text-white text-sm">
                                        <option value={1}>1st</option>
                                        <option value={2}>2nd</option>
                                        <option value={3}>3rd</option>
                                        <option value={4}>4th</option>
                                        <option value={5}>Last</option>
                                    </select>
                                    <select value={formData.monthWeekDay} onChange={e => setFormData({...formData, monthWeekDay: parseInt(e.target.value)})} className="bg-black/30 border border-white/10 rounded p-2 text-white text-sm">
                                        <option value={1}>Monday</option>
                                        <option value={2}>Tuesday</option>
                                        <option value={3}>Wednesday</option>
                                        <option value={4}>Thursday</option>
                                        <option value={5}>Friday</option>
                                        <option value={6}>Saturday</option>
                                        <option value={0}>Sunday</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/10">
                    <button type="submit" className="flex-1 bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90">Save Habit</button>
                    <Link to="/habits" className="flex-1 text-center py-3 text-gray-400 hover:text-white">Cancel</Link>
                </div>
            </form>
        </div>
    );
};
export default CreateHabit;
