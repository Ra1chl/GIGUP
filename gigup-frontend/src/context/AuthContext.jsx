//Stav přihlášeného uživatele (user, role, login, logout)

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('gigup_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData, token) => {
        localStorage.setItem('gigup_token', token);
        localStorage.setItem('gigup_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('gigup_token');
        localStorage.removeItem('gigup_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);