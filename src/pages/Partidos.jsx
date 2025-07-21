import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Container, Alert, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPartidos, deletePartido, getEquiposDisponibles } from '../services/partidoService';
import { getEquipos } from '../services/equipoService';

const Partidos = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [partidos, setPartidos] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [error, setError] = useState('');
    const [selectedEquipo, setSelectedEquipo] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, eRes] = await Promise.all([getPartidos(), getEquipos()]);
                setPartidos(pRes.data || []);
                setEquipos(eRes || []); // <-- Solución: Quita el .data
            } catch (err) {
                setError('Error cargando datos');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEdit = (id) => navigate(`/partidos/${id}`);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este partido?')) return;
        try {
            await deletePartido(id);
            // Actualizamos el estado local para que el cambio se refleje al instante
            setPartidos(prev => prev.filter(p => p.idPartido !== id));
        } catch (err) {
            setError('Error eliminando partido');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const renderUsuarioRegistro = (idUsuarioRegistro) => {
        return idUsuarioRegistro === 0 ? 'Desconocido' : idUsuarioRegistro;
    };

    // --- CAMBIO EN LA LÓGICA DE FILTRADO ---
    // Ahora filtra si el equipo seleccionado es local O visitante
    const partidosFiltrados = selectedEquipo
        ? partidos.filter(p => 
            p.idEquipoLocalAsociado === Number(selectedEquipo) || 
            p.idEquipoVisitanteAsociado === Number(selectedEquipo)
          )
        : partidos;

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p>Cargando partidos...</p>
            </div>
        );
    }

    return (
        <Container className="mt-5">
            <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
                Gestión de Partidos
            </h2>

            <div className="mt-4">
                <Row className="justify-content-center align-items-center g-3">
                    <Col xs={12} md={6} lg={4}>
                        <Form.Group controlId="filterEquipo">
                            <Form.Label className="fw-bold">Filtrar por equipo:</Form.Label>
                            <Form.Select
                                value={selectedEquipo}
                                onChange={(e) => setSelectedEquipo(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    border: '2px solid #669bbc',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Todos mis equipos</option>
                                {equipos.map(equipo => (
                                    <option key={equipo.idEquipo} value={equipo.idEquipo}>
                                        {equipo.nombre} ({equipo.temporada})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={4}>
                        <Button
                            onClick={() => navigate('/partidos/new')}
                            style={{
                                backgroundColor: '#669bbc',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                padding: '10px 25px',
                                width: '100%'
                            }}
                        >
                            Nuevo Partido
                        </Button>
                    </Col>
                </Row>
            </div>

            {error ? (
                <Alert variant="danger" className="text-center mt-3">{error}</Alert>
            ) : partidosFiltrados.length === 0 ? (
                <div className="text-center mt-4">No se encontraron partidos</div>
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
                                {user.rol === 'Admin' && <th>ID</th>}
                                {/* --- CAMBIO EN LAS CABECERAS --- */}
                                <th>Equipo Local</th>
                                <th>Equipo Visitante</th>
                                <th>Competición</th>
                                <th>Fecha</th>
                                <th>Resultado</th>
                                {user.rol === 'Admin' && <th>Registrado por</th>}
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partidosFiltrados.map(p => (
                                <tr key={p.idPartido}>
                                    {user.rol === 'Admin' && <td>{p.idPartido}</td>}
                                    {/* --- CAMBIO EN LAS CELDAS --- */}
                                    <td>{p.nombreEquipoLocal}</td>
                                    <td>{p.nombreEquipoVisitante}</td>
                                    <td>{p.competicion || '-'}</td>
                                    <td>{formatDate(p.fecha)}</td>
                                    <td>{p.resultado || '-'}</td>
                                    {user.rol === 'Admin' && <td>{renderUsuarioRegistro(p.idUsuarioRegistro)}</td>}
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
                                            onClick={() => handleEdit(p.idPartido)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            style={{
                                                backgroundColor: '#780000',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontWeight: '500',
                                            }}
                                            onClick={() => handleDelete(p.idPartido)}
                                        >
                                            Eliminar
                                        </Button>
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

export default Partidos;