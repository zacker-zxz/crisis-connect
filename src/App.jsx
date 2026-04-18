import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import NgoDashboard from './pages/NgoDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/ngo-dashboard" element={<NgoDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
