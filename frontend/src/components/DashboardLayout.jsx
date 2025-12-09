// frontend/src/components/DashboardLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaUser,
    FaSignOutAlt,
    FaCalendarDay,
    FaCalendarWeek,
    FaThList,
    FaClock,
    FaChartBar,
    FaCogs,
} from 'react-icons/fa';
import './DashboardLayout.css';

const Sidebar = ({ user, logout }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Hoy', icon: FaCalendarDay },
        { path: '/semana', label: 'Semana', icon: FaCalendarWeek },
        { path: '/kanban', label: 'Kanban', icon: FaThList },
        { path: '/pomodoro', label: 'Pomodoro', icon: FaClock },
        { path: '/eisenhower', label: 'Eisenhower', icon: FaChartBar },
        { path: '/settings', label: 'Configuración', icon: FaCogs },
    ];

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h1 className="app-title">Organizador</h1>
            </div>

            <div className="user-info">
                <div className="user-avatar">
                    <FaUser />
                </div>
                <div className="user-details">
                    <h4>{user?.email}</h4>
                    <p>Conectado</p>
                </div>
            </div>

            <ul className="nav-links">
                {navItems.map((item) => (
                    <li key={item.path} className="nav-item">
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                isActive ? 'nav-link-item active' : 'nav-link-item'
                            }
                            end={item.path === '/'}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt /> Salir
                </button>
            </div>
        </nav>
    );
};

function DashboardLayout() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="dashboard-container">
            <Sidebar user={user} logout={logout} />
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;
