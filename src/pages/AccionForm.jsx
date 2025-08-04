import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Table, Modal, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPartidoById } from '../services/partidoService';
import { 
  getAccionesByPartido, 
  createAccion, 
  updateAccion, 
  deleteAccion, 
  getAccionEnums 
} from '../services/accionService';

const AccionForm = () => {
  const { idPartido, id } = useParams();
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
  
  // Estados del formulario
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
  
  // Estados para la interfaz interactiva
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccionId, setSelectedAccionId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accionToDelete, setAccionToDelete] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(false);

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
        
        // Si hay un ID de acción, cargar esa acción para editar
        if (id) {
          const accionToEdit = accionesData.find(a => a.idAccion === parseInt(id));
          if (accionToEdit) {
            setFormData({
              idPartido: accionToEdit.idPartido,
              idPosesion: accionToEdit.idPosesion,
              equipoAccion: accionToEdit.equipoAccion,
              tipoAtaque: accionToEdit.tipoAtaque,
              origenAccion: accionToEdit.origenAccion,
              evento: accionToEdit.evento,
              detalleFinalizacion: accionToEdit.detalleFinalizacion || '',
              zonaLanzamiento: accionToEdit.zonaLanzamiento || '',
              detalleEvento: accionToEdit.detalleEvento || ''
            });
            setIsEditing(true);
            setSelectedAccionId(parseInt(id));
          }
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
  }, [idPartido, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await updateAccion(selectedAccionId, formData);
        setSuccess('Acción actualizada correctamente');
        setIsEditing(false);
        setSelectedAccionId(null);
      } else {
        await createAccion(formData);
        setSuccess('Acción creada correctamente');
        // Incrementar posesión automáticamente para el siguiente registro
        setFormData(prev => ({
          ...prev,
          idPosesion: prev.idPosesion + 1
        }));
      }
      
      // Recargar acciones
      const accionesData = await getAccionesByPartido(idPartido);
      setAcciones(accionesData);
      
      // Si no está en modo edición, limpiar algunos campos para la siguiente acción
      if (!isEditing) {
        setFormData(prev => ({
          ...prev,
          detalleFinalizacion: '',
          zonaLanzamiento: '',
          detalleEvento: ''
        }));
      }
    } catch (err) {
      setError('Error guardando la acción');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (accion) => {
    setFormData({
      idPartido: accion.idPartido,
      idPosesion: accion.idPosesion,
      equipoAccion: accion.equipoAccion,
      tipoAtaque: accion.tipoAtaque,
      origenAccion: accion.origenAccion,
      evento: accion.evento,
      detalleFinalizacion: accion.detalleFinalizacion || '',
      zonaLanzamiento: accion.zonaLanzamiento || '',
      detalleEvento: accion.detalleEvento || ''
    });
    setIsEditing(true);
    setSelectedAccionId(accion.idAccion);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedAccionId(null);
    setFormData({
      idPartido: parseInt(idPartido),
      idPosesion: acciones.length + 1,
      equipoAccion: 'LOCAL',
      tipoAtaque: 'Posicional',
      origenAccion: 'Juego_Continuado',
      evento: 'Gol',
      detalleFinalizacion: '',
      zonaLanzamiento: '',
      detalleEvento: ''
    });
  };

  const handleDelete = async (accionId) => {
    try {
      await deleteAccion(accionId);
      const accionesData = await getAccionesByPartido(idPartido);
      setAcciones(accionesData);
      setShowDeleteModal(false);
      setSuccess('Acción eliminada correctamente');
    } catch (err) {
      setError('Error eliminando la acción');
    }
  };

  const confirmDelete = (accion) => {
    setAccionToDelete(accion);
    setShowDeleteModal(true);
  };

  // Función para obtener el grid de zonas según el tipo de ataque
  const getZonasGrid = () => {
    if (formData.tipoAtaque === 'Posicional') {
      return [
        { id: 'Lanzamiento_Exterior', label: 'Exterior', zones: ['Izquierda', 'Centro', 'Derecha'] },
        { id: 'Pivote', label: 'Pivote', zones: ['Centro'] },
        { id: 'Penetracion', label: 'Penetración', zones: ['Izquierda', 'Centro', 'Derecha'] },
        { id: 'Extremo', label: 'Extremo', zones: ['Izquierda', 'Derecha'] },
        { id: '_7m', label: '7m', zones: ['_7m'] }
      ];
    } else {
      return [
        { id: 'Contragol', label: 'Contragol', zones: ['Izquierda', 'Centro', 'Derecha'] },
        { id: 'Primera_Oleada', label: '1ª Oleada', zones: ['Izquierda', 'Centro', 'Derecha'] },
        { id: 'Segunda_Oleada', label: '2ª Oleada', zones: ['Izquierda', 'Centro', 'Derecha'] },
        { id: 'Tercera_Oleada', label: '3ª Oleada', zones: ['Izquierda', 'Centro', 'Derecha'] }
      ];
    }
  };

  const handleZoneClick = (detalleFinalizacion, zona) => {
    setFormData(prev => ({
      ...prev,
      detalleFinalizacion: detalleFinalizacion,
      zonaLanzamiento: zona
    }));
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

  return (
    <Container fluid className="mt-3">
      {/* Header del partido */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  {partido.nombreEquipoLocal} vs {partido.nombreEquipoVisitante}
                </h4>
                <div>
                  <Button
                    variant={isLiveMode ? 'success' : 'outline-light'}
                    onClick={() => setIsLiveMode(!isLiveMode)}
                    className="me-2"
                  >
                    {isLiveMode ? 'MODO EN VIVO' : 'ACTIVAR MODO EN VIVO'}
                  </Button>
                  <Button 
                    variant="outline-light" 
                    onClick={() => navigate('/acciones')}
                  >
                    Volver
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Fecha:</strong> {new Date(partido.fecha).toLocaleDateString('es-ES')}</p>
                  <p><strong>Competición:</strong> {partido.competicion || 'No especificada'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Resultado:</strong> {partido.resultado || 'Por disputar'}</p>
                  <p><strong>Total de acciones:</strong> <Badge bg="primary">{acciones.length}</Badge></p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Formulario de acciones */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header style={{ backgroundColor: '#780000', color: 'white' }}>
              <h5 className="mb-0">
                {isEditing ? 'Editar Acción' : 'Registrar Nueva Acción'}
              </h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Posesión #</Form.Label>
                      <Form.Control
                        type="number"
                        name="idPosesion"
                        value={formData.idPosesion}
                        onChange={handleInputChange}
                        min="1"
                        required
                        disabled={isLiveMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Equipo</Form.Label>
                      <Form.Select
                        name="equipoAccion"
                        value={formData.equipoAccion}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="LOCAL">{partido.nombreEquipoLocal}</option>
                        <option value="VISITANTE">{partido.nombreEquipoVisitante}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Ataque</Form.Label>
                      <Form.Select
                        name="tipoAtaque"
                        value={formData.tipoAtaque}
                        onChange={handleInputChange}
                        required
                      >
                        {enums.tipoAtaque?.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Origen de la Acción</Form.Label>
                      <Form.Select
                        name="origenAccion"
                        value={formData.origenAccion}
                        onChange={handleInputChange}
                        required
                      >
                        {enums.origenAccion?.map(origen => (
                          <option key={origen} value={origen}>
                            {origen.replace('_', ' ')}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Evento</Form.Label>
                      <Form.Select
                        name="evento"
                        value={formData.evento}
                        onChange={handleInputChange}
                        required
                      >
                        {enums.evento?.map(evento => (
                          <option key={evento} value={evento}>
                            {evento.replace('_', ' ')}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Detalle del Evento</Form.Label>
                      <Form.Select
                        name="detalleEvento"
                        value={formData.detalleEvento}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccionar...</option>
                        {enums.detalleEvento?.map(detalle => (
                          <option key={detalle} value={detalle}>
                            {detalle.replace('_', ' ')}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Grid de la pista con imagen de fondo */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      Seleccionar Zona de Lanzamiento - {formData.tipoAtaque}
                    </h6>
                  </Card.Header>
                  <Card.Body style={{ 
                    backgroundImage: 'url(/pista_bm.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    minHeight: '400px',
                    position: 'relative'
                  }}>
                    <div className="position-relative" style={{ height: '100%' }}>
                      {getZonasGrid().map((finalizacion, index) => (
                        <div key={finalizacion.id} className="mb-2">
                          <h6 className="text-center mb-2 bg-white bg-opacity-75 rounded p-1">
                            {finalizacion.label}
                          </h6>
                          <Row className="justify-content-center">
                            {finalizacion.zones.map(zona => (
                              <Col key={zona} xs="auto" className="mb-2">
                                <Button
                                  variant={
                                    formData.detalleFinalizacion === finalizacion.id && 
                                    formData.zonaLanzamiento === zona 
                                      ? 'success' 
                                      : 'outline-primary'
                                  }
                                  size="sm"
                                  onClick={() => handleZoneClick(finalizacion.id, zona)}
                                  style={{
                                    backgroundColor: formData.detalleFinalizacion === finalizacion.id && 
                                                   formData.zonaLanzamiento === zona 
                                                     ? '#28a745' 
                                                     : 'rgba(255,255,255,0.8)',
                                    border: '2px solid #669bbc',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {zona.replace('_', ' ')}
                                </Button>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                {/* Selección actual */}
                {formData.detalleFinalizacion && formData.zonaLanzamiento && (
                  <Alert variant="info">
                    <strong>Selección actual:</strong> {formData.detalleFinalizacion.replace('_', ' ')} 
                    - {formData.zonaLanzamiento.replace('_', ' ')}
                  </Alert>
                )}

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    style={{ backgroundColor: '#669bbc', border: 'none' }}
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        {isEditing ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      isEditing ? 'Actualizar Acción' : 'Registrar Acción'
                    )}
                  </Button>
                  
                  {isEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancelar Edición
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Lista de acciones */}
        <Col lg={4}>
          <Card>
            <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
              <h6 className="mb-0">Acciones Registradas ({acciones.length})</h6>
            </Card.Header>
            <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {acciones.length === 0 ? (
                <p className="text-muted text-center">No hay acciones registradas</p>
              ) : (
                acciones.map((accion, index) => (
                  <Card key={accion.idAccion} className="mb-2" size="sm">
                    <Card.Body className="p-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <small>
                            <strong>#{accion.idPosesion}</strong> - {accion.equipoAccion} - {accion.evento}
                            <br />
                            {accion.tipoAtaque} | {accion.origenAccion.replace('_', ' ')}
                            {accion.detalleFinalizacion && (
                              <>
                                <br />
                                <Badge bg="secondary" className="me-1">
                                  {accion.detalleFinalizacion.replace('_', ' ')}
                                </Badge>
                                {accion.zonaLanzamiento && (
                                  <Badge bg="info">
                                    {accion.zonaLanzamiento.replace('_', ' ')}
                                  </Badge>
                                )}
                              </>
                            )}
                          </small>
                        </div>
                        <div className="d-flex flex-column gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(accion)}
                            style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => confirmDelete(accion)}
                            style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar esta acción?
          {accionToDelete && (
            <div className="mt-2">
              <strong>Posesión #{accionToDelete.idPosesion}</strong> - {accionToDelete.equipoAccion} - {accionToDelete.evento}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(accionToDelete.idAccion)}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccionForm;