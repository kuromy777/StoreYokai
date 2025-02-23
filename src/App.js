import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Usuario from './Usuario';
import Administrador from './Administrador';
import Productos from './Productos';
import AdministrarUsuario from './AdministrarUsuario';
import Inventario from './Inventario';
function App() {
    return (_jsxs("div", { className: "app-container", children: [_jsx("video", { className: "background-video", autoPlay: true, loop: true, muted: true, children: _jsx("source", { src: "https://cdn.pixabay.com/video/2020/06/27/43238-435970498_tiny.mp4", type: "video/mp4" }) }), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/usuario", element: _jsx(Usuario, {}) }), _jsx(Route, { path: "/administrador", element: _jsx(Administrador, {}) }), _jsx(Route, { path: "/tienda/:usuarioId", element: _jsx(Productos, {}) }), _jsx(Route, { path: "/administrar/:usuarioId", element: _jsx(AdministrarUsuario, {}) }), _jsx(Route, { path: "/inventario", element: _jsx(Inventario, {}) })] })] }));
}
export default App;
