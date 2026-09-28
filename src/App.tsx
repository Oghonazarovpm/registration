/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { getSupabaseClient } from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { TaskApp } from './components/TaskApp';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // 1. Восстановление существующей сессии после перезагрузки страницы
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.error('Ошибка проверки сессии Supabase:', err);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });

    // 2. Обработка изменений статуса авторизации в реальном времени
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // При успешном входе отключаем демо-режим
        setIsDemo(false);
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsDemo(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Выход из аккаунта
  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Ошибка при выходе из Supabase:', err);
    } finally {
      setUser(null);
      setIsDemo(false);
    }
  };

  // Экран ожидания первичной проверки сессии
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Загрузка приложения...</p>
      </div>
    );
  }

  // Если пользователь авторизован через Supabase
  if (user) {
    return (
      <TaskApp
        user={user}
        isDemo={false}
        onSignOut={handleSignOut}
        onBackToAuth={handleSignOut}
      />
    );
  }

  // Если включен режим «Демо»
  if (isDemo) {
    return (
      <TaskApp
        user={null}
        isDemo={true}
        onSignOut={() => setIsDemo(false)}
        onBackToAuth={() => setIsDemo(false)}
      />
    );
  }

  // Экран входа и регистрации
  return <AuthScreen onStartDemo={() => setIsDemo(true)} />;
}
