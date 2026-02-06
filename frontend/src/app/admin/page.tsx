'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Trash2, Star } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { clsx } from 'clsx';

type AiModel = {
  id: string;
  name: string;
  provider: string;
  description?: string | null;
  enabled: boolean;
  isDefault: boolean;
};

type AppConfig = {
  id: string;
  maxContextMessages: number;
  allowUserApiKeys: boolean;
  requireUserApiKey: boolean;
};

type AdminConfigPayload = {
  config: AppConfig;
  models: AiModel[];
};

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [models, setModels] = useState<AiModel[]>([]);

  const [newModel, setNewModel] = useState<Partial<AiModel>>({
    enabled: true,
    isDefault: false,
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const init = async () => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        await useAuthStore.getState().checkSession();
      } catch {
        // ignore
      }

      await refresh();
    };

    init().finally(() => setLoading(false));
  }, []);

  async function refresh() {
    try {
      const res = await api.get<AdminConfigPayload>('/admin/config');
      if (res.success && res.data) {
        setConfig(res.data.config);
        setModels(res.data.models);
      } else {
        throw new Error(res.error || 'Failed to load admin config');
      }
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Failed to load admin config');
    }
  }

  async function handleBootstrap() {
    try {
      const res = await api.post('/admin/bootstrap', { token: bootstrapToken });
      if (!res.success) throw new Error(res.error || 'Bootstrap failed');
      await useAuthStore.getState().checkSession();
      success('Admin enabled for your account');
      setBootstrapToken('');
      await refresh();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Bootstrap failed');
    }
  }

  async function handleSaveConfig() {
    if (!config) return;
    try {
      const res = await api.put<AppConfig>('/admin/config', {
        maxContextMessages: config.maxContextMessages,
        allowUserApiKeys: config.allowUserApiKeys,
        requireUserApiKey: config.requireUserApiKey,
      });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to save');
      success('Config saved');
      await refresh();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Failed to save config');
    }
  }

  async function upsertModel(m: AiModel | Partial<AiModel>) {
    try {
      const res = await api.post<AiModel>('/admin/models', m);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to save model');
      success('Model saved');
      await refresh();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Failed to save model');
    }
  }

  async function setDefault(id: string) {
    try {
      const res = await api.patch(`/admin/models/${id}/default`, {});
      if (!res.success) throw new Error(res.error || 'Failed to set default');
      success('Default model updated');
      await refresh();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Failed to set default model');
    }
  }

  async function deleteModel(id: string) {
    if (!confirm('Delete this model?')) return;
    try {
      const res = await api.delete(`/admin/models/${id}`);
      if (!res.success) throw new Error(res.error || 'Failed to delete model');
      success('Model deleted');
      await refresh();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Failed to delete model');
    }
  }

  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
      return `${a.provider}/${a.name}`.localeCompare(`${b.provider}/${b.name}`);
    });
  }, [models]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-warm-950 flex items-center justify-center">
        <p className="text-warm-600 dark:text-warm-400">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950">
      <header className="border-b border-warm-200 bg-white px-4 py-4 dark:border-warm-700 dark:bg-warm-900">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-jade-400 to-jade-600 text-white shadow-jade">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-warm-900 dark:text-warm-50">Admin</h1>
              <p className="text-xs text-warm-500 dark:text-warm-400">Runtime config, models, policy</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push('/chat')}>
            Back to chat
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 p-4">
        {!isAdmin && (
          <Card variant="default" className="p-6">
            <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">Bootstrap Admin</h2>
            <p className="mt-1 text-sm text-warm-600 dark:text-warm-400">
              Promote your account to ADMIN using `ADMIN_BOOTSTRAP_TOKEN` from your server env.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  label="Bootstrap token"
                  value={bootstrapToken}
                  onChange={(e) => setBootstrapToken(e.target.value)}
                  placeholder="Paste token here"
                />
              </div>
              <Button variant="primary" onClick={handleBootstrap} disabled={bootstrapToken.trim().length < 16}>
                Enable Admin
              </Button>
            </div>
          </Card>
        )}

        {isAdmin && config && (
          <Card variant="default" className="p-6">
            <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">Server Policy</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300">
                  Max context messages
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={config.maxContextMessages}
                  onChange={(e) => setConfig({ ...config, maxContextMessages: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border-2 border-warm-200 bg-white px-4 py-2.5 text-warm-900 focus:border-jade-500 focus:outline-none dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50"
                />
                <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
                  Controls how many previous messages are sent to the model.
                </p>
              </div>

              <div className="space-y-3">
                <ToggleRow
                  label="Allow user API keys"
                  checked={config.allowUserApiKeys}
                  onChange={(checked) =>
                    setConfig({ ...config, allowUserApiKeys: checked, requireUserApiKey: checked ? config.requireUserApiKey : false })
                  }
                />
                <ToggleRow
                  label="Require user API key"
                  checked={config.requireUserApiKey}
                  disabled={!config.allowUserApiKeys}
                  onChange={(checked) => setConfig({ ...config, requireUserApiKey: checked })}
                />
                <p className="text-xs text-warm-500 dark:text-warm-400">
                  If required, users must set their own key in Settings. Otherwise the server default key can be used.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="primary" onClick={handleSaveConfig}>
                Save Policy
              </Button>
            </div>
          </Card>
        )}

        {isAdmin && (
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">Models</h2>
                <p className="text-sm text-warm-600 dark:text-warm-400">Enable/disable, set default, add new models.</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => refresh()}
              >
                Refresh
              </Button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-warm-200 dark:border-warm-700">
              <table className="min-w-full text-sm">
                <thead className="bg-warm-50 dark:bg-warm-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-warm-900 dark:text-warm-50">Model</th>
                    <th className="px-4 py-3 text-left font-semibold text-warm-900 dark:text-warm-50">Provider</th>
                    <th className="px-4 py-3 text-left font-semibold text-warm-900 dark:text-warm-50">Enabled</th>
                    <th className="px-4 py-3 text-left font-semibold text-warm-900 dark:text-warm-50">Default</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-warm-900">
                  {sortedModels.map((m) => (
                    <tr key={m.id} className="border-t border-warm-200 dark:border-warm-700">
                      <td className="px-4 py-3">
                        <div className="font-medium text-warm-900 dark:text-warm-50">{m.name}</div>
                        <div className="text-xs text-warm-500 dark:text-warm-400">{m.id}</div>
                        {m.description && (
                          <div className="text-xs text-warm-500 dark:text-warm-400 mt-1">{m.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-warm-700 dark:text-warm-300">{m.provider}</td>
                      <td className="px-4 py-3">
                        <button
                          className={clsx(
                            'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                            m.enabled
                              ? 'bg-jade-100 text-jade-700 dark:bg-jade-900/30 dark:text-jade-200'
                              : 'bg-warm-200 text-warm-600 dark:bg-warm-800 dark:text-warm-300'
                          )}
                          onClick={() => upsertModel({ ...m, enabled: !m.enabled })}
                        >
                          {m.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {m.isDefault ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-jade-100 px-3 py-1 text-xs font-semibold text-jade-700 dark:bg-jade-900/30 dark:text-jade-200">
                            <Star className="h-3.5 w-3.5" />
                            Default
                          </span>
                        ) : (
                          <Button variant="ghost" onClick={() => setDefault(m.id)} disabled={!m.enabled}>
                            Set default
                          </Button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" onClick={() => deleteModel(m.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl border-2 border-dashed border-warm-300 p-4 dark:border-warm-700">
              <div className="flex items-center gap-2 text-warm-900 dark:text-warm-50 font-semibold">
                <Plus className="h-4 w-4" />
                Add or Update Model
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input
                  label="Model id"
                  value={newModel.id || ''}
                  onChange={(e) => setNewModel({ ...newModel, id: e.target.value })}
                  placeholder="openai/gpt-4o"
                />
                <Input
                  label="Name"
                  value={newModel.name || ''}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  placeholder="GPT-4o"
                />
                <Input
                  label="Provider"
                  value={newModel.provider || ''}
                  onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                  placeholder="OpenAI"
                />
                <Input
                  label="Description"
                  value={newModel.description || ''}
                  onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                  <ToggleInline
                    label="Enabled"
                    checked={!!newModel.enabled}
                    onChange={(checked) => setNewModel({ ...newModel, enabled: checked })}
                  />
                  <ToggleInline
                    label="Default"
                    checked={!!newModel.isDefault}
                    onChange={(checked) => setNewModel({ ...newModel, isDefault: checked })}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!newModel.id || !newModel.name || !newModel.provider) {
                      error('Model id/name/provider are required');
                      return;
                    }
                    upsertModel(newModel as AiModel).then(() => setNewModel({ enabled: true, isDefault: false }));
                  }}
                >
                  Save Model
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={clsx('flex items-center justify-between gap-3', disabled && 'opacity-60')}>
      <span className="text-sm font-medium text-warm-700 dark:text-warm-300">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
          checked ? 'bg-jade-500' : 'bg-warm-300 dark:bg-warm-700',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={clsx(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

function ToggleInline({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-xs font-semibold transition-colors',
        checked
          ? 'border-jade-500 bg-jade-50 text-jade-700 dark:bg-jade-900/20 dark:text-jade-200'
          : 'border-warm-300 bg-white text-warm-700 dark:border-warm-700 dark:bg-warm-900 dark:text-warm-300'
      )}
    >
      <span className={clsx('h-2 w-2 rounded-full', checked ? 'bg-jade-500' : 'bg-warm-400')} />
      {label}
    </button>
  );
}

