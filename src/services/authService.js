import api from './api';

export const login = async (email, contraseña) => {
  const res = await api.post('api/auth/login', { email, contraseña });
  return res.data;
};

export const register = async (nombre, email, contraseña) => {
  try {
    const res = await api.post('/api/auth/registro', { nombre, email, contraseña });
    return res.data;
  } catch (error) {
    throw error; 
  }
};