import api from './api';

// --- Llamadas a la API (sin cambios) ---
export const getAcciones = async () => api.get('/acciones');
export const getAccionById = async (id) => api.get(`/acciones/${id}`);
export const getAccionesByPartido = async (idPartido) => api.get(`/acciones/partido/${idPartido}`);
export const createAccion = async (data) => api.post('/acciones', data);
export const updateAccion = async (id, data) => api.patch(`/acciones/${id}`, data);
export const deleteAccion = async (id) => api.delete(`/acciones/${id}`);

// --- Enums y Constantes (sin cambios) ---
export const EQUIPO_ACCION = { LOCAL: 'LOCAL', VISITANTE: 'VISITANTE' };
export const TIPO_ATAQUE = { POSICIONAL: 'Posicional', CONTRAATAQUE: 'Contraataque' };
export const ORIGEN_ACCION = { JUEGO_CONTINUADO: 'Juego_Continuado', REBOTE_DIRECTO: 'Rebote_directo', REBOTE_INDIRECTO: 'Rebote_indirecto', SIETE_METROS: '_7m' };
export const EVENTO = { GOL: 'Gol', LANZAMIENTO_PARADO: 'Lanzamiento_Parado', LANZAMIENTO_FUERA: 'Lanzamiento_Fuera', PERDIDA: 'Perdida' };
export const DETALLE_FINALIZACION = { LANZAMIENTO_EXTERIOR: 'Lanzamiento_Exterior', PIVOTE: 'Pivote', PENETRACION: 'Penetracion', EXTREMOS: 'Extremos', SIETE_METROS: '_7m', CONTRAGOL: 'Contragol', PRIMERA_OLEADA: '_1a_oleada', SEGUNDA_OLEADA: '_2a_oleada', TERCERA_OLEADA: '_3a_oleada' };
export const ZONA_LANZAMIENTO = { IZQUIERDA: 'Izquierda', CENTRO: 'Centro', DERECHA: 'Derecha' };
export const DETALLE_EVENTO = { PARADA_PORTERO: 'Parada_Portero', BLOQUEO_DEFENSOR: 'Bloqueo_Defensor', PALO: 'Palo', FUERA_DIRECTO: 'Fuera_Directo', PASOS: 'Pasos', DOBLES: 'Dobles', FALTA_ATAQUE: 'FaltaAtaque', PASIVO: 'Pasivo', INVASION_AREA: 'InvasionArea', ROBO: 'Robo', PIE: 'Pie', BALON_FUERA: 'BalonFuera' };


// --- NUEVAS FUNCIONES DE LÓGICA PREVENTIVA ---

/**
 * Devuelve los tipos de ataque válidos según el origen.
 * Regla: Un 7m siempre es un ataque posicional.
 */
export const getValidTipoAtaque = (origenAccion) => {
  if (origenAccion === ORIGEN_ACCION.SIETE_METROS) {
    return [TIPO_ATAQUE.POSICIONAL];
  }
  return [TIPO_ATAQUE.POSICIONAL, TIPO_ATAQUE.CONTRAATAQUE];
};

/**
 * Devuelve los detalles de evento válidos para un evento principal.
 */
export const getValidDetalleEvento = (evento) => {
  switch (evento) {
    case EVENTO.LANZAMIENTO_PARADO:
      return [DETALLE_EVENTO.PARADA_PORTERO, DETALLE_EVENTO.BLOQUEO_DEFENSOR];
    case EVENTO.LANZAMIENTO_FUERA:
      return [DETALLE_EVENTO.PALO, DETALLE_EVENTO.FUERA_DIRECTO];
    case EVENTO.PERDIDA:
      return [DETALLE_EVENTO.PASOS, DETALLE_EVENTO.DOBLES, DETALLE_EVENTO.FALTA_ATAQUE, DETALLE_EVENTO.PASIVO, DETALLE_EVENTO.INVASION_AREA, DETALLE_EVENTO.ROBO, DETALLE_EVENTO.PIE, DETALLE_EVENTO.BALON_FUERA];
    default:
      return [];
  }
};

/**
 * Determina si la posesión debe cambiar según el evento y su detalle.
 */
export const shouldChangePossession = (evento, detalleEvento) => {
  if (evento === EVENTO.LANZAMIENTO_PARADO) {
    return false; // Ni parada ni bloqueo cambian la posesión
  }
  if (evento === EVENTO.LANZAMIENTO_FUERA && detalleEvento === DETALLE_EVENTO.PALO) {
    return false; // Un palo no cambia la posesión
  }
  return true; // El resto de eventos sí cambian la posesión
};

// La antigua función `validateAction` se elimina, ya que la lógica ahora estará en la UI.