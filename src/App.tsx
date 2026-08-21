import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { JurosCompostos } from './pages/JurosCompostos';
import { Rentabilidade } from './pages/Rentabilidade';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juros-compostos" element={<JurosCompostos />} />
        <Route path="/rentabilidade" element={<Rentabilidade />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
