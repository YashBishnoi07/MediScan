import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DiagnosePage from './pages/DiagnosePage';
import ModelsPage from './pages/ModelsPage';
import AboutPage from './pages/AboutPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/diagnose" element={<DiagnosePage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
