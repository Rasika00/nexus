const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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
  try {
    const result = await dbRun('INSERT INTO Users (email, full_name, role) VALUES (?, ?, ?)', [email, full_name, role || 'User']);
    res.status(201).json({ id: result.id, email, full_name, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { email, full_name, role } = req.body;
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
