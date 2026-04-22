import type { Notebook, Note } from '../types';

export function createSampleData(): { notebooks: Notebook[], notes: Note[] } {
  const now = Date.now();
  const notebookId = crypto.randomUUID();
  
  return {
    notebooks: [
      { id: notebookId, name: 'Getting Started', createdAt: now }
    ],
    notes: [
      {
        id: crypto.randomUUID(),
        notebookId,
        title: 'Welcome to NoteFlow! 🎉',
        content: '<h1>Welcome to NoteFlow!</h1><p>NoteFlow is your <strong>private, offline-first</strong> note-taking app. Your notes never leave your device.</p><h2>Key Features</h2><ul><li>Rich text editing with formatting</li><li>Organize notes into <strong>notebooks</strong></li><li>Tag notes for quick filtering</li><li>Full-text search across all notes</li><li>Dark and light mode</li></ul>',
        tags: ['welcome', 'important'],
        pinned: true,
        deleted: false,
        deletedAt: null,
        createdAt: now - 1000 * 60 * 5,
        updatedAt: now - 1000 * 60 * 2,
      },
      {
        id: crypto.randomUUID(),
        notebookId,
        title: 'Formatting Guide',
        content: '<h2>Text Formatting</h2><p>Use the toolbar or keyboard shortcuts to format text:</p><ul><li><strong>Bold</strong> — Ctrl+B</li><li><em>Italic</em> — Ctrl+I</li><li><s>Strikethrough</s></li></ul><h2>Task Lists</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="true">Create a notebook ✓</li><li data-type="taskItem" data-checked="false">Try rich text formatting</li><li data-type="taskItem" data-checked="false">Add tags to a note</li></ul><h2>Code Blocks</h2><pre><code>const greeting = "Hello, NoteFlow!";\nconsole.log(greeting);</code></pre>',
        tags: ['guide', 'formatting'],
        pinned: false,
        deleted: false,
        deletedAt: null,
        createdAt: now - 1000 * 60 * 60,
        updatedAt: now - 1000 * 60 * 30,
      },
      {
        id: crypto.randomUUID(),
        notebookId,
        title: 'Tips & Tricks',
        content: '<h2>Keyboard Shortcuts</h2><ul><li><strong>Alt+N</strong> — New note</li><li><strong>Alt+Shift+N</strong> — New notebook</li><li><strong>Ctrl+F</strong> — Focus search</li></ul><h2>Organization</h2><p>Use <strong>tags</strong> to cross-reference notes across notebooks. Click any tag in the sidebar to filter all notes with that tag.</p><blockquote><p>💡 Tip: Pin your most important notes so they always appear at the top of the list.</p></blockquote>',
        tags: ['tips', 'shortcuts'],
        pinned: false,
        deleted: false,
        deletedAt: null,
        createdAt: now - 1000 * 60 * 60 * 2,
        updatedAt: now - 1000 * 60 * 60,
      },
    ]
  };
}
