import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

const Navbar = ({ onLogout }) => {
  return (
    <header className="navbar">
      <div className="nav-header">
        {/* We can leave this empty or put contextual titles here */}
      </div>

      <div className="nav-actions">
        <div className="user-profile" onClick={onLogout} style={{ cursor: 'pointer' }} title="Click to Logout">
          <div className="avatar">A</div>
          <div className="user-profile-info">
            <strong>Admin User</strong>
            <span>admin@nexus.db</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
