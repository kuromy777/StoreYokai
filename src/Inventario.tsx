import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import './App.css';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  stock: number;
  precio: number;
}

function Inventario() {
  const [activeTab, setActiveTab] = useState('Anime');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stockValues, setStockValues] = useState<{ [key: string]: number }>({});
  const [priceValues, setPriceValues] = useState<{ [key: string]: number }>({});
  const [editName, setEditName] = useState<{ [key: string]: boolean }>({});
  const [nameValues, setNameValues] = useState<{ [key: string]: string }>({});
  const [editDesc, setEditDesc] = useState<{ [key: string]: boolean }>({});
  const [descValues, setDescValues] = useState<{ [key: string]: string }>({});
  const [editImg, setEditImg] = useState<{ [key: string]: boolean }>({});
  const [imgValues, setImgValues] = useState<{ [key: string]: string }>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    descripcion: '',
    imagen: '',
    stock: '',
    precio: ''
  });

  useEffect(() => {
    const fetchProductos = async () => {
      const docRef = doc(db, 'productos', activeTab);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const productosList: Producto[] = Object.keys(data).map(key => ({
          id: data[key].id,
          nombre: data[key].nombre,
          descripcion: data[key].descripcion,
          imagen: data[key].imagen,
          stock: data[key].stock,
          precio: data[key].precio,
        }));
        setProductos(productosList);
        const stockMap: { [key: string]: number } = {};
        const priceMap: { [key: string]: number } = {};
        const nameMap: { [key: string]: string } = {};
        const descMap: { [key: string]: string } = {};
        const imgMap: { [key: string]: string } = {};
        const editNameMap: { [key: string]: boolean } = {};
        const editDescMap: { [key: string]: boolean } = {};
        const editImgMap: { [key: string]: boolean } = {};
        productosList.forEach(producto => {
          stockMap[producto.id] = producto.stock;
          priceMap[producto.id] = producto.precio;
          nameMap[producto.id] = producto.nombre;
          descMap[producto.id] = producto.descripcion;
          imgMap[producto.id] = producto.imagen;
          editNameMap[producto.id] = false;
          editDescMap[producto.id] = false;
          editImgMap[producto.id] = false;
        });
        setStockValues(stockMap);
        setPriceValues(priceMap);
        setNameValues(nameMap);
        setDescValues(descMap);
        setImgValues(imgMap);
        setEditName(editNameMap);
        setEditDesc(editDescMap);
        setEditImg(editImgMap);
      }
    };

    fetchProductos();
  }, [activeTab]);

  const handleStockChange = (id: string, value: number) => {
    setStockValues(prev => ({ ...prev, [id]: value }));
  };

  const handlePriceChange = (id: string, value: number) => {
    setPriceValues(prev => ({ ...prev, [id]: value }));
  };

  const handleNameChange = (id: string, value: string) => {
    setNameValues(prev => ({ ...prev, [id]: value }));
  };

  const handleDescChange = (id: string, value: string) => {
    setDescValues(prev => ({ ...prev, [id]: value }));
  };

  const handleImgChange = (id: string, value: string) => {
    setImgValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveStock = async (id: string) => {
    try {
      const newStock = stockValues[id];
      const docRef = doc(db, 'productos', activeTab);
      await updateDoc(docRef, { [`${id}.stock`]: newStock });
    } catch (error) {
      console.error("Error updating stock: ", error);
    }
  };

  const handleSavePrice = async (id: string) => {
    try {
      const newPrice = priceValues[id];
      const docRef = doc(db, 'productos', activeTab);
      await updateDoc(docRef, { [`${id}.precio`]: newPrice });
    } catch (error) {
      console.error("Error updating price: ", error);
    }
  };

  const handleSaveName = async (id: string) => {
    try {
      const newName = nameValues[id];
      const docRef = doc(db, 'productos', activeTab);
      await updateDoc(docRef, { [`${id}.nombre`]: newName });
      setEditName(prev => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error("Error updating name: ", error);
    }
  };

  const handleSaveDesc = async (id: string) => {
    try {
      const newDesc = descValues[id];
      const docRef = doc(db, 'productos', activeTab);
      await updateDoc(docRef, { [`${id}.descripcion`]: newDesc });
      setEditDesc(prev => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error("Error updating description: ", error);
    }
  };

  const handleSaveImg = async (id: string) => {
    try {
      const newImg = imgValues[id];
      const docRef = doc(db, 'productos', activeTab);
      await updateDoc(docRef, { [`${id}.imagen`]: newImg });
      setEditImg(prev => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error("Error updating image: ", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar el producto ${nameValues[id]}?`);
    if (confirmDelete) {
      try {
        const docRef = doc(db, 'productos', activeTab);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          delete data[id];
          await setDoc(docRef, data);
          setProductos(prev => prev.filter(producto => producto.id !== id));
        }
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.nombre || !newProduct.descripcion || !newProduct.imagen || !newProduct.stock || !newProduct.precio) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const docRef = doc(db, 'productos', activeTab);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newId = (Object.keys(data).length + 1).toString();
        const newProducto = {
          id: newId,
          nombre: newProduct.nombre,
          descripcion: newProduct.descripcion,
          imagen: newProduct.imagen,
          stock: parseInt(newProduct.stock),
          precio: parseInt(newProduct.precio),
          tipo: activeTab
        };
        data[newId] = newProducto;
        await setDoc(docRef, data);
        setProductos(prev => [...prev, newProducto]);
        setShowAddForm(false);
        setNewProduct({
          nombre: '',
          descripcion: '',
          imagen: '',
          stock: '',
          precio: ''
        });
      }
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const renderContent = () => (
    <div className={`inventory-content ${showAddForm ? 'blurred' : ''}`}>
      <div className="scroll-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Nombre del producto</th>
              <th>Descripción</th>
              <th>Imagen</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id}>
                <td>
                  {editName[producto.id] ? (
                    <>
                      <input
                        type="text"
                        value={nameValues[producto.id]}
                        onChange={e => handleNameChange(producto.id, e.target.value)}
                      />
                      <button onClick={() => handleSaveName(producto.id)}>Guardar</button>
                    </>
                  ) : (
                    <>
                      {producto.nombre}
                      <button style={{backgroundColor: "transparent", borderColor: "transparent" }}  onClick={() => setEditName(prev => ({ ...prev, [producto.id]: true }))}>
                      <span style={{ textDecoration: "underline", color:"rgb(134, 134, 134)" }}>Editar</span>
                      </button>
                    </>
                  )}
                </td>
                <td>
                  {editDesc[producto.id] ? (
                    <>
                      <input
                        type="text"
                        value={descValues[producto.id]}
                        onChange={e => handleDescChange(producto.id, e.target.value)}
                      />
                      <button onClick={() => handleSaveDesc(producto.id)}>Guardar</button>
                    </>
                  ) : (
                    <>
                      {producto.descripcion}
                      <button style={{backgroundColor: "transparent", borderColor: "transparent" }} onClick={() => setEditDesc(prev => ({ ...prev, [producto.id]: true }))}>
                      <span style={{ textDecoration: "underline", color:"rgb(134, 134, 134)" }}>Editar</span>
                      </button>
                    </>
                  )}
                </td>
                <td>
                  {editImg[producto.id] ? (
                    <>
                      <input
                        type="text"
                        value={imgValues[producto.id]}
                        onChange={e => handleImgChange(producto.id, e.target.value)}
                      />
                      <button onClick={() => handleSaveImg(producto.id)}>Guardar</button>
                    </>
                  ) : (
                    <>
                      <img src={producto.imagen} alt={producto.nombre} className="product-img" />
                      <button style={{backgroundColor: "transparent", borderColor: "transparent" }} onClick={() => setEditImg(prev => ({ ...prev, [producto.id]: true }))}>
                      <span style={{ textDecoration: "underline", color:"rgb(134, 134, 134)" }}>Editar</span>
                      </button>
                    </>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    value={stockValues[producto.id]}
                    onChange={e => handleStockChange(producto.id, Number(e.target.value))}
                  />
                  <button onClick={() => handleSaveStock(producto.id)}>Guardar</button>
                </td>
                <td>
                  <input
                    type="number"
                    value={priceValues[producto.id]}
                    onChange={e => handlePriceChange(producto.id, Number(e.target.value))}
                  />
                  <button onClick={() => handleSavePrice(producto.id)}>Guardar</button>
                </td>
                <td>
                  <button style={{backgroundColor: "transparent", borderColor: "transparent" }}  onClick={() => handleDeleteProduct(producto.id)}>
                    <img style={{ width:"50px" }} src="https://cdn-icons-png.flaticon.com/512/9713/9713380.png" alt="Delete" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="content">
      <h2>Inventario</h2>
      <div className="tabs">
        <button onClick={() => setActiveTab('Anime')} className={activeTab === 'Anime' ? 'active' : ''}>Anime</button>
        <button onClick={() => setActiveTab('Elegante')} className={activeTab === 'Elegante' ? 'active' : ''}>Elegante</button>
        <button onClick={() => setActiveTab('Oficinista')} className={activeTab === 'Oficinista' ? 'active' : ''}>Oficinista</button>
        <button onClick={() => setActiveTab('Moda urbana')} className={activeTab === 'Moda urbana' ? 'active' : ''}>Moda urbana</button>
      </div>
      <button className="add-product-button" onClick={() => setShowAddForm(true)}>Añadir Producto</button>
      <div className="tab-content full-width">
        {renderContent()}
      </div>
      {showAddForm && (
        <div className="add-product-form-overlay">
          <div className="add-product-form">
            <h3>Añadir Producto</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={newProduct.nombre}
              onChange={e => setNewProduct({ ...newProduct, nombre: e.target.value })}
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newProduct.descripcion}
              onChange={e => setNewProduct({ ...newProduct, descripcion: e.target.value })}
            />
            <input
              type="text"
              placeholder="URL de la imagen"
              value={newProduct.imagen}
              onChange={e => setNewProduct({ ...newProduct, imagen: e.target.value })}
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
            />
            <input
              type="number"
              placeholder="Precio"
              value={newProduct.precio}
              onChange={e => setNewProduct({ ...newProduct, precio: e.target.value })}
            />
            <button onClick={handleAddProduct}>Añadir</button>
            <button onClick={() => setShowAddForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
      <Link to="/administrador">
        <button className="back-button">Regresar</button>
      </Link>
    </div>
  );
}

export default Inventario;