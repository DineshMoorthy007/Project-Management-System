import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  LogOut, 
  Folder, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  Plus, 
  User as UserIcon, 
  RefreshCw, 
  LayoutDashboard, 
  ListTodo, 
  TrendingUp, 
  AlertCircle,
  Search,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Local calculation states
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    projectsInProgress: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0
  });

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axios.get('/api/projects').catch(() => null),
        axios.get('/api/tasks').catch(() => null)
      ]);

      let projectsData = [];
      let tasksData = [];

      if (projectsRes && Array.isArray(projectsRes.data)) {
        projectsData = projectsRes.data;
      } else {
        projectsData = [
          { id: '1', name: 'Cloud Migration Strategy', description: 'Migrate critical legacy databases and APIs to secure AWS instances.', status: 'In_Progress', startDate: '2026-06-01', endDate: '2026-08-30' },
          { id: '2', name: 'UI Dashboard System Design', description: 'Design and build the new clean enterprise telemetry dashboard.', status: 'In_Progress', startDate: '2026-06-15', endDate: '2026-07-20' },
          { id: '3', name: 'ISO 27001 Security Audit', description: 'Ensure compliance with security standards across all repositories.', status: 'Not_Started', startDate: '2026-07-01', endDate: '2026-07-31' },
          { id: '4', name: 'API Version 2.0 Integration', description: 'Deprecated v1 routing nodes and replace with performant GraphQL routes.', status: 'Completed', startDate: '2026-05-10', endDate: '2026-06-12' }
        ];
      }

      if (tasksRes && Array.isArray(tasksRes.data)) {
        tasksData = tasksRes.data;
      } else {
        tasksData = [
          { id: 't1', name: 'Write system implementation plan', priority: 'High', status: 'Completed', project: { name: 'UI Dashboard System Design' } },
          { id: 't2', name: 'Configure CORS & session tokens', priority: 'High', status: 'In_Progress', project: { name: 'UI Dashboard System Design' } },
          { id: 't3', name: 'Validate password hashing parameters', priority: 'Medium', status: 'Pending', project: { name: 'ISO 27001 Security Audit' } },
          { id: 't4', name: 'Benchmark PostgreSQL query indexing', priority: 'Low', status: 'Pending', project: { name: 'Cloud Migration Strategy' } },
          { id: 't5', name: 'Refactor OAuth state handler', priority: 'High', status: 'Completed', project: { name: 'API Version 2.0 Integration' } }
        ];
      }

      setProjects(projectsData);
      setTasks(tasksData);
      calculateMetrics(projectsData, tasksData);

    } catch (err) {
      setError('Could not connect to database. Displaying workspace demo states.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateMetrics = (projectsList, tasksList) => {
    const totalP = projectsList.length;
    const progressP = projectsList.filter(p => p.status === 'In_Progress').length;
    const totalT = tasksList.length;
    const completedT = tasksList.filter(t => t.status === 'Completed').length;
    const pendingT = tasksList.filter(t => t.status === 'Pending' || t.status === 'In_Progress').length;
    const rate = totalT > 0 ? Math.round((completedT / totalT) * 100) : 0;

    setMetrics({
      totalProjects: totalP,
      projectsInProgress: progressP,
      totalTasks: totalT,
      completedTasks: completedT,
      pendingTasks: pendingT,
      completionRate: rate
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTasks = tasks.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.project && t.project.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between p-6 shrink-0 shadow-sm">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2H9a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">ProjectFlow</h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold">ENTERPRISE PMS</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            <a href="#dashboard" className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-650 border-l-4 border-blue-600 font-bold transition-all text-sm">
              <LayoutDashboard size={18} />
              <span>Workspace</span>
            </a>
            <a href="#projects" className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-medium">
              <Folder size={18} />
              <span>Projects</span>
            </a>
            <a href="#tasks" className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-medium">
              <ListTodo size={18} />
              <span>Tasks List</span>
            </a>
          </nav>
        </div>

        {/* User Block */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 font-bold shadow-inner">
              {user?.fullName?.charAt(0) || <UserIcon size={18} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || 'User Profile'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'authenticated'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-650 text-slate-650 font-semibold transition duration-150 border border-slate-200 hover:border-red-200 active:scale-[0.98] text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 min-w-0 p-6 md:p-8 flex flex-col space-y-6 overflow-y-auto bg-gradient-to-tr from-slate-100 via-slate-50 to-blue-50/50">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Dashboard</h2>
            <p className="text-sm text-slate-500">Track milestones, sprint updates, and productivity metrics.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-48 sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm shadow-slate-100/30"
              />
            </div>

            <button 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-850 hover:border-slate-350 transition duration-150 flex items-center justify-center active:scale-95 shadow-sm shadow-slate-100/30"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-650' : ''} />
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Grid Metrics */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm shadow-slate-100/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Projects</span>
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Folder size={18} /></div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900">{metrics.totalProjects}</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm shadow-slate-100/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">In Progress</span>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Clock size={18} /></div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900">{metrics.projectsInProgress}</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm shadow-slate-100/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tasks Done</span>
                <div className="p-2 bg-emerald-550/10 rounded-xl text-emerald-600"><CheckCircle2 size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-slate-900">{metrics.completedTasks}</span>
                <span className="text-slate-400 text-xs font-medium">/ {metrics.totalTasks} tasks</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm shadow-slate-100/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Completion</span>
                <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600"><TrendingUp size={18} /></div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{metrics.completionRate}%</span>
                <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${metrics.completionRate}%` }}></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Workspace Dual Columns */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List column */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
                  <p className="text-xs text-slate-500">Directory of running development pipelines.</p>
                </div>
                <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition active:scale-95 shadow-sm shadow-blue-500/10">
                  <Plus size={14} />
                  <span>New Project</span>
                </button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-150 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredProjects.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">No projects found.</div>
                  ) : (
                    filteredProjects.map(proj => (
                      <div key={proj.id} className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 hover:border-slate-300 transition flex justify-between items-center group">
                        <div className="truncate pr-4">
                          <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-650 transition truncate">{proj.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 truncate max-w-md">{proj.description}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          proj.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : proj.status === 'In_Progress' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {proj.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <a href="#projects" className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition">
                <span>View all project workflows</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Tasks checklist column */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Active Tasks</h3>
                  <p className="text-xs text-slate-500">Core tasks for this cycle.</p>
                </div>
                <button className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition active:scale-95">
                  <Plus size={14} />
                </button>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-50 border border-slate-150 rounded-xl"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">No tasks found.</div>
                  ) : (
                    filteredTasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50/30 border border-slate-100 rounded-xl hover:border-slate-200 transition">
                        <div className="flex items-center space-x-3 truncate">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            t.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-350 border border-slate-300'
                          }`}></div>
                          <span className={`text-xs truncate ${
                            t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'
                          }`}>{t.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          t.priority === 'High' 
                            ? 'bg-red-50 text-red-700 border-red-100' 
                            : t.priority === 'Medium' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <a href="#tasks" className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition">
                <span>Navigate task board</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
