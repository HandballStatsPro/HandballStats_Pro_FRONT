import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Inicio from './pages/Inicio';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Clubs from './pages/Clubs';
import ClubForm from './pages/ClubForm';
import Equipos from './pages/Equipos';
import EquipoForm from './pages/EquipoForm';

export default function App() {
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(200);

  const hideSidebar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="d-flex">
      {!hideSidebar && (
        <Sidebar onToggle={width => setSidebarWidth(width)} />
      )}
      <main
        style={{
          marginLeft: hideSidebar ? 0 : sidebarWidth,
          transition: 'margin-left 0.3s ease',
          width: '100%'
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id/edit" element={<Profile />} />
            <Route element={<PrivateRoute allowedRoles={['Admin', 'GestorClub']} />}>
              <Route path="/club" element={<Clubs />} />
              <Route path="/club/new" element={<ClubForm />} />
              <Route path="/club/:id" element={<ClubForm />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['Admin', 'GestorClub', 'Entrenador']} />}>
              <Route path="/equipo" element={<Equipos />} />
              <Route path="/equipo/new" element={<EquipoForm />} />
              <Route path="/equipo/:id" element={<EquipoForm />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}
