'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Play, Power, Trash2, Edit, Sparkles } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  status: 'idle' | 'active' | 'busy';
  createdAt: string;
}

function AgentCard({ agent, onDelete, onSpawn }: { 
  agent: Agent; 
  onDelete: (id: string) => void;
  onSpawn: (id: string) => void;
}) {
  const statusColors = {
    idle: 'bg-emerald-500/10 text-emerald-500',
    active: 'bg-[#6E56CF]/10 text-[#6E56CF]',
    busy: 'bg-amber-500/10 text-amber-500',
  };

  return (
    <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 sm:p-6 hover:border-[#6E56CF]/50 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6E56CF] to-[#4F46E5] flex items-center justify-center text-white font-semibold flex-shrink-0">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{agent.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[agent.status]}`}>
              {agent.status}
            </span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onSpawn(agent.id)}
            disabled={agent.status !== 'idle'}
            className="p-2 rounded-lg hover:bg-[#6E56CF]/10 text-[#6E56CF] disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Spawn Session"
            aria-label="Spawn session"
          >
            <Play className="w-4 h-4" />
          </button>
          <Link
            href={`/agents/${agent.id}`}
            className="p-2 rounded-lg hover:bg-[#1A1A1A] text-[#A1A1AA] min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Edit"
            aria-label="Edit agent"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(agent.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Delete"
            aria-label="Delete agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {agent.description && (
        <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">{agent.description}</p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-[#71717A]">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{agent.model}</span>
        </div>
        <div className="flex items-center gap-1">
          <Power className="w-3 h-3 flex-shrink-0" />
          <span>Created {new Date(agent.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAgents(agents.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleSpawn = async (id: string) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: id }),
      });
      if (res.ok) {
        fetchAgents(); // Refresh to update status
      }
    } catch (error) {
      console.error('Failed to spawn session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Agents</h1>
            <p className="text-[#A1A1AA] mt-1 text-sm sm:text-base">Manage your AI agents and their configurations</p>
          </div>
          <Link
            href="/agents/new"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#6E56CF] hover:bg-[#5D45BE] text-white rounded-lg font-medium transition-colors min-h-[48px]"
          >
            <Plus className="w-4 h-4" />
            New Agent
          </Link>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#6E56CF] border-t-transparent rounded-full" />
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6E56CF]/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-[#6E56CF]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No agents yet</h3>
            <p className="text-[#A1A1AA] mb-6 text-sm sm:text-base">Create your first agent to get started with orchestration</p>
            <Link
              href="/agents/new"
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#6E56CF] hover:bg-[#5D45BE] text-white rounded-lg font-medium transition-colors min-h-[48px]"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onDelete={handleDelete}
                onSpawn={handleSpawn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
