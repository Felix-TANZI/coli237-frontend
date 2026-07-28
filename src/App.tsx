import { Navigate, Route, Routes } from 'react-router-dom';
import { Agents } from './pages/Agents';
import { Connexion } from './pages/Connexion';
import { Export } from './pages/Export';
import { TableauDeBord } from './pages/TableauDeBord';
import { Utilisateurs } from './pages/admin/Utilisateurs';
import { Compagnies } from './pages/admin/Compagnies';
import { AccueilAgent } from './pages/agent/AccueilAgent';
import { Recenser } from './pages/agent/Recenser';
import { MesFiches } from './pages/agent/MesFiches';
import { Profil } from './pages/agent/Profil';
import { CompagniesAgent } from './pages/agent/CompagniesAgent';

function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />

      {/* Espace admin */}
      <Route path="/tableau-de-bord" element={<TableauDeBord />} />
      <Route path="/utilisateurs" element={<Utilisateurs />} />
      <Route path="/compagnies" element={<Compagnies />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/export" element={<Export />} />

      {/* Espace agent */}
      <Route path="/agent" element={<AccueilAgent />} />
      <Route path="/agent/recenser" element={<Recenser />} />
      <Route path="/agent/fiches" element={<MesFiches />} />
      <Route path="/agent/profil" element={<Profil />} />
      <Route path="/agent/compagnies" element={<CompagniesAgent />} />

      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  );
}

export default App;