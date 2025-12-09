// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// CONTEXTOS
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext.jsx';

// LAYOUTS
import DashboardLayout from './components/DashboardLayout';

// PÁGINAS
import Hoy from './pages/Hoy';
import Semana from './pages/Semana';
import Kanban from './pages/Kanban';
import Pomodoro from './pages/Pomodoro';
import Eisenhower from './pages/Eisenhower';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

import './App.css';


// -----------------------------------------------------------
// 🔐 1. PRIVATE ROUTE CORREGIDO (usa <Outlet />)
// -----------------------------------------------------------
function PrivateRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-app-state">Cargando autenticación...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}


// -----------------------------------------------------------
// 2. RUTAS
// -----------------------------------------------------------
const AppRoutes = () => (
    <Routes>

        {/* PÚBLICAS */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PRIVADAS */}
        <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
                <Route path="/" element={<Hoy />} />
                <Route path="/semana" element={<Semana />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/pomodoro" element={<Pomodoro />} />
                <Route path="/eisenhower" element={<Eisenhower />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>404: Página no encontrada</h1>} />

    </Routes>
);


// -----------------------------------------------------------
// 3. APP PRINCIPAL (Providers arriba de todo)
// -----------------------------------------------------------
export default function App() {
    return (
        <AuthProvider>
            <TaskProvider>
                <AppRoutes />
            </TaskProvider>
        </AuthProvider>
    );
}
