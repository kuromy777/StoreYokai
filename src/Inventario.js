import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import './App.css';
function Inventario() {
    const [activeTab, setActiveTab] = useState('Anime');
    const [productos, setProductos] = useState([]);
    const [stockValues, setStockValues] = useState({});
    const [priceValues, setPriceValues] = useState({});
    const [editName, setEditName] = useState({});
    const [nameValues, setNameValues] = useState({});
    const [editDesc, setEditDesc] = useState({});
    const [descValues, setDescValues] = useState({});
    const [editImg, setEditImg] = useState({});
    const [imgValues, setImgValues] = useState({});
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
                const productosList = Object.keys(data).map(key => ({
                    id: data[key].id,
                    nombre: data[key].nombre,
                    descripcion: data[key].descripcion,
                    imagen: data[key].imagen,
                    stock: data[key].stock,
                    precio: data[key].precio,
                }));
                setProductos(productosList);
                const stockMap = {};
                const priceMap = {};
                const nameMap = {};
                const descMap = {};
                const imgMap = {};
                const editNameMap = {};
                const editDescMap = {};
                const editImgMap = {};
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
    const handleStockChange = (id, value) => {
        setStockValues(prev => ({ ...prev, [id]: value }));
    };
    const handlePriceChange = (id, value) => {
        setPriceValues(prev => ({ ...prev, [id]: value }));
    };
    const handleNameChange = (id, value) => {
        setNameValues(prev => ({ ...prev, [id]: value }));
    };
    const handleDescChange = (id, value) => {
        setDescValues(prev => ({ ...prev, [id]: value }));
    };
    const handleImgChange = (id, value) => {
        setImgValues(prev => ({ ...prev, [id]: value }));
    };
    const handleSaveStock = async (id) => {
        try {
            const newStock = stockValues[id];
            const docRef = doc(db, 'productos', activeTab);
            await updateDoc(docRef, { [`${id}.stock`]: newStock });
        }
        catch (error) {
            console.error("Error updating stock: ", error);
        }
    };
    const handleSavePrice = async (id) => {
        try {
            const newPrice = priceValues[id];
            const docRef = doc(db, 'productos', activeTab);
            await updateDoc(docRef, { [`${id}.precio`]: newPrice });
        }
        catch (error) {
            console.error("Error updating price: ", error);
        }
    };
    const handleSaveName = async (id) => {
        try {
            const newName = nameValues[id];
            const docRef = doc(db, 'productos', activeTab);
            await updateDoc(docRef, { [`${id}.nombre`]: newName });
            setEditName(prev => ({ ...prev, [id]: false }));
        }
        catch (error) {
            console.error("Error updating name: ", error);
        }
    };
    const handleSaveDesc = async (id) => {
        try {
            const newDesc = descValues[id];
            const docRef = doc(db, 'productos', activeTab);
            await updateDoc(docRef, { [`${id}.descripcion`]: newDesc });
            setEditDesc(prev => ({ ...prev, [id]: false }));
        }
        catch (error) {
            console.error("Error updating description: ", error);
        }
    };
    const handleSaveImg = async (id) => {
        try {
            const newImg = imgValues[id];
            const docRef = doc(db, 'productos', activeTab);
            await updateDoc(docRef, { [`${id}.imagen`]: newImg });
            setEditImg(prev => ({ ...prev, [id]: false }));
        }
        catch (error) {
            console.error("Error updating image: ", error);
        }
    };
    const handleDeleteProduct = async (id) => {
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
            }
            catch (error) {
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
        }
        catch (error) {
            console.error("Error adding product: ", error);
        }
    };
    const renderContent = () => (_jsx("div", { className: `inventory-content ${showAddForm ? 'blurred' : ''}`, children: _jsx("div", { className: "scroll-container", children: _jsxs("table", { className: "inventory-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nombre del producto" }), _jsx("th", { children: "Descripci\u00F3n" }), _jsx("th", { children: "Imagen" }), _jsx("th", { children: "Stock" }), _jsx("th", { children: "Precio" }), _jsx("th", { children: "Acciones" })] }) }), _jsx("tbody", { children: productos.map(producto => (_jsxs("tr", { children: [_jsx("td", { children: editName[producto.id] ? (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", value: nameValues[producto.id], onChange: e => handleNameChange(producto.id, e.target.value) }), _jsx("button", { onClick: () => handleSaveName(producto.id), children: "Guardar" })] })) : (_jsxs(_Fragment, { children: [producto.nombre, _jsx("button", { style: { backgroundColor: "transparent", borderColor: "transparent" }, onClick: () => setEditName(prev => ({ ...prev, [producto.id]: true })), children: _jsx("span", { style: { textDecoration: "underline", color: "rgb(134, 134, 134)" }, children: "Editar" }) })] })) }), _jsx("td", { children: editDesc[producto.id] ? (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", value: descValues[producto.id], onChange: e => handleDescChange(producto.id, e.target.value) }), _jsx("button", { onClick: () => handleSaveDesc(producto.id), children: "Guardar" })] })) : (_jsxs(_Fragment, { children: [producto.descripcion, _jsx("button", { style: { backgroundColor: "transparent", borderColor: "transparent" }, onClick: () => setEditDesc(prev => ({ ...prev, [producto.id]: true })), children: _jsx("span", { style: { textDecoration: "underline", color: "rgb(134, 134, 134)" }, children: "Editar" }) })] })) }), _jsx("td", { children: editImg[producto.id] ? (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", value: imgValues[producto.id], onChange: e => handleImgChange(producto.id, e.target.value) }), _jsx("button", { onClick: () => handleSaveImg(producto.id), children: "Guardar" })] })) : (_jsxs(_Fragment, { children: [_jsx("img", { src: producto.imagen, alt: producto.nombre, className: "product-img" }), _jsx("button", { style: { backgroundColor: "transparent", borderColor: "transparent" }, onClick: () => setEditImg(prev => ({ ...prev, [producto.id]: true })), children: _jsx("span", { style: { textDecoration: "underline", color: "rgb(134, 134, 134)" }, children: "Editar" }) })] })) }), _jsxs("td", { children: [_jsx("input", { type: "number", value: stockValues[producto.id], onChange: e => handleStockChange(producto.id, Number(e.target.value)) }), _jsx("button", { onClick: () => handleSaveStock(producto.id), children: "Guardar" })] }), _jsxs("td", { children: [_jsx("input", { type: "number", value: priceValues[producto.id], onChange: e => handlePriceChange(producto.id, Number(e.target.value)) }), _jsx("button", { onClick: () => handleSavePrice(producto.id), children: "Guardar" })] }), _jsx("td", { children: _jsx("button", { style: { backgroundColor: "transparent", borderColor: "transparent" }, onClick: () => handleDeleteProduct(producto.id), children: _jsx("img", { style: { width: "50px" }, src: "https://cdn-icons-png.flaticon.com/512/9713/9713380.png", alt: "Delete" }) }) })] }, producto.id))) })] }) }) }));
    return (_jsxs("div", { className: "content", children: [_jsx("h2", { children: "Inventario" }), _jsxs("div", { className: "tabs", children: [_jsx("button", { onClick: () => setActiveTab('Anime'), className: activeTab === 'Anime' ? 'active' : '', children: "Anime" }), _jsx("button", { onClick: () => setActiveTab('Elegante'), className: activeTab === 'Elegante' ? 'active' : '', children: "Elegante" }), _jsx("button", { onClick: () => setActiveTab('Oficinista'), className: activeTab === 'Oficinista' ? 'active' : '', children: "Oficinista" }), _jsx("button", { onClick: () => setActiveTab('Moda urbana'), className: activeTab === 'Moda urbana' ? 'active' : '', children: "Moda urbana" })] }), _jsx("button", { className: "add-product-button", onClick: () => setShowAddForm(true), children: "A\u00F1adir Producto" }), _jsx("div", { className: "tab-content full-width", children: renderContent() }), showAddForm && (_jsx("div", { className: "add-product-form-overlay", children: _jsxs("div", { className: "add-product-form", children: [_jsx("h3", { children: "A\u00F1adir Producto" }), _jsx("input", { type: "text", placeholder: "Nombre", value: newProduct.nombre, onChange: e => setNewProduct({ ...newProduct, nombre: e.target.value }) }), _jsx("input", { type: "text", placeholder: "Descripci\u00F3n", value: newProduct.descripcion, onChange: e => setNewProduct({ ...newProduct, descripcion: e.target.value }) }), _jsx("input", { type: "text", placeholder: "URL de la imagen", value: newProduct.imagen, onChange: e => setNewProduct({ ...newProduct, imagen: e.target.value }) }), _jsx("input", { type: "number", placeholder: "Stock", value: newProduct.stock, onChange: e => setNewProduct({ ...newProduct, stock: e.target.value }) }), _jsx("input", { type: "number", placeholder: "Precio", value: newProduct.precio, onChange: e => setNewProduct({ ...newProduct, precio: e.target.value }) }), _jsx("button", { onClick: handleAddProduct, children: "A\u00F1adir" }), _jsx("button", { onClick: () => setShowAddForm(false), children: "Cancelar" })] }) })), _jsx(Link, { to: "/administrador", children: _jsx("button", { className: "back-button", children: "Regresar" }) })] }));
}
export default Inventario;
