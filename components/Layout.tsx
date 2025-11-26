import React, { useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Toast } from '../types';
import BrewingAnimation from './BrewingAnimation';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({ to, icon, label, active }: { to: string; icon: string; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 rounded-full px-4 py-3 transition-all duration-200 group ${
      active 
        ? 'bg-primary/20 text-primary' 
        : 'text-stone-400 hover:bg-white/5 hover:text-stone-100'
    }`}
  >
    <span className={`material-symbols-outlined ${active ? 'fill' : ''}`} style={{fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"}}>{icon}</span>
    <p className="font-display text-sm font-medium leading-normal">{label}</p>
  </Link>
);

const BottomNavItem = ({ to, icon, label, active }: { to: string; icon: string; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-1 p-2 transition-all duration-200 ${
      active ? 'text-primary' : 'text-stone-400 hover:text-stone-100'
    }`}
  >
    <span className={`material-symbols-outlined text-2xl ${active ? 'fill' : ''}`} style={{fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"}}>{icon}</span>
    <span className="text-[10px] font-medium">{label}</span>
  </Link>
);

const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { 
        exportSaveData, exportHistoryToCSV, importSaveData, stats, setStats, setLanguage, resetGame, 
        login, register, logout, user,
        isCloudConfigured, configureCloud, disconnectCloud
    } = useGame();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newName, setNewName] = useState(stats.shopName);
    const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
    
    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginView, setIsLoginView] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Config State
    const [configJson, setConfigJson] = useState('');
    const [configError, setConfigError] = useState('');

    const getTimestampedFilename = (prefix: string, ext: string) => {
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
                        (now.getMonth()+1).toString().padStart(2, '0') +
                        now.getDate().toString().padStart(2, '0');
        const timeStr = now.getHours().toString().padStart(2, '0') +
                        now.getMinutes().toString().padStart(2, '0') +
                        now.getSeconds().toString().padStart(2, '0');
        return `${prefix}_${dateStr}_${timeStr}.${ext}`;
    };

    const handleDownloadJSON = () => {
        const data = exportSaveData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getTimestampedFilename('alchemist_habit_shop', 'json');
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
        a.download = getTimestampedFilename('history', 'csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = ""; // Reset input

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            importSaveData(text);
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to completely reset your game progress? This cannot be undone.")) {
            resetGame();
        }
    };
    
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            if (isLoginView) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            setEmail('');
            setPassword('');
        } catch (error) {
            // Error handled in context
        } finally {
            setAuthLoading(false);
        }
    };

    const handleConfigSubmit = () => {
        try {
            configureCloud(configJson);
        } catch(e) {
            setConfigError("Invalid JSON format or missing keys.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#3e3223] p-0 rounded-2xl border border-[#5d4a35] w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-[#5d4a35] bg-[#2a2218]">
                    <h2 className="text-xl font-bold text-white font-display">Settings</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="flex border-b border-[#5d4a35] bg-[#2a2218]">
                    <button onClick={() => setActiveTab('general')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'general' ? 'text-primary border-b-2 border-primary bg-white/5' : 'text-stone-400 hover:text-white'}`}>General</button>
                    <button onClick={() => setActiveTab('data')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'data' ? 'text-primary border-b-2 border-primary bg-white/5' : 'text-stone-400 hover:text-white'}`}>Data Management</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#3e3223]">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
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
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            {/* Cloud Sync (Firebase) */}
                            <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
                                 <h3 className="text-white font-bold flex items-center gap-2"><span className="material-symbols-outlined text-orange-400 text-base">cloud_sync</span> Cloud Account</h3>
                                 
                                 {!isCloudConfigured ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-200">
                                            <strong>Setup Required:</strong> To enable cloud sync, please paste your Firebase Config JSON below. This will be saved securely to your local storage.
                                        </div>
                                        <textarea 
                                            value={configJson}
                                            onChange={e => {setConfigJson(e.target.value); setConfigError('');}}
                                            placeholder='{"apiKey": "AIza...", "authDomain": "...", ...}'
                                            className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-white text-xs font-mono focus:border-primary focus:outline-none resize-none"
                                        />
                                        {configError && <p className="text-red-400 text-xs font-bold">{configError}</p>}
                                        <button onClick={handleConfigSubmit} className="w-full bg-primary text-black py-2 rounded text-xs font-bold hover:bg-primary/90">Connect to Cloud</button>
                                    </div>
                                 ) : (
                                     <>
                                         <p className="text-[10px] text-stone-400">Sign in to sync your progress across devices.</p>
                                         
                                         {user ? (
                                             <div className="flex flex-col gap-2">
                                                 <div className="flex items-center gap-2 text-green-400 text-xs">
                                                     <span className="material-symbols-outlined text-sm">check_circle</span>
                                                     Logged in as {user.email}
                                                 </div>
                                                 <button onClick={logout} className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded text-xs font-bold">Sign Out</button>
                                             </div>
                                         ) : (
                                             <div className="flex flex-col gap-3">
                                                 <form onSubmit={handleAuth} className="flex flex-col gap-3">
                                                    <input 
                                                        type="email" 
                                                        placeholder="Email Address" 
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary"
                                                        required
                                                    />
                                                    <input 
                                                        type="password" 
                                                        placeholder="Password" 
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary"
                                                        required
                                                        minLength={6}
                                                    />
                                                    <button 
                                                        type="submit" 
                                                        disabled={authLoading}
                                                        className="w-full bg-primary text-black py-2 rounded text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
                                                    >
                                                        {authLoading ? 'Processing...' : isLoginView ? 'Log In' : 'Sign Up'}
                                                    </button>
                                                 </form>
                                                 <button 
                                                    onClick={() => setIsLoginView(!isLoginView)} 
                                                    className="text-stone-400 text-xs hover:text-white underline"
                                                 >
                                                     {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                                                 </button>
                                             </div>
                                         )}
                                         
                                         <div className="pt-2 border-t border-white/5 mt-2">
                                             <button onClick={disconnectCloud} className="text-[10px] text-red-400 hover:text-red-300 underline">Reset Cloud Configuration</button>
                                         </div>
                                     </>
                                 )}
                            </div>

                            {/* Local Backup */}
                            <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
                                <h3 className="text-white font-bold text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base text-blue-400">save</span> Local Backup</h3>
                                <div className="flex gap-2">
                                    <button onClick={handleDownloadJSON} className="flex-1 bg-primary/20 text-primary border border-primary/50 py-2 rounded text-xs font-bold">Export JSON</button>
                                    <button onClick={handleDownloadCSV} className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 rounded text-xs font-bold">Export Records (CSV)</button>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/10 text-white py-2 rounded text-xs font-bold border border-white/10 hover:bg-white/20">Import Backup (JSON)</button>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileUpload} />
                            </div>

                            {/* Reset */}
                            <div className="p-4 bg-red-900/10 rounded-xl border border-red-900/30">
                                <button onClick={handleReset} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 py-2 rounded text-xs font-bold flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                                    Reset Game Data
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const { toasts } = useGame();
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md text-sm font-bold animate-in slide-in-from-right fade-in duration-300 ${
                    t.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-200' :
                    t.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' :
                    'bg-blue-500/20 border-blue-500/50 text-blue-200'
                }`}>
                    {t.message}
                </div>
            ))}
        </div>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const { stats, t, isBrewing, finishBrewing } = useGame();
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-500">
      <ToastContainer />
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {isBrewing && <BrewingAnimation onComplete={finishBrewing} />}
      
      {/* DESKTOP SIDEBAR */}
      <aside className="flex w-64 shrink-0 flex-col gap-8 border-r border-[#5d4a35]/50 bg-surface-dark p-4 z-20 hidden md:flex">
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

      {/* MOBILE DRAWER (FULL MENU) */}
      {showMobileDrawer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setShowMobileDrawer(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-surface-dark p-4 shadow-xl border-r border-[#5d4a35]" onClick={e => e.stopPropagation()}>
                 <div className="flex items-center justify-between mb-6 px-2">
                     <h2 className="text-xl font-bold text-white font-display">Menu</h2>
                     <button onClick={() => setShowMobileDrawer(false)}><span className="material-symbols-outlined text-stone-400">close</span></button>
                 </div>
                 <nav className="flex flex-col gap-1">
                    <SidebarItem to="/" icon="home" label={t('dashboard')} active={pathname === '/'} />
                    <SidebarItem to="/habits" icon="science" label={t('brewing')} active={pathname === '/habits'} />
                    <SidebarItem to="/quests" icon="assignment_turned_in" label={t('quests')} active={pathname === '/quests'} />
                    <SidebarItem to="/harvest" icon="forest" label={t('harvest')} active={pathname === '/harvest'} />
                    <SidebarItem to="/shop" icon="storefront" label={t('market')} active={pathname === '/shop'} />
                    <SidebarItem to="/journal" icon="menu_book" label={t('grimoire')} active={pathname === '/journal'} />
                    <SidebarItem to="/certificates" icon="workspace_premium" label={t('certificates')} active={pathname === '/certificates'} />
                    <SidebarItem to="/calendar" icon="calendar_month" label={t('review')} active={pathname === '/calendar'} />
                 </nav>
                 <div className="mt-6 pt-6 border-t border-white/5">
                      <button onClick={() => {setShowSettings(true); setShowMobileDrawer(false);}} className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-stone-400 hover:bg-white/5 hover:text-white">
                          <span className="material-symbols-outlined">settings</span>
                          <span className="font-display text-sm font-medium">{t('settings')}</span>
                      </button>
                 </div>
              </div>
          </div>
      )}

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-dark border-b border-[#5d4a35]/50 flex items-center justify-between px-4 z-30">
         <button onClick={() => setShowMobileDrawer(true)} className="text-white"><span className="material-symbols-outlined">menu</span></button>
         <span className="font-bold text-white truncate max-w-[200px]">{stats.shopName}</span>
         <div className="aspect-square size-8 rounded-full bg-cover bg-center border border-primary/30" style={{ backgroundImage: `url("${stats.avatarUrl}")` }}></div>
      </div>

      <main className="flex-1 overflow-y-auto relative scroll-smooth pt-16 pb-20 md:pt-0 md:pb-0">
         <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 pb-24">
            {children}
         </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-dark border-t border-[#5d4a35]/50 h-16 flex justify-around items-center z-40 pb-safe">
          <BottomNavItem to="/" icon="home" label="Home" active={pathname === '/'} />
          <BottomNavItem to="/habits" icon="science" label="Brew" active={pathname === '/habits'} />
          <BottomNavItem to="/quests" icon="assignment_turned_in" label="Quest" active={pathname === '/quests'} />
          <BottomNavItem to="/harvest" icon="forest" label="Harvest" active={pathname === '/harvest'} />
          <BottomNavItem to="/shop" icon="storefront" label="Shop" active={pathname === '/shop'} />
      </div>
    </div>
  );
};

export default Layout;