import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import "./Todo.css";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ProgressBar,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Todo = () => {
  const { user, profile } = useAuth();
  const [task, setTask] = useState({
    title: "",
    category: "Personal",
    dueDateTime: "",
    reminder: "",
    notes: "",
    priority: "Medium Priority",
  });
  const [tasks, setTasks] = useState([]);
  const [audioMap, setAudioMap] = useState({});

  // Fetch tasks from backend
  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:5000/tasks?email=${user.email}`)
        .then((res) => setTasks(res.data))
        .catch((err) => console.error("Error loading tasks:", err));
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updatedTasks = tasks.map((t) => {
        if (!t.reminder || t.played) return t;
        const taskTime = new Date(t.dueDateTime);
        const reminderTime = new Date(taskTime);
        switch (t.reminder) {
          case "1 min before": reminderTime.setMinutes(reminderTime.getMinutes() - 1); break;
          case "5 min before": reminderTime.setMinutes(reminderTime.getMinutes() - 5); break;
          case "1 hour before": reminderTime.setHours(reminderTime.getHours() - 1); break;
          default: return t;
        }
        if (
          now >= reminderTime &&
          now <= new Date(reminderTime.getTime() + 60000) &&
          profile.alarmSong &&
          !t.played
        ) {
          const audio = new Audio(profile.alarmSong);
          audio.play();
          setAudioMap((prev) => ({ ...prev, [t.id]: audio }));

          // Mark task as played in backend
          axios.put(`http://localhost:5000/tasks/${t.id}`, { played: true });
          return { ...t, played: true };
        }
        return t;
      });
      setTasks(updatedTasks);
    }, 30000);
    return () => clearInterval(interval);
  }, [tasks, profile, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      ...task,
      id: Date.now(),
      played: false,
      user_email: user.email,
    };
    axios
      .post("http://localhost:5000/tasks", newTask)
      .then(() => {
        setTasks((prev) => [...prev, newTask]);
        setTask({
          title: "",
          category: "Personal",
          dueDateTime: "",
          reminder: "",
          notes: "",
          priority: "Medium Priority",
        });
      })
      .catch((err) => console.error("Error adding task:", err));
  };

  const handleDelete = (id) => {
    const audio = audioMap[id];
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }

    axios
      .delete(`http://localhost:5000/tasks/${id}`)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setAudioMap((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      })
      .catch((err) => console.error("Error deleting task:", err));
  };

  // ... your existing JSX structure remains unchanged


  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.played).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "30px",
        paddingBottom: "60px",
        background: "linear-gradient(to right, #6a85b6, #bac8e0)",
      }}
    >
      <Container fluid="md">
        <Row>
          {/* Left Sidebar */}
          <Col md={4}>
            <Card className="mb-4 shadow rounded-4">
              <Card.Body>
                <Card.Title className="fw-semibold fs-5">📈 Progress Overview</Card.Title>
                <div className="d-flex justify-content-between mt-3 mb-3">
                  <div className="text-center">
                    <h4 className="text-primary">{totalTasks}</h4>
                    <small>Total</small>
                  </div>
                  <div className="text-center">
                    <h4 className="text-success">{completedTasks}</h4>
                    <small>Done</small>
                  </div>
                  <div className="text-center">
                    <h4 className="text-warning">{pendingTasks}</h4>
                    <small>Pending</small>
                  </div>
                </div>
                <ProgressBar now={progressPercent} label={`${progressPercent}% Complete`} />
              </Card.Body>
            </Card>

            <Card className="shadow rounded-4">
              <Card.Body>
                <Card.Title className="fw-semibold fs-5">🧭 Filters</Card.Title>
                <div className="mt-3">
                  <div className="mb-2"><strong>All Tasks</strong></div>
                  <div className="form-check"><input className="form-check-input" type="checkbox" /> Active</div>
                  <div className="form-check"><input className="form-check-input" type="checkbox" /> Completed</div>
                  <div className="form-check"><input className="form-check-input" type="checkbox" /> Overdue</div>
                </div>

                <hr />
                <div>
                  <strong>Priority Filter</strong>
                  <div className="form-check text-danger"><input className="form-check-input" type="checkbox" /> High Priority</div>
                  <div className="form-check text-warning"><input className="form-check-input" type="checkbox" /> Medium Priority</div>
                  <div className="form-check text-info"><input className="form-check-input" type="checkbox" /> Low Priority</div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Main Area */}
          <Col md={8}>
            <Card className="mb-4 shadow rounded-4">
              <Card.Body>
                <Card.Title className="fw-semibold fs-4">➕ Add New Task</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Task Title</Form.Label>
                        <Form.Control
                          placeholder="What needs to be done?"
                          value={task.title}
                          onChange={(e) => setTask({ ...task, title: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                          value={task.priority}
                          onChange={(e) => setTask({ ...task, priority: e.target.value })}
                        >
                          <option>High Priority</option>
                          <option>Medium Priority</option>
                          <option>Low Priority</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={task.category}
                          onChange={(e) => setTask({ ...task, category: e.target.value })}
                        >
                          <option>Personal</option>
                          <option>Work</option>
                          <option>Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                      <Form.Label>Due Date & Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={task.dueDateTime}
                        onChange={(e) => setTask({ ...task, dueDateTime: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Reminder</Form.Label>
                        <Form.Select
                          value={task.reminder}
                          onChange={(e) => setTask({ ...task, reminder: e.target.value })}
                        >
                          <option value="">No reminder</option>
                          <option>1 min before</option>
                          <option>5 min before</option>
                          <option>1 hour before</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Notes (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Add any additional details..."
                      value={task.notes}
                      onChange={(e) => setTask({ ...task, notes: e.target.value })}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2">Reset</Button>
                    <Button variant="primary" type="submit">+ Add Task</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Task list can be added here */}
            <div className="d-flex mb-4 bg-white p-3 rounded shadow justify-content-between align-items-center">
              <Form.Control placeholder="Search tasks..." className="me-2" />
              <Form.Select style={{ width: "200px" }}>
                <option>Sort by Due Date</option>
                <option>Sort by Priority</option>
              </Form.Select>
            </div>

            {tasks.map((t) => (
              <Card key={t.id} className="mb-3 shadow-sm rounded-4">
                <Card.Body>
                  <Card.Title>{t.title}</Card.Title>
                  <Card.Subtitle className="text-muted mb-2">
                    {t.category} | {t.priority}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Due:</strong> {new Date(t.dueDateTime).toLocaleString()}<br />
                    <strong>Reminder:</strong> {t.reminder || "None"}<br />
                    <strong>Notes:</strong> {t.notes}
                  </Card.Text>
                  <Button variant="danger" onClick={() => handleDelete(t.id)}>Delete</Button>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Todo;
