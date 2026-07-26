import axios from 'axios';

const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: URL_API,
});

// Ajoute automatiquement le jeton a chaque requete, s'il existe.
api.interceptors.request.use((config) => {
  const jeton = localStorage.getItem('coli_jeton');
  if (jeton) {
    config.headers.Authorization = `Bearer ${jeton}`;
  }
  return config;
});