import api from './api';

/** Listar clubes */
export const getClubs = async (userRole, userId) => {
  const endpoint = userRole === 'Admin' 
    ? '/club' 
    : `/club?gestorId=${userId}`;
  const res = await api.get(endpoint);
  return Array.isArray(res.data) ? res.data : [];
};

/** Crear un nuevo club */
export const createClub = (clubData) =>
  api.post('/club', clubData).then((r) => r.data);

/** Obtener un club por ID */
export const getClubById = (id) =>
  api.get(`/club/${id}`).then((r) => {
    const d = r.data;
    return {
      ...d,
      fechaCreacionClub: d.fechaCreacionClub?.split('T')[0] || '',
    };
  });

/** Actualizar un club */
export const updateClub = (id, data) => {
  const payload = {
    ...data,
    fechaCreacionClub: data.fechaCreacionClub + 'T00:00:00',
  };
  return api.patch(`/club/${id}`, payload).then((r) => r.data);
};

/** Eliminar un club */
export const deleteClub = (id) =>
  api.delete(`/club/${id}`).then((r) => r.data);

/** = FUNCIONES PARA GESTORES = */

/** Traer todos los gestores */
export const getAllGestores = async () => {
  const res = await api.get('/usuarios/gestores');
  return Array.isArray(res.data) ? res.data : [];
};

/** Asignar un gestor a un club */
export const assignGestor = async (clubId, gestorId) => {
  await api.post('/club/asignarUsuario', {
    idClub: clubId,
    idUsuario: gestorId,
  });
};

/** Desvincular un gestor de un club */
export const removeGestor = async (clubId, gestorId) => {
  await api.delete(`/club/${clubId}/gestores/${gestorId}`);
};

/** Buscar un usuario por email  */
export const findUserByEmail = async (email) => {
  const res = await api.get(`/usuarios/email?email=${encodeURIComponent(email)}`);
  return res.data;
};

/** Buscar y asignar por email solo si es GestorClub */
export const assignGestorByEmail = async (clubId, email) => {
  const user = await findUserByEmail(email);
  if (user.rol !== 'GestorClub') {
    const err = new Error('El usuario no tiene rol GestorClub');
    err.code = 'not_gestor';
    throw err;
  }
  await assignGestor(clubId, user.idUsuario);
};
