import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* The other routes have been removed so React stops looking for them */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;