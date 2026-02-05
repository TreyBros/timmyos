import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiHeaders } from '../config';

interface Skill {
  name: string;
  description: string;
  status: string;
}

const skillIcons: Record<string, string> = {
  'knowcore': '🧠',
  'weather': '🌤️',
  'github': '💻',
  'perplexity': '🔍',
  'auto-preserve': '💾',
  'smart-memory': '🧩',
  'complete-memory': '📚',
  'remotion': '🎬'
};

export default function SkillsGrid({ apiUrl }: { apiUrl: string }) {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch(`${apiUrl}/api/skills`, { headers: apiHeaders })
      .then(res => res.json())
      .then(data => setSkills(data))
      .catch(console.error);
  }, [apiUrl]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h2 className="font-semibold">Skills</h2>
        <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
          {skills.length} active
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {skills.map(skill => (
          <div
            key={skill.name}
            className="bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{skillIcons[skill.name] || '🔧'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate capitalize">{skill.name.replace(/-/g, ' ')}</p>
                <p className="text-xs text-slate-400 truncate">{skill.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-400">Ready</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
