import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Management from './pages/Management';
import Login from './pages/Login';
import Settings from './pages/Settings';
import './index.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <div className="app-container">
                <Sidebar />
                <div className="main-content">
                  <Navbar onLogout={() => setIsAuthenticated(false)} />
                  <main className="page-content animate-fade-in">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/management/*" element={<Management />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" />} />
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
