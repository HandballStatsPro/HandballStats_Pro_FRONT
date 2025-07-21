import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPartidoById } from '../services/partidoService';
import { 
  getAccionesByPartido, 
  createAccion, 
  EQUIPO_ACCION, 
  TIPO_ATAQUE, 
  ORIGEN_ACCION, 
  EVENTO, 
  getValidDetalleFinalizacion,
  getValidDetalleEvento,
  shouldChangePossession,
  validateAction
} from '../services/accionService';
import HandballCourt from '../components/HandballCourt';

const MatchActionsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [partido, setPartido] = useState(null);
  const [acciones, setAcciones] = useState([]);
  const [error, setError] = useState('');
  const [currentPosesion, setCurrentPosesion] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Estado del formulario de nueva acción
  const [newAction, setNewAction] = useState({
    idPartido: parseInt(id),
    idPosesion: 1,
    equipoAccion: '',
    tipoAtaque: '',
    origenAccion: '',
    evento: '',
    detalleFinalizacion: '',
    zonaLanzamiento: '',
    detalleEvento: '',
    cambioPosesion: false
  });
  
  const [formValidation, setFormValidation] = useState([]);
  const [showCourtSelector, setShowCourtSelector] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partidoRes, accionesRes] = await Promise.all([
          getPartidoById(id),
          getAccionesByPartido(id)
        ]);
        
        setPartido(partidoRes.data);
        setAcciones(accionesRes.data || []);
        
        // Calcular la posesión actual
        const ultimaAccion = accionesRes.data?.[accionesRes.data.length - 1];
        if (ultimaAccion) {
          setCurrentPosesion(ultimaAccion.cambioPosesion ? ultimaAccion.idPosesion + 1 : ultimaAccion.idPosesion);
        }
        
        setNewAction(prev => ({
          ...prev,
          idPosesion: currentPosesion
        }));
        
      } catch (err) {
        setError('Error cargando datos del partido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Actualizar cambio de posesión automáticamente
  useEffect(() => {
    if (newAction.evento && newAction.detalleEvento) {
      const shouldChange = shouldChangePossession(newAction.evento, newAction.detalleEvento);
      setNewAction(prev => ({
        ...prev,
        cambioPosesion: shouldChange
      }));
    }
  }, [newAction.evento, newAction.detalleEvento]);

  // Validar formulario en tiempo real
  useEffect(() => {
    const errors = validateAction(newAction);
    setFormValidation(errors);
  }, [newAction]);

  const handleFieldChange = (field, value) => {
    setNewAction(prev => {
      const updated = { ...prev, [field]: value };
      
      // Limpiar campos dependientes cuando cambian los campos principales
      if (field === 'tipoAtaque' || field === 'origenAccion') {
        updated.detalleFinalizacion = '';
      }
      
      if (field === 'evento') {
        updated.detalleEvento = '';
        updated.detalleFinalizacion = '';
        updated.zonaLanzamiento = '';
      }
      
      return updated;
    });
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setNewAction(prev => ({
      ...prev,
      equipoAccion: team,
      idPosesion: currentPosesion
    }));
  };

  const handleSubmitAction = async () => {
    try {
      const errors = validateAction(newAction);
      if (errors.length > 0) {
        setError(errors.join('. '));
        return;
      }

      await createAccion(newAction);
      
      // Recargar acciones
      const accionesRes = await getAccionesByPartido(id);
      setAcciones(accionesRes.data || []);
      
      // Actualizar posesión si cambió
      if (newAction.cambioPosesion) {
        setCurrentPosesion(prev => prev + 1);
      }
      
      // Resetear formulario
      setNewAction({
        idPartido: parseInt(id),
        idPosesion: newAction.cambioPosesion ? currentPosesion + 1 : currentPosesion,
        equipoAccion: '',
        tipoAtaque: '',
        origenAccion: '',
        evento: '',
        detalleFinalizacion: '',
        zonaLanzamiento: '',
        detalleEvento: '',
        cambioPosesion: false
      });
      
      setSelectedTeam(null);
      setShowCourtSelector(false);
      setError('');
      
    } catch (err) {
      setError('Error creando acción: ' + (err.response?.data?.message || err.message));
    }
  };

  const getAvailableOrigenAccion = () => {
    const lastAction = acciones[acciones.length - 1];
    
    if (!lastAction) {
      return [ORIGEN_ACCION.JUEGO_CONTINUADO];
    }
    
    if (lastAction.cambioPosesion) {
      return [ORIGEN_ACCION.JUEGO_CONTINUADO, ORIGEN_ACCION.SIETE_METROS];
    } else {
      return [ORIGEN_ACCION.REBOTE_DIRECTO, ORIGEN_ACCION.REBOTE_INDIRECTO];
    }
  };

  const isFieldRequired = (field) => {
    switch (field) {
      case 'detalleFinalizacion':
      case 'zonaLanzamiento':
        return [EVENTO.GOL, EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA].includes(newAction.evento);
      case 'detalleEvento':
        return [EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA, EVENTO.PERDIDA].includes(newAction.evento);
      default:
        return true;
    }
  };

  const shouldShowCourtSelector = () => {
    return newAction.evento && [EVENTO.GOL, EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA].includes(newAction.evento);
  };

  useEffect(() => {
    setShowCourtSelector(shouldShowCourtSelector());
  }, [newAction.evento]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando partido...</p>
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

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col xs={12}>
          <Card className="mb-4">
            <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
              <h4 className="mb-0">
                {partido.nombreEquipoLocal} vs {partido.nombreEquipoVisitante}
              </h4>
              <small>
                {partido.fecha} - {partido.competicion || 'Sin competición'}
                {partido.resultado && ` - Resultado: ${partido.resultado}`}
              </small>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Posesión actual: {currentPosesion}</strong>
                  <br />
                  <small className="text-muted">
                    Total de acciones: {acciones.length}
                  </small>
                </div>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/partidos')}
                >
                  Volver a Partidos
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Equipo Local */}
        <Col md={6}>
          <Card 
            className={`team-card ${selectedTeam === EQUIPO_ACCION.LOCAL ? 'selected' : ''}`}
            style={{ 
              minHeight: '300px',
              border: selectedTeam === EQUIPO_ACCION.LOCAL ? '3px solid #669bbc' : '1px solid #dee2e6',
              backgroundColor: selectedTeam === EQUIPO_ACCION.LOCAL ? '#f8f9fa' : 'white'
            }}
          >
            <Card.Header 
              style={{ 
                backgroundColor: '#669bbc', 
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => handleTeamSelect(EQUIPO_ACCION.LOCAL)}
            >
              <h5 className="mb-0">
                {partido.nombreEquipoLocal}
                <Badge bg="light" text="dark" className="ms-2">LOCAL</Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {selectedTeam === EQUIPO_ACCION.LOCAL && (
                <div className="action-form">
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Ataque</Form.Label>
                    <Form.Select
                      value={newAction.tipoAtaque}
                      onChange={(e) => handleFieldChange('tipoAtaque', e.target.value)}
                      required
                    >
                      <option value="">Selecciona tipo de ataque</option>
                      <option value={TIPO_ATAQUE.POSICIONAL}>Posicional</option>
                      <option value={TIPO_ATAQUE.CONTRAATAQUE}>Contraataque</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Origen de la Acción</Form.Label>
                    <Form.Select
                      value={newAction.origenAccion}
                      onChange={(e) => handleFieldChange('origenAccion', e.target.value)}
                      required
                    >
                      <option value="">Selecciona origen</option>
                      {getAvailableOrigenAccion().map(origen => (
                        <option key={origen} value={origen}>{origen}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Evento</Form.Label>
                    <Form.Select
                      value={newAction.evento}
                      onChange={(e) => handleFieldChange('evento', e.target.value)}
                      required
                    >
                      <option value="">Selecciona evento</option>
                      <option value={EVENTO.GOL}>Gol</option>
                      <option value={EVENTO.LANZAMIENTO_PARADO}>Lanzamiento Parado</option>
                      <option value={EVENTO.LANZAMIENTO_FUERA}>Lanzamiento Fuera</option>
                      <option value={EVENTO.PERDIDA}>Pérdida</option>
                    </Form.Select>
                  </Form.Group>

                  {isFieldRequired('detalleEvento') && (
                    <Form.Group className="mb-3">
                      <Form.Label>Detalle del Evento</Form.Label>
                      <Form.Select
                        value={newAction.detalleEvento}
                        onChange={(e) => handleFieldChange('detalleEvento', e.target.value)}
                        required
                      >
                        <option value="">Selecciona detalle</option>
                        {getValidDetalleEvento(newAction.evento).map(detalle => (
                          <option key={detalle} value={detalle}>{detalle}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Equipo Visitante */}
        <Col md={6}>
          <Card 
            className={`team-card ${selectedTeam === EQUIPO_ACCION.VISITANTE ? 'selected' : ''}`}
            style={{ 
              minHeight: '300px',
              border: selectedTeam === EQUIPO_ACCION.VISITANTE ? '3px solid #780000' : '1px solid #dee2e6',
              backgroundColor: selectedTeam === EQUIPO_ACCION.VISITANTE ? '#f8f9fa' : 'white'
            }}
          >
            <Card.Header 
              style={{ 
                backgroundColor: '#780000', 
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => handleTeamSelect(EQUIPO_ACCION.VISITANTE)}
            >
              <h5 className="mb-0">
                {partido.nombreEquipoVisitante}
                <Badge bg="light" text="dark" className="ms-2">VISITANTE</Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {selectedTeam === EQUIPO_ACCION.VISITANTE && (
                <div className="action-form">
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Ataque</Form.Label>
                    <Form.Select
                      value={newAction.tipoAtaque}
                      onChange={(e) => handleFieldChange('tipoAtaque', e.target.value)}
                      required
                    >
                      <option value="">Selecciona tipo de ataque</option>
                      <option value={TIPO_ATAQUE.POSICIONAL}>Posicional</option>
                      <option value={TIPO_ATAQUE.CONTRAATAQUE}>Contraataque</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Origen de la Acción</Form.Label>
                    <Form.Select
                      value={newAction.origenAccion}
                      onChange={(e) => handleFieldChange('origenAccion', e.target.value)}
                      required
                    >
                      <option value="">Selecciona origen</option>
                      {getAvailableOrigenAccion().map(origen => (
                        <option key={origen} value={origen}>{origen}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Evento</Form.Label>
                    <Form.Select
                      value={newAction.evento}
                      onChange={(e) => handleFieldChange('evento', e.target.value)}
                      required
                    >
                      <option value="">Selecciona evento</option>
                      <option value={EVENTO.GOL}>Gol</option>
                      <option value={EVENTO.LANZAMIENTO_PARADO}>Lanzamiento Parado</option>
                      <option value={EVENTO.LANZAMIENTO_FUERA}>Lanzamiento Fuera</option>
                      <option value={EVENTO.PERDIDA}>Pérdida</option>
                    </Form.Select>
                  </Form.Group>

                  {isFieldRequired('detalleEvento') && (
                    <Form.Group className="mb-3">
                      <Form.Label>Detalle del Evento</Form.Label>
                      <Form.Select
                        value={newAction.detalleEvento}
                        onChange={(e) => handleFieldChange('detalleEvento', e.target.value)}
                        required
                      >
                        <option value="">Selecciona detalle</option>
                        {getValidDetalleEvento(newAction.evento).map(detalle => (
                          <option key={detalle} value={detalle}>{detalle}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Selector de cancha */}
      {showCourtSelector && selectedTeam && (
        <Row className="mt-4">
          <Col xs={12}>
            <Card>
              <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
                <h6 className="mb-0">Selección de Zona y Detalle</h6>
              </Card.Header>
              <Card.Body>
                <HandballCourt
                  selectedZona={newAction.zonaLanzamiento}
                  onZonaChange={(zona) => handleFieldChange('zonaLanzamiento', zona)}
                  selectedDetalle={newAction.detalleFinalizacion}
                  onDetalleChange={(detalle) => handleFieldChange('detalleFinalizacion', detalle)}
                  tipoAtaque={newAction.tipoAtaque}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Errores y botones de acción */}
      {error && (
        <Row className="mt-3">
          <Col xs={12}>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {formValidation.length > 0 && (
        <Row className="mt-3">
          <Col xs={12}>
            <Alert variant="warning">
              <ul className="mb-0">
                {formValidation.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          </Col>
        </Row>
      )}

      {selectedTeam && (
        <Row className="mt-3">
          <Col xs={12} className="text-center">
            <Button
              style={{ backgroundColor: '#669bbc', border: 'none' }}
              onClick={handleSubmitAction}
              disabled={formValidation.length > 0 || !newAction.evento}
              size="lg"
            >
              Registrar Acción
            </Button>
            <Button
              variant="outline-secondary"
              className="ms-3"
              onClick={() => {
                setSelectedTeam(null);
                setNewAction({
                  idPartido: parseInt(id),
                  idPosesion: currentPosesion,
                  equipoAccion: '',
                  tipoAtaque: '',
                  origenAccion: '',
                  evento: '',
                  detalleFinalizacion: '',
                  zonaLanzamiento: '',
                  detalleEvento: '',
                  cambioPosesion: false
                });
              }}
            >
              Cancelar
            </Button>
          </Col>
        </Row>
      )}

      {/* Resumen de acciones recientes */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card>
            <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
              <h6 className="mb-0">Acciones Recientes</h6>
            </Card.Header>
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {acciones.length === 0 ? (
                <p className="text-muted">No hay acciones registradas</p>
              ) : (
                acciones.slice(-10).reverse().map((accion, index) => (
                  <div key={accion.idAccion} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                    <div>
                      <Badge bg={accion.equipoAccion === 'LOCAL' ? 'primary' : 'danger'}>
                        {accion.equipoAccion}
                      </Badge>
                      <span className="ms-2">{accion.evento}</span>
                      <small className="text-muted ms-2">Pos: {accion.idPosesion}</small>
                    </div>
                    <div>
                      <Badge bg={accion.cambioPosesion ? 'success' : 'warning'}>
                        {accion.cambioPosesion ? 'Cambio' : 'Continúa'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MatchActionsView;