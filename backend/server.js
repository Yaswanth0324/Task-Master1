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

// Multer setup for file upload in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MySQL DB connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "24YashL03@",
  database: "taskmaster_db",
});

db.connect((err) => {
  if (err) console.error("❌ MySQL failed:", err);
  else console.log("✅ MySQL connected");
});

// MongoDB connection and schema
mongoose
  .connect("mongodb://localhost:27017/taskmaster")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const profileSchema = new mongoose.Schema({
  email: String,
  name: String,
  mobile: String,
  address: String,
  profileImage: { data: Buffer, contentType: String },
  profileImageName: String,
  alarmSong: { data: Buffer, contentType: String },
  alarmSongName: String,
});
const Profile = mongoose.model("Profile", profileSchema);

// Save profile with file uploads and names
app.post(
  "/save-profile",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "alarmSong", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { email, name, mobile } = req.body;
      const profileImage = req.files.profileImage?.[0];
      const alarmSong = req.files.alarmSong?.[0];

      let profile = await Profile.findOne({ email });

      if (profile) {
        if (profileImage) {
          profile.profileImage = {
            data: profileImage.buffer,
            contentType: profileImage.mimetype,
          };
          profile.profileImageName = profileImage.originalname;
        }
        if (alarmSong) {
          profile.alarmSong = {
            data: alarmSong.buffer,
            contentType: alarmSong.mimetype,
          };
          profile.alarmSongName = alarmSong.originalname;
        }
        if (name) profile.name = name;
        if (mobile) profile.mobile = mobile;

        await profile.save();
      } else {
        profile = new Profile({
          email,
          name,
          mobile,
          profileImage: profileImage
            ? { data: profileImage.buffer, contentType: profileImage.mimetype }
            : undefined,
          profileImageName: profileImage ? profileImage.originalname : undefined,
          alarmSong: alarmSong
            ? { data: alarmSong.buffer, contentType: alarmSong.mimetype }
            : undefined,
          alarmSongName: alarmSong ? alarmSong.originalname : undefined,
        });
        await profile.save();
      }

      res.json({ message: "✅ Profile saved successfully" });
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Insert task with alarmType
app.post("/tasks", (req, res) => {
  const {
    user_email,
    title,
    category,
    dueDateTime,
    notes,
    reminder,
    priority,
    played,
    alarmType,
  } = req.body;

  const sql = `
    INSERT INTO tasks (user_email, title, category, dueDateTime, notes, reminder, priority, played, alarmType)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [user_email, title, category, dueDateTime, notes, reminder, priority, played, alarmType],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting task:", err);
        return res.status(500).json({ error: "Failed to add task" });
      }
      res.json({ message: "✅ Task added successfully" });
    }
  );
});

// Update task with alarmType support
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { played, title, category, dueDateTime, notes, reminder, priority, alarmType } = req.body;

  const fieldsToUpdate = {};
  if(typeof played !== "undefined") fieldsToUpdate.played = played;
  if(title) fieldsToUpdate.title = title;
  if(category) fieldsToUpdate.category = category;
  if(dueDateTime) fieldsToUpdate.dueDateTime = dueDateTime;
  if(notes) fieldsToUpdate.notes = notes;
  if(typeof reminder !== "undefined") fieldsToUpdate.reminder = reminder;
  if(priority) fieldsToUpdate.priority = priority;
  if(alarmType) fieldsToUpdate.alarmType = alarmType;

  if(Object.keys(fieldsToUpdate).length === 0) 
    return res.status(400).json({ error: "No fields to update provided." });

  const setClause = Object.keys(fieldsToUpdate).map(k => `${k} = ?`).join(", ");
  const values = Object.values(fieldsToUpdate);
  const sql = `UPDATE tasks SET ${setClause} WHERE id = ?`;

  db.query(sql, [...values, id], (err, result) => {
    if(err) {
      console.error("❌ Error updating task:", err);
      return res.status(500).json({ error: "Failed to update task" });
    }
    res.json({ message: "✅ Task updated successfully" });
  });
});

// Get tasks for user
app.get("/tasks", (req, res) => {
  const { email } = req.query;
  db.query("SELECT * FROM tasks WHERE user_email = ? ORDER BY dueDateTime ASC", [email], (err, results) => {
    if(err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Delete task by id
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM tasks WHERE id = ?", [id], (err) => {
    if(err) return res.status(500).json({ error: "Failed to delete task" });
    res.json({ message: "✅ Task deleted successfully" });
  });
});

// Get profile (with alarm song file name)
app.get("/profile/:email", async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.params.email });
    if(!profile) return res.status(404).json({ error:"Profile not found" });

    res.json({
      email: profile.email,
      name: profile.name,
      mobile: profile.mobile,
      profileImageBase64: profile.profileImage?.data.toString("base64") || null,
      profileImageContentType: profile.profileImage?.contentType || null,
      profileImageName: profile.profileImageName || null,
      alarmSongBase64: profile.alarmSong?.data.toString("base64") || null,
      alarmSongContentType: profile.alarmSong?.contentType || null,
      alarmSongName: profile.alarmSongName || null,
    });
  } catch(err) {
    console.error("❌ Error fetching profile: ", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve alarm song audio stream
app.get("/profile/:email/alarmSong", async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.params.email });
    if(!profile || !profile.alarmSong?.data) return res.status(404).send("Alarm song not found");

    res.set("Content-Type", profile.alarmSong.contentType);
    res.send(profile.alarmSong.data);
  } catch(err) {
    console.error("❌ Error serving alarm song:", err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
