import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';

const Inicio = () => (
  <Container
    fluid
    className="d-flex flex-column align-items-center justify-content-start py-5"
    style={{ backgroundColor: '#f4f3f2', minHeight: '100vh' }}
  >
    {/* Isotipo grande */}
    <img
      src="/isotipo_sin_fondo.png"
      alt="HandballStatsPro"
      style={{
        width: '280px',
        marginBottom: '40px',
        filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.25))',
      }}
    />

    {/* Título principal */}
    <h1 className="mb-4 text-center" style={{ color: '#780000' }}>
      Bienvenido a HandballStats Pro
    </h1>

    {/* Cards informativas */}
    <Row className="w-100 justify-content-center px-3" style={{ maxWidth: '1200px' }}>
      <Col md={6} className="mb-4">
        <Card style={{ borderLeft: '6px solid #669bbc', borderRadius: '16px' }}>
          <Card.Body>
            <Card.Title style={{ color: '#669bbc' }}>¿Qué es HandballStatsPro?</Card.Title>
            <Card.Text>
              Nuestra plataforma representa una innovación en el análisis del balonmano, centrada
              en capturar datos específicos de cada fase del juego, más allá de las estadísticas básicas.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} className="mb-4">
        <Card style={{ borderLeft: '6px solid #780000', borderRadius: '16px' }}>
          <Card.Body>
            <Card.Title style={{ color: '#780000' }}>¿Por qué es diferente?</Card.Title>
            <Card.Text>
              A diferencia de otras apps deportivas, HandballStats Pro analiza con detalle el
              ataque, la defensa, los contraataques y los repliegues defensivos. Una herramienta
              hecha para quienes buscan profundidad táctica.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col md={12}>
        <Card style={{ borderLeft: '6px solid #669bbc', borderRadius: '16px' }}>
          <Card.Body>
            <Card.Title style={{ color: '#669bbc' }}>¿Qué permite hacer?</Card.Title>
            <Card.Text>
              Calcula en tiempo real la eficacia y frecuencia de cada fase del juego, lo que
              facilita la toma de decisiones estratégicas basadas en datos reales y actuales.
              ¡Explora el menú lateral y comienza tu análisis avanzado hoy!
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default Inicio;
