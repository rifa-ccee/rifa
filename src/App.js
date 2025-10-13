
import './App.css';
import Rifa from './Components/Rifa/Rifa.jsx';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Rifa />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
