import React, { useState } from 'react';
import { CheckSquare, ArrowRight, ShieldAlert, Sparkles, User, Lock, Mail } from 'lucide-react';

interface AuthScreenProps {
  onStartDemo: () => void;
}

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onStartDemo }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // По требованию: не сохраняем пароли и не имитируем настоящую регистрацию/вход
    setPassword('');
    setInfoMessage(
      'Подключим Supabase на следующем шаге. Воспользуйтесь кнопкой «Попробовать демо» ниже!'
    );
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
          Учебное веб-приложение для управления делами
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
              setInfoMessage(null);
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
              setInfoMessage(null);
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
          {/* Уведомление о следующем этапе (Supabase) */}
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-950">
                Подключим Supabase на следующем шаге
              </span>
              Регистрация и облачная авторизация появятся на втором этапе проекта. Сейчас вы можете протестировать весь функционал задач в демо-режиме.
            </div>
          </div>

          {/* Форма авторизации */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {infoMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-medium leading-relaxed">
                {infoMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer border border-slate-300/80"
            >
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
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
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 text-blue-200" />
              <span>Попробовать демо</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-xs text-slate-500">
              Мгновенный вход без регистрации · Данные в вашем браузере
            </p>
          </div>
        </div>
      </div>

      {/* Футер с пояснением */}
      <div className="w-full max-w-md text-center mt-6">
        <p className="text-xs text-slate-400">
          Учебный проект «Мои задачи» · Демонстрационная версия
        </p>
      </div>
    </div>
  );
};
