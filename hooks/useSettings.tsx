// hooks/useSettings.ts
import { useState, useEffect } from 'react';

export function useSettings() {
  const [authorName, setAuthorName] = useState<string>('');
  const [authorUrl, setAuthorUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setAuthorName(localStorage.getItem('app_author_name') || '');
    setAuthorUrl(localStorage.getItem('app_author_url') || '');
    setIsLoaded(true);
  }, []);

  const saveSettings = (data: { name?: string, aUrl?: string }) => {
    if (data.name !== undefined) {
      setAuthorName(data.name);
      localStorage.setItem('app_author_name', data.name);
    }
    if (data.aUrl !== undefined) {
      setAuthorUrl(data.aUrl);
      localStorage.setItem('app_author_url', data.aUrl);
    }
  };

  return { authorName, authorUrl, saveSettings, isLoaded };
}