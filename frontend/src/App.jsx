import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Management from './pages/Management';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import { getSession, clearSession } from './api';
import './index.css';
import './App.css';

function App() {
  const [session, setSession] = useState(() => getSession());
  const isAuthenticated = Boolean(session?.token);

  const handleLogin = (nextSession) => setSession(nextSession);
  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <div className="app-container">
                <Sidebar user={session} />
                <div className="main-content">
                  <Navbar onLogout={handleLogout} user={session} />
                  <main className="page-content animate-fade-in">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/management/*" element={session?.role === 'Admin' ? <Management /> : <Navigate to="/dashboard" replace />} />
                      <Route path="/projects/*" element={<Projects />} />
                      <Route path="/tasks/*" element={<Tasks />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
