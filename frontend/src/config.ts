export const API_URL = process.env.REACT_APP_API_URL || 'https://crm-barber-backend.onrender.com/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://crm-barber-backend.onrender.com';
export const APP_NAME = 'Clipper Cut Barber Sports';
export const APP_VERSION = '1.0.0';

// Asegurarse de que la URL base termine en /api
export const getBaseUrl = () => {
  return API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
};

// Configuración para RTK Query
export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers: Headers, { getState }: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  },
  credentials: 'include' as const
};
