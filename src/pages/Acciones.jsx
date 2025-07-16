import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Container, Alert, Form, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAcciones, deleteAccion } from '../services/accionService';
import { getPartidos } from '../services/partidoService';

const Acciones = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [acciones, setAcciones] = useState([]);
    const [partidos, setPartidos] = useState([]);
    const [error, setError] = useState('');
    const [selectedPartido, setSelectedPartido] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accionesRes, partidosRes] = await Promise.all([
                    getAcciones(),
                    getPartidos()
                ]);
                setAcciones(accionesRes.data || []);
                setPartidos(partidosRes.data || []);
            } catch (err) {
                setError('Error cargando acciones');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta acción?')) return;
        try {
            await deleteAccion(id);
            setAcciones(prev => prev.filter(a => a.idAccion !== id));
        } catch (err) {
            setError('Error eliminando acción');
        }
    };

    const getPartidoName = (idPartido) => {
        const partido = partidos.find(p => p.idPartido === idPartido);
        return partido ? `${partido.nombreEquipoLocal} vs ${partido.nombreEquipoVisitante}` : 'Partido no encontrado';
    };

    const getEventoBadge = (evento) => {
        const colors = {
            'Gol': 'success',
            'Lanzamiento_Parado': 'warning',
            'Lanzamiento_Fuera': 'danger',
            'Perdida': 'secondary'
        };
        return <Badge bg={colors[evento] || 'primary'}>{evento}</Badge>;
    };

    const accionesFiltradas = selectedPartido
        ? acciones.filter(a => a.idPartido === Number(selectedPartido))
        : acciones;

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p>Cargando acciones...</p>
            </div>
        );
    }

    return (
        <Container className="mt-5">
            <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
                Gestión de Acciones
            </h2>

            <div className="mt-4">
                <Row className="justify-content-center align-items-center g-3">
                    <Col xs={12} md={6} lg={4}>
                        <Form.Group controlId="filterPartido">
                            <Form.Label className="fw-bold">Filtrar por partido:</Form.Label>
                            <Form.Select
                                value={selectedPartido}
                                onChange={(e) => setSelectedPartido(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    border: '2px solid #669bbc',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Todos los partidos</option>
                                {partidos.map(partido => (
                                    <option key={partido.idPartido} value={partido.idPartido}>
                                        {getPartidoName(partido.idPartido)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={4}>
                        {['Admin', 'GestorClub', 'Entrenador'].includes(user.rol) && (
                            <Button
                                onClick={() => navigate('/acciones/new')}
                                style={{
                                    backgroundColor: '#669bbc',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    padding: '10px 25px',
                                    width: '100%'
                                }}
                            >
                                Nueva Acción
                            </Button>
                        )}
                    </Col>
                </Row>
            </div>

            {error ? (
                <Alert variant="danger" className="text-center mt-3">
                    {error}
                </Alert>
            ) : accionesFiltradas.length === 0 ? (
                <div className="text-center mt-4">No se encontraron acciones</div>
            ) : (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    overflowX: 'auto',
                    marginTop: '20px'
                }}>
                    <Table responsive striped hover className="mb-0">
                        <thead style={{ backgroundColor: '#669bbc', color: 'white' }}>
                            <tr>
                                <th>ID</th>
                                <th>Partido</th>
                                <th>Posesión</th>
                                <th>Equipo</th>
                                <th>Evento</th>
                                <th>Tipo Ataque</th>
                                <th>Origen</th>
                                <th>Cambio Posesión</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accionesFiltradas.map(accion => (
                                <tr key={accion.idAccion}>
                                    <td>{accion.idAccion}</td>
                                    <td>{getPartidoName(accion.idPartido)}</td>
                                    <td>{accion.idPosesion}</td>
                                    <td>
                                        <Badge bg={accion.equipoAccion === 'LOCAL' ? 'primary' : 'info'}>
                                            {accion.equipoAccion}
                                        </Badge>
                                    </td>
                                    <td>{getEventoBadge(accion.evento)}</td>
                                    <td>{accion.tipoAtaque}</td>
                                    <td>{accion.origenAccion}</td>
                                    <td>
                                        <Badge bg={accion.cambioPosesion ? 'success' : 'warning'}>
                                            {accion.cambioPosesion ? 'Sí' : 'No'}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            size="sm"
                                            className="me-2"
                                            style={{
                                                backgroundColor: '#669bbc',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontWeight: '500',
                                            }}
                                            onClick={() => navigate(`/acciones/${accion.idAccion}`)}
                                        >
                                            Ver
                                        </Button>
                                        {['Admin', 'GestorClub', 'Entrenador'].includes(user.rol) && (
                                            <Button
                                                size="sm"
                                                style={{
                                                    backgroundColor: '#780000',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: '500',
                                                }}
                                                onClick={() => handleDelete(accion.idAccion)}
                                            >
                                                Eliminar
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default Acciones;