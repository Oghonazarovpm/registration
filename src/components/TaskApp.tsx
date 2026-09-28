import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  CheckSquare, 
  LogOut, 
  Info, 
  ClipboardList, 
  RotateCcw,
  CheckCircle2,
  Clock,
  Cloud,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Task, TaskFilter } from '../types/task';
// Демо-сервис (localStorage)
import { 
  getTasks as getDemoTasks, 
  addTask as addDemoTask, 
  toggleTaskCompletion as toggleDemoTask, 
  deleteTask as deleteDemoTask,
  resetDemoTasks
} from '../services/taskService';
// Supabase-сервис (база данных)
import { 
  fetchUserTasks, 
  createSupabaseTask, 
  updateSupabaseTaskStatus, 
  deleteSupabaseTask 
} from '../services/supabaseTaskService';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';

interface TaskAppProps {
  user: User | null;
  isDemo: boolean;
  onSignOut: () => void;
  onBackToAuth: () => void;
}

export const TaskApp: React.FC<TaskAppProps> = ({ 
  user, 
  isDemo, 
  onSignOut, 
  onBackToAuth 
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Защита от повторного нажатия и индикация для конкретных задач
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());
  const [deletingTaskIds, setDeletingTaskIds] = useState<Set<string>>(new Set());

  // Защита от результатов устаревших запросов (stale requests)
  const requestIdRef = useRef(0);

  // Загрузка задач при смене пользователя или режима
  useEffect(() => {
    // Немедленно очищаем список задач при смене пользователя или выходе
    setTasks([]);
    setErrorMessage(null);
    setLoading(true);

    const currentReqId = ++requestIdRef.current;

    const loadData = async () => {
      try {
        if (isDemo) {
          const demoData = await getDemoTasks();
          // Проверяем, не устарел ли запрос
          if (currentReqId === requestIdRef.current) {
            setTasks(demoData);
          }
        } else if (user) {
          const supabaseData = await fetchUserTasks();
          if (currentReqId === requestIdRef.current) {
            setTasks(supabaseData);
          }
        }
      } catch (err: unknown) {
        if (currentReqId === requestIdRef.current) {
          console.error('Ошибка загрузки задач:', err);
          const msg = err instanceof Error ? err.message : 'Не удалось загрузить задачи';
          setErrorMessage(msg);
        }
      } finally {
        if (currentReqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      // Инкрементируем при размонтировании
      requestIdRef.current++;
    };
  }, [user?.id, isDemo]);

  // Добавление новой задачи
  const handleAddTask = async (title: string) => {
    setErrorMessage(null);

    if (isDemo) {
      const created = await addDemoTask(title);
      setTasks((prev) => [created, ...prev]);
    } else {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }
      // Создание задачи в Supabase с title и user_id
      const created = await createSupabaseTask(title, user.id);
      // Показываем задачу только после успешного ответа Supabase
      setTasks((prev) => [created, ...prev]);
    }
  };

  // Переключение статуса выполнения задачи
  const handleToggleTask = async (id: string) => {
    if (updatingTaskIds.has(id)) return;

    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    setUpdatingTaskIds((prev) => new Set(prev).add(id));
    setErrorMessage(null);

    try {
      if (isDemo) {
        const updated = await toggleDemoTask(id);
        if (updated) {
          setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        }
      } else {
        const nextStatus = !target.is_completed;
        const updated = await updateSupabaseTaskStatus(id, nextStatus);
        // Обновляем состояние только после успешного ответа базы данных
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (err: unknown) {
      console.error('Ошибка обновления задачи:', err);
      const msg = err instanceof Error ? err.message : 'Не удалось обновить статус задачи';
      setErrorMessage(msg);
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Удаление задачи
  const handleDeleteTask = async (id: string) => {
    if (deletingTaskIds.has(id)) return;

    setDeletingTaskIds((prev) => new Set(prev).add(id));
    setErrorMessage(null);

    try {
      if (isDemo) {
        await deleteDemoTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        await deleteSupabaseTask(id);
        // Удаляем из списка только после подтверждения базы данных
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err: unknown) {
      console.error('Ошибка удаления задачи:', err);
      const msg = err instanceof Error ? err.message : 'Не удалось удалить задачу';
      setErrorMessage(msg);
    } finally {
      setDeletingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Сброс демонстрационных задач (только для режима Демо)
  const handleResetDemo = async () => {
    const demo = await resetDemoTasks();
    setTasks(demo);
  };

  // Счётчики задач
  const totalCount = tasks.length;
  const completedCount = useMemo(() => tasks.filter((t) => t.is_completed).length, [tasks]);
  const activeCount = useMemo(() => totalCount - completedCount, [totalCount, completedCount]);

  // Фильтры
  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.is_completed);
    if (filter === 'completed') return tasks.filter((t) => t.is_completed);
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Верхняя плашка режима */}
      {isDemo ? (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-amber-950 font-medium">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">Демо: данные хранятся только в этом браузере (localStorage)</span>
            </div>
            <button
              type="button"
              onClick={onBackToAuth}
              className="flex items-center gap-1.5 text-amber-900 hover:text-amber-950 font-semibold cursor-pointer underline decoration-amber-400 hover:decoration-amber-800 underline-offset-4 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>К экрану входа / регистрации</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-600 text-white px-4 py-2.5 shadow-xs">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2 truncate">
              <Cloud className="w-4 h-4 text-blue-200 shrink-0" />
              <span className="truncate">
                Подключено к Supabase: <span className="font-semibold">{user?.email}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-1.5 text-blue-100 hover:text-white cursor-pointer transition-colors bg-blue-700/60 hover:bg-blue-700 px-3 py-1 rounded-lg shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Заголовок */}
        <header className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Мои задачи
                </h1>
                {isDemo ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase tracking-wider">
                    Демо
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase tracking-wider">
                    Облако
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {isDemo 
                  ? 'Автономный режим без сохранения в облачной базе'
                  : 'Задачи синхронизируются с таблицей public.tasks в Supabase'}
              </p>
            </div>
          </div>
        </header>

        {/* Сообщение об ошибке (если есть) */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Форма добавления задачи */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Новая задача
          </h2>
          <TaskForm onAddTask={handleAddTask} />
        </section>

        {/* Счётчики задач и фильтры */}
        <section className="space-y-3">
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

          {/* Фильтры */}
          <div className="flex items-center justify-between gap-2 pt-1">
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

            {isDemo && totalCount === 0 && (
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
            <div className="flex flex-col items-center justify-center py-14 text-slate-400 text-sm gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Загрузка задач...</span>
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                isUpdating={updatingTaskIds.has(task.id)}
                isDeleting={deletingTaskIds.has(task.id)}
              />
            ))
          ) : (
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
                  ? 'Добавьте первую задачу в поле ввода выше, чтобы начать планирование.'
                  : filter === 'active'
                  ? 'Все задачи завершены! Отличный результат.'
                  : 'Вы ещё не выполнили ни одной задачи. Отметьте завершённые дела галочкой.'}
              </p>
              {isDemo && totalCount === 0 && (
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
