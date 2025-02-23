import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import './App.css';
function Home() {
    return (_jsxs("div", { className: "content", children: [_jsx("h1", { children: "LootBox Clothing" }), _jsxs("div", { className: "home-buttons", children: [_jsx("h1", { children: "Iniciar Sesi\u00F3n como:" }), _jsx(Link, { to: "/usuario", children: _jsx("button", { className: "blue-button", children: "Usuario" }) }), _jsx(Link, { to: "/administrador", children: _jsx("button", { className: "blue-button", children: "Administrador" }) })] })] }));
}
export default Home;
