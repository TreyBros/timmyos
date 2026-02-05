import { useState, useEffect } from 'react';
import { 
  Brain, Activity, FolderOpen, CheckSquare, 
  LogOut, Server, Wifi
} from 'lucide-react';
import SystemHealth from './components/SystemHealth';
import MemoryBrowser from './components/MemoryBrowser';
import TaskBoard from './components/TaskBoard';
import SkillsGrid from './components/SkillsGrid';
import QuickActions from './components/QuickActions';
import KnowcoreStatus from './components/KnowcoreStatus';
import ActivityLog from './components/ActivityLog';

interface DashboardProps {
  onLogout: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3333';

function Dashboard({ onLogout }: DashboardProps) {
  const [wsConnected, setWsConnected] = useState(false);
  const [activities, setActivities] = useState<Array<{id: number, type: string, message: string, timestamp: string}>>([]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      setWsConnected(true);
      addActivity('system', 'Connected to TimmyOS');
    };
    
    ws.onclose = () => {
      setWsConnected(false);
      addActivity('system', 'Disconnected from TimmyOS');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addActivity(data.type, `Updated: ${data.type}`);
    };
    
    return () => ws.close();
  }, []);

  const addActivity = (type: string, message: string) => {
    setActivities(prev => [{
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 50));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary-500" />
              <h1 className="text-xl font-bold text-white">TimmyOS</h1>
              <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                v1.0.0
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-sm ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                <Wifi className="w-4 h-4" />
                {wsConnected ? 'Live' : 'Reconnecting...'}
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Row - System Health */}
        <SystemHealth apiUrl={API_URL} />
        
        {/* Middle Row - Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Memory & Knowcore */}
          <div className="space-y-6">
            <KnowcoreStatus apiUrl={API_URL} />
            <MemoryBrowser apiUrl={API_URL} />
          </div>
          
          {/* Center Column - Task Board */}
          <div className="lg:col-span-1">
            <TaskBoard apiUrl={API_URL} />
          </div>
          
          {/* Right Column - Skills & Actions */}
          <div className="space-y-6">
            <SkillsGrid apiUrl={API_URL} />
            <QuickActions apiUrl={API_URL} onAction={addActivity} />
          </div>
        </div>
        
        {/* Bottom Row - Activity Log */}
        <div className="mt-6">
          <ActivityLog activities={activities} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
