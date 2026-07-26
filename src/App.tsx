import { Navigate, Route, Routes } from "react-router-dom";
import { Connexion } from "./pages/Connexion";

function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route
        path="/tableau-de-bord"
        element={<div className="p-8">Tableau de bord (à venir)</div>}
      />
      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  );
}

export default App;
