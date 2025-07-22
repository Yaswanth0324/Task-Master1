const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ⚠️ Update with your MySQL credentials
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '24YashL03@',
  database: 'taskmaster_db'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// Create tasks table if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT PRIMARY KEY,
    user_email VARCHAR(255),
    title VARCHAR(255),
    category VARCHAR(255),
    dueDateTime VARCHAR(255),
    reminder VARCHAR(255),
    notes TEXT,
    priority VARCHAR(255),
    played BOOLEAN DEFAULT false
  )
`);

app.get('/tasks', (req, res) => {
  const { email } = req.query;
  db.query('SELECT * FROM tasks WHERE user_email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/tasks', (req, res) => {
  const task = req.body;
  db.query('INSERT INTO tasks SET ?', task, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).send('Task added');
  });
});

app.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.send('Task deleted');
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
