import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/users/login`,
            { email, password },
            config
        );

        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    const register = async (name, email, password) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/users`,
            { name, email, password },
            config
        );

        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    const googleLogin = async (tokenId) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            console.log('Sending Google token to server...');
            console.log('API URL:', import.meta.env.VITE_API_URL);

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/google`,
                { tokenId },
                config
            );

            console.log('Google login successful:', data);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
        } catch (error) {
            console.error('Google login failed in AuthContext:', error);
            throw error; // Re-throw so the calling component can handle it
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
