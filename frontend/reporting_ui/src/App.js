import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PartList from './components/PartList';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import OrderForm from './components/OrderForm';
import ShipmentList from './components/ShipmentList';
import Dashboard from './components/Dashboard'; // Import Dashboard
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Spare Parts Reporting System</h1>
          <nav>
            <ul className="nav-links">
              <li><Link to="/">Dashboard</Link></li> {/* Dashboard as prominent link */}
              <li><Link to="/parts">Manage Parts</Link></li>
              <li><Link to="/orders">Manage Orders</Link></li>
              <li><Link to="/shipments">Manage Shipments</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} /> {/* Default to Dashboard */}
            <Route path="/parts" element={<PartList />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/new" element={<OrderForm />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/orders/:orderId/edit" element={<OrderForm />} />
            <Route path="/shipments" element={<ShipmentList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
