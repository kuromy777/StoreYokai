// @ts-ignore
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
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
  cantidad: number;
  direccion: string;
  fecha_compra: any;
  id_producto: string;
  nombre_producto: string;
  total: number;
  estado: string;
}

interface Usuario {
  id: string;
  nombre: string;
  gustos: string[];
  compras?: Compra[];
  recomendaciones: string[];
  notificaciones?: Notificacion[];
}

interface Notificacion {
  mensaje: string;
  fecha: Timestamp;
}

function AdministrarUsuario() {
  const { usuarioId } = useParams();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProductos, setSelectedProductos] = useState<{ [key: string]: boolean }>({});
  const [showRecomendacionesPopup, setShowRecomendacionesPopup] = useState(false);
  const [editEstado, setEditEstado] = useState<{ [key: number]: boolean }>({});
  const [estadoValues, setEstadoValues] = useState<{ [key: number]: string }>({});
  const [showNotificacionesPopup, setShowNotificacionesPopup] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [newNotificacion, setNewNotificacion] = useState('');

  useEffect(() => {
    const fetchUsuario = async () => {
      if (usuarioId) {
        const usuarioDoc = doc(db, 'usuarios', usuarioId);
        const usuarioSnapshot = await getDoc(usuarioDoc);
        if (usuarioSnapshot.exists()) {
          const data = usuarioSnapshot.data() as Usuario;
          setUsuario(data);
          const selected = data.recomendaciones.reduce((acc, nombre) => {
            acc[nombre] = true;
            return acc;
          }, {} as { [key: string]: boolean });
          setSelectedProductos(selected);
          const estadoMap: { [key: number]: string } = {};
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
        const productosList: Producto[] = [];
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

  const handleRecomendacionChange = (nombre: string) => {
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

  const handleEstadoChange = (index: number, value: string) => {
    setEstadoValues(prev => ({ ...prev, [index]: value }));
  };

  const handleSaveEstado = async (index: number) => {
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

  return (
    <div className={`content scroll-container ${showRecomendacionesPopup || showNotificacionesPopup ? 'blurred' : ''}`}>
      <h2>Usuario: {usuario?.nombre}</h2>
      <h2>Compras realizadas</h2>
      {usuario ? (
        <div>
          {usuario.compras && usuario.compras.length > 0 ? (
            <table className="usuario-table">
              <thead>
                <tr>
                  <th>Nombre del Producto</th>
                  <th>Cantidad</th>
                  <th>Dirección</th>
                  <th>Fecha de Compra</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuario.compras.map((compra, index) => (
                  <tr key={index}>
                    <td>{compra.nombre_producto}</td>
                    <td>{compra.cantidad}</td>
                    <td>{compra.direccion}</td>
                    <td>{new Date(compra.fecha_compra.seconds * 1000).toLocaleString()}</td>
                    <td>${compra.total}</td>
                    <td>
                      {editEstado[index] ? (
                        <>
                          <input
                            type="text"
                            value={estadoValues[index]}
                            onChange={e => handleEstadoChange(index, e.target.value)}
                          />
                          <button onClick={() => handleSaveEstado(index)}>Guardar</button>
                        </>
                      ) : (
                        <>
                          {compra.estado || 'Compra confirmada'}
                          <button style={{backgroundColor: "transparent", borderColor: "transparent" }}  onClick={() => setEditEstado(prev => ({ ...prev, [index]: true }))}>
                            <img className='edit-icon' src="https://cdn-icons-png.freepik.com/512/8280/8280556.png" alt="Edit" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Este usuario aún no ha realizado compras.</p>
          )}
          <h3>Preferencias</h3>
          {usuario.gustos.length > 0 ? (
            <ul className="usuario-gustos">
              {usuario.gustos.map((gusto, index) => (
                <li key={index}>{gusto}</li>
              ))}
            </ul>
          ) : (
            <p>Este usuario aún no ha seleccionado sus gustos.</p>
          )}
          <button className="blue-button" onClick={() => setShowRecomendacionesPopup(true)}>Recomendación</button>
          <button className="blue-button" onClick={() => setShowNotificacionesPopup(true)}>Enviar notificación</button>
          {showRecomendacionesPopup && createPortal(
            <div className="recomendaciones-popup-overlay">
              <div className="recomendaciones-popup">
                <h4>Selecciona productos para recomendar</h4>
                {productos.map(producto => (
                  <div key={producto.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedProductos[producto.nombre] || false}
                        onChange={() => handleRecomendacionChange(producto.nombre)}
                      />
                      {producto.nombre}
                    </label>
                  </div>
                ))}
                <button className="save-button" onClick={handleGuardarRecomendaciones}>Guardar</button>
                <button className="close-button" onClick={() => setShowRecomendacionesPopup(false)}>Cerrar</button>
              </div>
            </div>,
            document.body
          )}
          {showNotificacionesPopup && createPortal(
            <div className="notificaciones-popup-overlay">
              <div className="notificaciones-popup">
                <h4>Notificaciones del usuario {usuario?.nombre}</h4>
               
               
                <textarea style={{width: "100%"}}
                  value={newNotificacion}
                  onChange={(e) => setNewNotificacion(e.target.value)}
                  placeholder="Escribe la notificación aquí..."
                />
                <button className="save-button" onClick={handleGuardarNotificacion}>Enviar</button>
                <button className="close-button" onClick={() => setShowNotificacionesPopup(false)}>Cerrar</button>
                <h4>Notificaciones existentes</h4>
                {notificaciones.length > 0 ? (
                  <ul>
                    {notificaciones.map((notificacion, index) => (
                      <li key={index}>
                        {notificacion.mensaje} - {new Date(notificacion.fecha.seconds * 1000).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No se encontraron notificaciones.</p>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
      ) : (
        <p>Cargando datos del usuario...</p>
      )}
      <Link to="/administrador">
        <button className="back-button">Regresar</button>
      </Link>
    </div>
  );
}

export default AdministrarUsuario;