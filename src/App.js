
import './App.css';
import Rifa from './Components/Rifa/Rifa.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Rifa />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
