import React, { useState } from 'react';
import { User, Lock, Moon, Sun, Monitor, Bell } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('dark');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // In a real app, this would update context and body class
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings.</p>
      </header>

      <div className="settings-container">
        <aside className="settings-sidebar helios-card">
          <nav className="settings-nav">
            <button 
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} />
              <span>Security</span>
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Moon size={18} />
              <span>Appearance</span>
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </button>
          </nav>
        </aside>

        <main className="settings-content helios-card animate-fade-in">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <p className="section-desc">Update your account's profile information and email address.</p>
              
              <div className="profile-avatar-section">
                <div className="avatar lg">A</div>
                <div className="avatar-actions">
                  <button className="btn btn-primary">Change Avatar</button>
                  <button className="btn btn-secondary">Remove</button>
                </div>
              </div>

              <form className="settings-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input type="text" className="input-field" defaultValue="Admin User" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input type="email" className="input-field" defaultValue="admin@nexus.db" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Role</label>
                    <input type="text" className="input-field" defaultValue="Administrator" disabled />
                  </div>
                </div>
                <div className="form-actions-bottom">
                  <button className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Update Password</h2>
              <p className="section-desc">Ensure your account is using a long, random password to stay secure.</p>
              
              <form className="settings-form" style={{ maxWidth: '400px' }}>
                <div className="input-group">
                  <label className="input-label">Current Password</label>
                  <input type="password" className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <input type="password" className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <input type="password" className="input-field" />
                </div>
                <div className="form-actions-bottom">
                  <button className="btn btn-primary">Update Password</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <p className="section-desc">Customize the look and feel of the application.</p>
              
              <div className="theme-options">
                <div className={`theme-card ${theme === 'light' ? 'active' : ''}`} onClick={() => handleThemeChange('light')}>
                  <div className="theme-preview light-preview"></div>
                  <div className="theme-info">
                    <Sun size={18} />
                    <span>Light Mode</span>
                  </div>
                </div>
                <div className={`theme-card ${theme === 'dark' ? 'active' : ''}`} onClick={() => handleThemeChange('dark')}>
                  <div className="theme-preview dark-preview"></div>
                  <div className="theme-info">
                    <Moon size={18} />
                    <span>Dark Mode</span>
                  </div>
                </div>
                <div className={`theme-card ${theme === 'system' ? 'active' : ''}`} onClick={() => handleThemeChange('system')}>
                  <div className="theme-preview system-preview">
                    <div className="half-light"></div>
                    <div className="half-dark"></div>
                  </div>
                  <div className="theme-info">
                    <Monitor size={18} />
                    <span>System Preference</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
