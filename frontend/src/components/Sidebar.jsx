import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, HelpCircle, Hexagon } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Hexagon className="icon" size={24} />
        <span>NexusDB</span>
      </div>
      
      <nav className="nav-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/management" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Database size={18} />
          <span>Management</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button className="nav-link" style={{ background: 'transparent', textAlign: 'left', width: '100%', cursor: 'pointer' }}>
          <HelpCircle size={18} />
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
