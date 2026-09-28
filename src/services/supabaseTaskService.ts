import { getSupabaseClient } from '../lib/supabase';
import { Task } from '../types/task';

/**
 * Загрузка задач текущего пользователя из Supabase
 * Сортировка по created_at, новые сверху.
 */
export async function fetchUserTasks(): Promise<Task[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, is_completed, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch tasks error:', error);
    throw new Error(error.message || 'Не удалось загрузить задачи из Supabase');
  }

  return (data || []) as Task[];
}

/**
 * Создание задачи в таблице public.tasks
 * Передаёт title и user_id.
 */
export async function createSupabaseTask(title: string, userId: string): Promise<Task> {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error('Название задачи не может быть пустым');
  }
  if (trimmed.length > 200) {
    throw new Error('Длина задачи не должна превышать 200 символов');
  }
  if (!userId) {
    throw new Error('Пользователь не авторизован');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        title: trimmed,
        user_id: userId,
        is_completed: false,
      },
    ])
    .select('id, user_id, title, is_completed, created_at')
    .single();

  if (error) {
    console.error('Supabase create task error:', error);
    throw new Error(error.message || 'Ошибка при сохранении задачи в Supabase');
  }

  return data as Task;
}

/**
 * Обновление статуса выполнения задачи в Supabase
 */
export async function updateSupabaseTaskStatus(
  taskId: string,
  isCompleted: boolean
): Promise<Task> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId)
    .select('id, user_id, title, is_completed, created_at')
    .single();

  if (error) {
    console.error('Supabase update task error:', error);
    throw new Error(error.message || 'Ошибка при обновлении задачи в Supabase');
  }

  return data as Task;
}

/**
 * Удаление задачи из Supabase
 */
export async function deleteSupabaseTask(taskId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Supabase delete task error:', error);
    throw new Error(error.message || 'Ошибка при удалении задачи из Supabase');
  }
}
