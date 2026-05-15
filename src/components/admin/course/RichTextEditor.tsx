'use client';

import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Высота textarea (rows). */
  rows?: number;
}

export default function RichTextEditor({ value, onChange, disabled, placeholder, rows = 8 }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-1">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          disabled={disabled}
          className="px-2 py-1 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700 bg-white"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          disabled={disabled}
          className="px-2 py-1 text-xs italic border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700 bg-white"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('`', '`')}
          disabled={disabled}
          className="px-2 py-1 text-xs font-mono border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700 bg-white"
          title="Code"
        >
          {'<>'}
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertMarkdown('# ')}
          disabled={disabled}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700 bg-white"
          title="Heading"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('## ')}
          disabled={disabled}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700 bg-white"
          title="Heading 2"
        >
          H2
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertMarkdown('- ')}
          disabled={disabled}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700 bg-white"
          title="List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('[', '](url)')}
          disabled={disabled}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700 bg-white"
          title="Link"
        >
          🔗
        </button>
        <div className="flex-1" />
        <div className="flex border border-gray-300 rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1 text-xs text-gray-700 ${
              activeTab === 'edit' ? 'bg-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-xs text-gray-700 ${
              activeTab === 'preview' ? 'bg-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white">
        {activeTab === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className="w-full px-3 py-2 text-sm font-mono focus:outline-none resize-none text-gray-900 bg-white"
          />
        ) : (
          <div className="px-3 py-2 prose prose-sm max-w-none">
            {value ? (
              <ReactMarkdown>{value}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>

      {/* Help */}
      <div className="bg-gray-50 border-t border-gray-300 px-3 py-2 text-xs text-gray-500">
        Markdown supported: **bold**, *italic*, `code`, # heading, - list, [link](url)
      </div>
    </div>
  );
}
