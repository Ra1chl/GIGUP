//Nastavení Axiosu + automatické přidávání JWT

import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatické přiložení JWT tokenu z localStorage
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('gigup_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;