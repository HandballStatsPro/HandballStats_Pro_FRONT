import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

console.log('[DEBUG] VITE_API_URL:', import.meta.env.VITE_API_URL);

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Mostrar la URL completa de la petición
  console.log(`[DEBUG] Sending request to: ${config.baseURL}${config.url}`);
  console.log('[DEBUG] Method:', config.method.toUpperCase());
  console.log('[DEBUG] Headers:', config.headers);
  console.log('[DEBUG] Data:', config.data);

  return config;
});

api.interceptors.response.use(
  response => {
    console.log('[DEBUG] Response:', response);
    return response;
  },
  error => {
    console.error('[ERROR] Response:', error.response);
    return Promise.reject(error);
  }
);

export default api;
