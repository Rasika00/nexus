import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, AlertTriangle, CheckCircle, CheckSquare } from 'lucide-react';
import './Management.css'; 

const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type} animate-fade-in`}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
    <span>{message}</span>
    <button onClick={onClose} className="toast-close"><X size={16} /></button>
  </div>
);

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', status: 'Pending', due_date: '', project_id: '', assigned_to: '' });
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projRes, usersRes] = await Promise.all([
        fetch('http://localhost:3001/api/tasks'),
        fetch('http://localhost:3001/api/projects'),
        fetch('http://localhost:3001/api/users')
      ]);
      const tasksData = await tasksRes.json();
      const projData = await projRes.json();
      const usersData = await usersRes.json();
      setTasks(tasksData);
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

  const handleOpenModal = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setFormData({ 
        title: task.title, 
        status: task.status, 
        due_date: task.due_date, 
        project_id: task.project_id,
        assigned_to: task.assigned_to 
      });
    } else {
      setSelectedTask(null);
      setFormData({ 
        title: '', 
        status: 'Pending', 
        due_date: new Date().toISOString().split('T')[0], 
        project_id: projects.length > 0 ? projects[0].id : '',
        assigned_to: users.length > 0 ? users[0].id : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedTask 
        ? `http://localhost:3001/api/tasks/${selectedTask.id}` 
        : 'http://localhost:3001/api/tasks';
      const method = selectedTask ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast(`Task successfully ${selectedTask ? 'updated' : 'added'}`);
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
      const res = await fetch(`http://localhost:3001/api/tasks/${selectedTask.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Task successfully deleted');
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.project_name && t.project_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="management-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="page-header flex-between">
        <div>
          <h1>Tasks Management</h1>
          <p>Assign, track, and manage database tasks across projects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </header>

      <div className="helios-card data-container">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks or projects..." 
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
                <th>Task Title</th>
                <th>Status</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="spinner mx-auto" style={{ width: '30px', height: '30px' }}></div>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <div className="empty-icon-wrapper"><CheckSquare size={32} /></div>
                      <h3>No tasks found</h3>
                      <p>Try adjusting your search criteria or add a new task.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar sm bg-purple" style={{background: 'rgba(195, 142, 196, 0.2)', color: 'var(--color-primary)'}}><CheckSquare size={14} /></div>
                        <div>
                          <div className="user-name">{task.title}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${task.status.toLowerCase().replace(' ', '-')}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>{task.project_name || 'No Project'}</td>
                    <td>{task.assigned_name || 'Unassigned'}</td>
                    <td>{task.due_date || 'N/A'}</td>
                    <td className="actions-cell">
                      <button className="icon-btn edit" onClick={() => handleOpenModal(task)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => { setSelectedTask(task); setIsDeleteModalOpen(true); }} title="Delete">
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
              <h2>{selectedTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label className="input-label">Task Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Due Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Project</label>
                <select 
                  className="input-field"
                  value={formData.project_id}
                  onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                  required
                >
                  <option value="">Select a Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Assigned To</label>
                <select 
                  className="input-field"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                >
                  <option value="">Select a User (Optional)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{selectedTask ? 'Save Changes' : 'Create Task'}</button>
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
            <h2>Delete Task?</h2>
            <p>Are you sure you want to delete <strong>{selectedTask?.title}</strong>? This action cannot be undone.</p>
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

export default Tasks;
