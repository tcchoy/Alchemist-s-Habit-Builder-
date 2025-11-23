
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Quest, QuestCategory } from '../types';
import { renderCategoryIcon } from '../utils/categoryAssets';

const QuestCard: React.FC<{ quest: Quest }> = ({ quest }) => {
    const { completeQuest, claimQuestReward, deleteQuest, stats } = useGame();
    const isSystem = quest.type === 'System';
    const isClaimed = quest.status === 'claimed';

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this notice?')) {
            deleteQuest(quest.id);
        }
    };

    return (
        <div className={`group relative flex flex-col gap-4 rounded-lg p-6 border-2 transition-all ${isSystem ? 'bg-[#1e1b2e] border-blue-500/30' : 'bg-[#2a2218] border-amber-600/30'} ${isClaimed ? 'opacity-80 grayscale bg-black/20' : ''}`}>
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 size-4 rounded-full bg-red-800 shadow-md border border-red-950"></div>
             {!isSystem && <button onClick={handleDelete} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-200 z-10 p-1"><span className="material-symbols-outlined text-sm">delete</span></button>}
             
             <div className="flex items-start gap-4">
                 {renderCategoryIcon(quest.category, stats.customCategories, "size-10 shrink-0")}
                 <div className="flex-1">
                     <div className="flex gap-2 mb-1">
                         <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-black/40 text-gray-300">{quest.type}</span>
                         {quest.status === 'active' && quest.maxProgress > 1 && <span className="text-xs text-white">{quest.progress}/{quest.maxProgress}</span>}
                         {quest.recurring && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded">Recurring</span>}
                     </div>
                     <h3 className="text-lg font-bold text-white font-display leading-tight">{quest.title}</h3>
                 </div>
             </div>
             
             <p className="text-sm text-gray-400 font-serif italic">"{quest.description}"</p>

             <div className="mt-auto pt-3 border-t border-white/5 flex gap-4">
                 <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs" title="Gold"><span className="material-symbols-outlined text-sm">monetization_on</span> {quest.rewardGold}</div>
                 <div className="flex items-center gap-1 text-purple-400 font-bold text-xs" title="Gems"><span className="material-symbols-outlined text-sm">diamond</span> {quest.rewardGems}</div>
                 <div className="flex items-center gap-1 text-green-400 font-bold text-xs" title="XP"><span className="material-symbols-outlined text-sm">psychology</span> {quest.rewardXp}</div>
             </div>

             <div className="mt-2">
                {quest.status === 'active' && !isSystem && <button onClick={() => completeQuest(quest.id)} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-bold text-white">Mark Complete</button>}
                {quest.status === 'active' && isSystem && <div className="w-full py-2 bg-black/20 rounded text-xs text-center text-gray-500 flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm animate-spin">sync</span> Auto-tracking</div>}
                {quest.status === 'completed' && <button onClick={() => claimQuestReward(quest.id)} className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 rounded text-black font-bold text-sm animate-pulse">Claim Rewards</button>}
                {isClaimed && <div className="text-center text-green-500 text-xs font-bold py-2">Claimed</div>}
             </div>
        </div>
    );
};

const CreateQuestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addQuest, stats } = useGame();
    const [formData, setFormData] = useState({ title: '', description: '', category: 'General', rewardGold: 10, rewardGems: 0, rewardXp: 20, recurring: false });
    const allCategories = ['General', 'Learning', 'Fitness', 'Diet', 'Mental Health', 'Housework', ...stats.customCategories.map(c => c.name)];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addQuest({
            id: Date.now().toString(),
            ...formData,
            type: 'Custom',
            category: formData.category as any,
            status: 'active',
            progress: 0,
            maxProgress: 1
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark p-6 rounded-2xl border border-white/10 w-full max-w-md">
                <h2 className="text-white font-bold mb-4">Post Custom Notice</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white" />
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white">{allCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <div className="grid grid-cols-3 gap-2">
                        <label className="text-xs text-gray-400">Gold <input type="number" value={formData.rewardGold} onChange={e => setFormData({...formData, rewardGold: +e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-1 text-white" /></label>
                        <label className="text-xs text-gray-400">Gems <input type="number" value={formData.rewardGems} onChange={e => setFormData({...formData, rewardGems: +e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-1 text-white" /></label>
                        <label className="text-xs text-gray-400">XP <input type="number" value={formData.rewardXp} onChange={e => setFormData({...formData, rewardXp: +e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-1 text-white" /></label>
                    </div>
                    <label className="text-xs text-gray-400 flex items-center gap-2">
                        <input type="checkbox" checked={formData.recurring} onChange={e => setFormData({...formData, recurring: e.target.checked})} />
                        Recurring Daily
                    </label>
                    <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white h-24 resize-none" />
                    <button type="submit" className="bg-primary text-black font-bold py-2 rounded">Post</button>
                    <button type="button" onClick={onClose} className="text-gray-400">Cancel</button>
                </form>
            </div>
        </div>
    );
};

const QuestBoard: React.FC = () => {
    const { quests } = useGame();
    const [activeTab, setActiveTab] = useState<'Active' | 'System' | 'Custom' | 'History'>('Active');
    const [showModal, setShowModal] = useState(false);

    const displayQuests = quests.filter(q => {
        if (activeTab === 'History') return q.status === 'claimed';
        if (q.status === 'claimed') return false;
        if (activeTab === 'Active') return true;
        return q.type === activeTab;
    });

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {showModal && <CreateQuestModal onClose={() => setShowModal(false)} />}
            <div className="flex justify-between items-end mb-6">
                <div><h1 className="text-4xl font-bold text-white font-display">Town Notice Board</h1><p className="text-gray-400 font-serif italic">"Help wanted!"</p></div>
                <button onClick={() => setShowModal(true)} className="bg-primary text-black px-4 py-2 rounded font-bold text-sm">+ Custom Request</button>
            </div>
            
            <div className="flex gap-4 border-b border-white/10 mb-6">
                {(['Active', 'System', 'Custom', 'History'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-4 text-sm font-bold border-b-2 ${activeTab === tab ? 'border-primary text-white' : 'border-transparent text-gray-500'}`}>{tab}</button>
                ))}
            </div>

            <div className="bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-[#3e3223] p-6 rounded border-2 border-[#4a3b2a] shadow-2xl min-h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayQuests.map(q => <QuestCard key={q.id} quest={q} />)}
                    {displayQuests.length === 0 && <div className="col-span-full text-center py-20 text-[#8a7558] font-serif italic text-xl">No notices posted.</div>}
                </div>
            </div>
        </div>
    );
};

export default QuestBoard;
