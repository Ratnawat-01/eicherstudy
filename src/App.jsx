import React, { useState, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, Users, FileBarChart, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TelephonicForm from './pages/TelephonicForm';
import InPersonForm from './pages/InPersonForm';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change (when user taps a nav link on mobile)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
      {/* Hamburger Button (visible only on mobile via CSS) */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Backdrop overlay for mobile sidebar */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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

