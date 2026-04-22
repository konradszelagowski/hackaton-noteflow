import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { format } from 'date-fns';
import useNotesStore from '../store/useNotesStore';
import type { Note } from '../types';
import { htmlToMarkdown, htmlToPlainText, downloadFile } from '../utils/exportUtils';

interface EditorToolbarProps {
  editor: ReturnType<typeof useEditor>;
}

function ToolbarButton({ onClick, isActive, title, children }: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
        <span className="bg-yellow-200 px-0.5 rounded text-xs">H</span>
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
        <span className="text-xs font-bold">H1</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
        <span className="text-xs font-bold">H2</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
        <span className="text-xs font-bold">H3</span>
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M3 8h.01M3 12h.01M3 16h.01" />
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task List">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10.5h3m-3 4h3m4-4h3m-3 4h3M3 7.5v9a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0019.5 6h-15A1.5 1.5 0 003 7.5z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} isActive={false} title="Horizontal Rule">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      </ToolbarButton>
    </div>
  );
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  readOnly?: boolean;
}

function TagInput({ tags, onChange, readOnly }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-t border-gray-200 dark:border-gray-700 min-h-[44px]">
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs"
        >
          #{tag}
          {!readOnly && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 leading-none"
            >
              ×
            </button>
          )}
        </span>
      ))}
      {!readOnly && (
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
              e.preventDefault();
              addTag(inputValue);
            }
            if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          className="outline-none bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 min-w-[80px] flex-1"
        />
      )}
    </div>
  );
}

interface ExportMenuProps {
  note: Note;
}

function ExportMenu({ note }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const exportAs = (type: 'md' | 'txt') => {
    const title = note.title || 'Untitled';
    if (type === 'md') {
      const md = `# ${title}\n\n${htmlToMarkdown(note.content)}`;
      downloadFile(md, `${title}.md`, 'text/markdown');
    } else {
      const txt = `${title}\n${'='.repeat(title.length)}\n\n${htmlToPlainText(note.content)}`;
      downloadFile(txt, `${title}.txt`, 'text/plain');
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[140px]">
          <button onClick={() => exportAs('md')} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Export as Markdown
          </button>
          <button onClick={() => exportAs('txt')} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Export as Plain Text
          </button>
        </div>
      )}
    </div>
  );
}

export default function Editor() {
  const selectedNoteId = useNotesStore(s => s.selectedNoteId);
  const notes = useNotesStore(s => s.notes);
  const updateNote = useNotesStore(s => s.updateNote);
  const deleteNote = useNotesStore(s => s.deleteNote);

  const note = notes.find(n => n.id === selectedNoteId);

  const [title, setTitle] = useState(note?.title ?? '');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlock,
      Highlight,
      Placeholder.configure({
        placeholder: 'Start writing your note...',
      }),
    ],
    content: note?.content ?? '',
    onUpdate: ({ editor }) => {
      if (!selectedNoteId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(selectedNoteId, { content: editor.getHTML() });
      }, 500);
    },
  });

  // Update editor content when selected note changes
  useEffect(() => {
    if (!note) {
      setTitle('');
      editor?.commands.setContent('');
      return;
    }
    setTitle(note.title);
    if (editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || '', { emitUpdate: false });
    }
  }, [note?.id]); // Only run when note ID changes

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    if (!selectedNoteId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateNote(selectedNoteId, { title: value });
    }, 500);
  }, [selectedNoteId, updateNote]);

  const handleTagsChange = useCallback((tags: string[]) => {
    if (!selectedNoteId) return;
    updateNote(selectedNoteId, { tags });
  }, [selectedNoteId, updateNote]);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900 text-center px-8">
        <span className="text-6xl mb-4">📝</span>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No note selected</h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Select a note from the list or create a new one</p>
      </div>
    );
  }

  const isTrash = note.deleted;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      {!isTrash && <EditorToolbar editor={editor} />}

      {/* Trash notice */}
      {isTrash && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          This note is in the Trash. Restore it to edit.
        </div>
      )}

      {/* Title */}
      <div className="px-6 pt-6 pb-2">
        <input
          type="text"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Note title"
          disabled={isTrash}
          className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 disabled:opacity-60"
        />
      </div>

      {/* Editor */}
      <div
        className="flex-1 overflow-y-auto px-6 py-2 prose dark:prose-invert max-w-none"
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent
          editor={editor}
          className="min-h-full text-gray-800 dark:text-gray-200 [&_.ProseMirror]:min-h-[200px]"
        />
      </div>

      {/* Tags */}
      <TagInput
        tags={note.tags}
        onChange={handleTagsChange}
        readOnly={isTrash}
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-xs text-gray-400 dark:text-gray-500 space-x-3">
          <span>Created {format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
          <span>·</span>
          <span>Updated {format(new Date(note.updatedAt), 'MMM d, yyyy HH:mm')}</span>
        </div>
        {!isTrash && <ExportMenu note={note} />}
        {isTrash && (
          <button
            onClick={() => deleteNote(note.id)}
            className="text-xs text-red-500 hover:text-red-600"
          >
            Delete permanently
          </button>
        )}
      </div>
    </div>
  );
}
