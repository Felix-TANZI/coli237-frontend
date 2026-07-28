import { api } from "./client";

interface ReponseConnexion {
  jeton: string;
  agent: {
    id: string;
    nom: string;
    email: string;
    role: "AGENT" | "ADMIN";
    doitChangerMotDePasse: boolean;
  };
}

// Connexion. Si "seSouvenir", le jeton persiste (localStorage) ;
// sinon il ne dure que la session de l'onglet (sessionStorage).
export async function seConnecter(
  identifiant: string,
  motDePasse: string,
  seSouvenir = true,
) {
  const { data } = await api.post<ReponseConnexion>("/auth/connexion", {
    identifiant,
    motDePasse,
  });

  const stockage = seSouvenir ? localStorage : sessionStorage;
  stockage.setItem("coli_jeton", data.jeton);
  stockage.setItem("coli_agent", JSON.stringify(data.agent));
  return data;
}

// Inscription libre d'un agent. Connecte directement apres creation.
export async function sinscrire(
  nom: string,
  email: string,
  telephone: string,
  motDePasse: string,
  seSouvenir = true,
) {
  const { data } = await api.post<ReponseConnexion>('/auth/inscription', {
    nom,
    email,
    telephone,
    motDePasse,
  });

  const stockage = seSouvenir ? localStorage : sessionStorage;
  stockage.setItem('coli_jeton', data.jeton);
  stockage.setItem('coli_agent', JSON.stringify(data.agent));
  return data;
}

export function seDeconnecter() {
  localStorage.removeItem("coli_jeton");
  localStorage.removeItem("coli_agent");
  sessionStorage.removeItem("coli_jeton");
  sessionStorage.removeItem("coli_agent");
}

export function agentConnecte() {
  const brut =
    localStorage.getItem("coli_agent") ?? sessionStorage.getItem("coli_agent");
  return brut ? JSON.parse(brut) : null;
}
