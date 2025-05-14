import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEquipos, deleteEquipo } from '../services/equipoService';

const Equipos = () => {
  const { user } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const loadEquipos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await getEquipos(user.rol, user.idUsuario);

      setEquipos(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError('Error cargando equipos');
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadEquipos();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este equipo?')) {
      try {
        await deleteEquipo(id);
        loadEquipos();
      } catch (error) {
        setError('Error eliminando equipo');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando equipos...</p>
      </div>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
        Gestión de Equipos
      </h2>

        <div className="text-center mt-4">
          <Button
            onClick={() => navigate('/equipo/new')}
            style={{
              backgroundColor: '#669bbc',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              padding: '10px 25px'
            }}
          >
            Nuevo Equipo
          </Button>
        </div>

      {error ? (
        <Alert variant="danger" className="text-center">
          {error} <Button variant="link" onClick={loadEquipos}>Reintentar</Button>
        </Alert>
      ) : Array.isArray(equipos) && equipos.length === 0 ? (
        <div className="text-center">No se encontraron equipos</div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          overflowX: 'auto',
          marginTop: '20px'
        }}>
          <Table responsive striped hover className="mb-0">
            <thead style={{ backgroundColor: '#669bbc', color: 'white' }}>
              <tr>
                {user.rol === 'Admin' && <th>Id</th>}                
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Competición</th>
                <th>Club</th>
                {(user.rol === 'Admin' || user.rol === 'GestorClub') && <th>Entrenadores</th>}
                <th>Fecha Creación</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(equipos) && equipos.map(equipo => (
                <tr key={equipo.idEquipo}>
                  {user.rol === 'Admin' && <td>{equipo.idEquipo}</td>}
                  <td>{equipo.nombre}</td>
                  <td>{equipo.categoria}</td>
                  <td>{equipo.competicion}</td>
                  <td>{equipo.clubNombre || '-'}</td>
                 {(user.rol === 'Admin' || user.rol === 'GestorClub') && (
                   <td>
                     {(equipo.entrenadores ?? [])
                       .map(u => u.nombre || u.email)
                       .join(', ') || '-'}
                   </td>
                 )}
                  <td>{formatDate(equipo.fechaCreacionEquipo)}</td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      className="me-2"
                      style={{
                        backgroundColor: '#669bbc',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                      }}
                      onClick={() => navigate(`/equipo/${equipo.idEquipo}`)}
                    >
                      Editar
                    </Button>
                    {(user.rol === 'Admin') && (
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: '#780000',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '500',
                        }}
                        onClick={() => handleDelete(equipo.idEquipo)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default Equipos;