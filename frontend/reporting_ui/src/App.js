import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import PartList from './components/PartList';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import OrderForm from './components/OrderForm';
import ShipmentList from './components/ShipmentList';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import * as api from './services/api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  // Using a simple state for isAuthenticated. A Context API would be more robust for larger apps.

  const navigate = useNavigate(); // Hook for navigation, needs to be called within Router context

  useEffect(() => {
    // Listen to storage changes to reflect login/logout from other tabs/windows
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // Navigation will be handled by LoginPage component
  };

  const handleLogout = async () => {
    try {
      await api.logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if server logout fails, clear client-side state
    } finally {
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    // <Router> No longer needed here if App is wrapped in index.js or if useNavigate is used carefully
      <div className="App">
        <header className="App-header">
          <h1>Spare Parts Reporting System</h1>
          <nav>
            {isAuthenticated && (
              <ul className="nav-links">
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/parts">Manage Parts</Link></li>
                <li><Link to="/orders">Manage Orders</Link></li>
                <li><Link to="/shipments">Manage Shipments</Link></li>
              </ul>
            )}
            <div className="auth-controls">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="logout-button">Logout</button>
              ) : (
                <Link to="/login" className="login-link">Login</Link>
              )}
            </div>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/" element={<ProtectedRoute />}> {/* Parent route for protected content */}
              <Route index element={<Dashboard />} /> {/* Default protected route */}
              <Route path="parts" element={<PartList />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/new" element={<OrderForm />} />
              <Route path="orders/:orderId" element={<OrderDetail />} />
              <Route path="orders/:orderId/edit" element={<OrderForm />} />
              <Route path="shipments" element={<ShipmentList />} />
            </Route>
          </Routes>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    // </Router>
  );
}

// It's common to wrap App with Router in index.js if using useNavigate in App itself
// For this structure, let's assume Router is in index.js or adjust App to not use useNavigate directly
// Or, create a sub-component for the header/nav that uses useNavigate if App itself can't be under Router directly.

// For simplicity of this task, we'll modify App to ensure navigate is used correctly.
// The most straightforward way is to have a component that uses navigate *inside* the Router context.
// The App component itself is often the one providing the Router context.

// Corrected structure for App if it's the top-level component providing Router
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper; // Export AppWrapper
