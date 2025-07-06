import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Table, Row, Col, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEquipoById, createEquipo, updateEquipo, assignEntrenadorByEmail, removeEntrenador, getClubesDisponibles } from '../services/equipoService';
import { findUserByEmail } from '../services/clubService';

const EquipoForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    categoria: '',
    temporada: '25-26',
    idClub: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const [entrenadorEmail, setEntrenadorEmail] = useState('');
  const [entrenadores, setEntrenadores] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (isEditing) {
        try {
          const data = await getEquipoById(id);

          setForm({
            nombre: data.nombre || '',
            categoria: data.categoria || '',
            temporada: data.temporada || '',
            idClub: (data.club && data.club.idClub) ? data.club.idClub : ''
          });

                    console.log('Datos del equipo al cargar:', data);
          console.log('form.idClub después de la carga:', form.idClub);

          setEntrenadores(Array.isArray(data.entrenadores) ? data.entrenadores : []);

        } catch (err) {
          setError('Error cargando equipo');
        }
      }

      if (user.rol === 'GestorClub' || user.rol === 'Admin') {
        try {
          const clubesData = await getClubesDisponibles(user.idUsuario);
          setClubes(Array.isArray(clubesData) ? clubesData : []);
        } catch (err) {
          setError('Error cargando clubes');
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones en JavaScript
    if (!form.nombre.trim()) {
      setError('El nombre del equipo no puede estar vacío.');
      return;
    }
    if (!form.categoria.trim()) {
      setError('La categoría del equipo no puede estar vacía.');
      return;
    }
    if (!form.temporada.trim()) {
      setError('La temporada del equipo no puede estar vacía.');
      return;
    }

    try {
      if (isEditing) {
        await updateEquipo(id, form);
        setSuccess('Equipo actualizado correctamente');
      } else {
        await createEquipo(form);
        setSuccess('Equipo creado correctamente');
        navigate('/equipo');
      }
    } catch (err) {
      setError(err.message || 'Error guardando equipo');
    }
  };

const handleAddEntrenador = async () => {
    setError('');
    setSuccess('');
    if (!entrenadorEmail) return setError('Introduce un email');
    try {
      let usuario;
      try {
        usuario = await findUserByEmail(entrenadorEmail);
        if (!usuario) {
          return setError(`No se encontró ningún usuario con el email '${entrenadorEmail}'.`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          return setError(`No se encontró ningún usuario con el email '${entrenadorEmail}'.`);
        }
        // Si es otro error en la búsqueda, lo logueamos y mostramos un mensaje genérico
        console.error("Error al buscar usuario por email:", error);
        return setError('Error al verificar el usuario.');
      }

      if (usuario.rol !== 'Entrenador') {
        return setError('El usuario no es entrenador.');
      }
      await assignEntrenadorByEmail(id, entrenadorEmail);
      setEntrenadores([...entrenadores, usuario]);
      setEntrenadorEmail('');
      setSuccess('Entrenador asignado');
    } catch (err) {
      // Capturamos errores que puedan ocurrir durante la asignación
      setError(err.message || 'Error asignando entrenador.');
    }
  };

  const handleRemoveEntrenador = async (idUsuario) => {
    try {
      await removeEntrenador(id, idUsuario);
      setEntrenadores(entrenadores.filter(e => e.idUsuario !== idUsuario));
      setSuccess('Entrenador eliminado');
    } catch (err) {
      setError('Error eliminando entrenador');
    }
  };

  if (loading) return (
    <div className="text-center mt-5">
      <Spinner animation="border" variant="primary" />
      <p>Cargando...</p>
    </div>
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
        {isEditing ? 'Editar Equipo' : 'Nuevo Equipo'}
      </h2>

      <div className="p-4" style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="nombre">
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
              <Form.Group controlId="categoria">
                <Form.Label>Categoría</Form.Label>
                <Form.Control
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="temporada">
                <Form.Label>Temporada</Form.Label>
                <Form.Select
                  name="temporada"
                  value={form.temporada}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                >
                  <option value="25-26">25-26</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {(user.rol === 'Admin' || user.rol === 'GestorClub') && (
              <Col md={6}>
                <Form.Group controlId="club">
                  <Form.Label>Club</Form.Label>
                  <Form.Select
                    value={form.idClub}
                    onChange={handleChange}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="">Seleccionar club</option>
                    {Array.isArray(clubes) && clubes.map(club => (
                      <option key={club.idClub} value={club.idClub}>
                        {club.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>

          <div className="d-flex justify-content-end gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate(isEditing ? '/equipo' : '/equipo')}
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
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </Form>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}

        {isEditing && (user.rol === 'Admin' || user.rol === 'GestorClub') && (
          <>
            <hr className="my-5" />
            <div className="mt-4">
              <h4>Entrenadores Asignados</h4>
              {Array.isArray(entrenadores) && entrenadores.length === 0 ? (
                <p className="text-muted">No hay entrenadores asignados</p>
              ) : (
                <Table hover className="rounded-lg overflow-hidden mt-3">
                  <thead style={{ backgroundColor: '#669bbc', color: 'white' }}>
                    <tr>
                      <th>Nombre</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(entrenadores) && entrenadores.map(entrenador => (
                      <tr key={entrenador.idUsuario}>
                        <td>{entrenador.nombre}</td>
                        <td className="text-end">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveEntrenador(entrenador.idUsuario)}
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
                      placeholder="Email del entrenador"
                      value={entrenadorEmail}
                      onChange={e => setEntrenadorEmail(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button
                      onClick={handleAddEntrenador}
                      style={{
                        backgroundColor: '#669bbc',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: '600'
                      }}
                    >
                      Añadir Entrenador
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

export default EquipoForm;