
import React, { useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({ to, icon, label, active }: { to: string; icon: string; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 rounded-full px-4 py-3 transition-all duration-200 group ${
      active 
        ? 'bg-primary/20 text-primary' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className={`material-symbols-outlined ${active ? 'fill' : ''}`} style={{fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"}}>{icon}</span>
    <p className="font-display text-sm font-medium leading-normal">{label}</p>
  </Link>
);

const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { exportSaveData, exportHistoryToCSV, importSaveData, stats, setStats } = useGame();
    const [importStatus, setImportStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newName, setNewName] = useState(stats.shopName);

    const handleDownloadJSON = () => {
        const data = exportSaveData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `potion_shop_save_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownloadCSV = () => {
        const data = exportHistoryToCSV();
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `potion_shop_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (importSaveData(text)) {
                setImportStatus("Success! Reloading...");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setImportStatus("Error: Invalid file format.");
            }
        };
        reader.readAsText(file);
    };

    const handleNameChange = () => {
        if(newName.trim()) {
            setStats(prev => ({...prev, shopName: newName}));
            alert("Shop name updated!");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-dark p-6 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white font-display">Game Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="space-y-6">
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                        <h3 className="text-white font-bold mb-2">Shop Details</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                placeholder="Enter Shop Name"
                            />
                            <button onClick={handleNameChange} className="bg-primary text-black px-3 rounded-lg font-bold text-sm">Save</button>
                        </div>
                    </div>

                    <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex flex-col gap-3">
                        <h3 className="text-white font-bold">Data Management</h3>
                        <p className="text-xs text-gray-400">Export your data to keep it safe.</p>
                        
                        <div className="flex gap-2">
                            <button onClick={handleDownloadJSON} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/50 font-bold rounded-lg text-sm hover:bg-primary hover:text-black transition-colors">
                                <span className="material-symbols-outlined text-base">data_object</span> Save File (JSON)
                            </button>
                            <button onClick={handleDownloadCSV} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 font-bold rounded-lg text-sm hover:bg-green-500 hover:text-black transition-colors">
                                <span className="material-symbols-outlined text-base">table_chart</span> History (CSV)
                            </button>
                        </div>

                        <div className="border-t border-white/10 pt-3 mt-1">
                            <p className="text-xs text-gray-400 mb-2">Import a previous JSON save file.</p>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept=".json"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/20">
                                <span className="material-symbols-outlined text-base">upload</span> Upload Save File
                            </button>
                            {importStatus && <p className={`text-xs mt-2 font-bold ${importStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{importStatus}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const { stats } = useGame();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-500">
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      
      <aside className="flex w-64 shrink-0 flex-col gap-8 border-r border-white/5 bg-surface-dark p-4 z-20 hidden md:flex">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div 
                className="aspect-square size-12 rounded-full bg-cover bg-center bg-no-repeat border-2 border-primary/30" 
                style={{ backgroundImage: `url("${stats.avatarUrl}")` }}
            ></div>
            <div className="flex flex-col">
              <h1 className="font-display text-base font-bold leading-tight text-white truncate max-w-[150px]">{stats.shopName}</h1>
              <p className="font-display text-xs font-medium text-primary">Level {stats.level} {stats.title}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 mt-4">
            <SidebarItem to="/" icon="home" label="Dashboard" active={pathname === '/'} />
            <SidebarItem to="/habits" icon="science" label="Brewing Station" active={pathname === '/habits'} />
            <SidebarItem to="/quests" icon="assignment_turned_in" label="Quest Board" active={pathname === '/quests'} />
            <SidebarItem to="/harvest" icon="forest" label="Wild Harvest" active={pathname === '/harvest'} />
            <SidebarItem to="/shop" icon="storefront" label="Marketplace" active={pathname === '/shop'} />
            <SidebarItem to="/journal" icon="menu_book" label="Grimoire" active={pathname === '/journal'} />
            <SidebarItem to="/calendar" icon="calendar_month" label="Review" active={pathname === '/calendar'} />
          </nav>
        </div>

        <div className="mt-auto">
          <p className="text-center text-xs text-gray-600 pb-2">Game auto-saves locally</p>
          <button 
            onClick={() => setShowSettings(true)}
            className="flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/50 px-4 text-sm font-bold leading-normal text-primary transition-colors"
          >
            <span className="truncate">Settings / Export</span>
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-dark border-b border-white/10 flex items-center justify-between px-4 z-30">
         <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">eco</span>
            <span className="font-bold text-white truncate max-w-[120px]">{stats.shopName}</span>
         </div>
         <div className="flex gap-1">
             <Link to="/" className="p-2 text-white"><span className="material-symbols-outlined">home</span></Link>
             <Link to="/habits" className="p-2 text-white"><span className="material-symbols-outlined">science</span></Link>
             <Link to="/quests" className="p-2 text-white"><span className="material-symbols-outlined">assignment_turned_in</span></Link>
             <Link to="/shop" className="p-2 text-white"><span className="material-symbols-outlined">storefront</span></Link>
             <button onClick={() => setShowSettings(true)} className="p-2 text-white"><span className="material-symbols-outlined">settings</span></button>
         </div>
      </div>

      <main className="flex-1 overflow-y-auto relative scroll-smooth pt-16 md:pt-0">
         <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 pb-24">
            {children}
         </div>
      </main>
    </div>
  );
};

export default Layout;
