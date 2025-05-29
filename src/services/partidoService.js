import api from './api';  // Instancia de axios configurada con baseURL y token

export const getPartidos = async () => {
  //console.log('Llamando a GET /partidos');
  const res = await api.get('/partidos');
  //console.log('Respuesta /partidos:', res.data);
  return res;
};

export const getPartidoById = async (id) => {
  //console.log(`Llamando a GET /partidos/${id}`);
  const res = await api.get(`/partidos/${id}`);
  //console.log('Respuesta /partido por id:', res.data);
  return res;
};

export const createPartido = async (data) => {
  //console.log('Llamando a POST /partidos con datos:', data);
  const res = await api.post('/partidos', data);
  //console.log('Respuesta creación:', res.data);
  return res;
};

export const updatePartido = async (id, data) => {
  //console.log(`Llamando a PATCH /partidos/${id} con datos:`, data);
  const res = await api.patch(`/partidos/${id}`, data);
  //console.log('Respuesta actualización:', res.data);
  return res;
};

export const deletePartido = async (id) => {
  //console.log(`Llamando a DELETE /partidos/${id}`);
  const res = await api.delete(`/partidos/${id}`);
  //console.log('Partido eliminado');
  return res;
};

export const getEquiposDisponibles = async () => {
  //console.log('Llamando a GET /partidos/equipos-disponibles');
  const res = await api.get('/partidos/equipos-disponibles');
  //console.log('Equipos disponibles:', res.data);
  return res;
};
