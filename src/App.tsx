import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { JurosCompostos } from './pages/JurosCompostos';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juros-compostos" element={<JurosCompostos />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
