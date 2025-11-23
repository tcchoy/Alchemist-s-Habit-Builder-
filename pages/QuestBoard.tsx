
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Quest, QuestCategory } from '../types';

const QuestCard: React.FC<{ quest: Quest }> = ({ quest }) => {
    const { completeQuest, claimQuestReward, deleteQuest } = useGame();
    const isSystem = quest.type === 'System';
    const isCompleted = quest.status === 'completed';
    const isClaimed = quest.status === 'claimed';

    return (
        <div className={`group relative flex flex-col gap-4 rounded-lg p-6 border-2 transition-all ${isSystem ? 'bg-[#1e1b2e] border-blue-500/30' : 'bg-[#2a2218] border-amber-600/30'} ${isClaimed ? 'opacity-50 grayscale' : ''}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 size-4 rounded-full bg-red-800 shadow-md border border-red-950"></div>
            {!isSystem && <button onClick={() => { if(confirm('Tear down this notice?')) deleteQuest(quest.id); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-200 transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>}
            <div className="flex justify-between items-start">
                <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${isSystem ? 'bg-blue-900/50 text-blue-200' : 'bg-amber-900/50 text-amber-200'}`}>{quest.type}</span>
                    {quest.category && <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-white/10 text-gray-300">{quest.category}</span>}
                </div>
                {quest.status === 'active' && quest.maxProgress > 1 && <span className="text-xs text-gray-400">{quest.progress}/{quest.maxProgress}</span>}
            </div>
            <div><h3 className="text-lg font-bold text-white font-display mb-1">{quest.title}</h3><p className="text-sm text-gray-400 font-serif italic">"{quest.description}"</p>{quest.deadline && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">event</span> Due: {quest.deadline}</p>}</div>
            <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-auto">
                {quest.rewardGems > 0 && <div className="flex items-center gap-1 text-purple-400 text-xs font-bold"><span className="material-symbols-outlined text-sm">diamond</span> {quest.rewardGems}</div>}
                {quest.rewardGold > 0 && <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold"><span className="material-symbols-outlined text-sm">monetization_on</span> {quest.rewardGold}</div>}
                {quest.rewardXp > 0 && <div className="flex items-center gap-1 text-green-400 text-xs font-bold"><span className="material-symbols-outlined text-sm">psychology</span> {quest.rewardXp} XP</div>}
            </div>
            <div className="mt-2">
                {quest.status === 'active' && quest.type !== 'System' && <button onClick={() => completeQuest(quest.id)} className="w-full py-2 rounded bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors border border-white/10">Mark Complete</button>}
                {quest.status === 'active' && quest.type === 'System' && <div className="w-full py-2 text-center text-xs text-gray-500 bg-black/20 rounded flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm animate-spin">sync</span> Auto-tracking</div>}
                {isCompleted && <button onClick={() => claimQuestReward(quest.id)} className="w-full py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition-colors shadow-[0_0_10px_rgba(234,179,8,0.4)] animate-pulse">Claim Reward</button>}
                {isClaimed && <div className="w-full py-2 text-center text-xs text-green-500 font-bold flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Claimed</div>}
            </div>
        </div>
    );
};

const CreateQuestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addQuest, stats } = useGame();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'General' as QuestCategory,
        deadline: '',
        rewardGold: 10,
        rewardGems: 0,
        rewardXp: 20
    });

    const allCategories = ['General', 'Health', 'Knowledge', 'Housework', 'Productivity', ...stats.customCategories];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addQuest({
            id: Date.now().toString(),
            title: formData.title,
            description: formData.description,
            type: 'Custom',
            category: formData.category,
            rewardGems: formData.rewardGems,
            rewardGold: formData.rewardGold,
            rewardXp: formData.rewardXp,
            status: 'active',
            progress: 0,
            maxProgress: 1,
            deadline: formData.deadline
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark p-6 rounded-2xl border border-white/10 w-full max-w-md animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-white mb-4 font-display">Post New Notice</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input required placeholder="Request Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as QuestCategory})} className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                        {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <textarea required placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-black/30 border border-white/10 rounded-lg p-3 text-white h-24 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
                    <div className="flex flex-col gap-1"><span className="text-xs text-gray-400 uppercase font-bold">Deadline (Optional)</span><input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm" /></div>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-400 uppercase font-bold">Rewards</span>
                        <div className="grid grid-cols-3 gap-2">
                             <input type="number" placeholder="Gold" value={formData.rewardGold} onChange={e => setFormData({...formData, rewardGold: parseInt(e.target.value)})} className="bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm" />
                             <input type="number" placeholder="XP" value={formData.rewardXp} onChange={e => setFormData({...formData, rewardXp: parseInt(e.target.value)})} className="bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm" />
                             <input type="number" placeholder="Gems" value={formData.rewardGems} onChange={e => setFormData({...formData, rewardGems: parseInt(e.target.value)})} className="bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                        <button type="submit" className="flex-1 bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors">Post Notice</button>
                        <button type="button" onClick={onClose} className="flex-1 bg-transparent border border-white/10 text-gray-400 hover:text-white py-3 rounded-lg transition-colors">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const QuestBoard: React.FC = () => {
    const { quests, stats } = useGame();
    const [activeTab, setActiveTab] = useState<'Active' | 'System' | 'Custom' | 'History'>('Active');
    const [categoryFilter, setCategoryFilter] = useState<QuestCategory | 'All'>('All');
    const [showModal, setShowModal] = useState(false);

    const displayQuests = quests.filter(q => {
        if (categoryFilter !== 'All' && q.category !== categoryFilter) return false;
        if (activeTab === 'History') return q.status === 'claimed';
        if (q.status === 'claimed') return false;
        if (activeTab === 'Active') return true;
        return q.type === activeTab;
    });

    const allCategories = ['All', 'General', 'Health', 'Knowledge', 'Housework', 'Productivity', ...stats.customCategories];
    const recentHistory = quests.filter(q => q.status === 'claimed').slice(-5).reverse();

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             {showModal && <CreateQuestModal onClose={() => setShowModal(false)} />}
             <div className="flex flex-col gap-2 mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Town Notice Board</h1>
                <p className="text-gray-400 text-lg font-serif">"Citizens in need of assistance!"</p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex gap-4 border-b border-white/10 overflow-x-auto w-full md:w-auto">
                    {(['Active', 'System', 'Custom', 'History'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-white'}`}>{tab === 'Active' ? 'Active Notices' : `${tab} Requests`}</button>
                    ))}
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as QuestCategory | 'All')} className="bg-surface-dark border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-primary focus:border-primary">
                    {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <div className="bg-[#2a2218] p-2 rounded-t-lg border-x-2 border-t-2 border-[#4a3b2a] flex justify-between items-center">
                         <div className="flex gap-2"><div className="size-3 rounded-full bg-[#1a150f]"></div><div className="size-3 rounded-full bg-[#1a150f]"></div></div>
                         <span className="text-[#8a7558] font-bold uppercase tracking-widest text-xs">{activeTab === 'History' ? 'Completed Archives' : 'Active Notices'}</span>
                         <div className="flex gap-2"><div className="size-3 rounded-full bg-[#1a150f]"></div><div className="size-3 rounded-full bg-[#1a150f]"></div></div>
                     </div>
                     <div className="bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-[#3e3223] p-6 rounded-b-lg border-x-2 border-b-2 border-[#4a3b2a] shadow-2xl min-h-[600px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {displayQuests.length > 0 ? displayQuests.map(q => <QuestCard key={q.id} quest={q} />) : <div className="col-span-2 flex flex-col items-center justify-center text-[#8a7558] py-20"><span className="material-symbols-outlined text-6xl opacity-50">sentiment_satisfied</span><p className="mt-4 font-serif text-xl italic">{activeTab === 'History' ? "No completed quests yet." : "No active notices in this category."}</p></div>}
                        </div>
                     </div>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="bg-surface-dark p-6 rounded-xl border border-white/5">
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">history</span>Recent Activity</h2>
                        <div className="flex flex-col gap-2 text-sm text-gray-400">{recentHistory.map(q => <div key={q.id} className="flex justify-between items-center pb-2 border-b border-white/5"><span className="truncate max-w-[150px]">{q.title}</span><span className="text-green-500 text-xs font-bold">Done</span></div>)}{recentHistory.length === 0 && <p className="text-xs italic">No history yet.</p>}</div>
                    </div>
                    <div className="bg-surface-dark p-6 rounded-xl border border-white/5">
                         <h2 className="text-white font-bold mb-4">Write Notice</h2>
                         <p className="text-xs text-gray-400 mb-4">Need to track a specific one-time goal?</p>
                         <button onClick={() => setShowModal(true)} className="w-full py-3 rounded-lg bg-primary/20 text-primary font-bold border border-primary/50 hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined">edit</span>Create Custom Request</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestBoard;
