import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, 
  LogOut, 
  Info, 
  ClipboardList, 
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Task, TaskFilter } from '../types/task';
import { 
  getTasks, 
  addTask as apiAddTask, 
  toggleTaskCompletion as apiToggleTask, 
  deleteTask as apiDeleteTask,
  resetDemoTasks
} from '../services/taskService';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';

interface TaskAppProps {
  onBackToAuth: () => void;
}

export const TaskApp: React.FC<TaskAppProps> = ({ onBackToAuth }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [loading, setLoading] = useState(true);

  // Первоначальная загрузка задач из сервиса
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        console.error('Ошибка загрузки задач:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // Добавление задачи
  const handleAddTask = async (title: string) => {
    try {
      const created = await apiAddTask(title);
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Ошибка добавления задачи:', err);
      throw err;
    }
  };

  // Переключение статуса выполнения
  const handleToggleTask = async (id: string) => {
    // Оптимистичное обновление UI
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t))
    );
    try {
      await apiToggleTask(id);
    } catch (err) {
      console.error('Ошибка обновления задачи:', err);
      // Возвращаем актуальное состояние при ошибке
      const data = await getTasks();
      setTasks(data);
    }
  };

  // Удаление задачи
  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiDeleteTask(id);
    } catch (err) {
      console.error('Ошибка удаления задачи:', err);
      const data = await getTasks();
      setTasks(data);
    }
  };

  // Восстановление демо-задач
  const handleResetDemo = async () => {
    const demo = await resetDemoTasks();
    setTasks(demo);
  };

  // Счётчики задач
  const totalCount = tasks.length;
  const completedCount = useMemo(() => tasks.filter((t) => t.is_completed).length, [tasks]);
  const activeCount = useMemo(() => totalCount - completedCount, [totalCount, completedCount]);

  // Фильтрация для отображения
  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.is_completed);
    if (filter === 'completed') return tasks.filter((t) => t.is_completed);
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Верхняя панель / Заметная плашка демо-режима */}
      <div className="bg-blue-50 border-b border-blue-200/80 px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-blue-950 font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Демо: данные хранятся только в этом браузере</span>
          </div>
          <button
            type="button"
            onClick={onBackToAuth}
            className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold cursor-pointer underline decoration-blue-300 hover:decoration-blue-700 underline-offset-4 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>К экрану входа / регистрации</span>
          </button>
        </div>
      </div>

      {/* Основной контейнер */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Заголовок страницы */}
        <header className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Мои задачи
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Управление текущими делами и планами
              </p>
            </div>
          </div>
        </header>

        {/* Форма добавления задачи */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Новая задача
          </h2>
          <TaskForm onAddTask={handleAddTask} />
        </section>

        {/* Счётчики задач и фильтры */}
        <section className="space-y-3">
          {/* Счётчики активных и выполненных */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Активные задачи</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeCount}
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Выполненные</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {completedCount}
                </div>
              </div>
            </div>
          </div>

          {/* Фильтры вкладок */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center bg-slate-200/60 p-1 rounded-xl text-xs sm:text-sm font-medium">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'active'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Активные ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Выполненные ({completedCount})
              </button>
            </div>

            {totalCount === 0 && (
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                title="Восстановить стартовые задачи"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Восстановить примеры</span>
              </button>
            )}
          </div>
        </section>

        {/* Список задач */}
        <section className="space-y-2.5">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Загрузка задач...
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            /* Понятное пустое состояние списка */
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                {filter === 'all'
                  ? 'Список задач пуст'
                  : filter === 'active'
                  ? 'Нет активных задач'
                  : 'Нет выполненных задач'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {filter === 'all'
                  ? 'Добавьте первую задачу в поле ввода выше, чтобы спланировать свой день.'
                  : filter === 'active'
                  ? 'Все задачи завершены! Отличная работа.'
                  : 'Вы ещё не выполнили ни одной задачи. Отметьте завершённые дела галочкой.'}
              </p>
              {totalCount === 0 && (
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Загрузить примеры задач</span>
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
