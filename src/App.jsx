import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InmobiliariaForm from './pages/inmobiliaria/agregarInmo.jsx';
import LotesList from './pages/inmobiliaria/lote/LotesList.jsx';
import MyMap from './pages/mapa/Map.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/agregar" element={<InmobiliariaForm />} />
        <Route path="/lotes/:idinmobilaria" element={<LotesList />} />
        <Route path="/" element={<MyMap />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
