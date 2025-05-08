import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, getUserById, updateUser } from '../services/userService';
const Profile = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const editingSelf = !id;
  const userId = id || user.idUsuario;
  const [data, setData] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState({
      general: '',
      email: '',
      password: ''
    });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
        try {
            let userData;
            if (id) {
                userData = await getUserById(id);
            } else {
                userData = await getCurrentUser();
            }
            setData(userData);
            // Inicializar el formulario con los datos actuales
            setForm({
                nombre: userData.nombre,
                email: userData.email,
                contraseña: userData.contraseña,
                rol: userData.rol
            });
        } catch (error) {
            alert('Error al cargar perfil');
        }
    };
    
    loadProfile();
}, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
        const updatedUser = await updateUser(userId, form);
        
        // Actualizar los datos locales
        setData(updatedUser);
        // Salir del modo edición
        setEditing(false);
        // Limpiar errores
        setErrors({ general: '', email: '', password: '' });
        
        // Si es admin, redirigir a lista de usuarios
        if (!editingSelf && isAdmin) {
            navigate('/users');
        }
        
    } catch (error) {
        if (error.response?.data?.code === 'email_existente') {
            setErrors({
                email: error.response.data.message,
                general: ''
            });
        } else {
            setErrors({
                general: error.response?.data?.message || 'Error al actualizar el perfil',
                email: ''
            });
        }
    }
};

  if (!data) return <p>Cargando...</p>;

  const isAdmin = user.rol === 'Admin';

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Perfil de {data.nombre}</h2>

      {!editing ? (
        <div
          className="p-4"
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          <dl className="row mb-0">
            <dt className="col-sm-3">Nombre</dt>
            <dd className="col-sm-9">{data.nombre}</dd>

            <dt className="col-sm-3">Email</dt>
            <dd className="col-sm-9">{data.email}</dd>

            {isAdmin && (
              <>
                <dt className="col-sm-3">Rol</dt>
                <dd className="col-sm-9">{data.rol}</dd>
              </>
            )}

            <dt className="col-sm-3">Registrado</dt>
            <dd className="col-sm-9">
              {new Date(data.fechaRegistro).toLocaleDateString()}
            </dd>
          </dl>

          <div className="text-center mt-4">
            <Button
              onClick={() => setEditing(true)}
              style={{
                backgroundColor: '#780000',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
              }}
            >
              Editar Perfil
            </Button>
          </div>
        </div>
      ) : (
        <Form
          onSubmit={handleSubmit}
          className="p-4"
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  style={{ borderRadius: '8px' }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {isAdmin && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formRol">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    name="rol"
                    value={form.rol}
                    onChange={handleChange}
                    style={{ borderRadius: '8px' }}
                  >
                    <option>Admin</option>
                    <option>GestorClub</option>
                    <option>Entrenador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  name="contraseña"
                  type="password"
                  placeholder="Nueva contraseña"
                  value={form.contraseña}
                  onChange={handleChange}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
          </Row>
          {errors.general && (
              <div className="alert alert-danger mb-3">
                  {errors.general}
              </div>
          )}

          {!errors.general && data.updatedAt && (
              <div className="alert alert-success mb-3">
                  Perfil actualizado correctamente
              </div>
          )}
          <div className="text-center">
            <Button
              type="submit"
              style={{
                backgroundColor: '#669bbc',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                marginRight: '10px',
              }}
            >
              Guardar
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditing(false)}
              style={{
                backgroundColor: '#f4f3f2',
                color: '#000',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
              }}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default Profile;
