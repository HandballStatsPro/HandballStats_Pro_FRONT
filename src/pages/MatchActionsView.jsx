import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
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
  getValidTipoAtaque,
  getValidDetalleEvento,
  shouldChangePossession,
} from '../services/accionService';
import CourtGridSelector from '../components/CourtGridSelector';

const initialActionState = {
    idPartido: 0,
    idPosesion: 1,
    equipoAccion: '',
    tipoAtaque: '',
    origenAccion: ORIGEN_ACCION.JUEGO_CONTINUADO,
    evento: '',
    detalleFinalizacion: '',
    zonaLanzamiento: '',
    detalleEvento: '',
    cambioPosesion: false
};

const MatchActionsView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [partido, setPartido] = useState(null);
    const [acciones, setAcciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPosesion, setCurrentPosesion] = useState(1);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const [newAction, setNewAction] = useState({
        ...initialActionState,
        idPartido: parseInt(id)
    });

    const isActionComplete = useMemo(() => {
        if (!newAction.equipoAccion || !newAction.tipoAtaque || !newAction.origenAccion || !newAction.evento) {
            return false;
        }

        if ([EVENTO.GOL, EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA].includes(newAction.evento)) {
            if (!newAction.detalleFinalizacion || !newAction.zonaLanzamiento) return false;
        }

        if ([EVENTO.PERDIDA, EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA].includes(newAction.evento)) {
            if (!newAction.detalleEvento) return false;
        }

        if (newAction.origenAccion === ORIGEN_ACCION.SIETE_METROS && newAction.tipoAtaque !== TIPO_ATAQUE.POSICIONAL) {
            return false;
        }

        return true;
    }, [newAction]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const [partidoRes, accionesRes] = await Promise.all([ getPartidoById(id), getAccionesByPartido(id) ]);
            setPartido(partidoRes.data);
            const loadedAcciones = accionesRes.data || [];
            setAcciones(loadedAcciones);
    
            const ultimaAccion = loadedAcciones[loadedAcciones.length - 1];
            const newPosesion = ultimaAccion ? (ultimaAccion.cambioPosesion ? ultimaAccion.idPosesion + 1 : ultimaAccion.idPosesion) : 1;
            setCurrentPosesion(newPosesion);
            setNewAction(prev => ({ ...prev, idPosesion: newPosesion }));
    
          } catch (err) {
            setError('Error cargando datos del partido');
          } finally {
            setLoading(false);
          }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (newAction.evento && newAction.detalleEvento) {
            const shouldChange = shouldChangePossession(newAction.evento, newAction.detalleEvento);
            setNewAction(prev => ({ ...prev, cambioPosesion: shouldChange }));
        }
    }, [newAction.evento, newAction.detalleEvento]);

    const handleFieldChange = (field, value) => {
        setNewAction(prev => {
            let updated = { ...prev, [field]: value };

            if (field === 'origenAccion') {
                updated.tipoAtaque = '';
            }
            if (field === 'tipoAtaque') {
                updated.evento = '';
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
        setNewAction(prev => ({ ...prev, equipoAccion: team, idPosesion: currentPosesion }));
    };

    const handleSubmitAction = async () => {
        if (!isActionComplete) {
            setError("Faltan campos obligatorios por seleccionar.");
            return;
        }
        setError('');

        try {
            await createAccion(newAction);
            const accionesRes = await getAccionesByPartido(id);
            const updatedAcciones = accionesRes.data || [];
            setAcciones(updatedAcciones);

            const newPosesionValue = newAction.cambioPosesion ? currentPosesion + 1 : currentPosesion;
            setCurrentPosesion(newPosesionValue);

            setNewAction({
                ...initialActionState,
                idPartido: parseInt(id),
                idPosesion: newPosesionValue
            });
            setSelectedTeam(null);
        } catch (err) {
            setError('Error al guardar la acción: ' + (err.response?.data?.message || err.message));
        }
    };
    
    const getAvailableOrigenAccion = () => {
        const lastAction = acciones[acciones.length - 1];
        if (!lastAction || lastAction.cambioPosesion) {
          return [ORIGEN_ACCION.JUEGO_CONTINUADO, ORIGEN_ACCION.SIETE_METROS];
        } else {
          return [ORIGEN_ACCION.REBOTE_DIRECTO, ORIGEN_ACCION.REBOTE_INDIRECTO];
        }
      };
    
      const shouldShowGridSelector = () => {
        return newAction.evento &&
          newAction.tipoAtaque &&
          [EVENTO.GOL, EVENTO.LANZAMIENTO_PARADO, EVENTO.LANZAMIENTO_FUERA].includes(newAction.evento);
      };
    
      const handleGridSelection = (zona, detalle) => {
        handleFieldChange('zonaLanzamiento', zona);
        handleFieldChange('detalleFinalizacion', detalle);
      };

    if (loading) return <div className="text-center mt-5"><Spinner /></div>;

    return (
        <Container fluid className="mt-3">
            <Row>
                <Col xs={12}>
                <Card className="mb-4">
                    <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
                        <h4 className="mb-0">{partido.nombreEquipoLocal} vs {partido.nombreEquipoVisitante}</h4>
                        <small>{new Date(partido.fecha).toLocaleDateString()} - {partido.competicion || 'Sin competición'}{partido.resultado && ` - Resultado: ${partido.resultado}`}</small>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Posesión actual: {currentPosesion}</strong><br />
                                <small className="text-muted">Total de acciones: {acciones.length}</small>
                            </div>
                            <Button variant="outline-secondary" onClick={() => navigate('/partidos')}>Volver a Partidos</Button>
                        </div>
                    </Card.Body>
                </Card>
                </Col>
            </Row>

            <Row>
                {[EQUIPO_ACCION.LOCAL, EQUIPO_ACCION.VISITANTE].map(teamType => (
                    <Col md={6} key={teamType}>
                        <Card 
                            className={`team-card ${selectedTeam === teamType ? 'selected' : ''}`} 
                            style={{
                                minHeight: '300px',
                                border: selectedTeam === teamType ? `3px solid ${teamType === EQUIPO_ACCION.LOCAL ? '#669bbc' : '#780000'}` : '1px solid #dee2e6',
                                backgroundColor: selectedTeam === teamType ? '#f8f9fa' : 'white',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Card.Header style={{backgroundColor: teamType === EQUIPO_ACCION.LOCAL ? '#669bbc' : '#780000', color: 'white', cursor: 'pointer'}} onClick={() => handleTeamSelect(teamType)}>
                                <h5 className="mb-0">{teamType === EQUIPO_ACCION.LOCAL ? partido.nombreEquipoLocal : partido.nombreEquipoVisitante} <Badge bg="light" text="dark" className="ms-2">{teamType}</Badge></h5>
                            </Card.Header>
                            <Card.Body>
                                {selectedTeam === teamType && (
                                    <div className="action-form">
                                        <div>
                                            <h5 className="mb-2">Origen</h5>
                                            {getAvailableOrigenAccion().map(origen => (
                                                <Button key={origen} variant={newAction.origenAccion === origen ? "info" : "outline-info"} onClick={() => handleFieldChange('origenAccion', origen)} className="me-2 mb-2">{origen.replace(/_/g, ' ')}</Button>
                                            ))}
                                        </div>

                                        {newAction.origenAccion && (
                                            <div className="mt-3">
                                                <h5 className="mb-2">Tipo de Ataque</h5>
                                                {getValidTipoAtaque(newAction.origenAccion).map(tipo => (
                                                    <Button key={tipo} variant={newAction.tipoAtaque === tipo ? "primary" : "outline-primary"} onClick={() => handleFieldChange('tipoAtaque', tipo)} className="me-2 mb-2">{tipo}</Button>
                                                ))}
                                            </div>
                                        )}

                                        {newAction.tipoAtaque && (
                                            <div className="mt-3">
                                                <h5 className="mb-2">Evento</h5>
                                                {Object.values(EVENTO).map(evento => (<Button key={evento} variant={newAction.evento === evento ? "success" : "outline-success"} onClick={() => handleFieldChange('evento', evento)} className="me-2 mb-2">{evento.replace(/_/g, ' ')}</Button>))}
                                            </div>
                                        )}

                                        {newAction.evento && getValidDetalleEvento(newAction.evento).length > 0 && (
                                            <div className="mt-3">
                                                <h5 className="mb-2">Detalle del Evento</h5>
                                                {getValidDetalleEvento(newAction.evento).map(detalle => (
                                                    <Button key={detalle} variant={newAction.detalleEvento === detalle ? "warning" : "outline-warning"} onClick={() => handleFieldChange('detalleEvento', detalle)} className="me-2 mb-2">{detalle.replace(/_/g, ' ')}</Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {shouldShowGridSelector() && (
                <Row className="mt-4">
                    <Col xs={12}>
                        <Card>
                            <Card.Header>
                                <h6 className="mb-0">Define la Finalización</h6>
                            </Card.Header>
                            <Card.Body>
                                <CourtGridSelector 
                                    onSelection={handleGridSelection} 
                                    tipoAtaque={newAction.tipoAtaque} 
                                    selectedDetalle={newAction.detalleFinalizacion} 
                                    selectedZona={newAction.zonaLanzamiento} 
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
            
            <div className="mt-3">
                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            </div>

            {selectedTeam && (
                <Row className="mt-3">
                    <Col xs={12} className="text-center">
                        <Button
                            style={{ backgroundColor: '#669bbc', border: 'none', padding: '12px 30px' }}
                            onClick={handleSubmitAction}
                            disabled={!isActionComplete}
                            size="lg"
                        >
                            Registrar Acción
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            className="ms-3" 
                            size="lg" 
                            onClick={() => { 
                                setSelectedTeam(null); 
                                setNewAction({ 
                                    ...initialActionState, 
                                    idPartido: parseInt(id), 
                                    idPosesion: currentPosesion 
                                }); 
                            }}
                        >
                            Cancelar
                        </Button>
                    </Col>
                </Row>
            )}

            <Row className="mt-5">
                <Col xs={12}>
                    <Card>
                        <Card.Header style={{ backgroundColor: '#669bbc', color: 'white' }}>
                            <h6 className="mb-0">Acciones Recientes (últimas 10)</h6>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {acciones.length === 0 ? (
                                <p className="text-muted">No hay acciones registradas</p>
                            ) : (
                                [...acciones].reverse().slice(0, 10).map((accion) => (
                                <div key={accion.idAccion} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                    <div>
                                        <span className="me-2 fw-bold">P:{accion.idPosesion}</span>
                                        <Badge bg={accion.equipoAccion === 'LOCAL' ? 'primary' : 'danger'}>
                                            {accion.equipoAccion.slice(0, 3)}
                                        </Badge>
                                        <span className="ms-2">{accion.evento.replace(/_/g, ' ')}</span>
                                        {accion.detalleFinalizacion && <small className="text-muted ms-2 fst-italic">{`(${accion.detalleFinalizacion.replace(/_/g, ' ')})`}</small>}
                                    </div>
                                    <div>
                                        <Badge bg={accion.cambioPosesion ? 'success' : 'warning'}>
                                            {accion.cambioPosesion ? 'Cambio Posesión' : 'Mantiene Posesión'}
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