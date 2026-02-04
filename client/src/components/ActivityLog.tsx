import React from 'react';
import { Terminal, Activity, AlertCircle, CheckCircle, Server } from 'lucide-react';

interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  'system': <Server className="w-4 h-4" />,
  'health': <Activity className="w-4 h-4" />,
  'success': <CheckCircle className="w-4 h-4" />,
  'error': <AlertCircle className="w-4 h-4" />,
  'action': <Terminal className="w-4 h-4" />,
  'memory': <Activity className="w-4 h-4" />,
  'tasks': <Activity className="w-4 h-4" />
};

const typeColors: Record<string, string> = {
  'system': 'text-blue-400',
  'health': 'text-green-400',
  'success': 'text-green-400',
  'error': 'text-red-400',
  'action': 'text-yellow-400',
  'memory': 'text-purple-400',
  'tasks': 'text-primary-400'
};

export default function ActivityLog({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <Terminal className="w-5 h-5 text-slate-400" />
        <h2 className="font-semibold">Activity Log</h2>
        <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
          {activities.length} events
        </span>
      </div>
      
      <div className="max-h-48 overflow-y-auto p-2 font-mono text-sm">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for activity...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <span className={typeColors[activity.type] || 'text-slate-400'}>
                  {typeIcons[activity.type] || <Activity className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 truncate">{activity.message}</p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
