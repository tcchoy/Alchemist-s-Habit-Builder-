
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
        category: 'Health' as PotionCategory,
        frequency: 'daily' as FrequencyType,
        days: [0, 1, 2, 3, 4, 5, 6],
        repeatInterval: 3,
        monthlyDate: 1,
        startDate: new Date().toISOString().split('T')[0],
        description: '',
        rewardGold: 20,
        rewardXp: 10,
    });

    const defaultCategories: PotionCategory[] = ['Health', 'Knowledge', 'Housework', 'Productivity'];
    const allCategories = [...defaultCategories, ...stats.customCategories];

    useEffect(() => {
        if (editId) {
            const existing = habits.find(h => h.id === editId);
            if (existing) {
                setFormData({
                    title: existing.title,
                    category: existing.category,
                    frequency: existing.frequency || 'daily',
                    days: existing.days,
                    repeatInterval: existing.repeatInterval || 3,
                    monthlyDate: existing.monthlyDate || 1,
                    startDate: existing.startDate || new Date().toISOString().split('T')[0],
                    description: existing.description,
                    rewardGold: existing.rewardGold,
                    rewardXp: existing.rewardXp
                });
            }
        }
    }, [editId, habits]);

    const isFull = !editId && habits.length >= stats.habitSlots;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFull && !editId) return;

        const habitData = {
            ...formData,
            days: formData.frequency === 'specific_days' ? formData.days : [],
            repeatInterval: formData.frequency === 'repeating' ? formData.repeatInterval : undefined,
            monthlyDate: formData.frequency === 'monthly_date' ? formData.monthlyDate : undefined,
        };

        if (editId) {
             const existing = habits.find(h => h.id === editId);
             if(existing) {
                 updateHabit({ ...existing, ...habitData });
             }
        } else {
            addHabit({
                id: Date.now().toString(),
                ...habitData,
                status: 'todo',
                streak: 0,
                completions: 0,
                icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgFy8VQrawy8L6X4gPgRQnTME_AKW9vjNn2cNiFsYHqyBpLRxQwnI_vgVYARQxij-vSADr4xWOuVmr344fTR8ozve0FeQ4sfvCxSwei4b5aIc2M8D3zTUWy6UtioHMPpLcyDneTMw8kak63PR1zbIxTw3gUWCSBMfCo5942_mYNaHa9LciO6nFdTXkoA99nMB6YdnV7QbXTmTZnCZzr-4TEnb3BbWbfTqFSZ-6qyzWTHFQ82To5T-SXkpG5ehFOlwJbu8AwUVoYnk", 
            });
        }
        navigate('/habits');
    };

    const toggleDay = (dayIndex: number) => {
        setFormData(prev => {
            if (prev.days.includes(dayIndex)) {
                return { ...prev, days: prev.days.filter(d => d !== dayIndex) };
            } else {
                return { ...prev, days: [...prev.days, dayIndex] };
            }
        });
    };

    if (isFull) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">lock</span>
                <h1 className="text-2xl font-bold text-white mb-2">Brewing Station Full</h1>
                <p className="text-gray-400 mb-6">You have reached the maximum number of active potions.</p>
                <Link to="/shop" className="bg-primary text-black px-6 py-3 rounded-full font-bold">Upgrade Capacity in Shop</Link>
            </div>
        );
    }

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                 <h1 className="text-4xl font-bold text-white font-display mb-2">{editId ? 'Modify Recipe' : 'New Brewing Recipe'}</h1>
                 <p className="text-gray-400">Define the ingredients and schedule for your potion.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-dark p-8 rounded-2xl border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                        <span className="text-white font-medium">Potion Name</span>
                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-input w-full rounded-xl bg-background-dark border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-primary h-12" placeholder="e.g. Morning Meditation" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-white font-medium">Category</span>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as PotionCategory})} className="form-select w-full rounded-xl bg-background-dark border-white/10 text-white focus:border-primary focus:ring-primary h-12">
                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </label>
                </div>
                <div className="flex flex-col gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">calendar_month</span>Scheduling</h3>
                    <label className="flex flex-col gap-2">
                        <span className="text-gray-400 text-xs font-bold uppercase">Repeat Pattern</span>
                        <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value as FrequencyType})} className="form-select w-full rounded-xl bg-background-dark border-white/10 text-white focus:border-primary focus:ring-primary h-12">
                            <option value="daily">Every Day</option>
                            <option value="specific_days">Specific Days of Week</option>
                            <option value="repeating">Every X Days</option>
                            <option value="monthly_date">Monthly on Date</option>
                        </select>
                    </label>
                    {formData.frequency === 'specific_days' && (
                        <div className="flex flex-col gap-2">
                            <span className="text-gray-400 text-xs font-bold uppercase">Brewing Days</span>
                            <div className="flex gap-2">{weekDays.map((day, idx) => { const isSelected = formData.days.includes(idx); return (<button key={idx} type="button" onClick={() => toggleDay(idx)} className={`size-10 rounded-full font-bold transition-colors ${isSelected ? 'bg-primary text-black' : 'bg-background-dark text-gray-500 border border-white/10'}`}>{day}</button>)})}</div>
                        </div>
                    )}
                    {formData.frequency === 'repeating' && (
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-2"><span className="text-gray-400 text-xs font-bold uppercase">Interval (Days)</span><input type="number" min="1" value={formData.repeatInterval} onChange={e => setFormData({...formData, repeatInterval: parseInt(e.target.value)})} className="form-input w-full rounded-xl bg-background-dark border-white/10 text-white h-12" /></label>
                            <label className="flex flex-col gap-2"><span className="text-gray-400 text-xs font-bold uppercase">Start Date</span><input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="form-input w-full rounded-xl bg-background-dark border-white/10 text-white h-12" /></label>
                        </div>
                    )}
                    {formData.frequency === 'monthly_date' && (
                        <label className="flex flex-col gap-2"><span className="text-gray-400 text-xs font-bold uppercase">Day of Month (1-31)</span><input type="number" min="1" max="31" value={formData.monthlyDate} onChange={e => setFormData({...formData, monthlyDate: parseInt(e.target.value)})} className="form-input w-full rounded-xl bg-background-dark border-white/10 text-white h-12" /></label>
                    )}
                </div>
                <label className="flex flex-col gap-2">
                    <span className="text-white font-medium">Description</span>
                    <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-textarea w-full rounded-xl bg-background-dark border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-primary min-h-[120px]" placeholder="Describe the habit..." />
                </label>
                <div className="flex flex-col gap-2 bg-background-dark p-4 rounded-xl border border-white/5">
                     <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Rewards (Per Completion)</span>
                     <div className="grid grid-cols-2 gap-4 mt-2">
                        <label className="flex flex-col"><span className="text-xs text-gray-500 mb-1">Gold</span><input type="number" min="0" max="100" value={formData.rewardGold} onChange={e => setFormData({...formData, rewardGold: parseInt(e.target.value)})} className="rounded-lg bg-surface-dark border-white/10 text-white text-sm" /></label>
                        <label className="flex flex-col"><span className="text-xs text-gray-500 mb-1">XP</span><input type="number" min="0" max="100" value={formData.rewardXp} onChange={e => setFormData({...formData, rewardXp: parseInt(e.target.value)})} className="rounded-lg bg-surface-dark border-white/10 text-white text-sm" /></label>
                     </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                    <button type="submit" className="flex-1 h-12 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors">{editId ? 'Update Recipe' : 'Add to Schedule'}</button>
                    <Link to="/habits" className="h-12 px-6 flex items-center rounded-xl bg-background-dark text-gray-400 hover:text-white font-bold border border-white/10 transition-colors">Cancel</Link>
                </div>
            </form>
        </div>
    );
};

export default CreateHabit;
