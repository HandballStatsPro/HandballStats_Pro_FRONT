import api from './api';

// Obtener usuario actual (propio perfil)
export const getCurrentUser = async () => {
  const res = await api.get('/api/auth/me');
  return res.data;
};

export const getUsers = async () => {
  try {
    const res = await api.get('/usuarios');
    return res.data || []; 
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Obtener usuario por ID
export const getUserById = async id => {
  const res = await api.get(`/usuarios/${id}`);
  return res.data;
};

// Actualizar usuario
export const updateUser = async (id, data) => {
  const res = await api.patch(`/usuarios/${id}`, data);
  return res.data;
};

// Eliminar usuario
export const deleteUser = async id => {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data;
};