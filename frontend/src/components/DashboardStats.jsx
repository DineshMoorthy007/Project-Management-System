import React from 'react';
import { Folder, ListTodo, CheckCircle2, Clock, Activity } from 'lucide-react';

const DashboardStats = ({ projects = [], tasks = [] }) => {
  // Defensive array checks to prevent crashes if null/undefined is explicitly passed
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Compute metrics from props safely
  const totalProjects = safeProjects.length;
  const projectsInProgress = safeProjects.filter(p => p.status === 'In_Progress').length;
  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = safeTasks.filter(t => t.status === 'Pending' || t.status === 'In_Progress').length;

  const cards = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: Folder,
      colorClass: 'border-blue-100/80',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      colorClass: 'border-slate-200/80',
      iconColor: 'text-slate-650',
      iconBg: 'bg-slate-50'
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle2,
      colorClass: 'border-emerald-100/80',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      icon: Clock,
      colorClass: 'border-amber-100/80',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50'
    },
    {
      title: 'Projects In Progress',
      value: projectsInProgress,
      icon: Activity,
      colorClass: 'border-cyan-100/80',
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50'
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={idx} 
            className={`p-5 bg-white border ${card.colorClass} rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 hover:scale-105 cursor-default`}
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                <IconComponent size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900">{card.value}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default DashboardStats;
