import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { JurosCompostos } from './pages/JurosCompostos';
import { Rentabilidade } from './pages/Rentabilidade';
import { Financiamento } from './pages/Financiamento';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juros-compostos" element={<JurosCompostos />} />
        <Route path="/rentabilidade" element={<Rentabilidade />} />
        <Route path="/financiamento" element={<Financiamento />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
