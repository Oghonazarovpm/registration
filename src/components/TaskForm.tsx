import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  onAddTask: (title: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Введите текст задачи');
      return;
    }

    try {
      setError(null);
      await onAddTask(trimmed);
      setTitle('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось добавить задачу');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Что нужно сделать?"
            maxLength={180}
            disabled={isLoading}
            className={`w-full px-4 py-3 bg-white border ${
              error ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
            } rounded-xl text-base text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 transition-all`}
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 text-base"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить</span>
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">
          {error}
        </p>
      )}
    </form>
  );
};
