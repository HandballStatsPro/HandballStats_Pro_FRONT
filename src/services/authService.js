import api from './api';

export const login = async (email, contraseña) => {
  try {
    console.log('[DEBUG] login() - Email:', email);
    const res = await api.post('/api/auth/login', { email, contraseña });
    console.log('[DEBUG] login() - Response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('[ERROR][authService] Login:', {
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message
    });
    throw error;
  }
};


export const register = async (userData) => { // Recibir un objeto
  try {

    const res = await api.post('/api/auth/registro', userData); // Enviar el objeto directamente

    return res.data;
  } catch (error) {
    throw error;
  }
};