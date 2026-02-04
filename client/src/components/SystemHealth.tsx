import React, { useState, useEffect } from 'react';
import { Cpu, Thermometer, HardDrive, Clock, AlertCircle } from 'lucide-react';

interface HealthData {
  ram: { used: string; total: string; percent: number; status: string };
  cpu: { temp: string; status: string };
  disk: { used: string; total: string; percent: number; status: string };
  uptime: string;
}

export default function SystemHealth({ apiUrl }: { apiUrl: string }) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/health`);
        const data = await res.json();
        setHealth(data);
      } catch (error) {
        console.error('Health fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-green-400 bg-green-400/10 border-green-400/20';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* RAM */}
      <div className={`bg-slate-800 rounded-xl p-6 border ${getStatusColor(health.ram.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">RAM Usage</p>
            <p className="text-2xl font-bold mt-1">{health.ram.percent}%</p>
            <p className="text-xs text-slate-500 mt-1">{health.ram.used} / {health.ram.total}</p>
          </div>
          <Cpu className="w-10 h-10 opacity-50" />
        </div>
        <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              health.ram.percent > 85 ? 'bg-red-500' : 
              health.ram.percent > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${health.ram.percent}%` }}
          />
        </div>
      </div>

      {/* CPU Temp */}
      <div className={`bg-slate-800 rounded-xl p-6 border ${getStatusColor(health.cpu.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">CPU Temp</p>
            <p className="text-2xl font-bold mt-1">{health.cpu.temp}°C</p>
            <p className="text-xs text-slate-500 mt-1">Jetson Orin Nano</p>
          </div>
          <Thermometer className="w-10 h-10 opacity-50" />
        </div>
        <div className="mt-3 flex gap-1">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i}
              className={`h-2 flex-1 rounded-full ${
                (parseFloat(health.cpu.temp) / 80 * 10) > i ? 
                  (parseFloat(health.cpu.temp) > 70 ? 'bg-red-500' : 
                   parseFloat(health.cpu.temp) > 55 ? 'bg-yellow-500' : 'bg-green-500') 
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Disk */}
      <div className={`bg-slate-800 rounded-xl p-6 border ${getStatusColor(health.disk.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Disk Usage</p>
            <p className="text-2xl font-bold mt-1">{health.disk.percent}%</p>
            <p className="text-xs text-slate-500 mt-1">{health.disk.used} / {health.disk.total}</p>
          </div>
          <HardDrive className="w-10 h-10 opacity-50" />
        </div>
        <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              health.disk.percent > 90 ? 'bg-red-500' : 
              health.disk.percent > 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${health.disk.percent}%` }}
          />
        </div>
      </div>

      {/* Uptime */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Uptime</p>
            <p className="text-lg font-bold mt-1">{health.uptime}</p>
            <p className="text-xs text-slate-500 mt-1">System stable</p>
          </div>
          <Clock className="w-10 h-10 text-primary-500 opacity-50" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400">Running smoothly</span>
        </div>
      </div>
    </div>
  );
}
