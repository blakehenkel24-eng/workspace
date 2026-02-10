'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar, User, Clock, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
}

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const columns = [
  { id: 'todo', label: 'To Do', color: 'bg-[#A1A1AA]' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-[#6E56CF]' },
  { id: 'done', label: 'Done', color: 'bg-emerald-500' },
] as const;

function TaskCard({ 
  task, 
  onEdit, 
  onDelete,
  agents 
}: { 
  task: Task; 
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  agents: Agent[];
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const isDueSoon = task.dueDate && !isOverdue && new Date(task.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div 
      className="bg-[#1A1A1A] border border-[#27272A] rounded-lg p-3 sm:p-4 cursor-pointer hover:border-[#6E56CF]/50 transition-colors group touch-manipulation"
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 rounded hover:bg-red-500/10 text-red-500 transition-opacity min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Delete task"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-medium text-white mb-1 text-sm sm:text-base">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs sm:text-sm text-[#A1A1AA] line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex flex-col gap-2">
        {task.assignedAgentId ? (
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <div className="w-5 h-5 rounded-full bg-[#6E56CF] flex items-center justify-center text-white text-[10px]">
              {task.assignedAgentName?.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{task.assignedAgentName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#52525B]">
            <User className="w-3 h-3" />
            <span>Unassigned</span>
          </div>
        )}

        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : 'text-[#71717A]'
          }`}>
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{new Date(task.dueDate).toLocaleDateString()} {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskModal({
  task,
  agents,
  isOpen,
  onClose,
  onSave,
}: {
  task: Task | null;
  agents: Agent[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}) {
  const [form, setForm] = useState<Partial<Task>>({});

  useEffect(() => {
    if (task) {
      setForm(task);
    } else {
      setForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border-t sm:border border-[#27272A] rounded-t-2xl sm:rounded-xl w-full sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {task ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#1A1A1A] text-[#A1A1AA] min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] resize-none text-base"
                  placeholder="Add task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Status</label>
                  <select
                    value={form.status || 'todo'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Priority</label>
                  <select
                    value={form.priority || 'medium'}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assign Agent
                    </span>
                  </label>
                  <select
                    value={form.assignedAgentId || ''}
                    onChange={(e) => setForm({ ...form, assignedAgentId: e.target.value || undefined })}
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
                  >
                    <option value="">-- Unassigned --</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.dueDate ? new Date(form.dueDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value || undefined })}
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 p-4 sm:p-6 border-t border-[#27272A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-[#A1A1AA] hover:text-white transition-colors min-h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#6E56CF] hover:bg-[#5D45BE] text-white rounded-lg font-medium transition-colors min-h-[48px]"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, agentsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/agents'),
      ]);
      const tasksData = await tasksRes.json();
      const agentsData = await agentsRes.json();
      setTasks(tasksData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form: Partial<Task>) => {
    try {
      const url = form.id ? `/api/tasks/${form.id}` : '/api/tasks';
      const method = form.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  const handlePrevColumn = () => setActiveColumn(prev => Math.max(0, prev - 1));
  const handleNextColumn = () => setActiveColumn(prev => Math.min(2, prev + 1));

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Tasks</h1>
            <p className="text-[#A1A1AA] mt-1 text-sm sm:text-base">Kanban board for task management with agent assignment</p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#6E56CF] hover:bg-[#5D45BE] text-white rounded-lg font-medium transition-colors min-h-[48px]"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#6E56CF] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Mobile: Single column view with tabs */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevColumn}
                  disabled={activeColumn === 0}
                  className="p-2 rounded-lg bg-[#141414] border border-[#27272A] text-[#A1A1AA] disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Previous column"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${columns[activeColumn].color}`} />
                  <h3 className="font-medium text-white">{columns[activeColumn].label}</h3>
                  <span className="text-xs text-[#71717A] bg-[#1A1A1A] px-2 py-0.5 rounded-full">
                    {getTasksByStatus(columns[activeColumn].id).length}
                  </span>
                </div>
                
                <button
                  onClick={handleNextColumn}
                  disabled={activeColumn === 2}
                  className="p-2 rounded-lg bg-[#141414] border border-[#27272A] text-[#A1A1AA] disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Next column"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#141414] border border-[#27272A] rounded-xl p-3 sm:p-4">
                <div className="space-y-3">
                  {getTasksByStatus(columns[activeColumn].id).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      agents={agents}
                    />
                  ))}
                  {getTasksByStatus(columns[activeColumn].id).length === 0 && (
                    <div className="text-center py-8 text-[#52525B] text-sm">
                      No tasks in {columns[activeColumn].label}
                    </div>
                  )}
                </div>
              </div>

              {/* Column indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {columns.map((col, idx) => (
                  <button
                    key={col.id}
                    onClick={() => setActiveColumn(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === activeColumn ? 'bg-[#6E56CF]' : 'bg-[#27272A]'
                    }`}
                    aria-label={`Go to ${col.label}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: 3-column grid */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">
              {columns.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                return (
                  <div key={column.id} className="bg-[#141414] border border-[#27272A] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${column.color}`} />
                        <h3 className="font-medium text-white">{column.label}</h3>
                        <span className="text-xs text-[#71717A] bg-[#1A1A1A] px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          agents={agents}
                        />
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="text-center py-8 text-[#52525B] text-sm">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <TaskModal
        task={editingTask}
        agents={agents}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
