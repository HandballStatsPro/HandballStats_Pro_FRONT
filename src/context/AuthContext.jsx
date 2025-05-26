import { createContext, useContext, useState } from 'react';
import { login as loginReq, register as registerReq } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async ({ email, contraseña }) => {
    try {
      const { token, usuario } = await loginReq(email, contraseña);

      // Guardar token
      localStorage.setItem('token', token);

      // Mapear avatarBase64 → avatar Data‑URL
      const avatarDataUrl = usuario.avatarBase64
        ? `data:image/png;base64,${usuario.avatarBase64}`
        : null;

      // Actualizar estado de usuario
      setUser({
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        fechaRegistro: usuario.fechaRegistro,
        avatar: avatarDataUrl
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión',
        code: error.response?.data?.code || 'unknown_error'
      };
    }
  };

  const register = async ({ nombre, email, contraseña, avatarBase64 }) => {
    try {

      const { token, usuario } = await registerReq({
        nombre,
        email,
        contraseña,
        avatarBase64
      });

      // Guardar token
      localStorage.setItem('token', token);

      // Mapear avatarBase64 → avatar Data‑URL
      const avatarDataUrl = usuario.avatarBase64
        ? `data:image/png;base64,${usuario.avatarBase64}`
        : null;

      // Actualizar estado de usuario
      setUser({
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        fechaRegistro: usuario.fechaRegistro,
        avatar: avatarDataUrl
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el registro',
        code: error.response?.data?.code || 'registration_failed'
      };
    }
  };

  const updateAvatar = newDataUrl => {
    setUser(prev => ({
      ...prev,
      avatar: newDataUrl
    }));
  };


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateAvatar }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
