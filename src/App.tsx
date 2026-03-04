import { Routes, Route } from 'react-router-dom';
import { HomePage, SettingsPage, TestPage } from './pages';
import { ThemeProvider } from './components';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
