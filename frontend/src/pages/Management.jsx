import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import './Management.css';

// Simple Toast Component
const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type} animate-fade-in`}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
    <span>{message}</span>
    <button onClick={onClose} className="toast-close"><X size={16} /></button>
  </div>
);

const Management = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ email: '', full_name: '', role: 'User' });
  
  // Toast state
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({ email: user.email, full_name: user.full_name, role: user.role });
    } else {
      setSelectedUser(null);
      setFormData({ email: '', full_name: '', role: 'User' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedUser 
        ? `http://localhost:3001/api/users/${selectedUser.id}` 
        : 'http://localhost:3001/api/users';
      const method = selectedUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showToast(`User successfully ${selectedUser ? 'updated' : 'added'}`);
        setIsModalOpen(false);
        fetchUsers();
      } else {
        throw new Error('Operation failed');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${selectedUser.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('User successfully deleted');
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="management-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="page-header flex-between">
        <div>
          <h1>User Management</h1>
          <p>Manage system access, roles, and permissions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </header>

      <div className="helios-card data-container">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary filter-btn">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Created At</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    <div className="spinner mx-auto" style={{ width: '30px', height: '30px' }}></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">
                    <div className="empty-content">
                      <div className="empty-icon-wrapper"><Search size={32} /></div>
                      <h3>No users found</h3>
                      <p>Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar sm">{user.full_name.charAt(0)}</div>
                        <div>
                          <div className="user-name">{user.full_name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button className="icon-btn edit" onClick={() => handleOpenModal(user)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="table-pagination">
          <span>Showing 1 to {filteredUsers.length} of {filteredUsers.length} entries</span>
          <div className="pagination-controls">
            <button className="btn btn-secondary" disabled>Previous</button>
            <button className="btn btn-secondary" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content helios-card">
            <div className="modal-header">
              <h2>{selectedUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select 
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{selectedUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content helios-card confirm-modal">
            <div className="confirm-icon warning">
              <AlertTriangle size={32} />
            </div>
            <h2>Delete User?</h2>
            <p>Are you sure you want to delete <strong>{selectedUser?.full_name}</strong>? This action cannot be undone.</p>
            <div className="modal-footer justify-center mt-4">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;
