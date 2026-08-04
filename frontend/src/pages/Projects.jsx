import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, AlertTriangle, CheckCircle, Folder } from 'lucide-react';
import './Management.css'; // Reusing the same CSS

const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type} animate-fade-in`}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
    <span>{message}</span>
    <button onClick={onClose} className="toast-close"><X size={16} /></button>
  </div>
);

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active', owner_id: '' });
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, usersRes] = await Promise.all([
        fetch('http://localhost:3001/api/projects'),
        fetch('http://localhost:3001/api/users')
      ]);
      const projData = await projRes.json();
      const usersData = await usersRes.json();
      setProjects(projData);
      setUsers(usersData);
    } catch (err) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setSelectedProject(project);
      setFormData({ 
        name: project.name, 
        description: project.description, 
        status: project.status, 
        owner_id: project.owner_id 
      });
    } else {
      setSelectedProject(null);
      setFormData({ name: '', description: '', status: 'Active', owner_id: users.length > 0 ? users[0].id : '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedProject 
        ? `http://localhost:3001/api/projects/${selectedProject.id}` 
        : 'http://localhost:3001/api/projects';
      const method = selectedProject ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast(`Project successfully ${selectedProject ? 'updated' : 'added'}`);
        setIsModalOpen(false);
        fetchData();
      } else {
        throw new Error(data.error || 'Operation failed');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${selectedProject.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Project successfully deleted');
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="management-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="page-header flex-between">
        <div>
          <h1>Projects Management</h1>
          <p>Create and track database projects and applications.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </header>

      <div className="helios-card data-container">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search projects..." 
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
                <th>Project Name</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Created At</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <div className="spinner mx-auto" style={{ width: '30px', height: '30px' }}></div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-content">
                      <div className="empty-icon-wrapper"><Folder size={32} /></div>
                      <h3>No projects found</h3>
                      <p>Try adjusting your search criteria or add a new project.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map(project => (
                  <tr key={project.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar sm bg-blue" style={{background: 'rgba(52, 211, 153, 0.2)', color: 'var(--color-success)'}}><Folder size={14} /></div>
                        <div>
                          <div className="user-name">{project.name}</div>
                          <div className="user-email" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>{project.owner_name || 'Unassigned'}</td>
                    <td>{new Date(project.created_at).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button className="icon-btn edit" onClick={() => handleOpenModal(project)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => { setSelectedProject(project); setIsDeleteModalOpen(true); }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content helios-card">
            <div className="modal-header">
              <h2>{selectedProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label className="input-label">Project Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select 
                  className="input-field"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Project Owner</label>
                <select 
                  className="input-field"
                  value={formData.owner_id}
                  onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
                  required
                >
                  <option value="">Select an Owner</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{selectedProject ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content helios-card confirm-modal">
            <div className="confirm-icon warning">
              <AlertTriangle size={32} />
            </div>
            <h2>Delete Project?</h2>
            <p>Are you sure you want to delete <strong>{selectedProject?.name}</strong>? This action cannot be undone.</p>
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

export default Projects;
