export interface Notebook {
  id: string;
  name: string;
  createdAt: number;
}

export interface Note {
  id: string;
  notebookId: string;
  title: string;
  content: string; // HTML content from TipTap
  tags: string[];
  pinned: boolean;
  deleted: boolean;
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export type ViewType = 'all' | 'notebook' | 'tag' | 'trash';

export interface AppView {
  type: ViewType;
  notebookId?: string;
  tag?: string;
}
