import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth'; // Asegúrate de ajustar la ruta según tu estructura

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Llamada al servicio de login
      const data = await authService.login(email, password);
      // Guarda el token en localStorage
      localStorage.setItem('token', data.token);
      // Redirige al dashboard reemplazando la ruta actual
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error en el login:', error.response?.data);
      // Aquí podrías agregar un mensaje de error para el usuario
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Correo" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
