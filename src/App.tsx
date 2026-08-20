import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { JurosCompostos } from './pages/JurosCompostos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juros-compostos" element={<JurosCompostos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
