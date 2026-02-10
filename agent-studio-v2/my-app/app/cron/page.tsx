'use client';

import { useEffect, useState } from 'react';
import { Plus, Clock, Play, Trash2, Edit, X, User, Calendar, RefreshCw } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  agentId: string;
  agentName: string;
  message: string;
  enabled: boolean;
  lastRunAt?: string;
  lastRunStatus?: string;
  createdAt: string;
}

const intervalOptions = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
];

const hourOptions = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
  { value: 4, label: '4 hours' },
  { value: 6, label: '6 hours' },
  { value: 8, label: '8 hours' },
  { value: 12, label: '12 hours' },
];

const dailyTimeOptions = [
  { value: '00:00', label: '12:00 AM' },
  { value: '06:00', label: '6:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '21:00', label: '9:00 PM' },
];

function getHumanReadableSchedule(schedule: string): string {
  const patterns: Record<string, string> = {
    '*/5 * * * *': 'Every 5 minutes',
    '*/10 * * * *': 'Every 10 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
    '0 * * * *': 'Every hour',
    '0 */2 * * *': 'Every 2 hours',
    '0 */3 * * *': 'Every 3 hours',
    '0 */4 * * *': 'Every 4 hours',
    '0 */6 * * *': 'Every 6 hours',
    '0 */8 * * *': 'Every 8 hours',
    '0 */12 * * *': 'Every 12 hours',
    '0 0 * * *': 'Daily at 12:00 AM',
    '0 6 * * *': 'Daily at 6:00 AM',
    '0 9 * * *': 'Daily at 9:00 AM',
    '0 12 * * *': 'Daily at 12:00 PM',
    '0 15 * * *': 'Daily at 3:00 PM',
    '0 17 * * *': 'Daily at 5:00 PM',
    '0 21 * * *': 'Daily at 9:00 PM',
  };
  return patterns[schedule] || schedule;
}

function CronCard({ 
  job, 
  onEdit, 
  onDelete, 
  onToggle,
  onRun 
}: { 
  job: CronJob; 
  onEdit: (job: CronJob) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRun: (id: string) => void;
}) {
  return (
    <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${job.enabled ? 'bg-emerald-500' : 'bg-[#52525B]'}`} />
          <h3 className="font-semibold text-white truncate">{job.name}</h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onRun(job.id)}
            className="p-2 rounded-lg hover:bg-[#6E56CF]/10 text-[#6E56CF] min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Run now"
            aria-label="Run cron job"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(job)}
            className="p-2 rounded-lg hover:bg-[#1A1A1A] text-[#A1A1AA] min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Edit"
            aria-label="Edit cron job"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Delete"
            aria-label="Delete cron job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">{job.message}</p>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-[#A1A1AA]">
          <div className="p-1 rounded bg-[#6E56CF]/10 flex-shrink-0">
            <Clock className="w-3 h-3 text-[#6E56CF]" />
          </div>
          <span className="text-white">{getHumanReadableSchedule(job.schedule)}</span>
        </div>

        <div className="flex items-center gap-2 text-[#A1A1AA]">
          <div className="p-1 rounded bg-[#1A1A1A] flex-shrink-0">
            <User className="w-3 h-3" />
          </div>
          <span>Runs as {job.agentName}</span>
        </div>

        {job.lastRunAt && (
          <div className="flex items-start gap-2 text-[#A1A1AA]">
            <div className="p-1 rounded bg-[#1A1A1A] flex-shrink-0 mt-0.5">
              <Calendar className="w-3 h-3" />
            </div>
            <span className="break-words">
              Last run: {new Date(job.lastRunAt).toLocaleString()}
              {job.lastRunStatus && (
                <span className={`ml-1 ${job.lastRunStatus === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                  ({job.lastRunStatus})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[#27272A]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={job.enabled}
            onChange={(e) => onToggle(job.id, e.target.checked)}
            className="w-5 h-5 rounded border-[#27272A] bg-[#0D0D0D] text-[#6E56CF] focus:ring-[#6E56CF]"
          />
          <span className="text-sm text-[#A1A1AA]">{job.enabled ? 'Enabled' : 'Disabled'}</span>
        </label>
      </div>
    </div>
  );
}

function CronModal({
  job,
  agents,
  isOpen,
  onClose,
  onSave,
}: {
  job: CronJob | null;
  agents: Agent[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Partial<CronJob> & { scheduleConfig: { type: string; interval: number; timeOfDay?: string } }) => void;
}) {
  const [form, setForm] = useState<{
    name: string;
    message: string;
    agentId: string;
    enabled: boolean;
    scheduleConfig: {
      type: 'minutes' | 'hours' | 'daily';
      interval: number;
      timeOfDay?: string;
    };
  }>({
    name: '',
    message: '',
    agentId: '',
    enabled: true,
    scheduleConfig: {
      type: 'hours',
      interval: 6,
    },
  });

  useEffect(() => {
    if (job) {
      // Parse existing schedule
      let scheduleConfig = {
        type: 'hours' as const,
        interval: 6,
      };

      if (job.schedule.startsWith('*/')) {
        const interval = parseInt(job.schedule.slice(2));
        if (job.schedule.includes('* * * *')) {
          scheduleConfig = { type: 'minutes', interval };
        } else {
          scheduleConfig = { type: 'hours', interval };
        }
      } else if (job.schedule.startsWith('0 ')) {
        const parts = job.schedule.split(' ');
        const hour = parts[1];
        if (hour === '*') {
          scheduleConfig = { type: 'hours', interval: 1 };
        } else if (hour.startsWith('*/')) {
          scheduleConfig = { type: 'hours', interval: parseInt(hour.slice(2)) };
        } else {
          scheduleConfig = { type: 'daily', interval: 1, timeOfDay: `${hour.padStart(2, '0')}:00` };
        }
      }

      setForm({
        name: job.name,
        message: job.message,
        agentId: job.agentId,
        enabled: job.enabled,
        scheduleConfig,
      });
    } else {
      setForm({
        name: '',
        message: '',
        agentId: agents[0]?.id || '',
        enabled: true,
        scheduleConfig: {
          type: 'hours',
          interval: 6,
        },
      });
    }
  }, [job, isOpen, agents]);

  if (!isOpen) return null;

  const generateCronExpression = () => {
    const { type, interval, timeOfDay } = form.scheduleConfig;
    switch (type) {
      case 'minutes':
        return `*/${interval} * * * *`;
      case 'hours':
        return `0 */${interval} * * *`;
      case 'daily':
        const [hours, minutes] = (timeOfDay || '09:00').split(':').map(Number);
        return `${minutes} ${hours} * * *`;
      default:
        return '0 */6 * * *';
    }
  };

  const getSchedulePreview = () => {
    const cron = generateCronExpression();
    return getHumanReadableSchedule(cron);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule = generateCronExpression();
    onSave({
      id: job?.id,
      name: form.name,
      message: form.message,
      agentId: form.agentId,
      enabled: form.enabled,
      schedule,
      scheduleConfig: form.scheduleConfig,
    });
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
                {job ? 'Edit Cron Job' : 'New Cron Job'}
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
                <label className="block text-sm font-medium text-white mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Daily Report"
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white placeholder-[#52525B] focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Run as Agent *
                  </span>
                </label>
                <select
                  required
                  value={form.agentId}
                  onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
                >
                  <option value="" disabled>Select an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Schedule *
                  </span>
                </label>
                
                <div className="bg-[#0D0D0D] border border-[#27272A] rounded-lg p-4 space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {(['minutes', 'hours', 'daily'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          scheduleConfig: {
                            type,
                            interval: type === 'minutes' ? 5 : type === 'hours' ? 6 : 1,
                            timeOfDay: type === 'daily' ? '09:00' : undefined,
                          },
                        })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                          form.scheduleConfig.type === type
                            ? 'bg-[#6E56CF] text-white'
                            : 'bg-[#1A1A1A] text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>

                  {form.scheduleConfig.type === 'minutes' && (
                    <div>
                      <label className="block text-xs text-[#A1A1AA] mb-2">Every</label>
                      <select
                        value={form.scheduleConfig.interval}
                        onChange={(e) => setForm({
                          ...form,
                          scheduleConfig: { ...form.scheduleConfig, interval: parseInt(e.target.value) },
                        })}
                        className="w-full px-4 py-3 bg-[#141414] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] text-base"
                      >
                        {intervalOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {form.scheduleConfig.type === 'hours' && (
                    <div>
                      <label className="block text-xs text-[#A1A1AA] mb-2">Every</label>
                      <select
                        value={form.scheduleConfig.interval}
                        onChange={(e) => setForm({
                          ...form,
                          scheduleConfig: { ...form.scheduleConfig, interval: parseInt(e.target.value) },
                        })}
                        className="w-full px-4 py-3 bg-[#141414] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] text-base"
                      >
                        {hourOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {form.scheduleConfig.type === 'daily' && (
                    <div>
                      <label className="block text-xs text-[#A1A1AA] mb-2">At time</label>
                      <select
                        value={form.scheduleConfig.timeOfDay}
                        onChange={(e) => setForm({
                          ...form,
                          scheduleConfig: { ...form.scheduleConfig, timeOfDay: e.target.value },
                        })}
                        className="w-full px-4 py-3 bg-[#141414] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] text-base"
                      >
                        {dailyTimeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-[#27272A]">
                    <RefreshCw className="w-4 h-4 text-[#6E56CF] flex-shrink-0" />
                    <span className="text-sm text-[#A1A1AA]">Preview: </span>
                    <span className="text-sm text-white font-medium">{getSchedulePreview()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Message to Send *</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="What message should be sent to the agent?"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white placeholder-[#52525B] focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] resize-none text-base"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-[#27272A] bg-[#0D0D0D] text-[#6E56CF] focus:ring-[#6E56CF]"
                />
                <span className="text-sm text-white">Enable this cron job</span>
              </label>
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
              disabled={!form.name || !form.agentId || !form.message}
              className="px-6 py-3 bg-[#6E56CF] hover:bg-[#5D45BE] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors min-h-[48px]"
            >
              {job ? 'Save Changes' : 'Create Cron Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, agentsRes] = await Promise.all([
        fetch('/api/cron'),
        fetch('/api/agents'),
      ]);
      const jobsData = await jobsRes.json();
      const agentsData = await agentsRes.json();
      setJobs(jobsData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form: Partial<CronJob>) => {
    try {
      const url = form.id ? `/api/cron/${form.id}` : '/api/cron';
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
      console.error('Failed to save cron job:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cron job?')) return;
    
    try {
      const res = await fetch(`/api/cron/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete cron job:', error);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/cron/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        setJobs(jobs.map(j => j.id === id ? { ...j, enabled } : j));
      }
    } catch (error) {
      console.error('Failed to toggle cron job:', error);
    }
  };

  const handleRun = async (id: string) => {
    try {
      const res = await fetch(`/api/cron/${id}`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to run cron job:', error);
    }
  };

  const handleEdit = (job: CronJob) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Cron Jobs</h1>
            <p className="text-[#A1A1AA] mt-1 text-sm sm:text-base">Schedule automated tasks for your agents</p>
          </div>
          <button
            onClick={handleNew}
            disabled={agents.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#6E56CF] hover:bg-[#5D45BE] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors min-h-[48px]"
          >
            <Plus className="w-4 h-4" />
            New Cron Job
          </button>
        </header>

        {agents.length === 0 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm">
            You need to create at least one agent before you can schedule cron jobs.
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#6E56CF] border-t-transparent rounded-full" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6E56CF]/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-[#6E56CF]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No cron jobs yet</h3>
            <p className="text-[#A1A1AA] mb-6 text-sm sm:text-base">Create scheduled tasks to automate agent workflows</p>
            <button
              onClick={handleNew}
              disabled={agents.length === 0}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#6E56CF] hover:bg-[#5D45BE] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors min-h-[48px]"
            >
              <Plus className="w-4 h-4" />
              Create Cron Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {jobs.map((job) => (
              <CronCard
                key={job.id}
                job={job}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onRun={handleRun}
              />
            ))}
          </div>
        )}
      </div>

      <CronModal
        job={editingJob}
        agents={agents}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
