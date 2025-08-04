import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPartidoById } from '../services/partidoService';
import { 
  getAccionesByPartido, 
  createAccion, 
  deleteAccion, 
  getAccionEnums 
} from '../services/accionService';

const AccionForm = () => {
  const { idPartido } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partido, setPartido] = useState(null);
  const [acciones, setAcciones] = useState([]);
  const [enums, setEnums] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados del formulario - siempre en modo rápido
  const [formData, setFormData] = useState({
    idPartido: parseInt(idPartido),
    idPosesion: 1,
    equipoAccion: 'LOCAL',
    tipoAtaque: 'Posicional',
    origenAccion: 'Juego_Continuado',
    evento: 'Gol',
    detalleFinalizacion: '',
    zonaLanzamiento: '',
    detalleEvento: ''
  });
  
  // Estado para el equipo actual (se cambia automáticamente)
  const [equipoActual, setEquipoActual] = useState('LOCAL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar partido
        const partidoRes = await getPartidoById(idPartido);
        setPartido(partidoRes.data);
        
        // Cargar acciones existentes
        const accionesData = await getAccionesByPartido(idPartido);
        setAcciones(accionesData);
        
        // Cargar enums
        const enumsData = await getAccionEnums();
        setEnums(enumsData);
        
        // Configurar próxima posesión y equipo
        if (accionesData.length > 0) {
          const ultimaAccion = accionesData[accionesData.length - 1];
          const proximaPosesion = ultimaAccion.idPosesion + 1;
          // Cambiar equipo si la última acción tuvo cambio de posesión
          const proximoEquipo = ultimaAccion.cambioPosesion ? 
            (ultimaAccion.equipoAccion === 'LOCAL' ? 'VISITANTE' : 'LOCAL') :
            ultimaAccion.equipoAccion;
          
          setFormData(prev => ({
            ...prev,
            idPosesion: proximaPosesion,
            equipoAccion: proximoEquipo
          }));
          setEquipoActual(proximoEquipo);
        }
      } catch (err) {
        setError('Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    if (idPartido) {
      fetchData();
    }
  }, [idPartido]);

  // Función para cambiar valores rápidamente
  const setQuickValue = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para seleccionar zona rápidamente
  const selectZone = (detalleFinalizacion, zona) => {
    setFormData(prev => ({
      ...prev,
      detalleFinalizacion: detalleFinalizacion,
      zonaLanzamiento: zona
    }));
  };

  // Función para registrar acción rápidamente
  const registrarAccionRapida = async () => {
    if (!formData.detalleFinalizacion || !formData.zonaLanzamiento) {
      setError('Selecciona zona de lanzamiento');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await createAccion(formData);
      
      // Recargar acciones
      const accionesData = await getAccionesByPartido(idPartido);
      setAcciones(accionesData);
      
      // Preparar siguiente acción
      const nuevaAccion = accionesData[accionesData.length - 1];
      const proximaPosesion = nuevaAccion.idPosesion + 1;
      const proximoEquipo = nuevaAccion.cambioPosesion ? 
        (nuevaAccion.equipoAccion === 'LOCAL' ? 'VISITANTE' : 'LOCAL') :
        nuevaAccion.equipoAccion;

      setFormData({
        idPartido: parseInt(idPartido),
        idPosesion: proximaPosesion,
        equipoAccion: proximoEquipo,
        tipoAtaque: 'Posicional', // Reset a default
        origenAccion: 'Juego_Continuado', // Reset a default
        evento: 'Gol', // Reset a default
        detalleFinalizacion: '',
        zonaLanzamiento: '',
        detalleEvento: ''
      });

      setEquipoActual(proximoEquipo);
      setSuccess(`Acción registrada. Turno: ${proximoEquipo === 'LOCAL' ? partido.nombreEquipoLocal : partido.nombreEquipoVisitante}`);
      
      // Limpiar mensaje de éxito después de 2 segundos
      setTimeout(() => setSuccess(''), 2000);
      
    } catch (err) {
      setError('Error guardando la acción');
    } finally {
      setSaving(false);
    }
  };

  // Función para eliminar acción rápidamente
  const eliminarAccionRapida = async (accionId) => {
    try {
      await deleteAccion(accionId);
      const accionesData = await getAccionesByPartido(idPartido);
      setAcciones(accionesData);
      
      // Reajustar posesión si es necesario
      if (accionesData.length > 0) {
        const ultimaAccion = accionesData[accionesData.length - 1];
        const proximaPosesion = ultimaAccion.idPosesion + 1;
        const proximoEquipo = ultimaAccion.cambioPosesion ? 
          (ultimaAccion.equipoAccion === 'LOCAL' ? 'VISITANTE' : 'LOCAL') :
          ultimaAccion.equipoAccion;
        
        setFormData(prev => ({
          ...prev,
          idPosesion: proximaPosesion,
          equipoAccion: proximoEquipo
        }));
        setEquipoActual(proximoEquipo);
      } else {
        setFormData(prev => ({
          ...prev,
          idPosesion: 1,
          equipoAccion: 'LOCAL'
        }));
        setEquipoActual('LOCAL');
      }
    } catch (err) {
      setError('Error eliminando la acción');
    }
  };

  // Obtener configuración de zonas según tipo de ataque
  const getZonasGrid = () => {
    if (formData.tipoAtaque === 'Posicional') {
      return [
        { id: 'Lanzamiento_Exterior', label: 'EXTERIOR', zones: ['Izquierda', 'Centro', 'Derecha'], color: '#007bff' },
        { id: 'Pivote', label: 'PIVOTE', zones: ['Centro'], color: '#28a745' },
        { id: 'Penetracion', label: 'PENETRACIÓN', zones: ['Izquierda', 'Centro', 'Derecha'], color: '#ffc107' },
        { id: 'Extremo', label: 'EXTREMO', zones: ['Izquierda', 'Derecha'], color: '#dc3545' },
        { id: '_7m', label: '7M', zones: ['_7m'], color: '#6f42c1' }
      ];
    } else {
      return [
        { id: 'Contragol', label: 'CONTRAGOL', zones: ['Izquierda', 'Centro', 'Derecha'], color: '#20c997' },
        { id: 'Primera_Oleada', label: '1ª OLEADA', zones: ['Izquierda', 'Centro', 'Derecha'], color: '#fd7e14' },
        { id: 'Segunda_Oleada', label: '2ª OLEADA', zones: ['Izquierda', 'Centro', 'Derecha'], color: '#e83e8c' },
        { id: 'Tercera_Oleada', label: '3ª OLEADA', zones: ['Izquierda', 'Centro', 'Derecha'], color: '#6610f2' }
      ];
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando datos del partido...</p>
      </div>
    );
  }

  if (!partido) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Partido no encontrado</Alert>
      </Container>
    );
  }

  const equipoEnTurno = equipoActual === 'LOCAL' ? partido.nombreEquipoLocal : partido.nombreEquipoVisitante;

  return (
    <Container fluid className="mt-3">
      {/* Header del partido con info del turno */}
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Header style={{ 
              backgroundColor: equipoActual === 'LOCAL' ? '#669bbc' : '#780000', 
              color: 'white' 
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  {partido.nombreEquipoLocal} vs {partido.nombreEquipoVisitante}
                </h4>
                <div className="d-flex align-items-center gap-3">
                  <Badge bg="light" text="dark" style={{ fontSize: '1.2rem', padding: '8px 15px' }}>
                    Posesión #{formData.idPosesion}
                  </Badge>
                  <Badge bg="warning" text="dark" style={{ fontSize: '1.2rem', padding: '8px 15px' }}>
                    TURNO: {equipoEnTurno}
                  </Badge>
                  <Button 
                    variant="outline-light" 
                    onClick={() => navigate('/acciones')}
                  >
                    Volver
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="py-2">
              <Row>
                <Col>
                  <span className="fw-bold">Total acciones: </span>
                  <Badge bg="primary">{acciones.length}</Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        {/* Panel de controles rápidos */}
        <Col lg={8}>
          <Card className="mb-3">
            <Card.Header style={{ backgroundColor: '#343a40', color: 'white' }}>
              <h5 className="mb-0">⚡ REGISTRO RÁPIDO DE ACCIONES</h5>
            </Card.Header>
            <Card.Body>
              
              {/* Tipo de Ataque */}
              <Row className="mb-3">
                <Col>
                  <h6>TIPO DE ATAQUE:</h6>
                  <div className="d-flex gap-2">
                    {enums.tipoAtaque?.map(tipo => (
                      <Button
                        key={tipo}
                        size="lg"
                        onClick={() => setQuickValue('tipoAtaque', tipo)}
                        variant={formData.tipoAtaque === tipo ? 'primary' : 'outline-primary'}
                        style={{ minWidth: '150px' }}
                      >
                        {tipo}
                      </Button>
                    ))}
                  </div>
                </Col>
              </Row>

              {/* Origen de la Acción */}
              <Row className="mb-3">
                <Col>
                  <h6>ORIGEN:</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {enums.origenAccion?.map(origen => (
                      <Button
                        key={origen}
                        onClick={() => setQuickValue('origenAccion', origen)}
                        variant={formData.origenAccion === origen ? 'success' : 'outline-success'}
                        style={{ minWidth: '120px' }}
                      >
                        {origen.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </Col>
              </Row>

              {/* Evento */}
              <Row className="mb-3">
                <Col>
                  <h6>EVENTO:</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {enums.evento?.map(evento => (
                      <Button
                        key={evento}
                        size="lg"
                        onClick={() => setQuickValue('evento', evento)}
                        variant={formData.evento === evento ? 'warning' : 'outline-warning'}
                        style={{ minWidth: '140px' }}
                      >
                        {evento.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </Col>
              </Row>

              {/* Grid de la pista */}
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">🎯 SELECCIONA ZONA - {formData.tipoAtaque}</h6>
                </Card.Header>
                <Card.Body style={{ 
                  backgroundImage: 'url(/pista_bm.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  minHeight: '350px',
                  position: 'relative'
                }}>
                  <div className="position-relative">
                    {getZonasGrid().map((finalizacion, index) => (
                      <div key={finalizacion.id} className="mb-3">
                        <div className="text-center mb-2">
                          <Badge 
                            bg="dark" 
                            style={{ 
                              fontSize: '0.9rem', 
                              padding: '5px 10px',
                              backgroundColor: finalizacion.color + '!important'
                            }}
                          >
                            {finalizacion.label}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          {finalizacion.zones.map(zona => (
                            <Button
                              key={zona}
                              size="lg"
                              onClick={() => selectZone(finalizacion.id, zona)}
                              style={{
                                minWidth: '120px',
                                backgroundColor: 
                                  formData.detalleFinalizacion === finalizacion.id && 
                                  formData.zonaLanzamiento === zona 
                                    ? finalizacion.color 
                                    : 'rgba(255,255,255,0.9)',
                                border: `3px solid ${finalizacion.color}`,
                                color: formData.detalleFinalizacion === finalizacion.id && 
                                       formData.zonaLanzamiento === zona 
                                         ? 'white' 
                                         : finalizacion.color,
                                fontWeight: 'bold',
                                fontSize: '1rem'
                              }}
                            >
                              {zona.replace('_', ' ')}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Botón de registro */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={registrarAccionRapida}
                  disabled={saving || !formData.detalleFinalizacion || !formData.zonaLanzamiento}
                  style={{ 
                    backgroundColor: '#28a745', 
                    border: 'none',
                    fontSize: '1.3rem',
                    padding: '15px 40px',
                    minWidth: '250px'
                  }}
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      REGISTRANDO...
                    </>
                  ) : (
                    '✅ REGISTRAR ACCIÓN'
                  )}
                </Button>
              </div>

              {/* Selección actual */}
              {formData.detalleFinalizacion && formData.zonaLanzamiento && (
                <Alert variant="info" className="mt-3 text-center">
                  <strong>📍 Selección:</strong> {formData.detalleFinalizacion.replace('_', ' ')} 
                  - {formData.zonaLanzamiento.replace('_', ' ')}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Lista de acciones recientes */}
        <Col lg={4}>
          <Card>
            <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
              <h6 className="mb-0">📋 ÚLTIMAS ACCIONES ({acciones.length})</h6>
            </Card.Header>
            <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {acciones.length === 0 ? (
                <p className="text-muted text-center">No hay acciones registradas</p>
              ) : (
                acciones.slice().reverse().map((accion, index) => (
                  <Card key={accion.idAccion} className="mb-2" size="sm">
                    <Card.Body className="p-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ fontSize: '0.85rem' }}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Badge bg={accion.equipoAccion === 'LOCAL' ? 'primary' : 'danger'}>
                              #{accion.idPosesion}
                            </Badge>
                            <strong>{accion.equipoAccion}</strong>
                            <Badge bg="secondary">{accion.evento}</Badge>
                          </div>
                          <div>
                            {accion.tipoAtaque} | {accion.origenAccion.replace('_', ' ')}
                          </div>
                          {accion.detalleFinalizacion && (
                            <div className="mt-1">
                              <Badge bg="info" className="me-1">
                                {accion.detalleFinalizacion.replace('_', ' ')}
                              </Badge>
                              {accion.zonaLanzamiento && (
                                <Badge bg="warning">
                                  {accion.zonaLanzamiento.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => eliminarAccionRapida(accion.idAccion)}
                          style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                        >
                          ✕
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccionForm;