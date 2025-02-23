import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import './App.css';
function AdministrarUsuario() {
    const { usuarioId } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [productos, setProductos] = useState([]);
    const [selectedProductos, setSelectedProductos] = useState({});
    const [showRecomendacionesPopup, setShowRecomendacionesPopup] = useState(false);
    const [editEstado, setEditEstado] = useState({});
    const [estadoValues, setEstadoValues] = useState({});
    const [showNotificacionesPopup, setShowNotificacionesPopup] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [newNotificacion, setNewNotificacion] = useState('');
    useEffect(() => {
        const fetchUsuario = async () => {
            if (usuarioId) {
                const usuarioDoc = doc(db, 'usuarios', usuarioId);
                const usuarioSnapshot = await getDoc(usuarioDoc);
                if (usuarioSnapshot.exists()) {
                    const data = usuarioSnapshot.data();
                    setUsuario(data);
                    const selected = data.recomendaciones.reduce((acc, nombre) => {
                        acc[nombre] = true;
                        return acc;
                    }, {});
                    setSelectedProductos(selected);
                    const estadoMap = {};
                    data.compras?.forEach((compra, index) => {
                        estadoMap[index] = compra.estado || 'Compra confirmada';
                    });
                    setEstadoValues(estadoMap);
                    setNotificaciones(data.notificaciones || []);
                }
            }
        };
        fetchUsuario();
    }, [usuarioId]);
    useEffect(() => {
        const fetchProductos = async () => {
            if (usuario && usuario.gustos.length > 0) {
                const productosList = [];
                for (const gusto of usuario.gustos) {
                    const productosDoc = doc(db, 'productos', gusto);
                    const productosSnapshot = await getDoc(productosDoc);
                    if (productosSnapshot.exists()) {
                        const data = productosSnapshot.data();
                        for (const key in data) {
                            if (data.hasOwnProperty(key) && data[key].stock > 0) {
                                const producto = data[key];
                                productosList.push({
                                    id: key,
                                    nombre: producto.nombre,
                                    descripcion: producto.descripcion,
                                    imagen: producto.imagen,
                                    precio: producto.precio,
                                    tipo: producto.tipo,
                                    stock: producto.stock
                                });
                            }
                        }
                    }
                }
                setProductos(productosList);
            }
        };
        if (usuario) {
            fetchProductos();
        }
    }, [usuario]);
    const handleRecomendacionChange = (nombre) => {
        setSelectedProductos(prev => ({ ...prev, [nombre]: !prev[nombre] }));
    };
    const handleGuardarRecomendaciones = async () => {
        if (usuarioId && usuario) {
            const recomendaciones = Object.keys(selectedProductos).filter(nombre => selectedProductos[nombre]);
            const usuarioDoc = doc(db, 'usuarios', usuarioId);
            await updateDoc(usuarioDoc, { recomendaciones });
            alert('Recomendaciones guardadas.');
            setShowRecomendacionesPopup(false);
        }
    };
    const handleEstadoChange = (index, value) => {
        setEstadoValues(prev => ({ ...prev, [index]: value }));
    };
    const handleSaveEstado = async (index) => {
        if (usuarioId && usuario) {
            const newEstado = estadoValues[index];
            const updatedCompras = usuario.compras?.map((compra, i) => {
                if (i === index) {
                    return { ...compra, estado: newEstado };
                }
                return compra;
            });
            const usuarioDoc = doc(db, 'usuarios', usuarioId);
            await updateDoc(usuarioDoc, { compras: updatedCompras });
            setEditEstado(prev => ({ ...prev, [index]: false }));
        }
    };
    const handleGuardarNotificacion = async () => {
        if (usuarioId && newNotificacion) {
            const notificacion = {
                mensaje: newNotificacion,
                fecha: Timestamp.now(),
            };
            const usuarioDoc = doc(db, 'usuarios', usuarioId);
            await updateDoc(usuarioDoc, {
                notificaciones: arrayUnion(notificacion),
            });
            setNotificaciones((prev) => [...prev, notificacion]);
            setNewNotificacion('');
            alert('Notificación enviada.');
        }
    };
    return (_jsxs("div", { className: `content scroll-container ${showRecomendacionesPopup || showNotificacionesPopup ? 'blurred' : ''}`, children: [_jsxs("h2", { children: ["Usuario: ", usuario?.nombre] }), _jsx("h2", { children: "Compras realizadas" }), usuario ? (_jsxs("div", { children: [usuario.compras && usuario.compras.length > 0 ? (_jsxs("table", { className: "usuario-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nombre del Producto" }), _jsx("th", { children: "Cantidad" }), _jsx("th", { children: "Direcci\u00F3n" }), _jsx("th", { children: "Fecha de Compra" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Estado" })] }) }), _jsx("tbody", { children: usuario.compras.map((compra, index) => (_jsxs("tr", { children: [_jsx("td", { children: compra.nombre_producto }), _jsx("td", { children: compra.cantidad }), _jsx("td", { children: compra.direccion }), _jsx("td", { children: new Date(compra.fecha_compra.seconds * 1000).toLocaleString() }), _jsxs("td", { children: ["$", compra.total] }), _jsx("td", { children: editEstado[index] ? (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", value: estadoValues[index], onChange: e => handleEstadoChange(index, e.target.value) }), _jsx("button", { onClick: () => handleSaveEstado(index), children: "Guardar" })] })) : (_jsxs(_Fragment, { children: [compra.estado || 'Compra confirmada', _jsx("button", { style: { backgroundColor: "transparent", borderColor: "transparent" }, onClick: () => setEditEstado(prev => ({ ...prev, [index]: true })), children: _jsx("img", { className: 'edit-icon', src: "https://cdn-icons-png.freepik.com/512/8280/8280556.png", alt: "Edit" }) })] })) })] }, index))) })] })) : (_jsx("p", { children: "Este usuario a\u00FAn no ha realizado compras." })), _jsx("h3", { children: "Preferencias" }), usuario.gustos.length > 0 ? (_jsx("ul", { className: "usuario-gustos", children: usuario.gustos.map((gusto, index) => (_jsx("li", { children: gusto }, index))) })) : (_jsx("p", { children: "Este usuario a\u00FAn no ha seleccionado sus gustos." })), _jsx("button", { className: "blue-button", onClick: () => setShowRecomendacionesPopup(true), children: "Recomendaci\u00F3n" }), _jsx("button", { className: "blue-button", onClick: () => setShowNotificacionesPopup(true), children: "Enviar notificaci\u00F3n" }), showRecomendacionesPopup && createPortal(_jsx("div", { className: "recomendaciones-popup-overlay", children: _jsxs("div", { className: "recomendaciones-popup", children: [_jsx("h4", { children: "Selecciona productos para recomendar" }), productos.map(producto => (_jsx("div", { children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: selectedProductos[producto.nombre] || false, onChange: () => handleRecomendacionChange(producto.nombre) }), producto.nombre] }) }, producto.id))), _jsx("button", { className: "save-button", onClick: handleGuardarRecomendaciones, children: "Guardar" }), _jsx("button", { className: "close-button", onClick: () => setShowRecomendacionesPopup(false), children: "Cerrar" })] }) }), document.body), showNotificacionesPopup && createPortal(_jsx("div", { className: "notificaciones-popup-overlay", children: _jsxs("div", { className: "notificaciones-popup", children: [_jsxs("h4", { children: ["Notificaciones del usuario ", usuario?.nombre] }), _jsx("textarea", { style: { width: "100%" }, value: newNotificacion, onChange: (e) => setNewNotificacion(e.target.value), placeholder: "Escribe la notificaci\u00F3n aqu\u00ED..." }), _jsx("button", { className: "save-button", onClick: handleGuardarNotificacion, children: "Enviar" }), _jsx("button", { className: "close-button", onClick: () => setShowNotificacionesPopup(false), children: "Cerrar" }), _jsx("h4", { children: "Notificaciones existentes" }), notificaciones.length > 0 ? (_jsx("ul", { children: notificaciones.map((notificacion, index) => (_jsxs("li", { children: [notificacion.mensaje, " - ", new Date(notificacion.fecha.seconds * 1000).toLocaleString()] }, index))) })) : (_jsx("p", { children: "No se encontraron notificaciones." }))] }) }), document.body)] })) : (_jsx("p", { children: "Cargando datos del usuario..." })), _jsx(Link, { to: "/administrador", children: _jsx("button", { className: "back-button", children: "Regresar" }) })] }));
}
export default AdministrarUsuario;
