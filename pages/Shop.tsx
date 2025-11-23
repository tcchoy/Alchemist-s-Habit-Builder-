
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ShopItem, PotionCategory } from '../types';

const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'slot_1',
        name: 'Oak Shelf Expansion',
        description: 'Adds 1 extra slot for active Potions (Habits).',
        costGold: 200,
        costGems: 0,
        effect: 'slot_upgrade',
        value: 1,
        minLevel: 1
    },
    {
        id: 'cat_unlock',
        name: 'Custom Category Permit',
        description: 'Unlock a new custom category for your Habits and Quests.',
        costGold: 0,
        costGems: 50,
        effect: 'unlock_category',
        value: 0,
        minLevel: 3
    },
    {
        id: 'felix_felicis',
        name: 'Felix Felicis Brew',
        description: 'Doubles rewards for ONE specific category permanently.',
        costGold: 0,
        costGems: 100,
        effect: 'category_multiplier',
        value: 2,
        minLevel: 5
    },
    {
        id: 'dec_shelf_oak',
        name: 'Ancient Oak Shelves',
        description: 'Cosmetic upgrade for your shop dashboard.',
        costGold: 1000,
        costGems: 0,
        effect: 'decoration',
        meta: 'shelves',
        value: 1,
        minLevel: 2
    },
    {
        id: 'dec_cauldron_gold',
        name: 'Golden Cauldron',
        description: 'A legendary cauldron that glows with magic (Cosmetic).',
        costGold: 5000,
        costGems: 10,
        effect: 'decoration',
        meta: 'cauldron',
        value: 2,
        minLevel: 10
    }
];

const Shop: React.FC = () => {
    const { stats, buyShopItem } = useGame();
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

    const defaultCategories: PotionCategory[] = ['Health', 'Knowledge', 'Housework', 'Productivity'];
    const allCategories = [...defaultCategories, ...stats.customCategories];

    const handleBuyClick = (item: ShopItem) => {
        if (item.effect === 'unlock_category' || item.effect === 'category_multiplier') {
            setSelectedItem(item); // Open Modal
        } else {
            // Direct Buy
            if (buyShopItem(item)) {
                alert(`Purchased ${item.name}!`);
            } else {
                alert("Not enough funds!");
            }
        }
    };

    const handleSpecialBuy = (param: string) => {
        if (!selectedItem) return;
        if (buyShopItem(selectedItem, param)) {
            alert("Purchase Successful!");
            setSelectedItem(null);
        } else {
            alert("Transaction failed.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-white font-display">The Marketplace</h1>
                <p className="text-gray-400">Spend your hard-earned loot on upgrades and decorations.</p>
            </header>

            {/* User Wallet */}
            <div className="flex justify-center gap-8 mb-12">
                <div className="flex items-center gap-3 bg-surface-dark px-6 py-3 rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-yellow-400">monetization_on</span>
                    <span className="text-2xl font-bold text-white">{stats.gold}</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-dark px-6 py-3 rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-purple-400">diamond</span>
                    <span className="text-2xl font-bold text-white">{stats.gems}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SHOP_ITEMS.map(item => {
                    const isLocked = item.minLevel && stats.level < item.minLevel;
                    const canAfford = stats.gold >= item.costGold && stats.gems >= item.costGems;
                    
                    // Check if decoration already owned
                    let isOwned = false;
                    if (item.effect === 'decoration' && item.meta) {
                        const currentVal = stats.purchasedDecorations[item.meta as keyof typeof stats.purchasedDecorations];
                        // Simple check: if current setting matches what this item gives
                        if (item.id === 'dec_shelf_oak' && currentVal === 'oak') isOwned = true;
                        if (item.id === 'dec_cauldron_gold' && currentVal === 'golden') isOwned = true;
                    }

                    return (
                        <div key={item.id} className={`flex flex-col bg-surface-dark rounded-xl overflow-hidden border transition-all ${isLocked ? 'opacity-50 border-white/5' : 'border-white/10 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1'}`}>
                            <div className="h-32 bg-[#1a150f] flex items-center justify-center relative group">
                                 <span className="material-symbols-outlined text-6xl text-gray-600 group-hover:text-primary transition-colors">storefront</span>
                                 {isLocked && (
                                     <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                         <span className="flex items-center gap-2 text-red-400 font-bold">
                                             <span className="material-symbols-outlined">lock</span> Level {item.minLevel}
                                         </span>
                                     </div>
                                 )}
                                 <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white border border-white/10">
                                     {item.effect === 'decoration' ? 'Cosmetic' : 'Upgrade'}
                                 </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-sm text-gray-400 mb-6 flex-1">{item.description}</p>
                                
                                {isOwned ? (
                                    <button disabled className="w-full py-3 rounded-lg font-bold bg-gray-800 text-green-500 border border-green-500/30">
                                        Owned
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleBuyClick(item)}
                                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                                            isLocked || !canAfford 
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-primary text-black hover:bg-primary/90'
                                        }`}
                                        disabled={isLocked || !canAfford}
                                    >
                                        {item.costGold > 0 && (
                                            <span className="flex items-center gap-1 text-xs">
                                                {item.costGold} <span className="material-symbols-outlined text-sm">monetization_on</span>
                                            </span>
                                        )}
                                        {item.costGems > 0 && (
                                            <span className="flex items-center gap-1 text-xs">
                                                {item.costGems} <span className="material-symbols-outlined text-sm">diamond</span>
                                            </span>
                                        )}
                                        <span>{isLocked ? 'Locked' : 'Buy'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal for Special Purchases */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface-dark p-6 rounded-2xl border border-white/10 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">{selectedItem.name}</h3>
                        
                        {selectedItem.effect === 'unlock_category' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-gray-400">Enter the name of the new category you want to add (e.g., "Fitness", "Art").</p>
                                <input type="text" id="newCatInput" className="bg-black/30 border border-white/10 rounded p-2 text-white" placeholder="Category Name" />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            const val = (document.getElementById('newCatInput') as HTMLInputElement).value;
                                            if (val) handleSpecialBuy(val);
                                        }}
                                        className="bg-primary text-black px-4 py-2 rounded font-bold"
                                    >Confirm</button>
                                    <button onClick={() => setSelectedItem(null)} className="text-gray-400 px-4 py-2">Cancel</button>
                                </div>
                            </div>
                        )}

                        {selectedItem.effect === 'category_multiplier' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-gray-400">Select which category receives the 2x reward boost.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {allCategories.map(cat => (
                                        <button 
                                            key={cat} 
                                            onClick={() => handleSpecialBuy(cat)}
                                            className="bg-white/5 hover:bg-primary/20 border border-white/10 text-white py-2 rounded"
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="text-gray-400 mt-2">Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
