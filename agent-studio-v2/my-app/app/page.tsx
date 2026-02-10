'use client';

import { useEffect, useState } from 'react';
import { Users, CheckSquare, Clock, Activity, AlertCircle } from 'lucide-react';

interface Stats {
  agents: {
    total: number;
    active: number;
    idle: number;
    busy: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
    dueToday: number;
  };
  sessions: {
    total: number;
    active: number;
  };
  crons: {
    total: number;
    enabled: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    status: string;
    createdAt: string;
  }>;
}

function StatCard({ title, value, subtitle, icon: Icon }: { 
  title: string; 
  value: number; 
  subtitle?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 sm:p-6">
      <div className="p-2 rounded-lg bg-[#6E56CF]/10 w-fit">
        <Icon className="w-5 h-5 text-[#6E56CF]" />
      </div>
      <div className="mt-4">
        <h3 className="text-xl sm:text-2xl font-bold text-white">{value}</h3>
        <p className="text-sm text-[#A1A1AA] mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-[#71717A] mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Stats['recentActivity'][0] }) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex items-start gap-3 sm:gap-4 py-4 border-b border-[#27272A] last:border-0">
      <div className="p-2 rounded-lg bg-[#6E56CF]/10 flex-shrink-0">
        <Activity className="w-4 h-4 text-[#6E56CF]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#FAFAFA] break-words">{activity.message}</p>
        <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
          <span className="text-xs text-[#71717A] capitalize">{activity.type.replace(/_/g, ' ')}</span>
          <span className="text-xs text-[#52525B]">•</span>
          <span className="text-xs text-[#71717A]">{timeAgo(activity.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#6E56CF] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-[#A1A1AA] mt-2 text-sm sm:text-base">Overview of your agent orchestration platform</p>
        </header>

        {/* Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Agents"
            value={stats?.agents.total || 0}
            subtitle={`${stats?.agents.active || 0} active • ${stats?.agents.idle || 0} idle`}
            icon={Users}
          />
          <StatCard
            title="Tasks"
            value={stats?.tasks.total || 0}
            subtitle={`${stats?.tasks.done || 0} completed • ${stats?.tasks.inProgress || 0} in progress`}
            icon={CheckSquare}
          />
          <StatCard
            title="Active Sessions"
            value={stats?.sessions.active || 0}
            subtitle={`${stats?.sessions.total || 0} total sessions`}
            icon={Activity}
          />
          <StatCard
            title="Cron Jobs"
            value={stats?.crons.enabled || 0}
            subtitle={`${stats?.crons.total || 0} total jobs`}
            icon={Clock}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white">Attention Needed</h2>
            </div>

            <div className="space-y-4">
              {(stats?.tasks.overdue || 0) > 0 && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-sm text-[#FAFAFA]">{stats?.tasks.overdue} overdue tasks</span>
                  </div>
                  <a href="/tasks" className="text-sm text-[#6E56CF] hover:underline flex-shrink-0">View →</a>
                </div>
              )}

              {(stats?.tasks.dueToday || 0) > 0 && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-sm text-[#FAFAFA]">{stats?.tasks.dueToday} tasks due today</span>
                  </div>
                  <a href="/tasks" className="text-sm text-[#6E56CF] hover:underline flex-shrink-0">View →</a>
                </div>
              )}

              {(stats?.tasks.dueToday || 0) === 0 && (stats?.tasks.overdue || 0) === 0 && (
                <div className="text-center py-8 text-[#71717A]">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">All caught up! No urgent tasks.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 rounded-lg bg-[#6E56CF]/10">
                <Activity className="w-5 h-5 text-[#6E56CF]" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white">Recent Activity</h2>
            </div>

            <div className="max-h-60 sm:max-h-80 overflow-y-auto -mx-2 px-2">
              {stats?.recentActivity?.length === 0 ? (
                <div className="text-center py-8 text-[#71717A]">
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                stats?.recentActivity?.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
