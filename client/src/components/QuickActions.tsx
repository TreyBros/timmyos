import React, { useState } from 'react';
import { 
  Play, RefreshCw, Trash2, Server, Brain, 
  Activity, Terminal, MessageSquare
} from 'lucide-react';

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const actions: Action[] = [
  { id: 'health-check', label: 'Health Check', icon: <Activity className="w-4 h-4" />, color: 'bg-green-600' },
  { id: 'refresh-memory', label: 'Refresh Memory', icon: <Brain className="w-4 h-4" />, color: 'bg-primary-600' },
  { id: 'clear-logs', label: 'Clear Logs', icon: <Trash2 className="w-4 h-4" />, color: 'bg-red-600' },
  { id: 'restart-gateway', label: 'Restart Gateway', icon: <Server className="w-4 h-4" />, color: 'bg-yellow-600' },
  { id: 'run-heartbeat', label: 'Run Heartbeat', icon: <RefreshCw className="w-4 h-4" />, color: 'bg-blue-600' },
  { id: 'check-knowcore', label: 'Check Knowcore', icon: <Brain className="w-4 h-4" />, color: 'bg-purple-600' },
];

export default function QuickActions({ apiUrl, onAction }: { apiUrl: string; onAction: (type: string, msg: string) => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const executeAction = async (actionId: string) => {
    setLoading(actionId);
    onAction('action', `Executing: ${actionId}`);
    
    try {
      const res = await fetch(`${apiUrl}/api/actions/${actionId}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        onAction('success', `${actionId} completed successfully`);
      } else {
        onAction('error', `${actionId} failed: ${data.error}`);
      }
    } catch (error) {
      onAction('error', `${actionId} error: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-slate-400" />
        <h2 className="font-semibold">Quick Actions</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => executeAction(action.id)}
            disabled={loading === action.id}
            className={`${action.color} hover:opacity-90 disabled:opacity-50 rounded-lg p-3 text-left transition-all flex items-center gap-2 text-white`}
          >
            {loading === action.id ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              action.icon
            )}
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
