import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, Users, FileBarChart } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TelephonicForm from './pages/TelephonicForm';
import InPersonForm from './pages/InPersonForm';

function App() {
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <FileBarChart size={28} />
          <span>Eicher Study</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/form/telephonic" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <PhoneCall size={20} />
            Telephonic Interview
          </NavLink>
          <NavLink to="/form/in-person" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Users size={20} />
            In-Person Field Study
          </NavLink>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/form/telephonic" element={<TelephonicForm />} />
          <Route path="/form/in-person" element={<InPersonForm />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
