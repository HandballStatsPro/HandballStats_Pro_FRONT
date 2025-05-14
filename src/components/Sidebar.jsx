import React, { useState, useEffect } from 'react';
import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaUser,
  FaUsers,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaUsersCog,
  FaFutbol,
  FaChartBar,
} from 'react-icons/fa';

const Sidebar = ({ onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const sidebarWidth = open ? 200 : 60;

  useEffect(() => {
    if (onToggle) onToggle(sidebarWidth);
  }, [open]);

  const backgroundStyles = {
    gradient: {
      background: 'linear-gradient(to bottom, #780000 0%, #669bbc 100%)',
    },
  };

  const linkItems = [
    { to: '/inicio', icon: <FaHome />, label: 'Inicio' },
    { to: '/profile', icon: <FaUser />, label: 'Perfil' },
    ...(user?.rol === 'Admin' 
      ? [{ to: '/users', icon: <FaUsers />, label: 'Usuarios' }] 
      : []),
    ...(['Admin', 'GestorClub'].includes(user?.rol) 
      ? [{ to: '/club', icon: <FaBuilding />, label: 'Clubes' }] 
      : []),
    { to: '/equipo', icon: <FaUsersCog />, label: 'Equipos' },
    { icon: <FaFutbol />, label: 'Partidos' },
    { icon: <FaChartBar />, label: 'Estadísticas' },
  ];

  return (
    <div
      style={{
        width: sidebarWidth,
        transition: 'width 0.3s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '10px',
        ...backgroundStyles.gradient,
      }}
      className="position-fixed text-white"
    >
      {/* Toggle */}
      <div>
        <button
          className="btn btn-sm btn-light m-2"
          onClick={() => setOpen(!open)}
          style={{
            borderRadius: '50%',
            backgroundColor: '#f4f3f2',
            border: 'none',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          {open ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        <Nav className="flex-column mt-3">
          {linkItems.map(({ to, icon, label }) => {
            const active = to && location.pathname === to;
            const baseStyles = {
              gap: '10px',
              fontWeight: active ? '600' : '500',
              color: active ? '#000' : '#fff',
              backgroundColor: active ? '#f4f3f2' : 'transparent',
              transition: 'all 0.3s ease',
              cursor: to ? 'pointer' : 'default',
            };

            const hoverStyles = `
              .sidebar-link:hover {
                background-color: #f4f3f2 !important;
                color: black !important;
              }
            `;

            const link = to ? (
              <Nav.Link
                as={Link}
                to={to}
                className="d-flex align-items-center px-3 py-2 my-1 rounded sidebar-link"
                style={baseStyles}
              >
                {icon}
                {open && label}
              </Nav.Link>
            ) : (
              <div
                className="d-flex align-items-center px-3 py-2 my-1 rounded sidebar-link"
                style={baseStyles}
              >
                {icon}
                {open && label}
              </div>
            );

            return (
              <React.Fragment key={label}>
                <style>{hoverStyles}</style>
                {open ? (
                  link
                ) : (
                  <OverlayTrigger
                    placement="right"
                    overlay={<Tooltip id={`tooltip-${label}`}>{label}</Tooltip>}
                  >
                    <div>{link}</div>
                  </OverlayTrigger>
                )}
              </React.Fragment>
            );
          })}
        </Nav>
      </div>

      {/* Logout */}
      {user && (
        <div className="mb-3">
          <style>{`
            .logout-link:hover {
              background-color: #f4f3f2 !important;
              color: black !important;
            }
          `}</style>
          <OverlayTrigger
            placement="right"
            overlay={<Tooltip id="tooltip-logout">Cerrar sesión</Tooltip>}
          >
            <Nav.Link
              onClick={logout}
              className="d-flex align-items-center px-3 py-2 rounded mx-2 logout-link"
              style={{
                gap: '10px',
                color: 'black',
                fontWeight: '500',
                transition: 'all 0.3s ease',
              }}
            >
              <FaSignOutAlt />
              {open && <span style={{ color: 'black' }}>Cerrar Sesión</span>}
            </Nav.Link>
          </OverlayTrigger>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
