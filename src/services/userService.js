import api from './api';

// Obtener usuario actual (propio perfil)
export const getCurrentUser = async () => {
  try {
    const res = await api.get('/api/auth/me');
    
    return {
      ...res.data,
      avatar: res.data.avatarBase64 
        ? `data:image/*;base64,${res.data.avatarBase64}` // Soporta todos los tipos de imagen
        : null
    };
  } catch (error) {
    console.error('[ERROR][userService] Error obteniendo usuario actual:', error);
    throw error;
  }
};

// Listar todos los usuarios (Admin)
export const getUsers = async () => {
  try {
    const res = await api.get('/usuarios');

    return (res.data || []).map(u => ({
      ...u,
      avatar: u.avatarBase64 
        ? `data:image/*;base64,${u.avatarBase64}` // Campo correcto del backend
        : null
    }));
  } catch (error) {
    console.error('[ERROR][userService] Error listando usuarios:', error);
    return [];
  }
};

// Obtener usuario por ID
export const getUserById = async id => {
  try {
    const res = await api.get(`/usuarios/${id}`);


    return {
      ...res.data,
      avatar: res.data.avatarBase64 
        ? `data:image/*;base64,${res.data.avatarBase64}` 
        : null
    };
  } catch (error) {
    console.error(`[ERROR][userService] Error obteniendo usuario ${id}:`, error);
    throw error;
  }
};

// Actualizar usuario (incluido avatar)
export const updateUser = async (id, data) => {
  try {
    // Extraer base64 puro del Data URL (si existe)
    const avatarBase64 = data.avatarBase64 || (
      data.avatar?.includes('base64,')
        ? data.avatar.split('base64,')[1]
        : data.avatar
    );


    const res = await api.patch(`/usuarios/${id}`, {
      ...data,
      avatarBase64 // Usar nombre de campo del DTO
    });

    
    return {
      ...res.data,
      avatarBase64: res.data.avatarBase64,
      avatar: res.data.avatarBase64
        ? `data:image/png;base64,${res.data.avatarBase64}`
        : null
    };
  } catch (error) {
    console.error('[ERROR][userService] Error actualizando usuario:', {
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message
    });
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async id => {
  try {
    await api.delete(`/usuarios/${id}`);
    return true;
  } catch (error) {
    throw error;
  }
};