import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './App.css';
const GUSTOS_POSIBLES = ["Oficinista", "Elegante", "Anime", "Moda urbana"];
function Tienda() {
    const { usuarioId } = useParams();
    const [gustosSeleccionados, setGustosSeleccionados] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchGustos = async () => {
            if (usuarioId) {
                const usuarioDoc = doc(db, 'usuarios', usuarioId);
                const usuarioSnapshot = await getDoc(usuarioDoc);
                if (usuarioSnapshot.exists()) {
                    const data = usuarioSnapshot.data();
                    console.log("Datos del usuario:", data);
                    setGustosSeleccionados(data.gustos || []);
                }
                else {
                    console.log("El documento no existe.");
                }
            }
        };
        fetchGustos();
    }, [usuarioId]);
    const handleCheckboxChange = (gusto) => {
        setGustosSeleccionados(prevState => prevState.includes(gusto)
            ? prevState.filter(item => item !== gusto)
            : [...prevState, gusto]);
    };
    const handleSave = async () => {
        if (usuarioId) {
            const usuarioDoc = doc(db, 'usuarios', usuarioId);
            await updateDoc(usuarioDoc, { gustos: gustosSeleccionados });
            navigate(`/productos/${usuarioId}`);
        }
    };
    return (_jsxs("div", { className: "content", children: [_jsxs("h2", { children: ["Preferencias de ", usuarioId] }), _jsxs("div", { className: "gustos-popup", children: [GUSTOS_POSIBLES.map(gusto => (_jsx("div", { children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: gustosSeleccionados.includes(gusto), onChange: () => handleCheckboxChange(gusto) }), gusto] }) }, gusto))), _jsx("button", { onClick: handleSave, children: "Cerrar pesta\u00F1a de gustos" })] }), _jsx(Link, { to: "/", children: _jsx("button", { className: "back-button", children: "Regresar" }) })] }));
}
export default Tienda;
