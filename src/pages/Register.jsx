import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card } from 'react-bootstrap';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Renombramos "avatar" a "avatarBase64" para que coincida con el backend
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    avatarBase64: ''
  });
  const [errors, setErrors] = useState({ general: '', email: '', password: '' });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fullDataURL = reader.result;
        const base64Data = fullDataURL.split('base64,')[1]; // Extrae solo el base64
        
        setForm(prev => ({
          ...prev,
          avatarBase64: base64Data, // Guarda solo "ABC123..."
          avatarPreview: fullDataURL // Previsualización con Data URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar errores mientras escribe
    if (e.target.name === 'email')       setErrors(prev => ({ ...prev, email: '' }));
    if (e.target.name === 'contraseña')  setErrors(prev => ({ ...prev, password: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({ general: '', email: '', password: '' });

    // 2. Crear payload con estructura correcta para el backend
    const payload = {
      nombre: form.nombre,
      email: form.email,
      contraseña: form.contraseña,
      avatarBase64: form.avatarBase64 // ✅ Usar directamente
    };


    // 4. Llamar al servicio de registro con datos estructurados
    const result = await register(payload);

    // 5. Resto de la lógica...
    if (result.success) {
      navigate('/inicio');
    } else {
      if (result.code === 'email_existente') {
        setErrors({ email: result.message, general: '' });
      } else {
        setErrors({ general: result.message || 'Error en el registro', email: '' });
      }
    }
  };
  
  return (
    <div className="d-flex vh-100" style={{
      background: 'linear-gradient(90deg, #669bbc 0%, #780000 100%)'
    }}>
      <div className="w-50 d-flex align-items-center justify-content-center">
        <img
          src="/imagotipo_sin_fondo.png"
          alt="Logo"
          style={{
            maxWidth: '60%',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
          }}
        />
      </div>
      
      <div className="w-50 d-flex align-items-center justify-content-center">
        <Card style={{
          width: '80%',
          maxWidth: '400px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.9)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          border: 'none',
          overflow: 'hidden',
        }}>
          <div style={{
            backgroundColor: '#780000',
            padding: '12px 0',
          }}>
            <h5 className="text-center text-white mb-0">Registro</h5>
          </div>
          
          <Card.Body>
            {errors.general && (
              <div className="alert alert-danger mb-3" style={{ borderRadius: '8px' }}>
                {errors.general}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Avatar */}
              <Form.Group className="mb-3">
                <Form.Label>Avatar</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ borderRadius: '8px' }}
                />
                {form.avatarPreview && (
                  <div className="mt-2 text-center">
                    <img 
                      src={form.avatarPreview}
                      alt="Previsualización"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}
              </Form.Group>

              {/* Nombre */}
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>

              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  isInvalid={!!errors.email}
                  style={{ borderRadius: '8px' }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Contraseña */}
              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  name="contraseña"
                  type="password"
                  value={form.contraseña}
                  onChange={handleChange}
                  required
                  isInvalid={!!errors.password}
                  style={{ borderRadius: '8px' }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                className="w-100"
                style={{
                  backgroundColor: '#780000',
                  border: 'none',
                  padding: '10px 0',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}
              >
                Regístrate
              </Button>
            </Form>

            <p className="mt-3 text-center">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                style={{
                  backgroundColor: '#669bbc',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={e => (e.target.style.backgroundColor = '#546f8a')}
                onMouseLeave={e => (e.target.style.backgroundColor = '#669bbc')}
              >
                Login
              </Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Register;
