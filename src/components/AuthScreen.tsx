import React, { useState } from 'react';
import { 
  CheckSquare, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';

interface AuthScreenProps {
  onStartDemo: () => void;
  onLoginSuccess?: () => void;
}

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onStartDemo }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);
    setSuccessNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Пожалуйста, введите адрес электронной почты');
      return;
    }
    if (!password) {
      setErrorMessage('Пожалуйста, введите пароль');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Пароль должен содержать минимум 6 символов');
      return;
    }

    const supabase = getSupabaseClient();
    setIsLoading(true);

    try {
      if (mode === 'register') {
        // Регистрация через supabase.auth.signUp с emailRedirectTo
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            emailRedirectTo: 'https://registration.oghonazarovkh.workers.dev/',
          },
        });

        // Не сохраняем пароль пользователя самостоятельно
        setPassword('');

        if (error) {
          throw error;
        }

        // Если после регистрации сессии нет, показываем сообщение о подтверждении
        if (!data.session) {
          setSuccessNotice('Проверьте почту и подтвердите регистрацию');
          setMode('login');
        }
      } else {
        // Вход через supabase.auth.signInWithPassword
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        // Не сохраняем пароль пользователя самостоятельно
        setPassword('');

        if (error) {
          throw error;
        }
      }
    } catch (err: unknown) {
      setPassword('');
      console.error('Ошибка авторизации Supabase:', err);

      let msg = 'Произошла ошибка при выполнении запроса';
      if (err instanceof Error) {
        if (err.message.includes('Invalid API key')) {
          msg = 'Недействительный или неполный API ключ Supabase (Invalid API key). Проверьте VITE_SUPABASE_PUBLISHABLE_KEY в переменных окружения.';
        } else if (err.message.includes('Invalid login credentials')) {
          msg = 'Неверный адрес электронной почты или пароль';
        } else if (err.message.includes('User already registered')) {
          msg = 'Пользователь с таким email уже зарегистрирован. Переключитесь на вкладку «Вход».';
        } else if (err.message.includes('Email not confirmed')) {
          msg = 'Электронная почта ещё не подтверждена. Проверьте почту и перейдите по ссылке активации.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          msg = 'Не удалось связаться с сервером Supabase. Проверьте подключение к сети.';
        } else {
          msg = err.message;
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      {/* Логотип и заголовок */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Мои задачи
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Облачное хранилище задач с базой данных Supabase
        </p>
      </div>

      {/* Основная карточка */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Переключатель Вход / Регистрация */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Регистрация
          </button>
        </div>

        <div className="p-6">
          {/* Сообщение об успешной регистрации с ожиданием подтверждения почты */}
          {successNotice && (
            <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3 text-xs leading-relaxed">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm text-blue-950 mb-1">
                  {successNotice}
                </span>
                Мы отправили ссылку для подтверждения на указанную электронную почту. После подтверждения войдите в систему.
              </div>
            </div>
          )}

          {/* Сообщение об ошибке */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Форма авторизации */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Электронная почта
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              {mode === 'register' && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Не менее 6 символов. Подтверждение будет направлено на Cloudflare Worker.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Подождите...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Войти в аккаунт' : 'Зарегистрироваться'}</span>
              )}
            </button>
          </form>

          {/* Разделитель */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-xs font-medium text-slate-400 uppercase tracking-wider">
              или
            </span>
          </div>

          {/* Главная кнопка быстрого входа в демо */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={onStartDemo}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-base rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer group border border-slate-200"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Попробовать демо</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-500" />
            </button>
            <p className="text-center text-xs text-slate-500">
              Локальное хранилище браузера без подключения к Supabase
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-200/80 text-center text-[11px] text-slate-400">
          Supabase Auth · Таблица public.tasks
        </div>
      </div>

      {/* Футер */}
      <div className="w-full max-w-md text-center mt-6">
        <p className="text-xs text-slate-400">
          Проект: <code className="text-slate-600">qhoylszqcgknqxdcxjly.supabase.co</code>
        </p>
      </div>
    </div>
  );
};
