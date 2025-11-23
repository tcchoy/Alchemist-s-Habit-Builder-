
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
    const { exportSaveData, exportHistoryToCSV, importSaveData, stats, setStats, saveToCloud, loadFromCloud, setLanguage, resetGame } = useGame();
    const [importStatus, setImportStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newName, setNewName] = useState(stats.shopName);
    const [cloudUrl, setCloudUrl] = useState('');
    const [cloudToken, setCloudToken] = useState('');
    const [cloudStatus, setCloudStatus] = useState('');

    const handleDownloadJSON = () => {
        const data = exportSaveData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `potion_shop_save.json`;
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
                setImportStatus("Error: Invalid file.");
            }
        };
        reader.readAsText(file);
    };

    const handleCloudSave = async () => {
        setCloudStatus('Saving...');
        const success = await saveToCloud(cloudUrl, cloudToken);
        setCloudStatus(success ? 'Saved to Cloud!' : 'Failed to Save');
    };

    const handleCloudLoad = async () => {
        setCloudStatus('Loading...');
        const success = await loadFromCloud(cloudUrl, cloudToken);
        setCloudStatus(success ? 'Loaded! Reloading...' : 'Failed to Load');
        if (success) setTimeout(() => window.location.reload(), 1000);
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to completely reset your game progress? This cannot be undone.")) {
            resetGame();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-dark p-6 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white font-display">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="space-y-6">
                    {/* General */}
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white text-sm font-bold">Language</span>
                            <div className="flex gap-2">
                                <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded text-xs ${stats.language === 'en' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}>English</button>
                                <button onClick={() => setLanguage('zh-TW')} className={`px-2 py-1 rounded text-xs ${stats.language === 'zh-TW' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}>繁體中文</button>
                            </div>
                        </div>
                        <div>
                            <span className="text-white text-sm font-bold block mb-1">Shop Name</span>
                            <div className="flex gap-2">
                                <input value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-sm" />
                                <button onClick={() => setStats(prev => ({...prev, shopName: newName}))} className="bg-primary text-black px-3 rounded text-xs font-bold">Save</button>
                            </div>
                        </div>
                    </div>

                    {/* Cloudflare Sync */}
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
                         <h3 className="text-white font-bold flex items-center gap-2"><span className="material-symbols-outlined text-orange-400">cloud</span> Cloud Sync</h3>
                         <input placeholder="Worker URL" value={cloudUrl} onChange={e => setCloudUrl(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-xs" />
                         <input placeholder="API Token" type="password" value={cloudToken} onChange={e => setCloudToken(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-xs" />
                         <div className="flex gap-2">
                             <button onClick={handleCloudSave} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded text-xs font-bold">Save to Cloud</button>
                             <button onClick={handleCloudLoad} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded text-xs font-bold">Load from Cloud</button>
                         </div>
                         {cloudStatus && <p className="text-xs text-center text-primary">{cloudStatus}</p>}
                    </div>

                    {/* Local File */}
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
                        <h3 className="text-white font-bold">Local File</h3>
                        <div className="flex gap-2">
                            <button onClick={handleDownloadJSON} className="flex-1 bg-primary/20 text-primary border border-primary/50 py-2 rounded text-xs font-bold">JSON Export</button>
                            <button onClick={() => {const data=exportHistoryToCSV(); const blob=new Blob([data],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='history.csv'; a.click();}} className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 rounded text-xs font-bold">CSV History</button>
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/10 text-white py-2 rounded text-xs font-bold">Import JSON</button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileUpload} />
                        {importStatus && <p className="text-xs text-center text-green-400">{importStatus}</p>}
                    </div>

                    {/* Reset */}
                    <div className="p-4 bg-red-900/10 rounded-xl border border-red-900/30">
                        <button onClick={handleReset} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 py-2 rounded text-xs font-bold">
                            Reset Game Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const { stats, t } = useGame();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-500">
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      
      <aside className="flex w-64 shrink-0 flex-col gap-8 border-r border-white/5 bg-surface-dark p-4 z-20 hidden md:flex">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="aspect-square size-12 rounded-full bg-cover bg-center border-2 border-primary/30" style={{ backgroundImage: `url("${stats.avatarUrl}")` }}></div>
            <div className="flex flex-col">
              <h1 className="font-display text-base font-bold leading-tight text-white truncate max-w-[150px]">{stats.shopName}</h1>
              <p className="font-display text-xs font-medium text-primary">Lv.{stats.level} {stats.title}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 mt-4">
            <SidebarItem to="/" icon="home" label={t('dashboard')} active={pathname === '/'} />
            <SidebarItem to="/habits" icon="science" label={t('brewing')} active={pathname === '/habits'} />
            <SidebarItem to="/quests" icon="assignment_turned_in" label={t('quests')} active={pathname === '/quests'} />
            <SidebarItem to="/harvest" icon="forest" label={t('harvest')} active={pathname === '/harvest'} />
            <SidebarItem to="/shop" icon="storefront" label={t('market')} active={pathname === '/shop'} />
            <SidebarItem to="/journal" icon="menu_book" label={t('grimoire')} active={pathname === '/journal'} />
            <SidebarItem to="/certificates" icon="workspace_premium" label={t('certificates')} active={pathname === '/certificates'} />
            <SidebarItem to="/calendar" icon="calendar_month" label={t('review')} active={pathname === '/calendar'} />
          </nav>
        </div>
        <div className="mt-auto">
          <button onClick={() => setShowSettings(true)} className="flex h-12 w-full items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/50 text-primary font-bold text-sm transition-colors">
            {t('settings')}
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-dark border-b border-white/10 flex items-center justify-between px-4 z-30">
         <span className="font-bold text-white">{stats.shopName}</span>
         <button onClick={() => setShowSettings(true)} className="text-white"><span className="material-symbols-outlined">settings</span></button>
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
