import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPartidos } from '../services/partidoService';
import { 
  getAccionById, 
  createAccion, 
  updateAccion,
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

const AccionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [partidos, setPartidos] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  
  const [formData, setFormData] = useState({
    idPartido: '',
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const partidosRes = await getPartidos();
        setPartidos(partidosRes.data || []);
        
        if (isEditing) {
          const accionRes = await getAccionById(id);
          setFormData(accionRes.data);
        }
      } catch (err) {
        setError('Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);

  // Validación en tiempo real
  useEffect(() => {
    if (formData.evento && formData.detalleEvento) {
      const shouldChange = shouldChangePossession(formData.evento, formData.detalleEvento);
      setFormData(prev => ({
        ...prev,
        cambioPosesion: shouldChange
      }));
    }
  }, [formData.evento, formData.detalleEvento]);

  useEffect(() => {
    const errors = validateAction(formData);
    setValidationErrors(errors);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Limpiar campos dependientes
      if (field === 'tipoAtaque' || field === 'origenAccion') {
        updated.detalleFinalizacion = '';
      }
      
      if (field === 'evento') {
        updated.detalleEvento = '';
        if (value !== EVENTO.GOL && value !== EVENTO.LANZAMIENTO_PARADO && value !== EVENTO.LANZAMIENTO_FUERA) {
          updated.detalleFinalizacion = '';
          updated.zonaLanzamiento = '';
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateAction(formData);
    if (errors.length > 0) {
      setError('Por favor corrige los errores de validación');
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing) {
        await updateAccion(id, formData);
      } else {
        await createAccion(formData);
      }
      
      navigate('/acciones');
    } catch (err) {
      setError('Error guardando acción: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const isFieldRequired = (field) => {
    switch (field) {
      case 'detalleFinalizacion':
      case 'zonaLanzamiento':
        return [EVENTO.GOL, EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA].includes(formData.evento);
      case 'detalleEvento':
        return [EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA, EVENTO.PERDIDA].includes(formData.evento);
      default:
        return true;
    }
  };

  const shouldShowCourt = () => {
    return formData.evento && [EVENTO.GOL, EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA].includes(formData.evento);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
              <h4 className="mb-0">
                {isEditing ? 'Editar Acción' : 'Nueva Acción'}
              </h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}
              
              {validationErrors.length > 0 && (
                <Alert variant="warning" className="mb-3">
                  <ul className="mb-0">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Partido *</Form.Label>
                      <Form.Select
                        value={formData.idPartido}
                        onChange={(e) => handleChange('idPartido', parseInt(e.target.value))}
                        required
                      >
                        <option value="">Selecciona un partido</option>
                        {partidos.map(partido => (
                          <option key={partido.idPartido} value={partido.idPartido}>
                            {partido.nombreEquipoLocal} vs {partido.nombreEquipoVisitante}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Posesión *</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.idPosesion}
                        onChange={(e) => handleChange('idPosesion', parseInt(e.target.value))}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Equipo de Acción *</Form.Label>
                      <Form.Select
                        value={formData.equipoAccion}
                        onChange={(e) => handleChange('equipoAccion', e.target.value)}
                        required
                      >
                        <option value="">Selecciona equipo</option>
                        <option value={EQUIPO_ACCION.LOCAL}>Local</option>
                        <option value={EQUIPO_ACCION.VISITANTE}>Visitante</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Ataque *</Form.Label>
                      <Form.Select
                        value={formData.tipoAtaque}
                        onChange={(e) => handleChange('tipoAtaque', e.target.value)}
                        required
                      >
                        <option value="">Selecciona tipo</option>
                        <option value={TIPO_ATAQUE.POSICIONAL}>Posicional</option>
                        <option value={TIPO_ATAQUE.CONTRAATAQUE}>Contraataque</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Origen de la Acción *</Form.Label>
                      <Form.Select
                        value={formData.origenAccion}
                        onChange={(e) => handleChange('origenAccion', e.target.value)}
                        required
                      >
                        <option value="">Selecciona origen</option>
                        <option value={ORIGEN_ACCION.JUEGO_CONTINUADO}>Juego Continuado</option>
                        <option value={ORIGEN_ACCION.REBOTE_DIRECTO}>Rebote Directo</option>
                        <option value={ORIGEN_ACCION.REBOTE_INDIRECTO}>Rebote Indirecto</option>
                        <option value={ORIGEN_ACCION.SIETE_METROS}>7 Metros</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Evento *</Form.Label>
                      <Form.Select
                        value={formData.evento}
                        onChange={(e) => handleChange('evento', e.target.value)}
                        required
                      >
                        <option value="">Selecciona evento</option>
                        <option value={EVENTO.GOL}>Gol</option>
                        <option value={EVENTO.LANZAMIENTO_PARADO}>Lanzamiento Parado</option>
                        <option value={EVENTO.LANZAMIENTO_FUERA}>Lanzamiento Fuera</option>
                        <option value={EVENTO.PERDIDA}>Pérdida</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {isFieldRequired('detalleEvento') && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Detalle del Evento *</Form.Label>
                        <Form.Select
                          value={formData.detalleEvento}
                          onChange={(e) => handleChange('detalleEvento', e.target.value)}
                          required
                        >
                          <option value="">Selecciona detalle</option>
                          {getValidDetalleEvento(formData.evento).map(detalle => (
                            <option key={detalle} value={detalle}>{detalle}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {shouldShowCourt() && (
                  <Row>
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <HandballCourt
                          selectedZona={formData.zonaLanzamiento}
                          onZonaChange={(zona) => handleChange('zonaLanzamiento', zona)}
                          selectedDetalle={formData.detalleFinalizacion}
                          onDetalleChange={(detalle) => handleChange('detalleFinalizacion', detalle)}
                          tipoAtaque={formData.tipoAtaque}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Cambio de Posesión"
                        checked={formData.cambioPosesion}
                        onChange={(e) => handleChange('cambioPosesion', e.target.checked)}
                        disabled // Se calcula automáticamente
                      />
                      <Form.Text className="text-muted">
                        Se calcula automáticamente según las reglas
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#669bbc', border: 'none' }}
                    disabled={loading || validationErrors.length > 0}
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : (isEditing ? 'Actualizar' : 'Crear')}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/acciones')}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccionForm;