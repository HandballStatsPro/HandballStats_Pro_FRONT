import React, { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser } from '../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const load = () => {
    getUsers()
      .then(setUsers)
      .catch(() => alert('Error al cargar usuarios'));
  };

  useEffect(load, []);

  const handleDelete = id => {
    if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      deleteUser(id)
        .then(load)
        .catch(() => alert('Error al eliminar'));
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
        Gestión de Usuarios
      </h2>

      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          overflowX: 'auto',
        }}
      >
        {/* Hover styles para los botones */}
        <style>{`
          .btn-edit:hover {
            background-color: #f4f3f2 !important;
            color: black !important;
          }
          .btn-delete:hover {
            background-color: #f4f3f2 !important;
            color: black !important;
          }
        `}</style>

        <Table responsive striped hover className="mb-0">
          <thead>
            <tr style={{ backgroundColor: '#669bbc', color: 'white' }}>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha de Registro</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.idUsuario}>
                <td>{u.idUsuario}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>{formatDate(u.fechaRegistro)}</td> {/* Fecha de registro */}
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
                    onClick={() =>
                      navigate(`/users/${u.idUsuario}/edit`)
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    className="btn-delete"
                    style={{
                      backgroundColor: '#780000',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                    }}
                    onClick={() => handleDelete(u.idUsuario)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default Users;
