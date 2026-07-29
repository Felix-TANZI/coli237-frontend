# COLI237 — Frontend

Interface web de la plateforme de recensement de livreurs **COLI237**.
Développée avec React, Vite, TypeScript et Tailwind CSS.

> Éditeur : NET AND PROSYSTEMS SARL

---

## Aperçu

Application à deux espaces, servie depuis une même base de code :

- **Espace agent** : recensement des personnes sur le terrain (avec un mode hors ligne), gestion des compagnies, suivi de ses fiches et de son activité.
- **Espace admin** : tableau de bord, validation des fiches, gestion des agents, export des données.

L'interface est bilingue (français / anglais) et pensée pour le mobile comme pour le poste fixe.

---

## Prérequis

- **Node.js** 20 ou plus (testé sur Node 24)
- **pnpm** (gestionnaire de paquets)
- Le **backend COLI237** en cours d'exécution (voir son dépôt)

---

## Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-depot-frontend>
cd coli237-frontend

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'URL de l'API
cp .env.example .env    # si un exemple existe, sinon créer .env
# puis renseigner VITE_API_URL (voir Configuration)

# 4. Lancer en développement
pnpm dev
```

L'application démarre sur `http://localhost:5173`.

---

## Configuration

Le frontend n'a besoin que d'une variable :

| Variable | Rôle | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3000` |

À placer dans un fichier `.env` à la racine :

```
VITE_API_URL=http://localhost:3000
```

Si la variable n'est pas définie, l'application se rabat par défaut sur `http://localhost:3000`.

> En production, définir `VITE_API_URL` sur l'URL publique de l'API avant de lancer `pnpm build`.

---

## Lancer le projet

```bash
# Développement (rechargement à chaud)
pnpm dev

# Compilation de production
pnpm build

# Prévisualiser le build de production
pnpm preview
```

---

## Scripts utiles

| Commande | Effet |
|---|---|
| `pnpm dev` | Lance le serveur de développement Vite |
| `pnpm build` | Vérifie les types puis compile pour la production |
| `pnpm preview` | Sert localement le build de production |
| `pnpm lint` | Analyse le code (ESLint) |

Vérification des types seule :

```bash
pnpm exec tsc --noEmit -p tsconfig.app.json
```

---

## Structure

```
src/
├── api/              Appels à l'API (auth, personnes, compagnies, export...)
│   └── client.ts     Instance Axios (lit VITE_API_URL, injecte le jeton)
├── composants/       Composants réutilisables
│   ├── formulaire/   Champs (téléphone, validation), écran de succès
│   ├── BarreNav.tsx  Navigation admin
│   └── NavAgent.tsx  Navigation agent
├── pages/
│   ├── admin/        Utilisateurs, compagnies, modales
│   ├── agent/        Accueil, recenser, mes fiches, compagnies, profil
│   ├── Connexion.tsx Connexion et inscription
│   ├── Export.tsx    Export Excel / PDF
│   └── TableauDeBord.tsx
├── i18n/             Traductions (fr.json, en.json)
└── App.tsx           Routes
```

---

## Fonctionnalités principales

- **Authentification** : connexion par email ou téléphone, inscription libre d'un agent, changement de mot de passe.
- **Recensement** : formulaire unique adapté au rôle (livreur indépendant, livreur d'agence, admin de compagnie, manager d'agence), avec validation visuelle des champs et sélecteur de pays pour le téléphone.
- **Mode hors ligne** : les fiches saisies sans connexion sont mises en file et synchronisées au retour du réseau.
- **Compagnies** : création à la volée, rattachement d'un administrateur de compagnie.
- **Tableau de bord admin** : métriques, répartition par rôle, état des validations, classement des agents les plus actifs.
- **Export** : Excel et PDF, filtrables par rôle.
- **Bilingue** : bascule français / anglais.

---

## Conseils de développement

- Le stockage du jeton dépend de l'option « Se souvenir de moi » : `localStorage` (session persistante) ou `sessionStorage` (session courte).
- Après modification, vérifier la compilation :
  ```bash
  pnpm exec tsc --noEmit -p tsconfig.app.json
  ```
- Formater avant de committer :
  ```bash
  pnpm exec prettier --write .
  ```

---

## Licence

Projet privé — NET AND PROSYSTEMS SARL. Tous droits réservés.