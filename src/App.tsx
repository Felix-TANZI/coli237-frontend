import { Navigate, Route, Routes } from 'react-router-dom';
import { Connexion } from './pages/Connexion';
import { TableauDeBord } from './pages/TableauDeBord';

function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/tableau-de-bord" element={<TableauDeBord />} />
      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  );
}

export default App;