import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, CheckSquare, Clock, AlertCircle, CheckCircle2, 
  Folder, Calendar, Edit2, Trash2, X, AlertTriangle, ArrowRight, 
  RotateCcw, Sparkles, Kanban, List
} from 'lucide-react';
import './Management.css';
import './Dashboard.css';

const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type} animate-fade-in`}>
    {type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
    <span>{message}</span>
    <button onClick={onClose} className="toast-close"><X size={16} /></button>
  </div>
);

const STATUS_CONFIG = {
  'Pending': {
    title: 'Pending',
    dotClass: 'dot-pending',
    badgeClass: 'role-pending',
    nextStatus: 'In Progress',
    nextActionLabel: 'Start',
  },
  'In Progress': {
    title: 'In Progress',
    dotClass: 'dot-in-progress',
    badgeClass: 'role-in-progress',
    nextStatus: 'Completed',
    nextActionLabel: 'Complete',
  },
  'Completed': {
    title: 'Completed',
    dotClass: 'dot-completed',
    badgeClass: 'role-completed',
    nextStatus: 'Pending',
    nextActionLabel: 'Reopen',
  },
  'Blocked': {
    title: 'Blocked',
    dotClass: 'dot-blocked',
    badgeClass: 'role-blocked',
    nextStatus: 'In Progress',
    nextActionLabel: 'Resume',
  }
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Modals & Notifications
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    status: 'Pending',
    due_date: new Date().toISOString().split('T')[0],
    project_id: '',
    assigned_to: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projRes, usersRes] = await Promise.all([
        fetch('http://localhost:3001/api/tasks'),
        fetch('http://localhost:3001/api/projects'),
        fetch('http://localhost:3001/api/users')
      ]);
      const [tasksData, projData, usersData] = await Promise.all([
        tasksRes.json(),
        projRes.json(),
        usersRes.json()
      ]);
      setTasks(tasksData);
      setProjects(projData);
      setUsers(usersData);
    } catch {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.project_name && task.project_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.assigned_name && task.assigned_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesProject = selectedProjectId === 'ALL' || String(task.project_id) === String(selectedProjectId);

      return matchesSearch && matchesProject;
    });
  }, [tasks, searchQuery, selectedProjectId]);

  // Dashboard KPI metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const blocked = tasks.filter(t => t.status === 'Blocked').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, blocked, completionRate };
  }, [tasks]);

  // Project progress breakdown
  const projectSummaries = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const total = projectTasks.length;
      const completed = projectTasks.filter(t => t.status === 'Completed').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...project,
        taskCount: total,
        completedCount: completed,
        progress
      };
    });
  }, [projects, tasks]);

  // Open Create/Edit modal
  const handleOpenModal = (task = null, defaultStatus = 'Pending') => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        status: task.status,
        due_date: task.due_date || '',
        project_id: task.project_id || '',
        assigned_to: task.assigned_to || ''
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        status: defaultStatus,
        due_date: new Date().toISOString().split('T')[0],
        project_id: selectedProjectId !== 'ALL' ? selectedProjectId : (projects[0]?.id || ''),
        assigned_to: users[0]?.id || ''
      });
    }
    setIsModalOpen(true);
  };

  // Submit Task (Create or Update)
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
        showToast(`Task successfully ${selectedTask ? 'updated' : 'created'}`);
        setIsModalOpen(false);
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to save task');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Quick Status Transition
  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          status: newStatus,
          due_date: task.due_date,
          project_id: task.project_id,
          assigned_to: task.assigned_to
        })
      });

      if (res.ok) {
        showToast(`Moved "${task.title}" to ${newStatus}`);
        fetchData();
      } else {
        throw new Error('Status update failed');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Task
  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${selectedTask.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Task deleted successfully');
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Format Due Date & check overdue
  const checkDueStatus = (dueDate) => {
    if (!dueDate) return { text: 'No due date', status: 'normal' };
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) {
      return { text: `Overdue: ${dueDate}`, status: 'overdue' };
    } else if (dueDate === today) {
      return { text: 'Due Today', status: 'upcoming' };
    }
    return { text: dueDate, status: 'normal' };
  };

  return (
    <div className="dashboard-page animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Task Manager Dashboard</h1>
          <p>Monitor project workflows, prioritize tasks, and keep deadlines on schedule.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {/* KPI Metrics Cards */}
      <div className="metrics-grid">
        <div className="helios-card metric-card primary">
          <div className="metric-card-top">
            <span className="metric-label">Total Tasks</span>
            <div className="metric-icon-wrap"><CheckSquare size={20} /></div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{metrics.total}</span>
            <span className="metric-badge muted">{metrics.pending} pending</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${metrics.completionRate}%` }}></div>
          </div>
        </div>

        <div className="helios-card metric-card warning">
          <div className="metric-card-top">
            <span className="metric-label">In Progress</span>
            <div className="metric-icon-wrap"><Clock size={20} /></div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{metrics.inProgress}</span>
            <span className="metric-badge success">Active Work</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: metrics.total > 0 ? `${(metrics.inProgress / metrics.total) * 100}%` : '0%', background: 'linear-gradient(90deg, #FBBF24, #F59E0B)' }}></div>
          </div>
        </div>

        <div className="helios-card metric-card success">
          <div className="metric-card-top">
            <span className="metric-label">Completed</span>
            <div className="metric-icon-wrap"><CheckCircle2 size={20} /></div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{metrics.completed}</span>
            <span className="metric-badge success">{metrics.completionRate}% Done</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill success" style={{ width: `${metrics.completionRate}%` }}></div>
          </div>
        </div>

        <div className="helios-card metric-card danger">
          <div className="metric-card-top">
            <span className="metric-label">Blocked / Attention</span>
            <div className="metric-icon-wrap"><AlertCircle size={20} /></div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{metrics.blocked}</span>
            <span className="metric-badge muted">Needs Review</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: metrics.total > 0 ? `${(metrics.blocked / metrics.total) * 100}%` : '0%', background: 'linear-gradient(90deg, #F87171, #EF4444)' }}></div>
          </div>
        </div>
      </div>

      {/* Project Sprints / Progress Strip */}
      {projectSummaries.length > 0 && (
        <section className="projects-strip-section">
          <div className="section-subtitle">
            <Folder size={16} />
            <span>Active Projects Progress</span>
          </div>
          <div className="projects-strip">
            {projectSummaries.map(proj => (
              <div 
                key={proj.id} 
                className={`project-mini-card ${selectedProjectId === String(proj.id) ? 'active' : ''}`}
                onClick={() => setSelectedProjectId(selectedProjectId === String(proj.id) ? 'ALL' : String(proj.id))}
                title="Click to filter tasks by this project"
              >
                <div className="project-mini-card-head">
                  <span className="project-mini-title">
                    <Sparkles size={14} color="var(--color-primary)" />
                    {proj.name}
                  </span>
                  <span className="metric-badge muted">{proj.completedCount}/{proj.taskCount}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${proj.progress}%` }}></div>
                </div>
                <div className="project-mini-meta">
                  <span>{proj.progress}% finished</span>
                  <span>{proj.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Toolbar: Search, Project Filter & View Switcher */}
      <div className="helios-card dashboard-toolbar">
        <div className="filter-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Filter tasks, project, assignee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="ALL">All Projects ({tasks.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="view-toggle-group">
          <button 
            className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <Kanban size={15} />
            <span>Board</span>
          </button>
          <button 
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={15} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Main View: Kanban Board vs List Table */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board">
          {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
            const columnTasks = filteredTasks.filter(t => t.status === statusKey);
            return (
              <div key={statusKey} className="kanban-column">
                <div className="column-header">
                  <div className="column-header-title">
                    <span className={`status-indicator-dot ${config.dotClass}`}></span>
                    <span>{config.title}</span>
                    <span className="column-count-badge">{columnTasks.length}</span>
                  </div>
                  <button 
                    className="column-add-btn" 
                    title={`Add task to ${statusKey}`}
                    onClick={() => handleOpenModal(null, statusKey)}
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <div className="column-task-list">
                  {columnTasks.length === 0 ? (
                    <div className="column-empty">
                      <span>No tasks in {config.title}</span>
                    </div>
                  ) : (
                    columnTasks.map(task => {
                      const due = checkDueStatus(task.due_date);
                      return (
                        <div key={task.id} className="task-card">
                          <div className="task-card-header">
                            <span className="task-card-title">{task.title}</span>
                          </div>

                          {task.project_name && (
                            <span className="task-card-project">
                              <Folder size={12} />
                              <span>{task.project_name}</span>
                            </span>
                          )}

                          <div className="task-card-meta">
                            <div className="task-assignee">
                              <div className="task-avatar">
                                {task.assigned_name ? task.assigned_name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="task-assignee-name">
                                {task.assigned_name || 'Unassigned'}
                              </span>
                            </div>
                            <span className={`task-due ${due.status}`}>
                              <Calendar size={12} />
                              {due.text}
                            </span>
                          </div>

                          <div className="task-card-actions">
                            <button 
                              className="status-advance-btn"
                              title={`Advance status to ${config.nextStatus}`}
                              onClick={() => handleQuickStatusChange(task, config.nextStatus)}
                            >
                              {statusKey === 'Completed' ? <RotateCcw size={12} /> : <ArrowRight size={12} />}
                              <span>{config.nextActionLabel}</span>
                            </button>

                            <div className="task-icon-actions">
                              <button 
                                className="card-icon-btn" 
                                title="Edit Task"
                                onClick={() => handleOpenModal(task)}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                className="card-icon-btn delete" 
                                title="Delete Task"
                                onClick={() => { setSelectedTask(task); setIsDeleteModalOpen(true); }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View Mode */
        <div className="helios-card data-container">
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
                        <div className="user-name">{task.title}</div>
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
      )}

      {/* Create / Edit Task Modal */}
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
                  placeholder="e.g. Implement user authentication"
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

      {/* Delete Confirmation Modal */}
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

export default Dashboard;
