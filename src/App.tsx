import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Usuario from './Usuario';
import Administrador from './Administrador';
import Productos from './Productos';
import AdministrarUsuario from './AdministrarUsuario';
import Inventario from './Inventario';

function App() {
  return (
    <div className="app-container">
      <video className="background-video" autoPlay loop muted>
        <source src="https://cdn.pixabay.com/video/2020/06/27/43238-435970498_tiny.mp4" type="video/mp4" />
      </video>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/administrador" element={<Administrador />} />
        <Route path="/tienda/:usuarioId" element={<Productos />} />
        <Route path="/administrar/:usuarioId" element={<AdministrarUsuario />} />
        <Route path="/inventario" element={<Inventario />} />
      </Routes>
    </div>
  );
}

export default App;