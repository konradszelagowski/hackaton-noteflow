import { formatDistanceToNow } from 'date-fns';
import type { Note } from '../types';
import useNotesStore from '../store/useNotesStore';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 rounded-sm px-0.5">{part}</mark>
    ) : part
  );
}

export default function NoteList() {
  const currentView = useNotesStore(s => s.currentView);
  const selectedNoteId = useNotesStore(s => s.selectedNoteId);
  const searchQuery = useNotesStore(s => s.searchQuery);
  const notebooks = useNotesStore(s => s.notebooks);
  const createNote = useNotesStore(s => s.createNote);
  const deleteNote = useNotesStore(s => s.deleteNote);
  const restoreNote = useNotesStore(s => s.restoreNote);
  const permanentlyDeleteNote = useNotesStore(s => s.permanentlyDeleteNote);
  const updateNote = useNotesStore(s => s.updateNote);
  const setSelectedNote = useNotesStore(s => s.setSelectedNote);
  const getVisibleNotes = useNotesStore(s => s.getVisibleNotes);

  const notes = getVisibleNotes();
  const isTrash = currentView.type === 'trash';

  const handleNewNote = () => {
    const notebookId = currentView.type === 'notebook' ? currentView.notebookId : notebooks[0]?.id;
    const id = createNote(notebookId);
    setSelectedNote(id);
  };

  const getTitle = () => {
    if (searchQuery) return `Search: "${searchQuery}"`;
    if (currentView.type === 'all') return 'All Notes';
    if (currentView.type === 'notebook') {
      const nb = notebooks.find(n => n.id === currentView.notebookId);
      return nb?.name ?? 'Notebook';
    }
    if (currentView.type === 'tag') return `#${currentView.tag}`;
    if (currentView.type === 'trash') return 'Trash';
    return 'Notes';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{getTitle()}</h2>
        {!isTrash && (
          <button
            onClick={handleNewNote}
            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
            title="New Note (Ctrl+N)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <EmptyState isTrash={isTrash} isSearch={!!searchQuery} onCreateNote={handleNewNote} />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                searchQuery={searchQuery}
                isTrash={isTrash}
                onSelect={() => setSelectedNote(note.id)}
                onPin={() => updateNote(note.id, { pinned: !note.pinned })}
                onDelete={() => deleteNote(note.id)}
                onRestore={() => restoreNote(note.id)}
                onPermanentDelete={() => {
                  if (confirm('Permanently delete this note? This cannot be undone.')) {
                    permanentlyDeleteNote(note.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  searchQuery: string;
  isTrash: boolean;
  onSelect: () => void;
  onPin: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
}

function NoteCard({ note, isSelected, searchQuery, isTrash, onSelect, onPin, onDelete, onRestore, onPermanentDelete }: NoteCardProps) {
  const preview = stripHtml(note.content).slice(0, 100);

  return (
    <div
      onClick={onSelect}
      className={`relative px-4 py-3 cursor-pointer transition-colors group ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/30 border-l-2 border-indigo-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-transparent'
      }`}
    >
      {/* Pin indicator */}
      {note.pinned && !isTrash && (
        <span className="absolute top-2 right-2 text-indigo-500 dark:text-indigo-400" title="Pinned">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
          </svg>
        </span>
      )}

      <div className="pr-6">
        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
          {highlightText(note.title || 'Untitled', searchQuery)}
        </h3>
        {preview && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
            {highlightText(preview, searchQuery)}
          </p>
        )}
        <div className="flex items-center justify-between">
          <time className="text-xs text-gray-400 dark:text-gray-500">
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </time>
          {note.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap justify-end">
              {note.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions (show on hover) */}
      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700 p-0.5">
        {isTrash ? (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onRestore(); }}
              className="p-1 text-gray-400 hover:text-green-500 rounded transition-colors"
              title="Restore"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPermanentDelete(); }}
              className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
              title="Delete permanently"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPin(); }}
              className={`p-1 rounded transition-colors ${note.pinned ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-500'}`}
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              <svg className="w-3.5 h-3.5" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
              title="Move to Trash"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ isTrash, isSearch, onCreateNote }: { isTrash: boolean; isSearch: boolean; onCreateNote: () => void }) {
  if (isTrash) return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <span className="text-5xl mb-4">🗑️</span>
      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Trash is empty</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500">Deleted notes will appear here</p>
    </div>
  );

  if (isSearch) return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <span className="text-5xl mb-4">🔍</span>
      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No results found</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500">Try different keywords</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <span className="text-5xl mb-4">📝</span>
      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No notes yet</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Create your first note to get started</p>
      <button
        onClick={onCreateNote}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        New Note
      </button>
    </div>
  );
}
