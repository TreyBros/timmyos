import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Calendar, AlertCircle, Clock } from 'lucide-react';
import { apiHeaders } from '../config';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
}

export default function TaskBoard({ apiUrl }: { apiUrl: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [apiUrl]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/tasks`, { headers: apiHeaders });
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Tasks fetch error:', error);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          title: newTask,
          description: '',
          priority: 'medium'
        })
      });
      setNewTask('');
      setShowAdd(false);
      fetchTasks();
    } catch (error) {
      console.error('Add task error:', error);
    }
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`${apiUrl}/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch (error) {
      console.error('Move task error:', error);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-slate-600' },
    { id: 'in-progress', title: 'In Progress', color: 'border-yellow-500/50' },
    { id: 'done', title: 'Done', color: 'border-green-500/50' }
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 h-full">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold">Task Board</h2>
          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
            {tasks.length} tasks
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAdd && (
        <div className="p-4 border-b border-slate-700 bg-slate-700/30">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="New task..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={addTask}
              className="px-3 py-1 bg-primary-600 hover:bg-primary-500 rounded text-sm transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className={`border-l-2 ${col.color} pl-3`}>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center justify-between">
                {col.title}
                <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{colTasks.length}</span>
              </h3>
              <div className="space-y-2">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-slate-700/50 rounded-lg p-3 group hover:bg-slate-700 transition-colors"
                  >
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => moveTask(task.id, col.id === 'done' ? 'in-progress' : 'todo')}
                            className="p-1 hover:bg-slate-600 rounded"
                          >
                            ←
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => moveTask(task.id, col.id === 'todo' ? 'in-progress' : 'done')}
                            className="p-1 hover:bg-slate-600 rounded"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
