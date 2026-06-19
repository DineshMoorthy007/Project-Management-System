import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Plus, 
  RefreshCw, 
  AlertCircle,
  Search,
  ArrowRight,
  Loader2
} from 'lucide-react';
import DashboardStats from '../components/DashboardStats';

const Dashboard = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { activeTab, setActiveTab } = useOutletContext();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Project Form States
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStatusVal, setProjStatusVal] = useState('Not_Started');
  const [projError, setProjError] = useState('');
  const [projSubmitting, setProjSubmitting] = useState(false);

  // Task Form States
  const [tName, setTName] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tDueDate, setTDueDate] = useState('');
  const [tPriority, setTPriorityVal] = useState('Medium');
  const [tStatus, setTStatusVal] = useState('Pending');
  const [tProjectId, setTProjectId] = useState('');
  const [tError, setTError] = useState('');
  const [tSubmitting, setTSubmitting] = useState(false);

  // Reset form helper functions
  const resetProjectForm = () => {
    setProjName('');
    setProjDesc('');
    setProjStatusVal('Not_Started');
    setProjError('');
  };

  const resetTaskForm = () => {
    setTName('');
    setTDesc('');
    setTDueDate('');
    setTPriorityVal('Medium');
    setTStatusVal('Pending');
    setTProjectId(projects[0]?.id || '');
    setTError('');
  };

  // Initialize task project selection dropdown default
  useEffect(() => {
    if (isTaskModalOpen && projects.length > 0 && !tProjectId) {
      setTProjectId(projects[0].id);
    }
  }, [isTaskModalOpen, projects, tProjectId]);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projName.trim()) {
      setProjError('Project Name is required.');
      return;
    }
    setProjSubmitting(true);
    setProjError('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.post('http://localhost:5000/api/projects', {
        name: projName,
        description: projDesc,
        status: projStatusVal
      }, config);

      setIsProjectModalOpen(false);
      resetProjectForm();
      fetchData(true);
    } catch (err) {
      setProjError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create project.');
    } finally {
      setProjSubmitting(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!tName.trim()) {
      setTError('Task Name is required.');
      return;
    }
    if (!tProjectId) {
      setTError('Please select a project.');
      return;
    }
    setTSubmitting(true);
    setTError('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.post('http://localhost:5000/api/tasks', {
        name: tName,
        description: tDesc,
        dueDate: tDueDate ? new Date(tDueDate).toISOString() : null,
        priority: tPriority,
        status: tStatus,
        projectId: tProjectId
      }, config);

      setIsTaskModalOpen(false);
      resetTaskForm();
      fetchData(true);
    } catch (err) {
      setTError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create task.');
    } finally {
      setTSubmitting(false);
    }
  };

  // Search & Filter state variables
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [taskPriority, setTaskPriority] = useState('');

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      // Securely construct headers with JWT
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Fetch projects and tasks concurrently with security header config
      const [projectsRes, tasksRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects', config),
        axios.get('http://localhost:5000/api/tasks', config)
      ]);

      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Clean JavaScript helper functions to compute filtered arrays
  const getFilteredProjects = () => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(projectSearch.toLowerCase()));
      const matchesStatus = !projectStatus || p.status === projectStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredTasks = () => {
    return tasks.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (t.project && t.project.name.toLowerCase().includes(taskSearch.toLowerCase()));
      const matchesStatus = !taskStatus || t.status === taskStatus;
      const matchesPriority = !taskPriority || t.priority === taskPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const filteredProjects = getFilteredProjects();
  const filteredTasks = getFilteredTasks();

  // Modern Centered Loading Spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[450px]">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        <p className="mt-4 text-slate-500 font-medium tracking-wide text-sm animate-pulse">Loading dashboard telemetry...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Dashboard</h2>
          <p className="text-sm text-slate-500">Track milestones, sprint updates, and productivity metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition duration-150 flex items-center justify-center active:scale-95 shadow-sm shadow-slate-100/30"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}


      {/* Tab Content Panels */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-200">
            <DashboardStats projects={projects} tasks={tasks} />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="animate-in fade-in duration-200 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
                <p className="text-xs text-slate-500">Directory of running development pipelines.</p>
              </div>
              <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition active:scale-95 shadow-sm shadow-blue-500/10 self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>New Project</span>
              </button>
            </div>

            {/* Project Filters Row */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={projectSearch} 
                  onChange={(e) => setProjectSearch(e.target.value)} 
                  placeholder="Search projects by name..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <select 
                value={projectStatus} 
                onChange={(e) => setProjectStatus(e.target.value)} 
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Statuses</option>
                <option value="Not_Started">Not Started</option>
                <option value="In_Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Projects list or empty state */}
            <div className="space-y-3.5">
              {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
                    <Search size={22} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">No projects found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px]">We couldn't find any projects matching your search criteria.</p>
                  <button 
                    onClick={() => { setProjectSearch(''); setProjectStatus(''); }}
                    className="mt-3.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredProjects.map(proj => (
                  <div key={proj.id} className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 hover:border-slate-300 transition flex justify-between items-center group">
                    <div className="truncate pr-4">
                      <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition truncate">{proj.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-md">{proj.description}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                      proj.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : proj.status === 'In_Progress' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-slate-100 text-slate-650 border-slate-200'
                    }`}>
                      {proj.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-in fade-in duration-200 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Active Tasks</h3>
                <p className="text-xs text-slate-500">Core tasks for this cycle.</p>
              </div>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition active:scale-95 shadow-sm shadow-blue-500/10"
              >
                <Plus size={14} />
                <span>New Task</span>
              </button>
            </div>

            {/* Task Filters Group */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={taskSearch} 
                  onChange={(e) => setTaskSearch(e.target.value)} 
                  placeholder="Search tasks by name..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={taskStatus} 
                  onChange={(e) => setTaskStatus(e.target.value)} 
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <select 
                  value={taskPriority} 
                  onChange={(e) => setTaskPriority(e.target.value)} 
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Tasks list or empty state */}
            <div className="space-y-2.5">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
                    <Search size={20} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">No tasks found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">We couldn't find any tasks matching your criteria.</p>
                  <button 
                    onClick={() => { setTaskSearch(''); setTaskStatus(''); setTaskPriority(''); }}
                    className="mt-3.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50/30 border border-slate-100 rounded-xl hover:border-slate-200 transition">
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        t.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300 border border-slate-200'
                      }`}></div>
                      <span className={`text-xs truncate ${
                        t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}>{t.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                      t.priority === 'High' 
                        ? 'bg-red-50 text-red-700 border-red-100' 
                        : t.priority === 'Medium' 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-slate-100 text-slate-650 border-slate-200'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Project Modal Overlay */}
      {isProjectModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Create New Project</h3>
            <p className="text-sm text-slate-500 mb-4">Enter details for the new project pipeline.</p>
            
            {projError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs">
                {projError}
              </div>
            )}

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
                <input 
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Brief project details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={projStatusVal}
                  onChange={(e) => setProjStatusVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Not_Started">Not Started</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setIsProjectModalOpen(false); resetProjectForm(); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition active:scale-95"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  disabled={projSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs transition active:scale-95 shadow-sm shadow-blue-500/10"
                >
                  {projSubmitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Task Modal Overlay */}
      {isTaskModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Create New Task</h3>
            <p className="text-sm text-slate-500 mb-4">Enter details for the new task.</p>

            {tError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-755 text-xs">
                {tError}
              </div>
            )}

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Name *</label>
                <input 
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="e.g. Design Auth Flow"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={tDesc}
                  onChange={(e) => setTDesc(e.target.value)}
                  placeholder="Brief task description..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={tPriority}
                    onChange={(e) => setTPriorityVal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={tStatus}
                    onChange={(e) => setTStatusVal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In_Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={tDueDate}
                    onChange={(e) => setTDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project *</label>
                  <select
                    required
                    value={tProjectId}
                    onChange={(e) => setTProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled>Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setIsTaskModalOpen(false); resetTaskForm(); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition active:scale-95"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  disabled={tSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs transition active:scale-95 shadow-sm shadow-blue-500/10"
                >
                  {tSubmitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Dashboard;
