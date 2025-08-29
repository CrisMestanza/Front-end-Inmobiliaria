import { BrowserRouter, Routes, Route } from "react-router-dom";
import InmobiliariaForm from "./pages/inmobiliaria/agregarInmo.jsx";
import LotesList from "./pages/inmobiliaria/lote/LotesList.jsx";
import ProyectoList from "./pages/inmobiliaria/proyecto/ProyectoList.jsx";
import MyMap from "./pages/mapa/Map.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/agregar" element={<InmobiliariaForm />} />
        <Route path="/lotes/:idproyecto" element={<LotesList />} />
        <Route path="/proyectos/:idinmobilaria" element={<ProyectoList />} />
        <Route path="/" element={<MyMap />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
