import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/lightswind/Toast';
import { EntryPage } from './pages/EntryPage';
import { ConsolePage } from './pages/ConsolePage';
import { CitizenStubPage } from './pages/CitizenStubPage';

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/console" element={<ConsolePage />} />
          <Route path="/citizen" element={<CitizenStubPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
