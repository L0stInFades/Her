'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Key, Palette } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { api } from '@/lib/api';
import type { PublicConfig, UserSettings } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [keyModified, setKeyModified] = useState(false);
  const [preferredModel, setPreferredModel] = useState('openai/gpt-4o');
  const [availableModels, setAvailableModels] = useState<PublicConfig['models']>([]);
  const [allowUserApiKeys, setAllowUserApiKeys] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      // Load user settings
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const configRes = await api.get<PublicConfig>('/config');
      if (configRes.success && configRes.data) {
        const defaultModelId = configRes.data.defaultModelId || 'openai/gpt-4o';
        setAvailableModels(configRes.data.models || []);
        setAllowUserApiKeys(configRes.data.allowUserApiKeys);
        setPreferredModel((prev) => prev || defaultModelId);
      }

      const response = await api.get<UserSettings>('/users/settings');
      if (response.success && response.data) {
        const settings = response.data;
        if (settings.openRouterApiKey && settings.openRouterApiKey.startsWith('****')) {
          setHasExistingKey(true);
          setOpenRouterApiKey('');
        } else {
          setOpenRouterApiKey(settings.openRouterApiKey || '');
        }
        setKeyModified(false);
        setPreferredModel(settings.preferredModel || 'openai/gpt-4o');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Update user profile
      await api.patch('/users/profile', { name });

      // Update user settings - only send API key if it was modified
      const settingsPayload: Record<string, string | null> = { preferredModel };
      if (allowUserApiKeys && keyModified) {
        settingsPayload.openRouterApiKey = openRouterApiKey || null;
      }
      await api.patch('/users/settings', settingsPayload);

      // Update local user state
      if (user) {
        useAuthStore.setState({ user: { ...user, name } });
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error: unknown) {
      console.error('Failed to save settings:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-warm-600 dark:text-warm-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950">
      {/* Header */}
      <header className="border-b border-warm-200 bg-white px-4 py-4 dark:border-warm-700 dark:bg-warm-900">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-warm-600 hover:text-warm-900 dark:text-warm-400 dark:hover:text-warm-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-50">Settings</h1>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 p-4">
        {/* Message */}
        {message && (
          <div
            className={`rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-jade-50 text-jade-700 dark:bg-jade-900/20 dark:text-jade-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Section */}
        <Card variant="default" className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jade-100 text-jade-600 dark:bg-jade-900/20 dark:text-jade-400">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-warm-900 dark:text-warm-50">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-warm-300">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="mt-1 w-full rounded-xl border-2 border-warm-200 bg-warm-50 px-4 py-2.5 text-warm-400 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-500"
              />
              <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
                Email cannot be changed
              </p>
            </div>

            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
        </Card>

        {/* AI Settings Section */}
        <Card variant="default" className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jade-100 text-jade-600 dark:bg-jade-900/20 dark:text-jade-400">
              <Key className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-warm-900 dark:text-warm-50">
              AI Settings
            </h2>
          </div>

          <div className="space-y-4">
            {allowUserApiKeys && (
              <div>
              <label className="mb-2 block text-sm font-medium text-warm-700 dark:text-warm-300">
                OpenRouter API Key
              </label>
              <input
                type="password"
                value={openRouterApiKey}
                onChange={(e) => {
                  setOpenRouterApiKey(e.target.value);
                  setKeyModified(true);
                }}
                placeholder={hasExistingKey ? 'API key is set (leave empty to keep current)' : 'sk-or-...'}
                className="input"
              />
              {hasExistingKey && !keyModified && (
                <p className="mt-1 text-xs text-jade-600 dark:text-jade-400">
                  An API key is already configured. Enter a new value to replace it.
                </p>
              )}
              <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
                Optional. Leave empty to use the default API key. Get your key at{' '}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-jade-600 hover:underline dark:text-jade-400"
                >
                  openrouter.ai
                </a>
              </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-warm-700 dark:text-warm-300">
                Preferred Model
              </label>
              <select
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="input"
              >
                {availableModels.length > 0 ? (
                  availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="openai/gpt-4o">GPT-4o</option>
                    <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                    <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                  </>
                )}
              </select>
              <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
                Choose the AI model you prefer for conversations
              </p>
            </div>
          </div>
        </Card>

        {/* Appearance Section */}
        <Card variant="default" className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jade-100 text-jade-600 dark:bg-jade-900/20 dark:text-jade-400">
              <Palette className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-warm-900 dark:text-warm-50">
              Appearance
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-warm-900 dark:text-warm-50">Theme</p>
              <p className="text-sm text-warm-600 dark:text-warm-400">
                Toggle between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSettings} isLoading={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* Logout */}
        <div className="border-t border-warm-200 pt-6 dark:border-warm-700">
          <Button
            variant="danger"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
