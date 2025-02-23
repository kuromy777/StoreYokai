import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import './App.css';

interface Usuario {
  id: string;
  nombre: string;
  gustos: string[];
}

function Usuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
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
      } catch (error) {
        console.error("Error fetching usuarios: ", error);
      }
    };

    fetchUsuarios();
  }, []);

  const handlePerfilClick = async (usuarioId: string) => {
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

  const handleGustoChange = async (gusto: string, checked: boolean) => {
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

  return (
    <div className="content">
      <h2>¿Quién está comprando ahora?</h2>
      <div className="usuarios-grid">
        {usuarios.length > 0 ? (
          usuarios.map(usuario => (
            <div key={usuario.id} className="perfil" onClick={() => handlePerfilClick(usuario.id)}>
              <img src={`https://ui-avatars.com/api/?name=${usuario.nombre}&background=random`} alt={usuario.nombre} className="perfil-img" />
              <p>{usuario.nombre}</p>
            </div>
          ))
        ) : (
          <p>No hay usuarios disponibles.</p>
        )}
      </div>
      {selectedUsuario && (
        <div className="gustos-popup">
          <h3>Selecciona preferencias {selectedUsuario.nombre}</h3>
          <ul>
            {['Anime', 'Moda urbana', 'Elegante', 'Oficinista'].map((gusto, index) => (
              <li key={index}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedUsuario.gustos.includes(gusto)}
                    onChange={(e) => handleGustoChange(gusto, e.target.checked)}
                  />
                  {gusto}
                </label>
              </li>
            ))}
          </ul>
          <button className="blue-button" onClick={handleContinuar}>Continuar</button>
        </div>
      )}
      <Link to="/">
        <button className="back-button">Regresar</button>
      </Link>
    </div>
  );
}

export default Usuario;
