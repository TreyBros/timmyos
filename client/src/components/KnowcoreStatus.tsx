import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, Database, Zap } from 'lucide-react';

interface KnowcoreData {
  connected: boolean;
  kcName: string;
  kcId: string;
  totalChunks: number;
  latency: number;
  error?: string;
}

export default function KnowcoreStatus({ apiUrl }: { apiUrl: string }) {
  const [data, setData] = useState<KnowcoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/knowcore`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        setData({ connected: false, error: error.message, kcName: '', kcId: '', totalChunks: 0, latency: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-xl border p-4 ${data?.connected ? 'border-green-500/30' : 'border-red-500/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className={`w-5 h-5 ${data?.connected ? 'text-green-500' : 'text-red-500'}`} />
          <h2 className="font-semibold">Knowcore</h2>
        </div>
        {data?.connected ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      {data?.connected ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Knowledge Core</span>
            <span className="text-sm font-medium">{data.kcName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Chunks</span>
            <span className="text-sm font-medium flex items-center gap-1">
              <Database className="w-3 h-3" />
              {data.totalChunks}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Latency</span>
            <span className="text-sm font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {data.latency}ms
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2 truncate">
            ID: {data.kcId.slice(0, 8)}...{data.kcId.slice(-8)}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{data?.error || 'Not connected'}</p>
        </div>
      )}
    </div>
  );
}
