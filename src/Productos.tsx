// @ts-ignore
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp, onSnapshot } from 'firebase/firestore';
import './App.css';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  tipo: string;
  stock: number;
}

interface Compra {
  id_producto: string;
  nombre_producto: string;
  direccion: string;
  cantidad: number;
  total: number;
  fecha_compra: any;
  estado: string;
  tipo: string;
}

interface Notificacion {
  mensaje: string;
  fecha: Timestamp;
}

function Productos() {
  const { usuarioId } = useParams();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [gustos, setGustos] = useState<string[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<string[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [direccion, setDireccion] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [compras, setCompras] = useState<Compra[]>([]);
  const [showCompras, setShowCompras] = useState(false);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<Compra | null>(null);
  // @ts-ignore
  const [suggestedProduct, setSuggestedProduct] = useState<Producto | null>(null);
  // @ts-ignore
  const [lastNotificationDate, setLastNotificationDate] = useState<Timestamp | null>(null);
  const [newNotification, setNewNotification] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

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
    const productosList: Producto[] = [];
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
    const productosList: Producto[] = [];
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

    
    const getRandomProduct = (products: Producto[]) => {
      const filteredProducts = products.filter(producto => lastPurchase && producto.tipo === lastPurchase.tipo && producto.id !== lastPurchase.id_producto);
      return filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
    };

    const suggested = getRandomProduct(productosList);
    setSuggestedProduct(suggested || null);
  };

  const handleComprar = (producto: Producto) => {
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

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'red';
    if (stock < 10) return 'red';
    if (stock >= 10 && stock < 20) return 'orange';
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

  const checkForNewNotifications = (notificaciones: Notificacion[], lastNotificationDate: Timestamp | null) => {
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

  return (
    <div>
      <div className={`content ${selectedProducto || showCompras || showNotificaciones ? 'blurred' : ''}`}>
        <h2>Productos inspirados en tus preferencias {usuarioId}</h2>
        <button className={`notificaciones ${newNotification ? 'new-notification' : ''}`} onClick={handleNotificaciones}>
          {newNotification ? 'Nueva notificación' : 'Notificaciones'}
        </button>
        <button className="mis-compras-button" onClick={() => setShowCompras(true)}>Mis Compras</button>
        <div className="productos-grid scroll-container">
          {productos.map(producto => (
            <div key={producto.id} className="producto-card">
              {recomendaciones.includes(producto.nombre) && (
                <p className="recomendado-label">PRODUCTO RECOMENDADO</p>
              )}
              <img src={producto.imagen} alt={producto.nombre} className="producto-img tienda-img" />
              <h3>{producto.nombre}</h3>
              <p>{producto.descripcion}</p>
              <p>Precio: ${producto.precio}</p>
              {producto.stock === 0 ? (
                <p className="stock-unavailable">Producto agotado</p>
              ) : (
                <button className="buy-button" onClick={() => handleComprar(producto)}>Comprar</button>
              )}
            </div>
          ))}
        </div>
        <Link to="/">
          <button className="back-button">Regresar</button>
        </Link>
      </div>
      {selectedProducto && createPortal(
        <div className="compra-form-overlay">
          <div className="compra-form">
            <h3>Formulario de Compra</h3>
            <p style={{ color: getStockColor(selectedProducto.stock) }}>
              Disponible en stock: {selectedProducto.stock}
            </p>
            <label>
              Dirección:
              <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </label>
            <label>
              Cantidad:
              <input type="number" value={cantidad} min="1" onChange={(e) => setCantidad(parseInt(e.target.value))} />
            </label>
            <p>Total: ${total}</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button className="blue-button" onClick={handleConfirmarCompra}>Confirmar Compra</button>
            <button className="blue-button" onClick={handleCancelarCompra}>Cancelar Compra</button>
          </div>
        </div>,
        document.body
      )}
      {showCompras && createPortal(
        <div className="compras-overlay">
          <div className="compras-popup scroll-container">
            <h3>Mis Compras</h3>
            <table className="usuario-table">
              <thead>
                <tr>
                  <th>Nombre del Producto</th>
                  <th>Cantidad</th>
                  <th>Dirección</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra, index) => (
                  <tr key={index}>
                    <td>{compra.nombre_producto}</td>
                    <td>{compra.cantidad}</td>
                    <td>{compra.direccion}</td>
                    <td>${compra.total}</td>
                    <td>{compra.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="back-button" onClick={() => setShowCompras(false)}>Cerrar</button>
          </div>
        </div>,
        document.body
      )}
      {showNotificaciones && createPortal(
        <div className="compras-overlay">
          <div className="compras-popup scroll-container">
            <h3>Mis Notificaciones</h3>
            {notificaciones.length > 0 ? (
              <ul>
                {notificaciones
                  .sort((a, b) => b.fecha.seconds - a.fecha.seconds) // Ordenar de la más reciente a la más antigua
                  .map((notificacion, index) => (
                    <li key={index}>
                      {notificacion.mensaje} - {new Date(notificacion.fecha.seconds * 1000).toLocaleString()}
                    </li>
                ))}
              </ul>
            ) : (
              <p>No se encontraron notificaciones.</p>
            )}
            <button className="back-button" onClick={() => setShowNotificaciones(false)}>Cerrar</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Productos;