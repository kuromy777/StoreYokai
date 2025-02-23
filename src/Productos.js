import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp, onSnapshot } from 'firebase/firestore';
import './App.css';
function Productos() {
    const { usuarioId } = useParams();
    const [productos, setProductos] = useState([]);
    const [gustos, setGustos] = useState([]);
    const [recomendaciones, setRecomendaciones] = useState([]);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [direccion, setDireccion] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');
    const [compras, setCompras] = useState([]);
    const [showCompras, setShowCompras] = useState(false);
    const [showNotificaciones, setShowNotificaciones] = useState(false);
    const [lastPurchase, setLastPurchase] = useState(null);
    const [suggestedProduct, setSuggestedProduct] = useState(null);
    const [lastNotificationDate, setLastNotificationDate] = useState(null);
    const [newNotification, setNewNotification] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    useEffect(() => {
        fetchUserData();
        if (usuarioId) {
            const usuarioDoc = doc(db, 'usuarios', usuarioId);
            const unsubscribe = onSnapshot(usuarioDoc, (doc) => {
                const data = doc.data();
                if (data) {
                    setNotificaciones(data.notificaciones || []);
                    checkForNewNotifications(data.notificaciones, data.lastNotificationDate || null);
                }
            });
            return () => unsubscribe();
        }
    }, [usuarioId]);
    useEffect(() => {
        if (gustos.length > 0) {
            fetchProductos();
        }
    }, [gustos]);
    useEffect(() => {
        if (selectedProducto) {
            setTotal(selectedProducto.precio * cantidad);
        }
    }, [selectedProducto, cantidad]);
    useEffect(() => {
        if (lastPurchase) {
            fetchSuggestedProduct();
        }
    }, [lastPurchase, gustos]);
    const fetchUserData = async () => {
        if (usuarioId) {
            const usuarioDoc = doc(db, 'usuarios', usuarioId);
            const usuarioSnapshot = await getDoc(usuarioDoc);
            if (usuarioSnapshot.exists()) {
                const data = usuarioSnapshot.data();
                setGustos(data.gustos || []);
                setRecomendaciones(data.recomendaciones || []);
                setCompras(data.compras || []);
                setNotificaciones(data.notificaciones || []);
                setLastNotificationDate(data.lastNotificationDate || null);
                if (data.compras && data.compras.length > 0) {
                    setLastPurchase(data.compras[data.compras.length - 1]);
                }
                checkForNewNotifications(data.notificaciones || [], data.lastNotificationDate || null);
            }
        }
    };
    const fetchProductos = async () => {
        const productosList = [];
        for (const gusto of gustos) {
            const productosDoc = doc(db, 'productos', gusto);
            const productosSnapshot = await getDoc(productosDoc);
            if (productosSnapshot.exists()) {
                const data = productosSnapshot.data();
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
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
    };
    const fetchSuggestedProduct = async () => {
        const productosList = [];
        for (const gusto of gustos) {
            const productosDoc = doc(db, 'productos', gusto);
            const productosSnapshot = await getDoc(productosDoc);
            if (productosSnapshot.exists()) {
                const data = productosSnapshot.data();
                for (const key in data) {
                    if (data.hasOwnProperty(key) && lastPurchase && data[key].id !== lastPurchase.id_producto) {
                        productosList.push(data[key]);
                    }
                }
            }
        }
       
        const getRandomProduct = (products) => {
            const filteredProducts = products.filter(producto => lastPurchase && producto.tipo === lastPurchase.tipo && producto.id !== lastPurchase.id_producto);
            return filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
        };
        const suggested = getRandomProduct(productosList);
        setSuggestedProduct(suggested || null);
    };
    const handleComprar = (producto) => {
        setSelectedProducto(producto);
        setTotal(producto.precio);
    };
    const handleConfirmarCompra = async () => {
        if (!direccion) {
            setError('La dirección no puede estar vacía.');
            return;
        }
        if (cantidad <= 0) {
            setError('La cantidad debe ser mayor a 0.');
            return;
        }
        if (selectedProducto && cantidad > selectedProducto.stock) {
            setError('La cantidad no puede ser mayor al stock disponible.');
            return;
        }
        if (usuarioId && selectedProducto) {
            const compra = {
                id_producto: selectedProducto.id,
                nombre_producto: selectedProducto.nombre,
                direccion,
                cantidad,
                total,
                fecha_compra: Timestamp.now(),
                estado: 'Compra confirmada'
            };
            const usuarioDoc = doc(db, 'usuarios', usuarioId);
            await updateDoc(usuarioDoc, {
                compras: arrayUnion(compra)
            });
            const productoDoc = doc(db, 'productos', selectedProducto.tipo);
            const productoSnapshot = await getDoc(productoDoc);
            if (productoSnapshot.exists()) {
                const data = productoSnapshot.data();
                data[selectedProducto.id].stock -= cantidad;
                await updateDoc(productoDoc, data);
            }
            alert('Pedido completado! Revisa la sección de administrador, tu información será actualizada.');
            handleCancelarCompra();
            fetchUserData();
            fetchProductos();
        }
    };
    const handleCancelarCompra = () => {
        setSelectedProducto(null);
        setDireccion('');
        setCantidad(1);
        setTotal(0);
        setError('');
    };
    const getStockColor = (stock) => {
        if (stock === 0)
            return 'red';
        if (stock < 10)
            return 'red';
        if (stock >= 10 && stock < 20)
            return 'orange';
        return 'green';
    };
    const handleNotificaciones = async () => {
        setShowNotificaciones(true);
        setNewNotification(false);
        if (usuarioId) {
            const usuarioDoc = doc(db, 'usuarios', usuarioId);
            await updateDoc(usuarioDoc, {
                lastNotificationDate: Timestamp.now(),
            });
        }
    };
    const checkForNewNotifications = (notificaciones, lastNotificationDate) => {
        if (!lastNotificationDate) {
            setNewNotification(notificaciones.length > 0);
            if (notificaciones.length > 0) {
                playNotificationSound();
            }
            return;
        }
        const hasNewNotifications = notificaciones.some(notificacion => notificacion.fecha.seconds > lastNotificationDate.seconds);
        setNewNotification(hasNewNotifications);
        if (hasNewNotifications) {
            playNotificationSound();
        }
    };
    const playNotificationSound = () => {
        const audio = new Audio('https://kuromy777.github.io/few/notification.mp3');
        audio.play();
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: `content ${selectedProducto || showCompras || showNotificaciones ? 'blurred' : ''}`, children: [_jsxs("h2", { children: ["Productos inspirados en tus preferencias ", usuarioId] }), _jsx("button", { className: `notificaciones ${newNotification ? 'new-notification' : ''}`, onClick: handleNotificaciones, children: newNotification ? 'Nueva notificación' : 'Notificaciones' }), _jsx("button", { className: "mis-compras-button", onClick: () => setShowCompras(true), children: "Mis Compras" }), _jsx("div", { className: "productos-grid scroll-container", children: productos.map(producto => (_jsxs("div", { className: "producto-card", children: [recomendaciones.includes(producto.nombre) && (_jsx("p", { className: "recomendado-label", children: "PRODUCTO RECOMENDADO" })), _jsx("img", { src: producto.imagen, alt: producto.nombre, className: "producto-img tienda-img" }), _jsx("h3", { children: producto.nombre }), _jsx("p", { children: producto.descripcion }), _jsxs("p", { children: ["Precio: $", producto.precio] }), producto.stock === 0 ? (_jsx("p", { className: "stock-unavailable", children: "Producto agotado" })) : (_jsx("button", { className: "buy-button", onClick: () => handleComprar(producto), children: "Comprar" }))] }, producto.id))) }), _jsx(Link, { to: "/", children: _jsx("button", { className: "back-button", children: "Regresar" }) })] }), selectedProducto && createPortal(_jsx("div", { className: "compra-form-overlay", children: _jsxs("div", { className: "compra-form", children: [_jsx("h3", { children: "Formulario de Compra" }), _jsxs("p", { style: { color: getStockColor(selectedProducto.stock) }, children: ["Disponible en stock: ", selectedProducto.stock] }), _jsxs("label", { children: ["Direcci\u00F3n:", _jsx("input", { type: "text", value: direccion, onChange: (e) => setDireccion(e.target.value) })] }), _jsxs("label", { children: ["Cantidad:", _jsx("input", { type: "number", value: cantidad, min: "1", onChange: (e) => setCantidad(parseInt(e.target.value)) })] }), _jsxs("p", { children: ["Total: $", total] }), error && _jsx("p", { style: { color: 'red' }, children: error }), _jsx("button", { className: "blue-button", onClick: handleConfirmarCompra, children: "Confirmar Compra" }), _jsx("button", { className: "blue-button", onClick: handleCancelarCompra, children: "Cancelar Compra" })] }) }), document.body), showCompras && createPortal(_jsx("div", { className: "compras-overlay", children: _jsxs("div", { className: "compras-popup scroll-container", children: [_jsx("h3", { children: "Mis Compras" }), _jsxs("table", { className: "usuario-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nombre del Producto" }), _jsx("th", { children: "Cantidad" }), _jsx("th", { children: "Direcci\u00F3n" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Estado" })] }) }), _jsx("tbody", { children: compras.map((compra, index) => (_jsxs("tr", { children: [_jsx("td", { children: compra.nombre_producto }), _jsx("td", { children: compra.cantidad }), _jsx("td", { children: compra.direccion }), _jsxs("td", { children: ["$", compra.total] }), _jsx("td", { children: compra.estado })] }, index))) })] }), _jsx("button", { className: "back-button", onClick: () => setShowCompras(false), children: "Cerrar" })] }) }), document.body), showNotificaciones && createPortal(_jsx("div", { className: "compras-overlay", children: _jsxs("div", { className: "compras-popup scroll-container", children: [_jsx("h3", { children: "Mis Notificaciones" }), notificaciones.length > 0 ? (_jsx("ul", { children: notificaciones
                                .sort((a, b) => b.fecha.seconds - a.fecha.seconds) // Ordenar de la más reciente a la más antigua
                                .map((notificacion, index) => (_jsxs("li", { children: [notificacion.mensaje, " - ", new Date(notificacion.fecha.seconds * 1000).toLocaleString()] }, index))) })) : (_jsx("p", { children: "No se encontraron notificaciones." })), _jsx("button", { className: "back-button", onClick: () => setShowNotificaciones(false), children: "Cerrar" })] }) }), document.body)] }));
}
export default Productos;
