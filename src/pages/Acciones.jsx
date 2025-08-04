import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert, Card, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPartidos } from '../services/partidoService';
import { getAccionesByPartido } from '../services/accionService';

const Acciones = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [partidos, setPartidos] = useState([]);
  const [partidosConAcciones, setPartidosConAcciones] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partidosRes = await getPartidos();
        const partidosData = partidosRes.data || [];
        setPartidos(partidosData);

        // Para cada partido, obtener el número de acciones
        const partidosConAccionesData = await Promise.all(
          partidosData.map(async (partido) => {
            try {
              const acciones = await getAccionesByPartido(partido.idPartido);
              return {
                ...partido,
                numeroAcciones: acciones.length
              };
            } catch (err) {
              return {
                ...partido,
                numeroAcciones: 0
              };
            }
          })
        );

        setPartidosConAcciones(partidosConAccionesData);
      } catch (err) {
        setError('Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleGestionarAcciones = (idPartido) => {
    navigate(`/acciones/partido/${idPartido}`);
  };

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
        Gestión de Acciones por Partido
      </h2>

      {error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : partidosConAcciones.length === 0 ? (
        <Card className="text-center">
          <Card.Body>
            <h5>No tienes partidos disponibles</h5>
            <p>Crea un partido primero para poder gestionar acciones.</p>
            <Button 
              onClick={() => navigate('/partidos/new')}
              style={{ backgroundColor: '#669bbc', border: 'none' }}
            >
              Crear Partido
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {partidosConAcciones.map(partido => (
            <Col key={partido.idPartido} xs={12} md={6} lg={4} className="mb-4">
              <Card 
                className="h-100 shadow-sm"
                style={{ 
                  borderRadius: '12px',
                  border: '2px solid #669bbc',
                  transition: 'transform 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Card.Header 
                  style={{ 
                    backgroundColor: '#669bbc', 
                    color: 'white',
                    borderRadius: '10px 10px 0 0'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{partido.nombreEquipoLocal} vs {partido.nombreEquipoVisitante}</strong>
                    <Badge 
                      bg={partido.numeroAcciones > 0 ? 'success' : 'secondary'}
                      style={{ fontSize: '0.9rem' }}
                    >
                      {partido.numeroAcciones} acciones
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>Fecha:</strong> {formatDate(partido.fecha)}
                    </p>
                    <p className="mb-1">
                      <strong>Competición:</strong> {partido.competicion || 'No especificada'}
                    </p>
                    <p className="mb-1">
                      <strong>Resultado:</strong> {partido.resultado || 'Por disputar'}
                    </p>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-light">
                  <div className="d-grid gap-2">
                    <Button
                      onClick={() => handleGestionarAcciones(partido.idPartido)}
                      style={{
                        backgroundColor: '#669bbc',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600'
                      }}
                    >
                      {partido.numeroAcciones > 0 ? 'Ver/Editar Acciones' : 'Registrar Acciones'}
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Acciones;