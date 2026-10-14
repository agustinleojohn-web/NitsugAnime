import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '@/types/storage';
import {
  getStoredSettings,
  saveSettings as storageSave,
  STORAGE_SYNC_EVENT,
} from '@/lib/storage/localStorage';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());

  const refresh = useCallback(() => {
    setSettings(getStoredSettings());
  }, []);

  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ type?: string }>;
      if (!customEvent.detail || customEvent.detail.type === 'settings') {
        refresh();
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const update = useCallback((newSettings: Partial<UserSettings>) => {
    const updated = storageSave(newSettings);
    setSettings(updated);
  }, []);

  return {
    settings,
    update,
  };
}
