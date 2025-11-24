
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ShopItem } from '../types';

const SHOP_ITEMS: ShopItem[] = [
    { id: 'slot_1', name: 'Oak Shelf Expansion', description: 'Adds 1 extra slot for Habits.', costGold: 200, costGems: 0, effect: 'slot_upgrade', value: 1, minLevel: 1 },
    { id: 'cat_unlock', name: 'Custom Category Permit', description: 'Mint a new custom category with your choice of icon and color.', costGold: 0, costGems: 50, effect: 'unlock_category', value: 0, minLevel: 3 },
    { id: 'cat_boost', name: 'Felix Felicis Brew', description: 'Boosts efficiency. 1.5x Rewards for a selected category permanently.', costGold: 0, costGems: 150, effect: 'category_multiplier', value: 1.5, minLevel: 5 },
    { id: 'map_upgrade', name: 'Wild Map Fragment', description: 'Unlock deeper levels of the Wild Harvest forest.', costGold: 1000, costGems: 20, effect: 'map_upgrade', value: 1, minLevel: 5 },
];

const Shop: React.FC = () => {
    const { stats, buyShopItem, showToast } = useGame();
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    
    // Custom Category States
    const [catName, setCatName] = useState('');
    const [catType, setCatType] = useState<'potion'|'book'|'pen'>('potion');
    const [catColor, setCatColor] = useState('#a78bfa');

    // Multiplier State
    const [targetCategory, setTargetCategory] = useState('');

    const allCategories = ['General', 'Learning', 'Fitness', 'Diet', 'Mental Health', 'Housework', ...stats.customCategories.map(c => c.name)];

    const handleBuy = (item: ShopItem) => {
        if (item.effect === 'unlock_category') {
            setSelectedItem(item);
        } else if (item.effect === 'category_multiplier') {
            setTargetCategory(allCategories[0]);
            setSelectedItem(item);
        } else {
             buyShopItem(item);
        }
    };

    const confirmPurchase = () => {
        if (!selectedItem) return;

        if (selectedItem.effect === 'unlock_category') {
            if (!catName) {
                showToast("Please enter a category name", 'error');
                return;
            }
            if (buyShopItem(selectedItem, catName, { type: catType, color: catColor })) {
                setSelectedItem(null);
                setCatName('');
            }
        } else if (selectedItem.effect === 'category_multiplier') {
            if (buyShopItem(selectedItem, targetCategory)) {
                showToast(`${targetCategory} boosted!`, 'success');
                setSelectedItem(null);
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8 text-center"><h1 className="text-4xl font-bold text-white font-display">Marketplace</h1></header>
            <div className="flex justify-center gap-8 mb-12">
                <div className="flex items-center gap-2 bg-surface-dark px-6 py-3 rounded-full border border-[#5d4a35] shadow-lg shadow-yellow-500/5">
                    <span className="material-symbols-outlined text-yellow-400">monetization_on</span>
                    <span className="text-white font-bold text-2xl">{stats.gold}</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-dark px-6 py-3 rounded-full border border-[#5d4a35] shadow-lg shadow-pink-500/5">
                    <span className="material-symbols-outlined text-pink-400">diamond</span>
                    <span className="text-white font-bold text-2xl">{stats.gems}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SHOP_ITEMS.map(item => {
                    const isLocked = item.minLevel && stats.level < item.minLevel;
                    const isMaxMap = item.effect === 'map_upgrade' && stats.harvestMapLevel >= 5;
                    
                    return (
                        <div key={item.id} className={`bg-surface-dark rounded-xl overflow-hidden border border-[#5d4a35] p-6 flex flex-col hover:border-primary/30 transition-all ${isLocked ? 'opacity-50' : ''}`}>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-sm text-stone-400 mb-4">{item.description}</p>
                            </div>
                            
                            <div className="bg-black/20 rounded-lg p-3 mb-4 flex gap-4 text-sm font-bold">
                                {item.costGold > 0 && (
                                    <span className="flex items-center gap-1 text-yellow-400"><span className="material-symbols-outlined text-sm">monetization_on</span> {item.costGold}</span>
                                )}
                                {item.costGems > 0 && (
                                    <span className="flex items-center gap-1 text-pink-400"><span className="material-symbols-outlined text-sm">diamond</span> {item.costGems}</span>
                                )}
                            </div>

                            {isMaxMap ? <button disabled className="bg-stone-700 text-stone-400 py-3 rounded-lg font-bold w-full">Max Level Reached</button> :
                            <button onClick={() => handleBuy(item)} disabled={isLocked} className={`py-3 rounded-lg font-bold w-full transition-colors flex justify-center gap-2 ${isLocked ? 'bg-stone-800 text-stone-500 cursor-not-allowed' : 'bg-primary text-black hover:bg-primary/90'}`}>
                                {isLocked ? `Requires Level ${item.minLevel}` : (item.effect === 'unlock_category' || item.effect === 'category_multiplier') ? 'Obtain Permit' : 'Buy Now'}
                            </button>}
                        </div>
                    );
                })}
            </div>

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-[#3e3223] p-6 rounded-2xl w-full max-w-md border border-[#5d4a35] space-y-4 shadow-2xl">
                        <h3 className="text-white font-bold text-xl font-display">
                            {selectedItem.effect === 'unlock_category' ? 'Mint Custom Category' : 'Select Category to Boost'}
                        </h3>
                        
                        {selectedItem.effect === 'unlock_category' && (
                            <>
                                <p className="text-stone-400 text-sm">Create a new classification for your habits and quests.</p>
                                
                                <div className="space-y-2">
                                    <label className="text-xs text-stone-500 uppercase font-bold">Category Name</label>
                                    <input placeholder="e.g. Creativity, Social..." value={catName} onChange={e => setCatName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" />
                                </div>
                                
                                <div className="space-y-2">
                                     <label className="text-xs text-stone-500 uppercase font-bold">Icon Style</label>
                                     <div className="flex gap-2">
                                        {(['potion','book','pen'] as const).map(t => (
                                            <button key={t} onClick={() => setCatType(t)} className={`flex-1 p-3 rounded-lg border transition-all flex justify-center ${catType === t ? 'border-primary bg-primary/20 text-white' : 'border-white/10 text-stone-500 hover:bg-white/5'}`}>
                                                <span className="material-symbols-outlined">{t === 'potion' ? 'science' : t === 'book' ? 'menu_book' : 'edit'}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                     <label className="text-xs text-stone-500 uppercase font-bold">Color Essence</label>
                                     <div className="flex gap-2 items-center bg-black/30 p-2 rounded-lg border border-white/10">
                                         <input type="color" value={catColor} onChange={e => setCatColor(e.target.value)} className="size-10 rounded cursor-pointer bg-transparent border-none" />
                                         <span className="text-stone-400 font-mono text-sm">{catColor}</span>
                                     </div>
                                </div>
                            </>
                        )}

                        {selectedItem.effect === 'category_multiplier' && (
                            <>
                                <p className="text-stone-400 text-sm">Choose a category to receive a permanent 1.5x reward multiplier.</p>
                                <div className="space-y-2">
                                    <label className="text-xs text-stone-500 uppercase font-bold">Target Category</label>
                                    <select value={targetCategory} onChange={e => setTargetCategory(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none">
                                        {allCategories.map(c => <option key={c} value={c}>{c} {stats.categoryMultipliers[c] ? `(x${stats.categoryMultipliers[c]})` : ''}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button onClick={confirmPurchase} className="flex-1 bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90">Confirm</button>
                            <button onClick={() => setSelectedItem(null)} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Shop;
