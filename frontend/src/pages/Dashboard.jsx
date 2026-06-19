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
  Loader2,
  Trash2,
  Pencil
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
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

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
    if (isTaskModalOpen && projects.length > 0 && !tProjectId && !editingTask) {
      setTProjectId(projects[0].id);
    }
  }, [isTaskModalOpen, projects, tProjectId, editingTask]);

  // Prefill forms when editing objects are set
  useEffect(() => {
    if (editingProject) {
      setProjName(editingProject.name || '');
      setProjDesc(editingProject.description || '');
      setProjStatusVal(editingProject.status || 'Not_Started');
      setProjError('');
    }
  }, [editingProject]);

  useEffect(() => {
    if (editingTask) {
      setTName(editingTask.name || '');
      setTDesc(editingTask.description || '');
      setTDueDate(editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '');
      setTPriorityVal(editingTask.priority || 'Medium');
      setTStatusVal(editingTask.status || 'Pending');
      setTProjectId(editingTask.projectId || '');
      setTError('');
    }
  }, [editingTask]);

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
      const payload = {
        name: projName,
        description: projDesc,
        status: projStatusVal
      };

      if (editingProject) {
        await axios.put(`http://localhost:5000/api/projects/${editingProject.id}`, payload, config);
        setEditingProject(null);
      } else {
        await axios.post('http://localhost:5000/api/projects', payload, config);
        setIsProjectModalOpen(false);
      }

      resetProjectForm();
      fetchData(true);
    } catch (err) {
      setProjError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save project.');
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
      const payload = {
        name: tName,
        description: tDesc,
        dueDate: tDueDate ? new Date(tDueDate).toISOString() : null,
        priority: tPriority,
        status: tStatus,
        projectId: tProjectId
      };

      if (editingTask) {
        await axios.put(`http://localhost:5000/api/tasks/${editingTask.id}`, payload, config);
        setEditingTask(null);
      } else {
        await axios.post('http://localhost:5000/api/tasks', payload, config);
        setIsTaskModalOpen(false);
      }

      resetTaskForm();
      fetchData(true);
    } catch (err) {
      setTError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save task.');
    } finally {
      setTSubmitting(false);
    }
  };
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(`http://localhost:5000/api/projects/${id}`, config);
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete project.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, config);
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete task.');
    }
  };

  // Search & Filter state variables
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [taskPriority, setTaskPriority] = useState('');
  const [taskSort, setTaskSort] = useState('newest');

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

      setProjects(Array.isArray(projectsRes.data?.data) ? projectsRes.data.data : []);
      setTasks(Array.isArray(tasksRes.data?.data) ? tasksRes.data.data : []);

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

  const PRIORITY_ORDER = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  const getSortedTasks = (tasksList) => {
    return [...tasksList].sort((a, b) => {
      if (taskSort === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (taskSort === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (taskSort === 'priority') {
        const aPriority = PRIORITY_ORDER[a.priority] || 0;
        const bPriority = PRIORITY_ORDER[b.priority] || 0;
        return bPriority - aPriority;
      }
      return 0;
    });
  };

  const filteredTasks = getSortedTasks(getFilteredTasks());

  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'Completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

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
          <div className="animate-in fade-in duration-200 space-y-6">
            <DashboardStats projects={projects} tasks={tasks} />
            
            {/* Overview Dynamic Telemetry Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Progress Telemetry Card */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Project Telemetry</h3>
                <p className="text-xs text-slate-500 mb-6">Real-time compilation of active pipelines and milestones.</p>
                
                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-500">No active projects found. Navigate to the Projects tab to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {projects.slice(0, 3).map(proj => {
                      const progress = getProjectProgress(proj.id);
                      return (
                        <div key={proj.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm">{proj.name}</h4>
                              <p className="text-xs text-slate-500 line-clamp-1">{proj.description || 'No description provided.'}</p>
                            </div>
                            <span className="text-xs font-bold text-blue-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Critical Tasks Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Critical Tasks</h3>
                <p className="text-xs text-slate-500 mb-6">High-priority pending and active items.</p>
                
                {tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-500">No critical tasks remaining.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {tasks
                      .filter(t => t.priority === 'High' && t.status !== 'Completed')
                      .slice(0, 4)
                      .map(t => (
                        <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                          <div className="truncate pr-3">
                            <h4 className="font-semibold text-slate-800 text-xs truncate">{t.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              Project: {projects.find(p => p.id === t.projectId)?.name || 'General'}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 bg-red-50 text-red-705 border-red-100 uppercase">
                            High
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
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
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                        proj.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : proj.status === 'In_Progress' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-slate-100 text-slate-650 border-slate-200'
                      }`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button 
                          onClick={() => setEditingProject(proj)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition active:scale-95 shrink-0"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-red-650 rounded-lg hover:bg-slate-100 transition active:scale-95 shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition active:scale-95"
              >
                <span>Navigate to Tasks Board</span>
                <ArrowRight size={14} />
              </button>
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
                <select 
                  value={taskSort} 
                  onChange={(e) => setTaskSort(e.target.value)} 
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-blue-600"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Highest Priority</option>
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
                    onClick={() => { setTaskSearch(''); setTaskStatus(''); setTaskPriority(''); setTaskSort('newest'); }}
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
                        t.status === 'Completed' 
                          ? 'bg-emerald-500' 
                          : t.status === 'In_Progress' 
                          ? 'bg-blue-500 animate-pulse' 
                          : 'bg-slate-350 border border-slate-200'
                      }`}></div>
                      <span className={`text-xs truncate ${
                        t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}>{t.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                        t.priority === 'High' 
                          ? 'bg-red-50 text-red-700 border-red-100' 
                          : t.priority === 'Medium' 
                          ? 'bg-amber-50 text-amber-700 border-amber-100' 
                          : 'bg-slate-100 text-slate-650 border-slate-200'
                      }`}>
                        {t.priority}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setEditingTask(t)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition active:scale-95 shrink-0"
                        >
                          <Pencil size={13} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1 text-slate-400 hover:text-red-650 rounded-lg hover:bg-slate-100 transition active:scale-95 shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition active:scale-95"
              >
                <span>Go to Projects Workflows</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Project Modal Overlay */}
      {(isProjectModalOpen || editingProject) && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {editingProject ? 'Modify details of your project pipeline.' : 'Enter details for the new project pipeline.'}
            </p>
            
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
                  onClick={() => { setIsProjectModalOpen(false); setEditingProject(null); resetProjectForm(); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition active:scale-95"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  disabled={projSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs transition active:scale-95 shadow-sm shadow-blue-500/10"
                >
                  {projSubmitting ? 'Saving...' : (editingProject ? 'Save Changes' : 'Save Project')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Task Modal Overlay */}
      {(isTaskModalOpen || editingTask) && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {editingTask ? 'Modify details of your task.' : 'Enter details for the new task.'}
            </p>

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
                  onClick={() => { setIsTaskModalOpen(false); setEditingTask(null); resetTaskForm(); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition active:scale-95"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  disabled={tSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs transition active:scale-95 shadow-sm shadow-blue-500/10"
                >
                  {tSubmitting ? 'Saving...' : (editingTask ? 'Save Changes' : 'Save Task')}
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
