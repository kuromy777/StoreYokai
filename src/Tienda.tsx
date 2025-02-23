import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './App.css';

const GUSTOS_POSIBLES = ["Oficinista", "Elegante", "Anime", "Moda urbana"];

function Tienda() {
  const { usuarioId } = useParams();
  const [gustosSeleccionados, setGustosSeleccionados] = useState<string[]>([]);
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
        } else {
          console.log("El documento no existe.");
        }
      }
    };

    fetchGustos();
  }, [usuarioId]);

  const handleCheckboxChange = (gusto: string) => {
    setGustosSeleccionados(prevState =>
      prevState.includes(gusto)
        ? prevState.filter(item => item !== gusto)
        : [...prevState, gusto]
    );
  };

  const handleSave = async () => {
    if (usuarioId) {
      const usuarioDoc = doc(db, 'usuarios', usuarioId);
      await updateDoc(usuarioDoc, { gustos: gustosSeleccionados });
      navigate(`/productos/${usuarioId}`);
    }
  };

  return (
    <div className="content">
      <h2>Preferencias de {usuarioId}</h2>
      <div className="gustos-popup">
        {GUSTOS_POSIBLES.map(gusto => (
          <div key={gusto}>
            <label>
              <input
                type="checkbox"
                checked={gustosSeleccionados.includes(gusto)}
                onChange={() => handleCheckboxChange(gusto)}
              />
              {gusto}
            </label>
          </div>
        ))}
        <button onClick={handleSave}>Cerrar pestaña de gustos</button>
      </div>
      <Link to="/">
        <button className="back-button">Regresar</button>
      </Link>
    </div>
  );
}

export default Tienda;
