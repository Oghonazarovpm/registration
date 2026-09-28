import { createClient } from '@supabase/supabase-js';

// Удаляем старый ключ из localStorage, если он был сохранён в предыдущей версии
try {
  localStorage.removeItem('supabase_custom_publishable_key');
} catch {
  // игнорируем ошибки доступа в приватном режиме
}

// Получаем переменные окружения напрямую через import.meta.env
const supabaseUrl: string =
  import.meta.env.VITE_SUPABASE_URL || 'https://qhoylszqcgknqxdcxjly.supabase.co';

const supabasePublishableKey: string =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Инициализация официального клиента Supabase.
 * Поддерживает как современный Publishable key (sb_publishable_...),
 * так и стандартный anon key.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getSupabaseClient = () => supabase;
