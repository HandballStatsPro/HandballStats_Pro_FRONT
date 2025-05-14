import api from './api';

export const getEquipos = async (userRole, userId) => {
  try {
    let endpoint;
    switch(userRole) {
      case 'Admin':
        endpoint = '/equipo';
        break;
      case 'GestorClub':
        endpoint = `/equipo?gestorId=${userId}`;
        break;
      case 'Entrenador':
        endpoint = `/equipo?entrenadorId=${userId}`;
        break;
      default:
        endpoint = '/equipo';
    }

    const res = await api.get(endpoint);

    const equipos = Array.isArray(res.data) ? res.data : [];
    
    return equipos;
    
  } catch (error) {
    return [];
  }
};

export const createEquipo = async (data) => {
  try {
    const res = await api.post('/equipo', data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creando equipo' };
  }
};

export const getEquipoById = async (id) => {
  try {
    const res = await api.get(`/equipo/${id}`);
    return res.data;
  } catch (error) {
    throw new Error('Equipo no encontrado');
  }
};

export const updateEquipo = async (id, data) => {
  try {
    const res = await api.patch(`/equipo/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error actualizando equipo' };
  }
};

export const deleteEquipo = async (id) => {
  try {
    await api.delete(`/equipo/${id}`);
  } catch (error) {
    throw error.response?.data || { message: 'Error eliminando equipo' };
  }
};

/** Buscar un usuario por email  */
export const findUserByEmail = async (email) => {
  const res = await api.get(`/usuarios/email?email=${encodeURIComponent(email)}`);
  return res.data;
};

/** Asignar un entrenador a un equipo por email */
export const assignEntrenadorByEmail = async (equipoId, email) => {
  // 1) Buscamos el usuario por email
  const user = await findUserByEmail(email);

  // 2) Validamos que tenga rol Entrenador
  if (user.rol !== 'Entrenador') {
    const err = new Error('El usuario no tiene rol Entrenador');
    err.code = 'not_entrenador';
    throw err;
  }

  // 3) Llamamos al endpoint con el idUsuario
  await api.post('/equipo/asignarUsuario', {
    idEquipo: equipoId,
    idUsuario: user.idUsuario
  });
};

export const removeEntrenador = async (equipoId, entrenadorId) => {
  try {
    await api.delete(`/equipo/${equipoId}/entrenadores/${entrenadorId}`);
  } catch (error) {
    throw error.response?.data || { message: 'Error eliminando entrenador' };
  }
};

export const getClubesDisponibles = async (userId) => {
  try {
    const res = await api.get(`/club?gestorId=${userId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error('Error obteniendo clubes');
  }
};