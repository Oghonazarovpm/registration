import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(task.created_at);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }, [task.created_at]);

  return (
    <div
      className={`group flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-xl border transition-all ${
        task.is_completed
          ? 'border-slate-200 bg-slate-50/60 text-slate-400'
          : 'border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Кнопка отметки выполнения */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.is_completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          className={`w-7 h-7 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
            task.is_completed
              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
              : 'border-slate-300 hover:border-blue-500 bg-white text-transparent hover:text-slate-300'
          }`}
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Текст задачи */}
        <div className="min-w-0 flex-1 pr-2">
          <p
            className={`text-base leading-snug break-words transition-all ${
              task.is_completed
                ? 'line-through text-slate-400'
                : 'text-slate-800 font-normal'
            }`}
          >
            {task.title}
          </p>
          {formattedDate && (
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {formattedDate}
            </span>
          )}
        </div>
      </div>

      {/* Кнопка удаления */}
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label="Удалить задачу"
        className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer shrink-0"
        title="Удалить задачу"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
