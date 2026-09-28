/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { TaskApp } from './components/TaskApp';

type Screen = 'auth' | 'demo';

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');

  return (
    <>
      {screen === 'auth' ? (
        <AuthScreen onStartDemo={() => setScreen('demo')} />
      ) : (
        <TaskApp onBackToAuth={() => setScreen('auth')} />
      )}
    </>
  );
}
