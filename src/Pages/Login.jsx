import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const USERS = [
  { username: 'edu', password: 'edu33827..', displayName: 'Eduardo' },
  { username: 'Diego', password: 'Diego2025', displayName: 'Diego' },
  { username: 'Karen', password: 'Karen2025', displayName: 'Karen' },
  { username: 'Sebastian', password: 'Sebastian2025', displayName: 'Sebastian' }
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    setError('');
    const found = USERS.find(u => u.username === username && u.password === password);
    if (found) {
      setUser({ username: found.username, displayName: found.displayName });
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div style={{padding: 20}}>
      <h2>Iniciar sesión</h2>
      <div style={{display: 'flex', gap: 8}}>
        <input placeholder="usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Entrar</button>
      </div>
      {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
    </div>
  );
};

export default Login;
