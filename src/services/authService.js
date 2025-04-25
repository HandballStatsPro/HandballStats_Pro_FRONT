import api from './api';

export const login = async (email, contraseña) => {
  const res = await api.post('/auth/login', { email, contraseña });
  return res.data;
};

export const register = async (nombre, email, contraseña) => {
  const res = await api.post('/auth/registro', { nombre, email, contraseña });
  return res.data;
};