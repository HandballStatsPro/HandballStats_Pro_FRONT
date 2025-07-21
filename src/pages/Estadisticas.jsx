import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getPartidos } from '../services/partidoService';
import { getEquipos } from '../services/equipoService';

const Estadisticas = () => {
    const { user } = useAuth();
    const [equipos, setEquipos] = useState([]);
    const [partidos, setPartidos] = useState([]);
    const [selectedEquipo, setSelectedEquipo] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [calculando, setCalculando] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [equiposRes, partidosRes] = await Promise.all([
                    getEquipos(), 
                    getPartidos()
                ]);
                
                setEquipos(equiposRes || []); 
                setPartidos(partidosRes.data || []);
            } catch (err) {
                setError('Error cargando datos');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setStats(null);
        setError('');
    }, [selectedEquipo]);

    const calcularEstadisticas = () => {
        setCalculando(true);
        setError('');
        try {
            const equipoSeleccionadoId = Number(selectedEquipo);

            const partidosEquipo = partidos.filter(p => 
                p.idEquipoLocalAsociado === equipoSeleccionadoId ||
                p.idEquipoVisitanteAsociado === equipoSeleccionadoId
            );

            if (partidosEquipo.length === 0) {
                throw new Error('El equipo no tiene partidos registrados con equipos asociados.');
            }

            let totalGolesMarcados = 0;
            let totalGolesRecibidos = 0;
            let partidosConResultado = 0;

            partidosEquipo.forEach(p => {
                if (p.resultado && /^\d+-\d+$/.test(p.resultado)) {
                    const [golesLocal, golesVisitante] = p.resultado.split('-').map(Number);
                    
                    if (p.idEquipoLocalAsociado === equipoSeleccionadoId) {
                        totalGolesMarcados += golesLocal;
                        totalGolesRecibidos += golesVisitante;
                    } else { 
                        totalGolesMarcados += golesVisitante;
                        totalGolesRecibidos += golesLocal;
                    }
                    partidosConResultado++;
                }
            });

            if (partidosConResultado === 0) {
                throw new Error('No hay partidos con resultados válidos para calcular estadísticas.');
            }

            setStats({
                mediaMarcados: totalGolesMarcados / partidosConResultado,
                mediaRecibidos: totalGolesRecibidos / partidosConResultado,
                totalPartidos: partidosConResultado
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setCalculando(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <Container className="mt-5">
            <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
                Estadísticas de Equipos
            </h2>

            <Row className="justify-content-center mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-bold">Seleccionar equipo:</Form.Label>
                        <Form.Select
                            value={selectedEquipo}
                            onChange={(e) => setSelectedEquipo(e.target.value)}
                            style={{
                                borderRadius: '8px',
                                border: '2px solid #669bbc',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Seleccione un equipo</option>
                            {equipos.map(equipo => (
                                <option key={equipo.idEquipo} value={equipo.idEquipo}>
                                    {equipo.nombre} ({equipo.temporada})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <div className="text-center mb-4">
                <Button
                    onClick={calcularEstadisticas}
                    disabled={!selectedEquipo || calculando}
                    style={{
                        backgroundColor: '#669bbc',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        padding: '10px 25px',
                        width: '200px'
                    }}
                >
                    {calculando ? (
                        <>
                            <Spinner animation="border" size="sm" /> Calculando...
                        </>
                    ) : (
                        'Calcular Estadísticas'
                    )}
                </Button>
            </div>

            {error && <Alert variant="danger" className="text-center">{error}</Alert>}

            {stats && (
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card style={{ 
                            borderRadius: '12px', 
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }}>
                            <Card.Body className="text-center">
                                <h4 className="mb-4">Resultados Estadísticos</h4>
                                
                                <Row>
                                    <Col>
                                        <div className="mb-3">
                                            <h5>Media de goles a favor</h5>
                                            <div style={{ fontSize: '2rem', color: '#780000' }}>
                                                {stats.mediaMarcados.toFixed(2)}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="mb-3">
                                            <h5>Media de goles en contra</h5>
                                            <div style={{ fontSize: '2rem', color: '#780000' }}>
                                                {stats.mediaRecibidos.toFixed(2)}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                
                                <div className="mt-3">
                                    <p className="text-muted">
                                        Análisis de {stats.totalPartidos} partidos con resultado
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Estadisticas;