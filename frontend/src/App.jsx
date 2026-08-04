import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Management from './pages/Management';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
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
                      <Route path="/" element={<Navigate to="/projects" replace />} />
                      <Route path="/management/*" element={<Management />} />
                      <Route path="/projects/*" element={<Projects />} />
                      <Route path="/tasks/*" element={<Tasks />} />
                      <Route path="*" element={<Navigate to="/projects" replace />} />
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
