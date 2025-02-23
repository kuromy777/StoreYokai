import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './App.css';
function Administrador() {
    const [usuarios, setUsuarios] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUsuarios = async () => {
            const usuariosCollection = collection(db, 'usuarios');
            const usuariosSnapshot = await getDocs(usuariosCollection);
            const usuariosList = usuariosSnapshot.docs.map(doc => ({
                id: doc.id,
                nombre: doc.data().nombre,
                imagen: `https://ui-avatars.com/api/?name=${doc.data().nombre}&background=random` 
            }));
            setUsuarios(usuariosList);
        };
        fetchUsuarios();
    }, []);
    const handlePerfilClick = (usuarioId) => {
        navigate(`/administrar/${usuarioId}`);
    };
    const handleInventarioClick = () => {
        navigate('/inventario');
    };
    return (_jsxs("div", { className: "content", children: [_jsx("h2", { children: "Gesti\u00F3n de usuarios" }), _jsx("div", { className: "usuarios-grid", children: usuarios.map(usuario => (_jsxs("div", { className: "perfil", onClick: () => handlePerfilClick(usuario.id), children: [_jsx("img", { src: usuario.imagen, alt: usuario.nombre, className: "perfil-img" }), _jsx("h3", { children: usuario.nombre })] }, usuario.id))) }), _jsx("h2", { children: "Gestionar inventario" }), _jsx("button", { className: "inventory-button", onClick: handleInventarioClick, children: "Abrir inventario" }), _jsx(Link, { to: "/", children: _jsx("button", { className: "back-button", children: "Regresar" }) })] }));
}
export default Administrador
