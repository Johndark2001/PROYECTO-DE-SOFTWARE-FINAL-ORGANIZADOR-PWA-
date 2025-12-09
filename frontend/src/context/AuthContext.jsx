// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -------------------------------------------------------
    // 🔍 CHECK AUTH — Basado en localStorage
    // -------------------------------------------------------
    const checkAuth = useCallback(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setIsAuthenticated(true);
            setUser(JSON.parse(savedUser));
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // -------------------------------------------------------
    // 🔐 LOGIN — Solo localStorage
    // -------------------------------------------------------
    const login = async (email, password) => {
        setError(null);

        if (!email || !password || password.length < 3) {
            const msg = "Correo o contraseña inválidos";
            setError(msg);
            throw new Error(msg);
        }

        // Simulación de usuario
        const fakeUser = { email, name: email.split('@')[0] };

        localStorage.setItem("user", JSON.stringify(fakeUser));
        setIsAuthenticated(true);
        setUser(fakeUser);

        return fakeUser;
    };

    // -------------------------------------------------------
    // 🧾 REGISTER — Solo localStorage
    // -------------------------------------------------------
    const register = async (email, password) => {
        setError(null);

        if (!email || !password || password.length < 3) {
            const msg = "Correo o contraseña inválidos";
            setError(msg);
            throw new Error(msg);
        }

        const fakeUser = { email, name: email.split('@')[0] };

        localStorage.setItem("user", JSON.stringify(fakeUser));
        setIsAuthenticated(true);
        setUser(fakeUser);

        return fakeUser;
    };

    // -------------------------------------------------------
    // 🚪 LOGOUT
    // -------------------------------------------------------
    const logout = () => {
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                error,
                login,
                register,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
