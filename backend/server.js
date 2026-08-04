const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

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

// --- USERS ROUTES ---

app.get('/api/users', async (req, res) => {
  try {
    const users = await dbAll('SELECT * FROM Users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { email, full_name, role } = req.body;
  if (!email || !email.includes('@') || !full_name) {
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
  const { email, password, full_name, role } = req.body;
  if (!email || !email.includes('@') || !password || password.length < 6 || !full_name) {
    return res.status(400).json({ error: 'Valid email, full name, and password (min 6 chars) are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await dbRun('INSERT INTO Users (email, password, full_name, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, full_name, role || 'User']);
    res.status(201).json({ id: result.id, email, full_name, role });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const users = await dbAll('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length > 0) {
      const user = users[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        res.json({ id: user.id, email: user.email, full_name: user.full_name, role: user.role });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { email, full_name, role } = req.body;
  if (!email || !email.includes('@') || !full_name) {
    return res.status(400).json({ error: 'Valid email and full name are required' });
  }
  try {
    await dbRun('UPDATE Users SET email = ?, full_name = ?, role = ? WHERE id = ?', [email, full_name, role, req.params.id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM Users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROJECTS ROUTES ---

app.get('/api/projects', async (req, res) => {
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

app.post('/api/projects', async (req, res) => {
  const { name, description, status, owner_id } = req.body;
  if (!name || !description) return res.status(400).json({ error: 'Name and description are required' });
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

app.put('/api/projects/:id', async (req, res) => {
  const { name, description, status, owner_id } = req.body;
  if (!name || !description) return res.status(400).json({ error: 'Name and description are required' });
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

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM Projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TASKS ROUTES ---

app.get('/api/tasks', async (req, res) => {
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

app.post('/api/tasks', async (req, res) => {
  const { title, status, due_date, project_id, assigned_to } = req.body;
  if (!title || !project_id) return res.status(400).json({ error: 'Title and Project ID are required' });
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

app.put('/api/tasks/:id', async (req, res) => {
  const { title, status, due_date, project_id, assigned_to } = req.body;
  if (!title || !project_id) return res.status(400).json({ error: 'Title and Project ID are required' });
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

app.delete('/api/tasks/:id', async (req, res) => {
  try {
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
