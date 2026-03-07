import { Routes, Route } from 'react-router-dom';
import { HomePage, SettingsPage, TestPage, ImageManagerPage } from './pages';
import { ThemeProvider } from './components';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/images" element={<ImageManagerPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
