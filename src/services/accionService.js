import api from './api';

export const getAcciones = async () => {
  const res = await api.get('/acciones');
  return res;
};

export const getAccionById = async (id) => {
  const res = await api.get(`/acciones/${id}`);
  return res;
};

export const getAccionesByPartido = async (idPartido) => {
  const res = await api.get(`/acciones/partido/${idPartido}`);
  return res;
};

export const createAccion = async (data) => {
  const res = await api.post('/acciones', data);
  return res;
};

export const updateAccion = async (id, data) => {
  const res = await api.patch(`/acciones/${id}`, data);
  return res;
};

export const deleteAccion = async (id) => {
  const res = await api.delete(`/acciones/${id}`);
  return res;
};

// Enums y constantes para validación
export const EQUIPO_ACCION = {
  LOCAL: 'LOCAL',
  VISITANTE: 'VISITANTE'
};

export const TIPO_ATAQUE = {
  POSICIONAL: 'Posicional',
  CONTRAATAQUE: 'Contraataque'
};

export const ORIGEN_ACCION = {
  JUEGO_CONTINUADO: 'Juego_Continuado',
  REBOTE_DIRECTO: 'Rebote_directo',
  REBOTE_INDIRECTO: 'Rebote_indirecto',
  SIETE_METROS: '_7m'
};

export const EVENTO = {
  GOL: 'Gol',
  LANZAMIENTO_PARADO: 'Lanzamiento_Parado',
  LANZAMIENTO_FUERA: 'Lanzamiento_Fuera',
  PERDIDA: 'Perdida'
};

export const DETALLE_FINALIZACION = {
  LANZAMIENTO_EXTERIOR: 'Lanzamiento_Exterior',
  PIVOTE: 'Pivote',
  PENETRACION: 'Penetracion',
  EXTREMOS: 'Extremos',
  SIETE_METROS: '_7m',
  CONTRAGOL: 'Contragol',
  PRIMERA_OLEADA: '_1a_oleada',
  SEGUNDA_OLEADA: '_2a_oleada',
  TERCERA_OLEADA: '_3a_oleada'
};

export const ZONA_LANZAMIENTO = {
  IZQUIERDA: 'Izquierda',
  CENTRO: 'Centro',
  DERECHA: 'Derecha'
};

export const DETALLE_EVENTO = {
  // Para Lanzamiento_Parado
  PARADA_PORTERO: 'Parada_Portero',
  BLOQUEO_DEFENSOR: 'Bloqueo_Defensor',
  // Para Lanzamiento_Fuera
  PALO: 'Palo',
  FUERA_DIRECTO: 'Fuera_Directo',
  // Para Perdida
  PASOS: 'Pasos',
  DOBLES: 'Dobles',
  FALTA_ATAQUE: 'FaltaAtaque',
  PASIVO: 'Pasivo',
  INVASION_AREA: 'InvasionArea',
  ROBO: 'Robo',
  PIE: 'Pie',
  BALON_FUERA: 'BalonFuera'
};

// Funciones de validación basadas en las reglas del backend
export const getValidDetalleFinalizacion = (tipoAtaque, origenAccion) => {
  if (origenAccion === ORIGEN_ACCION.SIETE_METROS) {
    return [DETALLE_FINALIZACION.SIETE_METROS];
  }
  
  if (tipoAtaque === TIPO_ATAQUE.CONTRAATAQUE) {
    return [
      DETALLE_FINALIZACION.CONTRAGOL,
      DETALLE_FINALIZACION.PRIMERA_OLEADA,
      DETALLE_FINALIZACION.SEGUNDA_OLEADA,
      DETALLE_FINALIZACION.TERCERA_OLEADA
    ];
  }
  
  if (tipoAtaque === TIPO_ATAQUE.POSICIONAL) {
    return [
      DETALLE_FINALIZACION.LANZAMIENTO_EXTERIOR,
      DETALLE_FINALIZACION.PIVOTE,
      DETALLE_FINALIZACION.PENETRACION,
      DETALLE_FINALIZACION.EXTREMOS,
      DETALLE_FINALIZACION.SIETE_METROS
    ];
  }
  
  return [];
};

export const getValidDetalleEvento = (evento) => {
  switch (evento) {
    case EVENTO.LANZAMIENTO_PARADO:
      return [DETALLE_EVENTO.PARADA_PORTERO, DETALLE_EVENTO.BLOQUEO_DEFENSOR];
    case EVENTO.LANZAMIENTO_FUERA:
      return [DETALLE_EVENTO.PALO, DETALLE_EVENTO.FUERA_DIRECTO];
    case EVENTO.PERDIDA:
      return [
        DETALLE_EVENTO.PASOS,
        DETALLE_EVENTO.DOBLES,
        DETALLE_EVENTO.FALTA_ATAQUE,
        DETALLE_EVENTO.PASIVO,
        DETALLE_EVENTO.INVASION_AREA,
        DETALLE_EVENTO.ROBO,
        DETALLE_EVENTO.PIE,
        DETALLE_EVENTO.BALON_FUERA
      ];
    default:
      return [];
  }
};

export const shouldChangePossession = (evento, detalleEvento) => {
  if (evento === EVENTO.LANZAMIENTO_PARADO && 
      (detalleEvento === DETALLE_EVENTO.PARADA_PORTERO || detalleEvento === DETALLE_EVENTO.BLOQUEO_DEFENSOR)) {
    return false;
  }
  
  if (evento === EVENTO.LANZAMIENTO_FUERA && detalleEvento === DETALLE_EVENTO.PALO) {
    return false;
  }
  
  return true;
};

export const validateAction = (action) => {
  const errors = [];
  
  // Regla 1: Caso especial de 7 metros
  if (action.origenAccion === ORIGEN_ACCION.SIETE_METROS) {
    if (action.detalleFinalizacion !== DETALLE_FINALIZACION.SIETE_METROS) {
      errors.push('Si el origen es 7m, el detalle de finalización debe ser 7m');
    }
    if (action.tipoAtaque !== TIPO_ATAQUE.POSICIONAL) {
      errors.push('Si el origen es 7m, el tipo de ataque debe ser Posicional');
    }
  }
  
  // Regla 2: Lógica del tipo de ataque
  if (action.tipoAtaque === TIPO_ATAQUE.CONTRAATAQUE) {
    const validDetails = [
      DETALLE_FINALIZACION.CONTRAGOL,
      DETALLE_FINALIZACION.PRIMERA_OLEADA,
      DETALLE_FINALIZACION.SEGUNDA_OLEADA,
      DETALLE_FINALIZACION.TERCERA_OLEADA
    ];
    if (!validDetails.includes(action.detalleFinalizacion)) {
      errors.push('Para contraataque, el detalle de finalización debe ser contragol u oleada');
    }
  }
  
  // Regla 3: Lógica del evento principal
  if (action.evento === EVENTO.GOL) {
    if (!action.detalleFinalizacion || !action.zonaLanzamiento) {
      errors.push('Para gol son obligatorios detalle de finalización y zona de lanzamiento');
    }
    if (action.detalleEvento) {
      errors.push('Para gol no debe haber detalle de evento');
    }
  }
  
  if (action.evento === EVENTO.PERDIDA) {
    if (action.detalleFinalizacion || action.zonaLanzamiento) {
      errors.push('Para pérdida no debe haber detalle de finalización ni zona de lanzamiento');
    }
    if (!action.detalleEvento) {
      errors.push('Para pérdida es obligatorio el detalle de evento');
    }
  }
  
  return errors;
};