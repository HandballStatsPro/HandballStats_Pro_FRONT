import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClubs, deleteClub } from '../services/clubService';

const Clubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getClubs(user.rol, user.idUsuario);
      setClubs(data);
    } catch (error) {
      setError('Error cargando clubes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadClubs();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este club?')) {
      try {
        await deleteClub(id);
        loadClubs();
      } catch (error) {
        setError('Error eliminando club');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando clubes...</p>
      </div>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
        Gestión de Clubes
      </h2>

      {(user.rol === 'Admin' || user.rol === 'GestorClub') && (
        <div className="text-center mt-4">
          <Button
            onClick={() => navigate('/club/new')}
            style={{
              backgroundColor: '#669bbc',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              padding: '10px 25px'
            }}
          >
            Nuevo Club
          </Button>
        </div>
      )}

      {error ? (
        <Alert variant="danger" className="text-center">
          {error} <Button variant="link" onClick={loadClubs}>Reintentar</Button>
        </Alert>
      ) : clubs.length === 0 ? (
        <div className="text-center">No se encontraron clubes</div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            overflowX: 'auto',
          }}
        >
          <style>{`
            .btn-edit:hover { background-color: #f4f3f2 !important; color: black !important; }
            .btn-delete:hover { background-color: #f4f3f2 !important; color: black !important; }
          `}</style>

          <Table responsive striped hover className="mb-0">
            <thead>
              <tr style={{ backgroundColor: '#669bbc', color: 'white' }}>
                {user.rol === 'Admin' && <th>ID</th>}
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Fecha de creación</th>
                {user.rol === 'Admin' && <th>Gestores</th>}
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map(club => (
                <tr key={club.idClub}>
                  {user.rol === 'Admin' && <td>{club.idClub}</td>}
                  <td>{club.nombre}</td>
                  <td>{club.ciudad}</td>
                  <td>{formatDate(club.fechaCreacionClub)}</td>
                  {user.rol === 'Admin' && (
                    <td>
                      {club.gestores?.length > 0
                        ? club.gestores.map(g => `${g.idUsuario}.- ` + g.nombre ).join(', ')
                        : '-'}
                    </td>
                  )}
                  <td className="text-center">
                    <Button
                      size="sm"
                      className="btn-edit me-2"
                      style={{
                        backgroundColor: '#669bbc',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                      }}
                      onClick={() => navigate(`/club/${club.idClub}`)}
                    >
                      Editar
                    </Button>
                    {user.rol === 'Admin' && (
                      <Button
                        size="sm"
                        className="btn-delete"
                        style={{
                          backgroundColor: '#780000',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '500',
                        }}
                        onClick={() => handleDelete(club.idClub)}
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

export default Clubs;