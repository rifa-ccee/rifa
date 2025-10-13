import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import "./Rifa.css";
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Hook para detectar el tamaño de la ventana
function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return { width: size[0], height: size[1] };
}

const Rifa = () => {
  const [soldNumbers, setSoldNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [numberData, setNumberData] = useState({});
  const [vendedor, setVendedor] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pageIndex, setPageIndex] = useState(0); // 0 => 1-100, 1 => 101-200, 2 => 201-300
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const collectionRef = collection(db, "vendidos");
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const newData = {};
      const newSoldNumbers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const raffleNumber = parseInt(doc.id, 10);
        newSoldNumbers.push(raffleNumber);
        newData[raffleNumber] = {
          nombre: data.nombre,
          telefono: data.telefono,
          vendedor: data.vendedor || "",
        };
      });
      setNumberData(newData);
      setSoldNumbers(newSoldNumbers);
    });
    return () => unsubscribe();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', show: false });
    }, 2000);
  };

  const handleNumberClick = (num) => {
    setCurrentNumber(num);
    const dataForNumber = numberData[num];
    if (dataForNumber) {
      setName(dataForNumber.nombre);
      setPhone(dataForNumber.telefono);
      setVendedor(dataForNumber.vendedor || (user ? user.displayName || user.username : ""));
    } else {
      setName("");
      setPhone("");
      setVendedor(user ? user.displayName || user.username : "");
    }
  };

  const handleSaveOrUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !currentNumber) return;
    const docRef = doc(db, "vendidos", currentNumber.toString());
    try {
      await setDoc(docRef, {
        nombre: name,
        telefono: phone,
        vendedor: vendedor,
      });
      showNotification(`Número ${currentNumber} guardado/actualizado.`, 'success');
      setCurrentNumber(null);
      setName("");
      setPhone("");
      setVendedor("");
    } catch (error) {
      console.error("Error al guardar/actualizar: ", error);
      showNotification('Error al guardar el número.', 'error');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!currentNumber || !soldNumbers.includes(currentNumber)) return;
    const isConfirmed = window.confirm(`¿Seguro que quieres liberar el número ${currentNumber}?`);
    if (!isConfirmed) return;
    const docRef = doc(db, "vendidos", currentNumber.toString());
    try {
      await deleteDoc(docRef);
      showNotification(`Número ${currentNumber} liberado.`, 'success');
      setCurrentNumber(null);
      setName("");
      setPhone("");
    } catch (error) {
      console.error("Error al eliminar: ", error);
      showNotification('Error al liberar el número.', 'error');
    }
  };

  const handleDownloadList = () => {
    if (Object.keys(numberData).length === 0) {
      showNotification("No hay números vendidos para exportar.", "error");
      return;
    }
    const sortedData = Object.entries(numberData).sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
    let fileContent = "Lista de Números Vendidos - Rifa Club de Pesca Río Toltén\n";
    fileContent += "========================================================\n\n";
    sortedData.forEach(([numeroRifa, data]) => {
      fileContent += `Número ${numeroRifa}: ${data.nombre} | Tel: ${data.telefono || ''} | Vendido por: ${data.vendedor || ''}\n`;
    });
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lista_rifa_vendidos.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    setUser(null);
    setVendedor('');
    showNotification('Sesión cerrada.', 'success');
  };

  const renderTable = () => {
    const numRows = isMobile ? 20 : 10;
    const numCols = isMobile ? 5 : 10;
    let tableRows = [];
    for (let i = 0; i < numRows; i++) {
      let tableCols = [];
      for (let j = 0; j < numCols; j++) {
        const cellNumber = pageIndex * 100 + (i * numCols + j + 1);
        if (cellNumber > 300 || cellNumber < 1) continue;
        const isSold = soldNumbers.includes(cellNumber);
        const isSelected = currentNumber === cellNumber;
        tableCols.push(
          <td
            key={cellNumber}
            className={`rifa-cell ${isSold ? "sold" : ""} ${isSelected ? "selected" : ""}`}
            onClick={() => handleNumberClick(cellNumber)}
          >
            {cellNumber}
          </td>
        );
      }
      tableRows.push(<tr key={i}>{tableCols}</tr>);
    }
    return tableRows;
  };

  return (
    <>
      {/* Notificación flotante */}
      <div className={`custom-notification ${notification.type} ${notification.show ? 'show' : ''}`}>
        {notification.message}
      </div>

      {/* HEADER FUERA DEL CONTENEDOR PRINCIPAL */}
      <header className="title-container">
        <div className="logo-slot">
          <a href="/" aria-label="Inicio">
            <img
              src={`${process.env.PUBLIC_URL}/logotexto.png`}
              alt="Logotipo - Rifa"
              title="ICINF"
              style={{ maxHeight: '140px', maxWidth: '100%' }}
            />
          </a>
        </div>
        <h1 className="title-center">Rifa Solidaria Ingeniería Civil Informática</h1>
        <div className="login-slot">
          {user ? (
            <>
              <span style={{ fontWeight: 600, marginRight: 8 }}>Hola, {user.displayName || user.username}</span>
              <button className="carousel-button" onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : (
            <button className="carousel-button" onClick={() => navigate('/login')}>Iniciar sesión</button>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="rifa-container">
        <div className="rifa-content">
          <div className="rifa-table-wrapper">
            <table className="rifa-table">
              <tbody>{renderTable()}</tbody>
            </table>
          </div>

          <div className="rifa-controls">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="carousel-button" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>◀</button>
              <span className="sold-counter">{soldNumbers.length} / 300 Vendidos</span>
              <button className="carousel-button" onClick={() => setPageIndex((p) => Math.min(2, p + 1))} disabled={pageIndex === 2}>▶</button>
              
            </div>
            {user ? (
              <button onClick={handleDownloadList} className="download-button">Descargar Lista</button>
            ) : null}
          </div>

          {user ? (
            <form className="rifa-form">
              <h2>{currentNumber ? `Gestionar número ${currentNumber}` : "Selecciona un número"}</h2>
              <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} disabled={!currentNumber} />
              <input type="tel" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!currentNumber} />
              <input type="text" placeholder="Vendido por" value={vendedor} onChange={(e) => setVendedor(e.target.value)} disabled={!currentNumber || !!user} />
              <button type="button" onClick={handleSaveOrUpdate} disabled={!currentNumber || !name.trim() || !user}>
                {soldNumbers.includes(currentNumber) ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={handleDelete} disabled={!currentNumber || !soldNumbers.includes(currentNumber) || !user}>
                Eliminar (Liberar)
              </button>
            </form>
          ) : (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Rifa;
