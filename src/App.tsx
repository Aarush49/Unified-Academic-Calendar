import { Routes, Route } from 'react-router-dom';
import { SetupView } from './views/SetupView';
import { AppShell } from './components/AppShell';

function App() {
  return (
    <Routes>
      <Route path="/setup" element={<SetupView />} />
      <Route path="/*" element={<AppShell />} />
    </Routes>
  );
}

export default App;
