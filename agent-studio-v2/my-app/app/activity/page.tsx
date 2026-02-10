'use client';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, AlertCircle, Clock, Filter, RefreshCw } from 'lucide-react';

interface ActivityLog {
  id: string;
  type: string;
  message: string;
  status?: string;
  metadata?: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  agent_created: Activity,
  agent_updated: Activity,
  agent_deleted: Activity,
  session_created: Activity,
  session_updated: Activity,
  session_closed: Activity,
  task_created: Activity,
  task_updated: Activity,
  task_deleted: Activity,
  cron_created: Clock,
  cron_updated: Clock,
  cron_deleted: Clock,
  cron_executed: Clock,
};

const typeColors: Record<string, string> = {
  agent_created: 'text-[#6E56CF]',
  agent_updated: 'text-[#6E56CF]',
  agent_deleted: 'text-red-500',
  session_created: 'text-emerald-500',
  session_updated: 'text-amber-500',
  session_closed: 'text-[#A1A1AA]',
  task_created: 'text-blue-500',
  task_updated: 'text-amber-500',
  task_deleted: 'text-red-500',
  cron_created: 'text-purple-500',
  cron_updated: 'text-purple-500',
  cron_deleted: 'text-red-500',
  cron_executed: 'text-emerald-500',
};

function LogItem({ log }: { log: ActivityLog }) {
  const Icon = typeIcons[log.type] || Activity;
  const colorClass = typeColors[log.type] || 'text-[#A1A1AA]';
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  let StatusIcon = AlertCircle;
  let statusColor = 'text-[#71717A]';
  
  if (log.status === 'success') {
    StatusIcon = CheckCircle2;
    statusColor = 'text-emerald-500';
  } else if (log.status === 'error') {
    StatusIcon = XCircle;
    statusColor = 'text-red-500';
  }

  return (
    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[#1A1A1A] rounded-lg transition-colors">
      <div className="p-2 rounded-lg bg-[#1A1A1A] flex-shrink-0">
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-[#FAFAFA] break-words">{log.message}</p>
            <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
              <span className="text-xs text-[#71717A] capitalize">
                {log.type.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-[#52525B]">•</span>
              <span className="text-xs text-[#71717A]">{timeAgo(log.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${statusColor}`} />
          </div>
        </div>
        
        {log.metadata && (
          <div className="mt-2 p-2 bg-[#0D0D0D] rounded text-xs text-[#71717A] font-mono overflow-x-auto">
            <code className="break-all">{log.metadata}</code>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs?limit=100');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter
    ? logs.filter(log => 
        log.type.toLowerCase().includes(filter.toLowerCase()) ||
        log.message.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = new Date(log.createdAt).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {} as Record<string, ActivityLog[]>);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Activity Logs</h1>
            <p className="text-[#A1A1AA] mt-1 text-sm sm:text-base">Track all system events and agent activities</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-3 bg-[#141414] border border-[#27272A] rounded-lg text-white placeholder-[#52525B] focus:outline-none focus:border-[#6E56CF] w-full sm:w-64 text-base"
              />
            </div>
            <button
              onClick={fetchLogs}
              className="p-3 rounded-lg bg-[#141414] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#6E56CF]/50 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#6E56CF] border-t-transparent rounded-full" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6E56CF]/10 flex items-center justify-center">
              <Activity className="w-8 h-8 text-[#6E56CF]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
            <p className="text-[#A1A1AA] text-sm sm:text-base">System activity will appear here as you use the platform</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date}>
                <div className="flex items-center gap-4 mb-3 sm:mb-4">
                  <h3 className="text-sm font-medium text-[#A1A1AA]">{date}</h3>
                  <div className="flex-1 h-px bg-[#27272A]" />
                </div>
                
                <div className="bg-[#141414] border border-[#27272A] rounded-xl overflow-hidden">
                  {dateLogs.map((log, index) => (
                    <div key={log.id}>
                      <LogItem log={log} />
                      {index < dateLogs.length - 1 && (
                        <div className="border-b border-[#27272A]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
