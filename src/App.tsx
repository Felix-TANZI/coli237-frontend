import { Navigate, Route, Routes } from 'react-router-dom';
import { Agents } from './pages/Agents';
import { Connexion } from './pages/Connexion';
import { Coursiers } from './pages/Coursiers';
import { Export } from './pages/Export';
import { Partenaires } from './pages/Partenaires';
import { TableauDeBord } from './pages/TableauDeBord';
import { AccueilAgent } from './pages/agent/AccueilAgent';
import { Recenser } from './pages/agent/Recenser';
import { MesFiches } from './pages/agent/MesFiches';

function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />

      {/* Espace admin */}
      <Route path="/tableau-de-bord" element={<TableauDeBord />} />
      <Route path="/coursiers" element={<Coursiers />} />
      <Route path="/partenaires" element={<Partenaires />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/export" element={<Export />} />

      {/* Espace agent */}
      <Route path="/agent" element={<AccueilAgent />} />
      <Route path="/agent/recenser" element={<Recenser />} />
      <Route path="/agent/fiches" element={<MesFiches />} />

      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  );
}

export default App;