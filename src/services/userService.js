import api from './api';

export const getUsers = async () => {
  const res = await api.get('/usuarios');
  return res.data;
};

export const getUserById = async id => {
  const res = await api.get(`/usuarios/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.patch(`/usuarios/${id}`, data);
  return res.data;
};

export const deleteUser = async id => {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data;
};