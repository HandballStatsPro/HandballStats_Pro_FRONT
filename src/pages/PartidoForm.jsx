import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPartido, updatePartido, getPartidoById, getEquiposDisponibles } from '../services/partidoService';

const PartidoForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    idEquipoPropio: '',
    nombreRival: '',
    esLocal: true,
    fecha: '',
    resultado: '',
    competicion: ''
  });

  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, pRes] = await Promise.all([
          getEquiposDisponibles(),
          isEdit ? getPartidoById(id) : Promise.resolve({ data: null })
        ]);

        setEquipos(eRes.data || []);

        if (isEdit && pRes.data) {
          const p = pRes.data;
          setForm({
            idEquipoPropio: p.idEquipoPropio,
            nombreRival: p.nombreRival,
            esLocal: p.esLocal,
            fecha: p.fecha.split('T')[0],
            resultado: p.resultado || '',
            competicion: p.competicion || ''
          });
        }
      } catch (err) {
        setError('Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones de campos
    if (!form.nombreRival.trim()) {
      setError('El nombre del rival no puede estar vacío.');
      return;
    }

    if (form.resultado && form.resultado.trim() !== '') {
      const resultadoRegex = /^\d+-\d+$/;
      if (!resultadoRegex.test(form.resultado)) {
        setError('El resultado debe tener el formato número-número (ej: 2-1).');
        return;
      }
    }

    try {
      if (isEdit) {
        await updatePartido(id, form);
        setSuccess('Partido actualizado correctamente');
      } else {
        await createPartido(form);
        navigate('/partidos');
      }
    } catch (err) {
      setError('Error guardando el partido');
    }
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
    <div className="container mt-5">
      <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
        {isEdit ? 'Editar Partido' : 'Nuevo Partido'}
      </h2>

      <div className="p-4" style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="idEquipoPropio">
                <Form.Label>Equipo Propio</Form.Label>
                <Form.Select
                  name="idEquipoPropio"
                  value={form.idEquipoPropio}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                >
                  <option value="">Seleccione...</option>
                  {equipos.map(e => (
                    <option key={e.idEquipo} value={e.idEquipo}>{e.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="nombreRival">
                <Form.Label>Nombre Rival</Form.Label>
                <Form.Control
                  type="text"
                  name="nombreRival"
                  value={form.nombreRival}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="fecha">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="esLocal" className="mt-4">
                <Form.Check
                  type="checkbox"
                  name="esLocal"
                  label="¿Es local?"
                  checked={form.esLocal}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <Form.Group controlId="resultado">
                <Form.Label>Resultado (opcional)</Form.Label>
                <Form.Control
                  type="text"
                  name="resultado"
                  value={form.resultado}
                  onChange={handleChange}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId="competicion">
                <Form.Label>Competición (opcional)</Form.Label>
                <Form.Control
                  type="text"
                  name="competicion"
                  value={form.competicion}
                  onChange={handleChange}
                  style={{ borderRadius: '8px' }}
                  placeholder="Añade aquí la competición..."
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/partidos')}
              style={{
                backgroundColor: '#f4f3f2',
                color: '#000',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                padding: '8px 20px'
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: '#669bbc',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                padding: '8px 25px'
              }}
            >
              {isEdit ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </Form>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      </div>
    </div>
  );
};

export default PartidoForm;