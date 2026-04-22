import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import useNotesStore from '../store/useNotesStore';

export default function Header() {
  const { t } = useTranslation();
  const darkMode = useNotesStore(s => s.darkMode);
  const searchQuery = useNotesStore(s => s.searchQuery);
  const toggleDarkMode = useNotesStore(s => s.toggleDarkMode);
  const setSearchQuery = useNotesStore(s => s.setSearchQuery);
  const toggleSidebar = useNotesStore(s => s.toggleSidebar);
  const createNote = useNotesStore(s => s.createNote);
  const createNotebook = useNotesStore(s => s.createNotebook);
  const setSelectedNote = useNotesStore(s => s.setSelectedNote);
  const notebooks = useNotesStore(s => s.notebooks);

  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+F focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'n') {
        e.preventDefault();
        const id = createNote(notebooks[0]?.id);
        setSelectedNote(id);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        createNotebook();
      }
      if (e.key === 'Escape') {
        if (document.activeElement === searchRef.current) {
          setSearchQuery('');
          searchRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [notebooks, createNote, createNotebook, setSelectedNote, setSearchQuery]);

  const currentLang = i18n.language?.slice(0, 2) ?? 'en';
  const langs = ['en', 'fr', 'it'] as const;

  return (
    <header className="flex items-center gap-3 px-4 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label={t('toggleSidebar')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search bar */}
      <div className="flex-1 relative max-w-lg">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-9 pr-9 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-700 outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={t('clearSearch')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Language switcher */}
      <div className="flex items-center gap-0.5">
        {langs.map(lang => (
          <button
            key={lang}
            onClick={() => i18n.changeLanguage(lang)}
            className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
              currentLang === lang
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={t('language')}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label={darkMode ? t('switchToLightMode') : t('switchToDarkMode')}
        title={darkMode ? t('switchToLightMode') : t('switchToDarkMode')}
      >
        {darkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  );
}
