import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import RegisterApp from './components/apps/RegisterApp';
import BrowseApps from './components/apps/BrowseApps';
import ManageRequests from './components/apps/ManageRequests';
import ManageAppUsers from './components/apps/ManageAppUsers';
import Documentation from './components/docs/Documentation';
import OAuthLogin from './components/oauth/OAuthLogin';
import OAuthSignup from './components/oauth/OAuthSignup';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* OAuth routes - public */}
            <Route path="/oauth/login" element={<OAuthLogin />} />
            <Route path="/oauth/signup" element={<OAuthSignup />} />

            {/* Main app routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apps/new"
              element={
                <ProtectedRoute>
                  <RegisterApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apps/edit/:id"
              element={
                <ProtectedRoute>
                  <RegisterApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse-apps"
              element={
                <ProtectedRoute>
                  <BrowseApps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-requests"
              element={
                <ProtectedRoute>
                  <ManageRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apps/:id/users"
              element={
                <ProtectedRoute>
                  <ManageAppUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documentation"
              element={
                <ProtectedRoute>
                  <Documentation />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
