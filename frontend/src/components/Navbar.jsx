import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

const Navbar = ({ onLogout }) => {
  return (
    <header className="navbar">
      <div className="nav-header">
        {/* We can leave this empty or put contextual titles here */}
      </div>

      <div className="nav-actions">
        <button className="action-btn" title="Notifications">
          <Bell size={18} />
        </button>
        <button className="action-btn" title="Settings">
          <Settings size={18} />
        </button>
        
        <div className="nav-search">
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Ask nexusDB anything" />
        </div>

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
