import { createContext, useContext, useState } from 'react';
import { login as loginReq, register as registerReq } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async ({ email, contraseña }) => {
    try {
      const data = await loginReq(email, contraseña);
      localStorage.setItem('token', data.token);
      setUser(data.usuario);
      return { success: true };
    } catch (error) {
      return { 
        success: false,
        message: error.response?.data?.message || 'Error de conexión',
        code: error.response?.data?.code || 'unknown_error'
      };
    }
  };

  const register = async ({ nombre, email, contraseña }) => {
    try {
      const result = await registerReq(nombre, email, contraseña);
      localStorage.setItem('token', result.token);
      setUser(result.usuario);      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el registro',
        code: error.response?.data?.code || 'registration_failed'
      };
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);