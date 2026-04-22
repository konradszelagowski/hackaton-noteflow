import { useEffect } from 'react';
import useNotesStore from './store/useNotesStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import Editor from './components/Editor';

function App() {
  const darkMode = useNotesStore(s => s.darkMode);
  const sidebarOpen = useNotesStore(s => s.sidebarOpen);
  const purgeOldTrash = useNotesStore(s => s.purgeOldTrash);
  const toggleSidebar = useNotesStore(s => s.toggleSidebar);

  // Apply dark mode class to root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Detect system theme on first visit
  useEffect(() => {
    const stored = localStorage.getItem('noteflow-state');
    if (!stored) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) useNotesStore.getState().toggleDarkMode();
    }
  }, []);

  // Purge old trash on launch
  useEffect(() => {
    purgeOldTrash();
  }, [purgeOldTrash]);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            w-56 flex-shrink-0 h-full overflow-hidden
            lg:relative lg:translate-x-0 lg:z-auto
            fixed left-0 top-0 z-30 transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ top: '3.5rem', height: 'calc(100vh - 3.5rem)' }}
        >
          <Sidebar />
        </div>

        {/* Note list */}
        <div className="w-72 flex-shrink-0 h-full overflow-hidden hidden sm:flex flex-col">
          <NoteList />
        </div>

        {/* Editor */}
        <div className="flex-1 h-full overflow-hidden">
          <Editor />
        </div>
      </div>
    </div>
  );
}

export default App;
