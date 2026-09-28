import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface TaskFormProps {
  onAddTask: (title: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = title.trim();
  const charCount = title.length;
  const isOverLimit = charCount > 200;
  const isBusy = isLoading || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;

    if (!trimmed) {
      setError('Введите текст задачи');
      return;
    }

    if (trimmed.length > 200) {
      setError('Длина задачи не должна превышать 200 символов');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await onAddTask(trimmed);
      // Очищаем поле только после успешного ответа
      setTitle('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось сохранить задачу в Supabase');
      }
    } finally {
      setIsSubmitting(false);
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
            maxLength={200}
            disabled={isBusy}
            className={`w-full px-4 py-3 bg-white border ${
              error || isOverLimit
                ? 'border-red-400 focus:ring-red-400/20'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
            } rounded-xl text-base text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 transition-all disabled:bg-slate-50 disabled:text-slate-500`}
          />

          {/* Счётчик символов */}
          <div className="absolute right-3 top-3 text-[11px] text-slate-400 pointer-events-none">
            <span className={charCount > 180 ? (isOverLimit ? 'text-red-500 font-bold' : 'text-amber-500 font-medium') : ''}>
              {charCount}
            </span>
            /200
          </div>
        </div>

        <button
          type="submit"
          disabled={!trimmed || isOverLimit || isBusy}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 text-base"
        >
          {isBusy ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Сохранение...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Добавить</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 font-medium ml-1 flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </form>
  );
};
