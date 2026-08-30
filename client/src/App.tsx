import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { LoadingPage } from './pages/loadingpage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { ComplaintFormPage } from './pages/ComplaintFormPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Opening Interface of the Website with integrated Login & Registration */}
        <Route path="/" element={<LoadingPage />} />
        
        {/* Main Portal Application Layout */}
        <Route element={<Layout />}>
          <Route path="/overview" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/report" element={<ComplaintFormPage />} />
          <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/dashboard/:role" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
