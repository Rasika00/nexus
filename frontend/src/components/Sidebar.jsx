import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, HelpCircle, Hexagon, Folder, CheckSquare } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Hexagon className="icon" size={24} />
        <span>NexusDB</span>
      </div>
      
      <nav className="nav-links">
        <NavLink 
          to="/projects" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Folder size={18} />
          <span>Projects</span>
        </NavLink>
        
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <CheckSquare size={18} />
          <span>Tasks</span>
        </NavLink>
        
        <NavLink 
          to="/management" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Database size={18} />
          <span>Users</span>
        </NavLink>
        
      </nav>
    </aside>
  );
};

export default Sidebar;
