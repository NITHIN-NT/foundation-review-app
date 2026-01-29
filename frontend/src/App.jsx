import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import ReviewerDashboard from './pages/ReviewerDashboard';
import StartReview from './pages/StartReview';
import ReviewSession from './pages/ReviewSession';
import ReviewReport from './pages/ReviewReport';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />

        {/* Admin Side Only */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']} allowSuperuser={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* User (Reviewer) Side */}
        <Route element={<ProtectedRoute allowedRoles={['REVIEWER']} allowSuperuser={true}><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/reviewer" replace />} />
          <Route path="/reviewer" element={<ReviewerDashboard />} />
          <Route path="/start-review" element={<StartReview />} />
          <Route path="/review/:id" element={<ReviewSession />} />
          <Route path="/report/:id" element={<ReviewReport />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
