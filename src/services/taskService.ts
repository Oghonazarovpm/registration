/**
 * taskService.ts
 * 
 * Сервисный слой для работы с задачами.
 * Сейчас данные сохраняются в localStorage браузера.
 * На следующем шаге функции внутри этого файла будут заменены на запросы к Supabase:
 *   - supabase.from('tasks').select('*')
 *   - supabase.from('tasks').insert([...])
 *   - supabase.from('tasks').update({ is_completed: ... }).eq('id', ...)
 *   - supabase.from('tasks').delete().eq('id', ...)
 */

import { Task } from '../types/task';

const STORAGE_KEY = 'my_tasks_demo_data_v1';

// Начальные демонстрационные задачи для первого входа
const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'Ознакомиться с интерфейсом приложения «Мои задачи»',
    is_completed: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Отметить эту задачу как выполненную',
    is_completed: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Добавить свою первую задачу через поле ввода выше',
    is_completed: false,
    created_at: new Date().toISOString(),
  },
];

/**
 * Чтение всех задач из хранилища
 */
export async function getTasks(): Promise<Task[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Инициализируем хранилище стартовыми задачами
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    }
    return JSON.parse(raw) as Task[];
  } catch (error) {
    console.error('Ошибка чтения задач из localStorage:', error);
    return INITIAL_DEMO_TASKS;
  }
}

/**
 * Добавление новой задачи
 */
export async function addTask(title: string): Promise<Task> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error('Название задачи не может быть пустым');
  }

  const tasks = await getTasks();
  const newTask: Task = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: trimmedTitle,
    is_completed: false,
    created_at: new Date().toISOString(),
  };

  const updatedTasks = [newTask, ...tasks];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
  return newTask;
}

/**
 * Переключение статуса выполнения задачи
 */
export async function toggleTaskCompletion(id: string): Promise<Task | null> {
  const tasks = await getTasks();
  let updatedTask: Task | null = null;

  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {
      updatedTask = { ...task, is_completed: !task.is_completed };
      return updatedTask;
    }
    return task;
  });

  if (updatedTask) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
  }
  return updatedTask;
}

/**
 * Удаление задачи по ID
 */
export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter((task) => task.id !== id);
  const wasRemoved = filtered.length !== tasks.length;
  if (wasRemoved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
  return wasRemoved;
}

/**
 * Сброс к демонстрационным данным (при необходимости очистки)
 */
export async function resetDemoTasks(): Promise<Task[]> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
  return INITIAL_DEMO_TASKS;
}
