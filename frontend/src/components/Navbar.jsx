import React from 'react';

const Navbar = ({ onLogout, user }) => {
  return (
    <header className="navbar">
      <div className="nav-header"></div>

      <div className="nav-actions">
        <div className="user-profile" onClick={onLogout} style={{ cursor: 'pointer' }} title="Click to Logout">
          <div className="avatar">{user?.full_name?.charAt(0) || 'U'}</div>
          <div className="user-profile-info">
            <strong>{user?.full_name || 'User'}</strong>
            <span>{user?.email || ''}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
