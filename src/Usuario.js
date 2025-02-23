import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import './App.css';
function Usuario() {
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const usuariosCollection = collection(db, 'usuarios');
                const usuariosSnapshot = await getDocs(usuariosCollection);
                const usuariosList = usuariosSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        nombre: data.nombre,
                        gustos: data.gustos || []
                    };
                });
                setUsuarios(usuariosList);
            }
            catch (error) {
                console.error("Error fetching usuarios: ", error);
            }
        };
        fetchUsuarios();
    }, []);
    const handlePerfilClick = async (usuarioId) => {
        const usuarioDoc = doc(db, 'usuarios', usuarioId);
        const usuarioSnapshot = await getDoc(usuarioDoc);
        if (usuarioSnapshot.exists()) {
            const data = usuarioSnapshot.data();
            setSelectedUsuario({
                id: usuarioId,
                nombre: data.nombre,
                gustos: data.gustos || []
            });
        }
    };
    const handleGustoChange = async (gusto, checked) => {
        if (selectedUsuario) {
            const updatedGustos = checked
                ? [...selectedUsuario.gustos, gusto]
                : selectedUsuario.gustos.filter(g => g !== gusto);
            setSelectedUsuario({ ...selectedUsuario, gustos: updatedGustos });
            const usuarioDoc = doc(db, 'usuarios', selectedUsuario.id);
            await updateDoc(usuarioDoc, { gustos: updatedGustos });
        }
    };
    const handleContinuar = () => {
        if (selectedUsuario) {
            navigate(`/tienda/${selectedUsuario.id}`);
        }
    };
    return (_jsxs("div", { className: "content", children: [_jsx("h2", { children: "\u00BFQui\u00E9n est\u00E1 comprando ahora?" }), _jsx("div", { className: "usuarios-grid", children: usuarios.length > 0 ? (usuarios.map(usuario => (_jsxs("div", { className: "perfil", onClick: () => handlePerfilClick(usuario.id), children: [_jsx("img", { src: `https://ui-avatars.com/api/?name=${usuario.nombre}&background=random`, alt: usuario.nombre, className: "perfil-img" }), _jsx("p", { children: usuario.nombre })] }, usuario.id)))) : (_jsx("p", { children: "No hay usuarios disponibles." })) }), selectedUsuario && (_jsxs("div", { className: "gustos-popup", children: [_jsxs("h3", { children: ["Selecciona preferencias ", selectedUsuario.nombre] }), _jsx("ul", { children: ['Anime', 'Moda urbana', 'Elegante', 'Oficinista'].map((gusto, index) => (_jsx("li", { children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: selectedUsuario.gustos.includes(gusto), onChange: (e) => handleGustoChange(gusto, e.target.checked) }), gusto] }) }, index))) }), _jsx("button", { className: "blue-button", onClick: handleContinuar, children: "Continuar" })] })), _jsx(Link, { to: "/", children: _jsx("button", { className: "back-button", children: "Regresar" }) })] }));
}
export default Usuario;
