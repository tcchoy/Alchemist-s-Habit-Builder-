
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Quest, QuestCategory } from '../types';
import { renderCategoryIcon } from '../utils/categoryAssets';
import { getQuestAvatar } from '../utils/questAssets';

const QuestCard: React.FC<{ quest: Quest; onEdit: (q: Quest) => void }> = ({ quest, onEdit }) => {
    const { completeQuest, claimQuestReward, deleteQuest, stats } = useGame();
    const isSystem = quest.type === 'System';
    const isClaimed = quest.status === 'claimed';

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to remove the notice for "${quest.title}"?`)) {
            deleteQuest(quest.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(quest);
    };

    return (
        <div className={`group relative flex flex-col gap-4 rounded-lg p-6 border-2 transition-all ${isSystem ? 'bg-[#2a2218] border-stone-500/30' : 'bg-[#3e3223] border-amber-600/30'} ${isClaimed ? 'opacity-80 grayscale bg-black/20' : ''}`}>
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 size-4 rounded-full bg-red-800 shadow-md border border-red-950"></div>
             
             {!isSystem && (
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <button onClick={handleEdit} className="p-1.5 bg-black/50 text-stone-400 hover:text-white rounded hover:bg-black/80"><span className="material-symbols-outlined text-sm">edit</span></button>
                     <button onClick={handleDelete} className="p-1.5 bg-black/50 text-red-400 hover:text-red-200 rounded hover:bg-black/80"><span className="material-symbols-outlined text-sm">delete</span></button>
                 </div>
             )}
             
             <div className="flex items-start gap-4">
                 {/* CUSTOMER AVATAR for Custom Quests */}
                 {!isSystem ? (
                     <div className="relative">
                         <img src={getQuestAvatar(quest.id)} alt="Customer" className="size-12 rounded-full border-2 border-[#5d4a35] bg-stone-800 object-cover" />
                         <div className="absolute -bottom-1 -right-1">
                             {renderCategoryIcon(quest.category, stats.customCategories, "size-5")}
                         </div>
                     </div>
                 ) : (
                    renderCategoryIcon(quest.category, stats.customCategories, "size-10 shrink-0")
                 )}

                 <div className="flex-1">
                     <div className="flex gap-2 mb-1">
                         <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-black/40 text-stone-300">{quest.type}</span>
                         {quest.status === 'active' && quest.maxProgress > 1 && <span className="text-xs text-white">{quest.progress}/{quest.maxProgress}</span>}
                         {quest.recurring && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded">Recurring</span>}
                     </div>
                     <h3 className="text-lg font-bold text-white font-display leading-tight">{quest.title}</h3>
                 </div>
             </div>
             
             <p className="text-sm text-stone-400 font-serif italic line-clamp-2">"{quest.description}"</p>
             {quest.deadline && <p className="text-xs text-red-400 mt-1">Due: {quest.deadline}</p>}

             <div className="mt-auto pt-3 border-t border-white/5 flex gap-4">
                 <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs" title="Gold"><span className="material-symbols-outlined text-sm">monetization_on</span> {quest.rewardGold}</div>
                 <div className="flex items-center gap-1 text-pink-400 font-bold text-xs" title="Gems"><span className="material-symbols-outlined text-sm">diamond</span> {quest.rewardGems}</div>
                 <div className="flex items-center gap-1 text-green-400 font-bold text-xs" title="XP"><span className="material-symbols-outlined text-sm">psychology</span> {quest.rewardXp}</div>
             </div>

             <div className="mt-2">
                {quest.status === 'active' && !isSystem && <button onClick={() => completeQuest(quest.id)} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-bold text-white">Mark Complete</button>}
                {quest.status === 'active' && isSystem && <div className="w-full py-2 bg-black/20 rounded text-xs text-center text-stone-500 flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm animate-spin">sync</span> Auto-tracking</div>}
                {quest.status === 'completed' && <button onClick={() => claimQuestReward(quest.id)} className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 rounded text-black font-bold text-sm animate-pulse">Claim Rewards</button>}
                {isClaimed && <div className="text-center text-green-500 text-xs font-bold py-2">Claimed</div>}
             </div>
        </div>
    );
};

const CreateQuestModal: React.FC<{ onClose: () => void; editingQuest?: Quest | null }> = ({ onClose, editingQuest }) => {
    const { addQuest, updateQuest, stats } = useGame();
    const [formData, setFormData] = useState({ 
        title: editingQuest?.title || '', 
        description: editingQuest?.description || '', 
        category: editingQuest?.category || 'General', 
        rewardGold: editingQuest?.rewardGold || 10, 
        rewardGems: editingQuest?.rewardGems || 0, 
        rewardXp: editingQuest?.rewardXp || 20, 
        recurring: editingQuest?.recurring || false,
        deadline: editingQuest?.deadline || ''
    });
    const allCategories = ['General', 'Learning', 'Fitness', 'Diet', 'Mental Health', 'Housework', ...stats.customCategories.map(c => c.name)];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            type: 'Custom' as const,
            category: formData.category as any,
            maxProgress: 1
        };

        if (editingQuest) {
            updateQuest({ ...editingQuest, ...data });
        } else {
            addQuest({
                id: Date.now().toString(),
                status: 'active',
                progress: 0,
                ...data
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#3e3223] p-6 rounded-2xl border border-[#5d4a35] w-full max-w-md shadow-2xl">
                <h2 className="text-white font-bold mb-4 font-display text-xl">{editingQuest ? 'Update Notice' : 'Post Custom Notice'}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-1">
                         <label className="text-xs text-stone-500 font-bold uppercase">Title</label>
                         <input required placeholder="e.g. Clean the attic" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <label className="text-xs text-stone-500 font-bold uppercase">Category</label>
                             <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none">{allCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        </div>
                         <div className="space-y-1">
                             <label className="text-xs text-stone-500 font-bold uppercase">Deadline (Optional)</label>
                             <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                        <label className="text-xs text-stone-400 font-bold">Gold <input type="number" min="0" value={formData.rewardGold} onChange={e => setFormData({...formData, rewardGold: +e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-1 text-white mt-1" /></label>
                        <label className="text-xs text-stone-400 font-bold">Gems <input type="number" min="0" value={formData.rewardGems} onChange={e => setFormData({...formData, rewardGems: +e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-1 text-white mt-1" /></label>
                        <label className="text-xs text-stone-400 font-bold">XP <input type="number" min="0" value={formData.rewardXp} onChange={e => setFormData({...formData, rewardXp: +e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-1 text-white mt-1" /></label>
                    </div>
                    <label className="text-xs text-stone-400 flex items-center gap-2 select-none">
                        <input type="checkbox" checked={formData.recurring} onChange={e => setFormData({...formData, recurring: e.target.checked})} className="rounded bg-black/30 border-white/10 text-primary focus:ring-primary" />
                        Recurring Daily (Reset at midnight)
                    </label>
                    <div className="space-y-1">
                         <label className="text-xs text-stone-500 font-bold uppercase">Description</label>
                         <textarea placeholder="Details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white h-24 resize-none focus:border-primary focus:outline-none" />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90">{editingQuest ? 'Update' : 'Post'}</button>
                        <button type="button" onClick={onClose} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const QuestBoard: React.FC = () => {
    const { quests } = useGame();
    const [activeTab, setActiveTab] = useState<'Active' | 'System' | 'Custom' | 'History'>('Active');
    const [showModal, setShowModal] = useState(false);
    const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

    const displayQuests = quests.filter(q => {
        if (activeTab === 'History') return q.status === 'claimed';
        if (q.status === 'claimed') return false;
        if (activeTab === 'Active') return true;
        return q.type === activeTab;
    });

    const openCreate = () => {
        setEditingQuest(null);
        setShowModal(true);
    };

    const openEdit = (q: Quest) => {
        setEditingQuest(q);
        setShowModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {showModal && <CreateQuestModal onClose={() => setShowModal(false)} editingQuest={editingQuest} />}
            <div className="flex justify-between items-end mb-6">
                <div><h1 className="text-4xl font-bold text-white font-display">Town Notice Board</h1><p className="text-stone-400 font-serif italic">"Help wanted!"</p></div>
                <button onClick={openCreate} className="bg-primary text-black px-4 py-2 rounded font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">add_circle</span> Custom Request
                </button>
            </div>
            
            <div className="flex gap-4 border-b border-[#5d4a35] mb-6 overflow-x-auto">
                {(['Active', 'System', 'Custom', 'History'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-primary text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}>{tab}</button>
                ))}
            </div>

            <div className="bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-[#3e3223] p-6 rounded-lg border-2 border-[#4a3b2a] shadow-2xl min-h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayQuests.map(q => <QuestCard key={q.id} quest={q} onEdit={openEdit} />)}
                    {displayQuests.length === 0 && <div className="col-span-full text-center py-20 text-[#8a7558] font-serif italic text-xl">No notices posted.</div>}
                </div>
            </div>
        </div>
    );
};

export default QuestBoard;
