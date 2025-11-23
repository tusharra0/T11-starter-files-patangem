import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return;
        }

        fetch(`${BACKEND_URL}/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(async (res) => {
            if (!res.ok) {
                throw new Error("Invalid token");
            }
            const data = await res.json();
            setUser(data.user);
        })
        .catch(() => {
            localStorage.removeItem("token");
            setUser(null);
        });
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const login = async (username, password) => {
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) {
                return data.message;
            }

            localStorage.setItem("token", data.token);
            const profileRes = await fetch(`${BACKEND_URL}/user/me`, {
                headers: { Authorization: `Bearer ${data.token}` }
            });
            const profile = await profileRes.json();
            setUser(profile.user);
            navigate("/profile");
            return "";
        } catch (err) {
            return "An error occurred";
        }
    };

    const register = async (userData) => {
        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if (res.status === 201) {
                navigate("/success");
                return "";
            }
            return data.message;
        } catch (err) {
            return "An error occurred";
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
