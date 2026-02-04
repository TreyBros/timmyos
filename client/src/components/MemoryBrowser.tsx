import React, { useState, useEffect } from 'react';
import { FolderOpen, FileText, Search, Clock } from 'lucide-react';

interface MemoryFile {
  name: string;
  size: string;
  modified: string;
  preview: string;
}

export default function MemoryBrowser({ apiUrl }: { apiUrl: string }) {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MemoryFile | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/memory`)
      .then(res => res.json())
      .then(data => setFiles(data))
      .catch(console.error);
  }, [apiUrl]);

  const filtered = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.preview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold">Local Memory</h2>
          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
            {files.length} files
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search memory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {filtered.map(file => (
          <div
            key={file.name}
            onClick={() => setSelected(file)}
            className="p-4 border-b border-slate-700/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
          >
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{file.preview}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{new Date(file.modified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selected && (
        <div className="p-4 bg-slate-700/30 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Selected: {selected.name}</p>
          <p className="text-sm text-slate-300 line-clamp-3">{selected.preview}</p>
        </div>
      )}
    </div>
  );
}
