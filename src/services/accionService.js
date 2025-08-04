import api from './api';

// Obtener todas las acciones de un partido específico
export const getAccionesByPartido = async (idPartido) => {
  const res = await api.get(`/acciones/partido/${idPartido}`);
  return res.data;
};

// Obtener una acción específica por ID
export const getAccionById = async (id) => {
  const res = await api.get(`/acciones/${id}`);
  return res.data;
};

// Crear una nueva acción
export const createAccion = async (accionData) => {
  const res = await api.post('/acciones', accionData);
  return res.data;
};

// Actualizar una acción existente
export const updateAccion = async (id, accionData) => {
  const res = await api.put(`/acciones/${id}`, accionData);
  return res.data;
};

// Eliminar una acción
export const deleteAccion = async (id) => {
  await api.delete(`/acciones/${id}`);
};

// Obtener los valores de enums para formularios
export const getAccionEnums = async () => {
  const res = await api.get('/acciones/enums');
  return res.data;
};