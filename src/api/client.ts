import axios from 'axios';

const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: URL_API,
});

// Ajoute le jeton a chaque requete. Cherche dans les deux stockages :
// localStorage (se souvenir) ou sessionStorage (session seule).
api.interceptors.request.use((config) => {
  const jeton =
    localStorage.getItem('coli_jeton') ?? sessionStorage.getItem('coli_jeton');
  if (jeton) {
    config.headers.Authorization = `Bearer ${jeton}`;
  }
  return config;
});