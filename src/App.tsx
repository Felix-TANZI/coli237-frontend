import { Navigate, Route, Routes } from "react-router-dom";
import { Agents } from "./pages/Agents";
import { Connexion } from "./pages/Connexion";
import { Export } from "./pages/Export";
import { TableauDeBord } from "./pages/TableauDeBord";
import { AccueilAgent } from "./pages/agent/AccueilAgent";
import { Recenser } from "./pages/agent/Recenser";
import { MesFiches } from "./pages/agent/MesFiches";
import { Profil } from "./pages/agent/Profil";
import { Compagnies } from './pages/admin/Compagnies';

function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />

      {/* Espace admin */}
      <Route path="/tableau-de-bord" element={<TableauDeBord />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/export" element={<Export />} />
      <Route path="/compagnies" element={<Compagnies />} />

      {/* Espace agent */}
      <Route path="/agent" element={<AccueilAgent />} />
      <Route path="/agent/recenser" element={<Recenser />} />
      <Route path="/agent/fiches" element={<MesFiches />} />
      <Route path="/agent/profil" element={<Profil />} />

      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  );
}

export default App;
