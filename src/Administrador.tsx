import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './App.css';

interface Usuario {
  id: string;
  nombre: string;
  imagen: string;
}

function Administrador() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      const usuariosCollection = collection(db, 'usuarios');
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const usuariosList: Usuario[] = usuariosSnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
        imagen: `https://ui-avatars.com/api/?name=${doc.data().nombre}&background=random` 
      }));
      setUsuarios(usuariosList);
    };

    fetchUsuarios();
  }, []);

  const handlePerfilClick = (usuarioId: string) => {
    navigate(`/administrar/${usuarioId}`);
  };

  const handleInventarioClick = () => {
    navigate('/inventario');
  };

  return (
    <div className="content">
      <h2>Gestión de usuarios</h2>
      <div className="usuarios-grid">
        {usuarios.map(usuario => (
          <div key={usuario.id} className="perfil" onClick={() => handlePerfilClick(usuario.id)}>
            <img src={usuario.imagen} alt={usuario.nombre} className="perfil-img" />
            <h3>{usuario.nombre}</h3>
          </div>
        ))}
      </div>
      <h2>Gestionar inventario</h2>
      <button className="inventory-button" onClick={handleInventarioClick}>Abrir inventario</button>
      <Link to="/">
        <button className="back-button">Regresar</button>
      </Link>
    </div>
  );
}

export default Administrador;
