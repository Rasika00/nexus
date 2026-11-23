const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const port = 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);
db.run('PRAGMA foreign_keys = ON');

// Helper function to handle async DB queries
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const sessions = new Map();
const loginAttempts = new Map();

const cleanText = (value, maxLength = 200) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>]/g, '').slice(0, maxLength);
};

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const isValidEmail = (email) => typeof email === 'string'
  && email.length <= 254
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Authentication required' });
  req.user = session;
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

app.post('/api/logout', authenticate, (req, res) => {
  const authorization = req.headers.authorization || '';
  sessions.delete(authorization.slice(7));
  res.json({ message: 'Logged out successfully' });
});

// --- USERS ROUTES ---

app.get('/api/users', authenticate, async (req, res) => {
  try {
    const users = await dbAll('SELECT id, email, full_name, role, created_at FROM Users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', authenticate, requireAdmin, async (req, res) => {
  const email = cleanText(req.body.email, 254).toLowerCase();
  const full_name = cleanText(req.body.full_name, 100);
  const role = ['Admin', 'Manager', 'User'].includes(req.body.role) ? req.body.role : 'User';
  if (!isValidEmail(email) || !full_name) {
    return res.status(400).json({ error: 'Valid email and full name are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash('password', 10);
    const result = await dbRun('INSERT INTO Users (email, password, full_name, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, full_name, role || 'User']);
    res.status(201).json({ id: result.id, email, full_name, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const email = cleanText(req.body.email, 254).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const full_name = cleanText(req.body.full_name, 100);
  if (!isValidEmail(email) || password.length < 6 || password.length > 72 || !full_name) {
    return res.status(400).json({ error: 'Valid email, full name, and password (min 6 chars) are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await dbRun('INSERT INTO Users (email, password, full_name, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, full_name, 'User']);
    res.status(201).json({ id: result.id, email, full_name, role: 'User' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const email = cleanText(req.body.email, 254).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!isValidEmail(email) || !password) return res.status(400).json({ error: 'Valid email and password required' });
  const attempts = loginAttempts.get(email) || { count: 0, until: 0 };
  if (Date.now() < attempts.until) {
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }
  try {
    const users = await dbAll('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length > 0) {
      const user = users[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        loginAttempts.delete(email);
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, { id: user.id, email: user.email, full_name: user.full_name, role: user.role });
        return res.json({ token, id: user.id, email: user.email, full_name: user.full_name, role: user.role });
      }
    }
    attempts.count += 1;
    if (attempts.count >= 5) attempts.until = Date.now() + 5 * 60 * 1000;
    loginAttempts.set(email, attempts);
    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  const email = cleanText(req.body.email, 254).toLowerCase();
  const full_name = cleanText(req.body.full_name, 100);
  const role = ['Admin', 'Manager', 'User'].includes(req.body.role) ? req.body.role : 'User';
  if (!isPositiveInteger(req.params.id) || !isValidEmail(email) || !full_name) {
    return res.status(400).json({ error: 'Valid email and full name are required' });
  }
  try {
    await dbRun('UPDATE Users SET email = ?, full_name = ?, role = ? WHERE id = ?', [email, full_name, role, req.params.id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!isPositiveInteger(req.params.id)) return res.status(400).json({ error: 'Invalid user ID' });
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' });
    await dbRun('DELETE FROM Users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROJECTS ROUTES ---

app.get('/api/projects', authenticate, async (req, res) => {
  try {
    const projects = await dbAll(`
      SELECT p.*, u.full_name as owner_name 
      FROM Projects p 
      LEFT JOIN Users u ON p.owner_id = u.id
    `);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', authenticate, async (req, res) => {
  const name = cleanText(req.body.name, 150);
  const description = cleanText(req.body.description, 1000);
  const status = ['Active', 'Planning', 'Completed', 'Archived'].includes(req.body.status) ? req.body.status : 'Active';
  const owner_id = req.body.owner_id;
  if (!name || !description || !isPositiveInteger(owner_id)) return res.status(400).json({ error: 'Valid name, description, and owner are required' });
  try {
    const result = await dbRun(
      'INSERT INTO Projects (name, description, status, owner_id) VALUES (?, ?, ?, ?)', 
      [name, description, status || 'Active', owner_id]
    );
    res.status(201).json({ id: result.id, name, description, status, owner_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
  const name = cleanText(req.body.name, 150);
  const description = cleanText(req.body.description, 1000);
  const status = ['Active', 'Planning', 'Completed', 'Archived'].includes(req.body.status) ? req.body.status : 'Active';
  const owner_id = req.body.owner_id;
  if (!isPositiveInteger(req.params.id) || !name || !description || !isPositiveInteger(owner_id)) return res.status(400).json({ error: 'Valid project fields are required' });
  try {
    await dbRun(
      'UPDATE Projects SET name = ?, description = ?, status = ?, owner_id = ? WHERE id = ?', 
      [name, description, status, owner_id, req.params.id]
    );
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  try {
    if (!isPositiveInteger(req.params.id)) return res.status(400).json({ error: 'Invalid project ID' });
    await dbRun('DELETE FROM Projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TASKS ROUTES ---

app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const tasks = await dbAll(`
      SELECT t.*, p.name as project_name, u.full_name as assigned_name 
      FROM Tasks t 
      LEFT JOIN Projects p ON t.project_id = p.id
      LEFT JOIN Users u ON t.assigned_to = u.id
    `);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', authenticate, async (req, res) => {
  const title = cleanText(req.body.title, 200);
  const status = ['Pending', 'In Progress', 'Completed', 'Blocked'].includes(req.body.status) ? req.body.status : 'Pending';
  const due_date = req.body.due_date || null;
  const project_id = req.body.project_id;
  const assigned_to = req.body.assigned_to || null;
  if (!title || !isPositiveInteger(project_id)) return res.status(400).json({ error: 'Valid title and project are required' });
  if (assigned_to !== null && !isPositiveInteger(assigned_to)) return res.status(400).json({ error: 'Invalid assigned user' });
  if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) return res.status(400).json({ error: 'Invalid due date' });
  try {
    const result = await dbRun(
      'INSERT INTO Tasks (title, status, due_date, project_id, assigned_to) VALUES (?, ?, ?, ?, ?)', 
      [title, status || 'Pending', due_date, project_id, assigned_to]
    );
    res.status(201).json({ id: result.id, title, status, due_date, project_id, assigned_to });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', authenticate, async (req, res) => {
  const title = cleanText(req.body.title, 200);
  const status = ['Pending', 'In Progress', 'Completed', 'Blocked'].includes(req.body.status) ? req.body.status : 'Pending';
  const due_date = req.body.due_date || null;
  const project_id = req.body.project_id;
  const assigned_to = req.body.assigned_to || null;
  if (!isPositiveInteger(req.params.id) || !title || !isPositiveInteger(project_id)) return res.status(400).json({ error: 'Valid task fields are required' });
  if (assigned_to !== null && !isPositiveInteger(assigned_to)) return res.status(400).json({ error: 'Invalid assigned user' });
  if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) return res.status(400).json({ error: 'Invalid due date' });
  try {
    await dbRun(
      'UPDATE Tasks SET title = ?, status = ?, due_date = ?, project_id = ?, assigned_to = ? WHERE id = ?', 
      [title, status, due_date, project_id, assigned_to, req.params.id]
    );
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    if (!isPositiveInteger(req.params.id)) return res.status(400).json({ error: 'Invalid task ID' });
    await dbRun('DELETE FROM Tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// START SERVER
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
