import { Link } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div className="content">
      <h1>LootBox Clothing</h1>
      <div className="home-buttons">
      <h1>Iniciar Sesión como:</h1>
        <Link to="/usuario">
          <button className="blue-button">Usuario</button>
        </Link>
        <Link to="/administrador">
          <button className="blue-button">Administrador</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
