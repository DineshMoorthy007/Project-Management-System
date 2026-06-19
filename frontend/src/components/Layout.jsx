import React from 'react';
import { Outlet, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, Folder, ListTodo } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 shadow-sm shadow-slate-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" onClick={() => setActiveTab('overview')} className="flex items-center space-x-3 group">
              <img src="/favicon.svg" className="w-9 h-9 object-contain transition-transform group-hover:scale-105" alt="ProjectFlow Logo" />
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">ProjectFlow</h1>
                <span className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold">ENTERPRISE PMS</span>
              </div>
            </Link>

            {/* Nav Items (Navbar version) */}
            <nav className="hidden md:flex space-x-1">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm font-semibold ${
                  activeTab === 'overview' 
                    ? 'bg-blue-50 text-blue-650' 
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={() => setActiveTab('projects')} 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm font-semibold ${
                  activeTab === 'projects' 
                    ? 'bg-blue-50 text-blue-650' 
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Folder size={16} />
                <span>Projects</span>
              </button>
              <button 
                onClick={() => setActiveTab('tasks')} 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm font-semibold ${
                  activeTab === 'tasks' 
                    ? 'bg-blue-50 text-blue-650' 
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ListTodo size={16} />
                <span>Tasks</span>
              </button>
            </nav>
          </div>

          {/* User Block & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 font-bold shadow-inner">
                {user?.fullName?.charAt(0) || <UserIcon size={14} />}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.fullName || 'User Profile'}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{user?.email || 'authenticated'}</p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 py-2 px-3 sm:px-4 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-650 text-slate-650 font-semibold transition duration-150 border border-slate-200 hover:border-red-200 active:scale-[0.98] text-xs"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-gradient-to-tr from-slate-100 via-slate-50 to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet context={{ activeTab, setActiveTab }} />
        </div>
      </main>
    </div>
  );
};

export default Layout;
