const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const mongoose = require("mongoose");
const multer = require("multer");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// MySQL connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "24YashL03@",
//   database: "taskmaster_db",
// });
const db = mysql.createConnection({
  host: 'mainline.proxy.rlwy.net',
  user: 'root',
  password: 'MsltVKvCXNNFAwUETUyAJNxoLVhzIKWJ',
  database: 'railway',
  port: 52557,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err);
  else console.log("✅ MySQL connected");
});

// MongoDB connection
const mongoURI = "mongodb+srv://taskuser:R4BKoH7duqE0o2M9@cluster0.hber7.mongodb.net/taskmaster?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));



const profileSchema = new mongoose.Schema({
  email: String,
  name: String, // fetched from MySQL
  mobile: String,
  address: String,
  profileImage: { data: Buffer, contentType: String },
  profileImageName: String,
});
const Profile = mongoose.model("Profile", profileSchema);

// Helper: get name from MySQL as a Promise
const getNameFromMySQL = (email) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT name FROM users WHERE email = ?", [email], (err, results) => {
      if (err) reject(err);
      else if (results.length === 0) reject(new Error("User not found in MySQL"));
      else resolve(results[0].name);
    });
  });
};

// Signup route
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length > 0)
      return res.status(400).json({ error: "Email already registered" });

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
      (err) => {
        if (err) return res.status(500).json({ error: "Signup failed" });
        res.json({ message: "✅ Signup successful" });
      }
    );
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length === 0 || results[0].password !== password)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = results[0];
    res.json({ id: user.id, name: user.name, email: user.email });
  });
});

// GET user (name,email) from MySQL for frontend
app.get("/user/:email", (req, res) => {
  const email = req.params.email;

  db.query(
    "SELECT name, email FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("MySQL error:", err); // 👈 Add this
        return res.status(500).json({ error: "Server error", details: err.message }); // 👈 Show details
      }
      if (results.length === 0)
        return res.status(404).json({ error: "User not found" });
      res.json(results[0]);
    }
  );
});


// Save profile (get name from MySQL, store address, mobile, image in MongoDB)
app.post("/profile", upload.single("profileImage"), async (req, res) => {
  const { email, mobile, address } = req.body;
  const profileImageFile = req.file;

  try {
    const name = await getNameFromMySQL(email);
    const updatedFields = { name, mobile, address };

    if (profileImageFile) {
      updatedFields.profileImage = {
        data: profileImageFile.buffer,
        contentType: profileImageFile.mimetype,
      };
      updatedFields.profileImageName = profileImageFile.originalname;
    }

    let existing = await Profile.findOne({ email });

    if (existing) {
      await Profile.updateOne({ email }, { $set: updatedFields });
    } else {
      await Profile.create({ email, ...updatedFields });
    }

    res.status(200).json({ message: "✅ Profile saved successfully" });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "❌ Error saving profile" });
  }
});

// Get profile
app.get("/profile/:email", async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.params.email });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    res.json({
      email: profile.email,
      name: profile.name,
      mobile: profile.mobile,
      address: profile.address,
      profileImageBase64: profile.profileImage?.data.toString("base64") || null,
      profileImageContentType: profile.profileImage?.contentType || null,
      profileImageName: profile.profileImageName || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// Insert task
app.post("/tasks", (req, res) => {
  const {
    user_email, title, category, dueDateTime, notes,
    reminder, priority, played, alarmType,
  } = req.body;

  // Debug log
  console.log("Received task:", req.body);

  const playedInt = played ? 1 : 0;
  const reminderInt = reminder ? 1 : 0;

  const sql = `INSERT INTO tasks (user_email, title, category, dueDateTime, notes, reminder, priority, played, alarmType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [user_email, title, category, dueDateTime, notes, reminderInt, priority, playedInt, alarmType],
    (err, results) => {
      if (err) {
        console.error("MySQL error inserting task:", err);  // Full error visible
        return res.status(500).json({ error: "Failed to add task", details: err.message });
      }
      res.json({ message: "✅ Task added successfully" });
    }
  );
});

// Update task
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const fieldsToUpdate = req.body;
  const keys = Object.keys(fieldsToUpdate);
  if (!keys.length) return res.status(400).json({ error: "No fields to update provided." });

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = Object.values(fieldsToUpdate);

  db.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, [...values, id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update task" });
    res.json({ message: "✅ Task updated successfully" });
  });
});

// Get tasks
app.get("/tasks", (req, res) => {
  const { email } = req.query;
  db.query("SELECT * FROM tasks WHERE user_email = ? ORDER BY dueDateTime ASC", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  db.query("DELETE FROM tasks WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete task" });
    res.json({ message: "✅ Task deleted successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
