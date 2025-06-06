import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card } from 'react-bootstrap';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', contraseña: '' });
  const [error, setError] = useState({ message: '', type: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setError({ message: '', type: '' });
    
    const { success, message, code } = await login(form);
    
    if (success) {
      navigate('/inicio');
    } else {
      setError({
        message: code === 'bad_credentials' 
          ? 'Email o contraseña incorrectos' 
          : message,
        type: code
      });
    }
  };

  return (
    <div
      className="d-flex vh-100"
      style={{
        background: 'linear-gradient(90deg, #669bbc 0%, #780000 100%)',
      }}
    >
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
        <Card
          style={{
            width: '80%',
            maxWidth: '400px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            border: 'none',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              backgroundColor: '#780000',
              padding: '12px 0',
            }}
          >
            <h5 className="text-center text-white mb-0">Iniciar Sesión</h5>
          </div>
          <Card.Body>
            {error.message && (
              <div className={`alert ${error.type === 'validation_error' 
                ? 'alert-warning' 
                : 'alert-danger'} mb-3`}
              >
                {error.message}
              </div>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  name="contraseña"
                  type="password"
                  value={form.contraseña}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
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
                Ingresar
              </Button>
            </Form>
            <p className="mt-3 text-center">
              ¿Todavía no tienes cuenta?{' '}
              <Link
                to="/register"
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
                Regístrate
              </Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Login;
