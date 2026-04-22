import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, Notebook, AppView } from '../types';
import { createSampleData } from '../utils/sampleData';

interface NotesStore {
  // State
  notebooks: Notebook[];
  notes: Note[];
  currentView: AppView;
  selectedNoteId: string | null;
  searchQuery: string;
  darkMode: boolean;
  sidebarOpen: boolean;

  // Actions
  createNotebook(name?: string): string;
  renameNotebook(id: string, name: string): void;
  deleteNotebook(id: string): void;
  createNote(notebookId?: string): string;
  updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'pinned'>>): void;
  deleteNote(id: string): void;
  restoreNote(id: string): void;
  permanentlyDeleteNote(id: string): void;
  purgeOldTrash(): void;
  setCurrentView(view: AppView): void;
  setSelectedNote(id: string | null): void;
  setSearchQuery(q: string): void;
  toggleDarkMode(): void;
  toggleSidebar(): void;

  // Selectors
  getVisibleNotes(): Note[];
  getNotebookNoteCount(notebookId: string): number;
  getAllTags(): { tag: string; count: number }[];
  getTagNoteCount(tag: string): number;
  getTrashCount(): number;
}

const sampleData = createSampleData();

const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      // Initial state — persist middleware will override with saved data if present
      notebooks: sampleData.notebooks,
      notes: sampleData.notes,
      currentView: { type: 'all' },
      selectedNoteId: null,
      searchQuery: '',
      darkMode: false,
      sidebarOpen: false,

      createNotebook(name?: string): string {
        const id = crypto.randomUUID();
        const notebook: Notebook = {
          id,
          name: name ?? 'New Notebook',
          createdAt: Date.now(),
        };
        set((state) => ({ notebooks: [...state.notebooks, notebook] }));
        return id;
      },

      renameNotebook(id: string, name: string): void {
        set((state) => ({
          notebooks: state.notebooks.map((nb) =>
            nb.id === id ? { ...nb, name } : nb
          ),
        }));
      },

      deleteNotebook(id: string): void {
        const now = Date.now();
        set((state) => ({
          notebooks: state.notebooks.filter((nb) => nb.id !== id),
          notes: state.notes.map((note) =>
            note.notebookId === id && !note.deleted
              ? { ...note, deleted: true, deletedAt: now }
              : note
          ),
        }));
      },

      createNote(notebookId?: string): string {
        const id = crypto.randomUUID();
        const { notebooks, currentView } = get();
        const resolvedNotebookId =
          notebookId ??
          (currentView.type === 'notebook' ? currentView.notebookId : undefined) ??
          notebooks[0]?.id ??
          (() => {
            const nb: Notebook = { id: crypto.randomUUID(), name: 'My Notebook', createdAt: Date.now() };
            set((state) => ({ notebooks: [...state.notebooks, nb] }));
            return nb.id;
          })();

        const now = Date.now();
        const note: Note = {
          id,
          notebookId: resolvedNotebookId,
          title: '',
          content: '',
          tags: [],
          pinned: false,
          deleted: false,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ notes: [...state.notes, note] }));
        return id;
      },

      updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'pinned'>>): void {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: Date.now() }
              : note
          ),
        }));
      },

      deleteNote(id: string): void {
        const now = Date.now();
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, deleted: true, deletedAt: now } : note
          ),
        }));
      },

      restoreNote(id: string): void {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, deleted: false, deletedAt: null } : note
          ),
        }));
      },

      permanentlyDeleteNote(id: string): void {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      purgeOldTrash(): void {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        set((state) => ({
          notes: state.notes.filter(
            (note) => !(note.deleted && note.deletedAt !== null && note.deletedAt < cutoff)
          ),
        }));
      },

      setCurrentView(view: AppView): void {
        set({ currentView: view });
      },

      setSelectedNote(id: string | null): void {
        set({ selectedNoteId: id });
      },

      setSearchQuery(q: string): void {
        set({ searchQuery: q });
      },

      toggleDarkMode(): void {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      toggleSidebar(): void {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      getVisibleNotes(): Note[] {
        const { notes, currentView, searchQuery } = get();
        const query = searchQuery.trim().toLowerCase();

        let filtered = notes.filter((note) => {
          if (currentView.type === 'trash') return note.deleted;
          if (note.deleted) return false;
          if (currentView.type === 'notebook') return note.notebookId === currentView.notebookId;
          if (currentView.type === 'tag') return note.tags.includes(currentView.tag ?? '');
          return true; // 'all'
        });

        if (query) {
          filtered = filtered.filter((note) => {
            const plainContent = note.content.replace(/<[^>]*>/g, ' ');
            return (
              note.title.toLowerCase().includes(query) ||
              plainContent.toLowerCase().includes(query)
            );
          });
        }

        return filtered.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return b.updatedAt - a.updatedAt;
        });
      },

      getNotebookNoteCount(notebookId: string): number {
        return get().notes.filter((n) => n.notebookId === notebookId && !n.deleted).length;
      },

      getAllTags(): { tag: string; count: number }[] {
        const tagCounts = new Map<string, number>();
        for (const note of get().notes) {
          if (note.deleted) continue;
          for (const tag of note.tags) {
            tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
          }
        }
        return Array.from(tagCounts.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => a.tag.localeCompare(b.tag));
      },

      getTagNoteCount(tag: string): number {
        return get().notes.filter((n) => !n.deleted && n.tags.includes(tag)).length;
      },

      getTrashCount(): number {
        return get().notes.filter((n) => n.deleted).length;
      },
    }),
    {
      name: 'noteflow-state',
      partialize: (state) => ({
        notebooks: state.notebooks,
        notes: state.notes,
        darkMode: state.darkMode,
      }),
    }
  )
);

export default useNotesStore;
