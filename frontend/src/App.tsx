import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/lightswind/Toast';
import { LangProvider } from './i18n/useLang';
import { ThemeProvider } from './context/ThemeContext';
import { ScenarioProvider } from './context/ScenarioContext';
import { EntryPage } from './pages/EntryPage';
import { ConsolePage } from './pages/ConsolePage';
import { CitizenPage } from './pages/CitizenPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LangProvider>
          <ScenarioProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<EntryPage />} />
                <Route path="/console" element={<ConsolePage />} />
                <Route path="/citizen" element={<CitizenPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ScenarioProvider>
        </LangProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
