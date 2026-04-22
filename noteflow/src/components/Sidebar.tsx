import { useState, useRef, useEffect } from 'react';
import useNotesStore from '../store/useNotesStore';
import type { AppView } from '../types';

export default function Sidebar() {
  const notebooks = useNotesStore(s => s.notebooks);
  const currentView = useNotesStore(s => s.currentView);
  const createNotebook = useNotesStore(s => s.createNotebook);
  const renameNotebook = useNotesStore(s => s.renameNotebook);
  const deleteNotebook = useNotesStore(s => s.deleteNotebook);
  const setCurrentView = useNotesStore(s => s.setCurrentView);
  const setSelectedNote = useNotesStore(s => s.setSelectedNote);
  const getNotebookNoteCount = useNotesStore(s => s.getNotebookNoteCount);
  const getAllTags = useNotesStore(s => s.getAllTags);
  const getTrashCount = useNotesStore(s => s.getTrashCount);

  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const editInputRef = useRef<HTMLInputElement>(null);

  const tags = getAllTags();
  const trashCount = getTrashCount();

  useEffect(() => {
    if (editingNotebookId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNotebookId]);

  const navigate = (view: AppView) => {
    setCurrentView(view);
    setSelectedNote(null);
  };

  const startRename = (id: string, name: string) => {
    setEditingNotebookId(id);
    setEditingName(name);
  };

  const commitRename = () => {
    if (editingNotebookId && editingName.trim()) {
      renameNotebook(editingNotebookId, editingName.trim());
    }
    setEditingNotebookId(null);
  };

  const handleNewNotebook = () => {
    const id = createNotebook();
    startRename(id, 'Untitled Notebook');
    navigate({ type: 'notebook', notebookId: id });
  };

  const handleDeleteNotebook = (id: string, name: string) => {
    if (confirm(`Delete notebook "${name}"? All notes will be moved to Trash.`)) {
      deleteNotebook(id);
      navigate({ type: 'all' });
    }
  };

  const isActive = (view: AppView) => {
    if (view.type !== currentView.type) return false;
    if (view.type === 'notebook') return view.notebookId === currentView.notebookId;
    if (view.type === 'tag') return view.tag === currentView.tag;
    return true;
  };

  const itemClass = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors w-full text-left ${
      active
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-medium'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
    }`;

  return (
    <aside className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📓</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">NoteFlow</span>
        </div>
        <button
          onClick={handleNewNotebook}
          className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Notebook
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {/* All Notes */}
        <button
          onClick={() => navigate({ type: 'all' })}
          className={itemClass(isActive({ type: 'all' }))}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="flex-1">All Notes</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {notebooks.reduce((sum, nb) => sum + getNotebookNoteCount(nb.id), 0)}
          </span>
        </button>

        {/* Notebooks */}
        <div className="pt-2">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Notebooks
          </p>
          {notebooks.map(notebook => (
            <div key={notebook.id} className="group relative">
              {editingNotebookId === notebook.id ? (
                <div className="flex items-center gap-1 px-3 py-1">
                  <input
                    ref={editInputRef}
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setEditingNotebookId(null);
                    }}
                    className="flex-1 text-sm bg-white dark:bg-gray-800 border border-indigo-400 rounded px-2 py-1 outline-none text-gray-900 dark:text-white"
                  />
                </div>
              ) : (
                <button
                  onClick={() => navigate({ type: 'notebook', notebookId: notebook.id })}
                  onDoubleClick={() => startRename(notebook.id, notebook.name)}
                  className={`${itemClass(isActive({ type: 'notebook', notebookId: notebook.id }))} pr-8`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="flex-1 truncate">{notebook.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {getNotebookNoteCount(notebook.id)}
                  </span>
                </button>
              )}

              {/* Hover actions */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); startRename(notebook.id, notebook.name); }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                  title="Rename"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteNotebook(notebook.id, notebook.name); }}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="w-full flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-3 h-3 transition-transform"
                style={{ transform: tagsExpanded ? 'rotate(90deg)' : 'rotate(0)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Tags
            </button>
            {tagsExpanded && (
              <div className="mt-1 space-y-0.5">
                {tags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => navigate({ type: 'tag', tag })}
                    className={itemClass(isActive({ type: 'tag', tag }))}
                  >
                    <span className="text-indigo-500 dark:text-indigo-400 font-medium">#</span>
                    <span className="flex-1 truncate">{tag}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Trash */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate({ type: 'trash' })}
          className={itemClass(isActive({ type: 'trash' }))}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="flex-1">Trash</span>
          {trashCount > 0 && (
            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
              {trashCount}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
