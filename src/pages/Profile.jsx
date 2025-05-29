import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, getUserById, updateUser } from '../services/userService';

const Profile = () => {
  const { user, updateAvatar } = useAuth();
  const { id } = useParams();
  const editingSelf = !id;
  const userId = id || user.idUsuario;
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    rol: '',
    avatarBase64: '',
    avatarPreview: null
  });
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({ general: '', email: '', password: '' });
  const navigate = useNavigate();
  const isAdmin = user.rol === 'Admin';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = id ? await getUserById(id) : await getCurrentUser();
        setData(userData);
        setForm({
          nombre: userData.nombre,
          email: userData.email,
          contraseña: "",
          rol: userData.rol,
          avatarBase64: userData.avatarBase64 || '',
          avatarPreview: userData.avatarBase64 
            ? `data:image/*;base64,${userData.avatarBase64}`
            : null
        });
      } catch (error) {
        alert('Error al cargar perfil');
      }
    };
    loadProfile();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'email') setErrors(prev => ({ ...prev, email: '' }));
    if (name === 'contraseña') setErrors(prev => ({ ...prev, password: '' }));
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const fullDataURL = reader.result;
      const base64Data = fullDataURL.split('base64,')[1];
      
      setForm(prev => ({
        ...prev,
        avatarBase64: base64Data,
        avatarPreview: fullDataURL
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Crear un payload con los datos base
    const payload = {
      nombre: form.nombre,
      email: form.email,
      rol: form.rol,
      avatarBase64: form.avatarBase64
    };

    // Solo agregar la contraseña si el usuario ha escrito algo
    if (form.contraseña && form.contraseña.trim() !== '') {
      payload.contraseña = form.contraseña;
    }

    try {
      const updatedUser = await updateUser(userId, payload);

      const avatarDataUrl = updatedUser.avatarBase64
        ? `data:image/png;base64,${updatedUser.avatarBase64}`
        : null;

      updateAvatar(avatarDataUrl);
      setData(prev => ({ ...prev, ...updatedUser, avatar: avatarDataUrl }));
      setEditing(false);
      setErrors({ general: '', email: '', password: '' });

      if (!editingSelf && isAdmin) navigate('/users');
    } catch (error) {
      if (error.response?.data?.code === 'email_existente') {
        setErrors({ email: error.response.data.message, general: '' });
      } else {
        setErrors({
          general: error.response?.data?.message || 'Error al actualizar el perfil',
          email: ''
        });
      }
    }
  };

  if (!data) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center" style={{ color: '#780000' }}>Perfil de {data.nombre}</h2>

      {!editing ? (
        <div className="profile-card p-4 shadow-sm rounded-3">
          <div className="d-flex align-items-center">
            <div className="avatar-container position-relative me-4">
              {data.avatarBase64 ? (
                <img
                  src={`data:image/*;base64,${data.avatarBase64}`}
                  alt="Avatar"
                  className="avatar-image rounded-circle shadow"
                />
              ) : (
                <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-person-fill fs-1" style={{ color: '#669bbc' }} />
                </div>
              )}
            </div>
            
            <div className="profile-info flex-grow-1">
              <dl className="row mb-0">
                <dt className="col-sm-4 text-muted">Nombre</dt>
                <dd className="col-sm-8 fs-5">{data.nombre}</dd>

                <dt className="col-sm-4 text-muted">Email</dt>
                <dd className="col-sm-8 fs-5">{data.email}</dd>

                {isAdmin && (
                  <>
                    <dt className="col-sm-4 text-muted">Rol</dt>
                    <dd className="col-sm-8 fs-5">{data.rol}</dd>
                  </>
                )}

                <dt className="col-sm-4 text-muted">Registrado</dt>
                <dd className="col-sm-8 fs-5">
                  {new Date(data.fechaRegistro).toLocaleDateString()}
                </dd>
              </dl>
              
              <div className="text-center mt-4">
                <Button
                  onClick={() => setEditing(true)}
                  className="edit-button px-4 py-2"
                >
                  Editar Perfil
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className="edit-form p-4 shadow-sm rounded-3">
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label">Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="form-input"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label className="form-label">Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  className="form-input"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6} className="text-center">
              <Form.Group className="mb-3">
                <Form.Label className="form-label">Avatar</Form.Label>
                <div className="avatar-upload-container position-relative mx-auto">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="avatar-input"
                  />
                  
                  {form.avatarPreview ? (
                    <>
                      <img
                        src={form.avatarPreview}
                        alt="Previsualización"
                        className="avatar-preview rounded-circle shadow"
                      />
                      <div className="edit-icon-container">
                        <i className="bi bi-pencil-fill edit-icon" />
                      </div>
                    </>
                  ) : (
                    <div className="avatar-upload-placeholder rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-camera-fill fs-3" />
                    </div>
                  )}
                </div>
                <Form.Text className="d-block mt-2 text-muted">
                  Haz clic para cambiar la foto
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {isAdmin && (
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Rol</Form.Label>
                  <Form.Select
                    name="rol"
                    value={form.rol}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option>Admin</option>
                    <option>GestorClub</option>
                    <option>Entrenador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Form.Group className="mb-4">
            <Form.Label className="form-label">Contraseña</Form.Label>
              <Form.Control
                name="contraseña"
                type="password"
                placeholder="Nueva contraseña"
                value={form.contraseña}
                onChange={handleChange}
                className="form-input"
                isInvalid={form.contraseña !== '' && !!errors.password}
              />
          </Form.Group>

          {errors.general && (
            <div className="alert alert-danger mb-4">{errors.general}</div>
          )}

          <div className="d-flex justify-content-center gap-3">
            <Button
              type="submit"
              className="save-button px-4 py-2"
            >
              Guardar Cambios
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => setEditing(false)}
              className="cancel-button px-4 py-2"
            >
              Cancelar
            </Button>
          </div>
        </Form>
      )}

      <style>{`
        .profile-card, .edit-form {
          background: white;
          border: 1px solid #dee2e6;
        }
        
        .avatar-container {
          width: 150px;
          height: 150px;
        }
        
        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 3px solid #669bbc;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background-color: #f8f9fa;
          border: 3px dashed #669bbc;
        }
        
        .avatar-upload-container {
          width: 150px;
          height: 150px;
          cursor: pointer;
        }
        
        .avatar-input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          z-index: 2;
        }
        
        .avatar-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 3px solid #669bbc;
        }
        
        .edit-icon-container {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: #780000;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }
        
        .edit-icon {
          color: white;
          font-size: 0.9rem;
        }
        
        .avatar-upload-placeholder {
          width: 100%;
          height: 100%;
          border: 3px dashed #780000;
          background: #f8f9fa;
          color: #780000;
        }
        
        .form-label {
          color: #780000;
          font-weight: 500;
        }
        
        .form-input {
          border-radius: 8px;
          border: 2px solid #dee2e6;
          padding: 0.75rem;
        }
        
        .form-input:focus {
          border-color: #669bbc;
          box-shadow: none;
        }
        
        .edit-button, .save-button {
          background-color: #780000;
          border: none;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .edit-button:hover, .save-button:hover {
          background-color: #5a0000;
          transform: translateY(-1px);
        }
        
        .cancel-button {
          background-color: #f4f3f2;
          color: #780000;
          border: none;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .cancel-button:hover {
          background-color: #e2e1e0;
          color: #5a0000;
        }
      `}</style>
    </div>
  );
};

export default Profile;