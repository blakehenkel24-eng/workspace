'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bot, Sparkles, Save, Loader2 } from 'lucide-react';

const models = [
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    model: 'claude-3-sonnet-20240229',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create agent');
      }

      router.push('/agents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="p-4 sm:p-6 lg:p-8">
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-white mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Link>

        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#6E56CF]/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-[#6E56CF]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Agent</h1>
              <p className="text-[#A1A1AA] text-sm sm:text-base">Configure your AI agent with a system prompt</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Research Assistant"
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white placeholder-[#52525B] focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of what this agent does"
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white placeholder-[#52525B] focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6E56CF]" />
                  Model
                </span>
              </label>
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] text-base"
              >
                {models.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                System Prompt *
              </label>
              <textarea
                required
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                placeholder="You are a helpful assistant..."
                rows={6}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#27272A] rounded-lg text-white placeholder-[#52525B] focus:outline-none focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF] resize-none font-mono text-sm"
              />
              <p className="text-xs text-[#71717A] mt-2">
                The system prompt defines how your agent behaves and responds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#27272A]">
              <Link
                href="/agents"
                className="px-4 py-3 text-[#A1A1AA] hover:text-white transition-colors text-center sm:text-left min-h-[48px] flex items-center justify-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !form.name || !form.systemPrompt}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#6E56CF] hover:bg-[#5D45BE] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors min-h-[48px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Agent
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
