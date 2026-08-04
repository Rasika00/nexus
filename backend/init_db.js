const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');

// Remove existing DB for a fresh start
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Projects Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      owner_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES Users (id)
    )
  `);

  // Create Tasks Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      due_date DATE,
      project_id INTEGER NOT NULL,
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES Projects (id),
      FOREIGN KEY (assigned_to) REFERENCES Users (id)
    )
  `);

  // Insert seed data
  console.log('Inserting seed data...');
  
  const stmtUser = db.prepare("INSERT INTO Users (email, full_name, role) VALUES (?, ?, ?)");
  stmtUser.run("admin@example.com", "Admin User", "Admin");
  stmtUser.run("john@example.com", "John Doe", "User");
  stmtUser.finalize();

  const stmtProject = db.prepare("INSERT INTO Projects (name, description, status, owner_id) VALUES (?, ?, ?, ?)");
  stmtProject.run("Website Redesign", "Overhaul the main corporate website", "Active", 1);
  stmtProject.run("Mobile App V2", "Develop version 2.0 of the mobile app", "Planning", 2);
  stmtProject.finalize();

  const stmtTask = db.prepare("INSERT INTO Tasks (title, status, due_date, project_id, assigned_to) VALUES (?, ?, ?, ?, ?)");
  stmtTask.run("Design Mockups", "Completed", "2026-08-10", 1, 1);
  stmtTask.run("Implement Frontend", "In Progress", "2026-08-20", 1, 2);
  stmtTask.run("Setup Database", "Pending", "2026-08-25", 2, 1);
  stmtTask.finalize();

  console.log('Database initialized successfully.');
});

db.close();
