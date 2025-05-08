import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Spinner, Alert, Table, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getClubById,
  createClub,
  updateClub,
  findUserByEmail,
  assignGestor,
  removeGestor,
} from '../services/clubService';

const ClubForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    ciudad: '',
    fechaCreacionClub: '',
  });
  const [gestorEmail, setGestorEmail] = useState('');
  const [gestores, setGestores] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const data = await getClubById(id);
        setForm({
          nombre: data.nombre,
          ciudad: data.ciudad,
          fechaCreacionClub: data.fechaCreacionClub,
        });
        setGestores(data.gestores || []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el club');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditing]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);

    try {
      if (isEditing) {
        await updateClub(id, form);
        setSuccess('Club actualizado correctamente');
      } else {
        await createClub(form);
        setSuccess('Club creado correctamente');
        navigate('/club');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error guardando el club');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGestor = async () => {
    setError(''); setSuccess('');
    if (!gestorEmail) return setError('Introduce un email');
    try {
      const u = await findUserByEmail(gestorEmail);
      if (u.rol !== 'GestorClub') {
        return setError('Solo puedes asignar gestores de club');
      }
      await assignGestor(id, u.idUsuario);
      setGestores([...gestores, { idUsuario: u.idUsuario, nombre: u.nombre }]);
      setGestorEmail('');
      setSuccess('Gestor asignado correctamente');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error asignando gestor');
    }
  };

  const handleDeleteGestor = async (idUsuario) => {
    if (!window.confirm("¿Eliminar gestor del club?")) return;

    try {
      await removeGestor(id, idUsuario); 
      setGestores(gestores.filter(g => g.idUsuario !== idUsuario));
      setSuccess('Gestor eliminado correctamente');
    } catch (err) {
      console.error(err);
      setError('Error eliminando gestor');
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Cargando datos...</p>
      </Container>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
        {isEditing ? 'Editar Club' : 'Nuevo Club'}
      </h2>

      <div
        className="p-4"
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId="formCiudad">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group controlId="formFecha">
                <Form.Label>Fecha de Fundación</Form.Label>
                <Form.Control
                  name="fechaCreacionClub"
                  type="date"
                  value={form.fechaCreacionClub}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-3">
            <Button
              variant="secondary"
              onClick={() => isEditing ? setSuccess('') : navigate('/club')}
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
              disabled={saving}
              style={{
                backgroundColor: '#669bbc',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                padding: '8px 25px'
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </Form>
        <br></br>
        {error && <Alert variant="danger" className="rounded-lg">{error}</Alert>}
        {success && <Alert variant="success" className="rounded-lg">{success}</Alert>}

        {isEditing && user.rol === 'Admin' && (
          <>
            <hr className="my-5" />

            <div className="mt-4">
              <h4 className="mb-4">Gestores Vinculados</h4>
              
              {gestores.length === 0 ? (
                <p className="text-muted">No hay gestores asignados</p>
              ) : (
                <Table hover className="rounded-lg overflow-hidden">
                  <thead style={{ backgroundColor: '#669bbc', color: 'white' }}>
                    <tr>
                      <th>Nombre</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gestores.map(g => (
                      <tr key={g.idUsuario}>
                        <td>{g.nombre}</td>
                        <td className="text-end">
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteGestor(g.idUsuario)}
                            style={{
                              borderRadius: '6px',
                              padding: '4px 12px',
                              fontWeight: '500'
                            }}
                          >
                            X
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              <div className="mt-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <Row className="g-3 align-items-center">
                  <Col>
                    <Form.Control
                      placeholder="Email del gestor"
                      value={gestorEmail}
                      onChange={e => setGestorEmail(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button 
                      onClick={handleAddGestor}
                      style={{
                        backgroundColor: '#669bbc',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: '600'
                      }}
                    >
                      Añadir Gestor
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubForm;