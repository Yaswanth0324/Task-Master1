import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import SpeechSynthesis from "./SpeechSynthesis";
import "./Todo.css";
import { Modal } from "react-bootstrap";

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

const initialTask = {
  title: "",
  category: "Personal",
  dueDateTime: "",
  reminder: false,
  notes: "",
  priority: "Medium Priority",
  alarmType: "aiVoice",
};

const Todo = () => {
  const { user } = useAuth();
  const [task, setTask] = useState(initialTask);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [speechText, setSpeechText] = useState("");
  const tasksRef = useRef(tasks);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const API = process.env.REACT_APP_API_URL;
  

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (user) {
      axios
        .get(`${API}/tasks?email=${user.email}`)
        .then((res) => setTasks(res.data))
        .catch((err) => console.error("Error loading tasks:", err));
    }
  }, [user]);

 useEffect(() => {
  // Ask notification permission once
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  const interval = setInterval(() => {
    const now = new Date();

    for (const t of tasksRef.current) {
      if (t.played || !t.dueDateTime) continue;

      const taskTime = new Date(t.dueDateTime);

      if (now >= taskTime && now <= new Date(taskTime.getTime() + 60000)) {
        const msg = `Reminder: You have a task titled "${t.title}" that is running.`;

        // ✅ In-app popup
        setPopupMessage(msg);
        setShowPopup(true);

        // ✅ System-level notification
        if (Notification.permission === "granted") {
          new Notification("Task Reminder", {
            body: msg,
            icon: "/icon.png", // optional
          });
        }
        if (Notification.permission === "granted") {
  new Notification("Task Reminder", {
    body: `Reminder: You have a task titled "${t.title}" that is running.`,
    icon: "/logo192.png", // optional
  });
}


        // ✅ AI Voice only if reminder is enabled
        if (parseInt(t.reminder) === 1) {
          setSpeechText(msg);
        }

        // ✅ Mark task as played
        axios.put(`${API}/tasks/${t.id}`, { played: true }).catch(console.error);
        setTasks((prev) =>
          prev.map((tsk) => (tsk.id === t.id ? { ...tsk, played: true } : tsk))
        );

        break;
      }
    }
  }, 30000);

  return () => clearInterval(interval);
}, [user]);

useEffect(() => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("✅ Notifications permission granted");
      } else {
        console.log("❌ Notifications permission denied");
      }
    });
  }
}, []);


useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);


useEffect(() => {
  if (speechText) {
    const utterance = new SpeechSynthesisUtterance(speechText);
    window.speechSynthesis.speak(utterance);
  }
}, [speechText]);



  const onSpeechEnd = () => setSpeechText("");

  const handleSubmit = (e) => {
  e.preventDefault();

  const formattedDue = task.dueDateTime
    ? new Date(task.dueDateTime).toISOString().slice(0, 19).replace("T", " ")
    : null;

  const newTask = {
    ...task,
    user_email: user.email,
    dueDateTime: formattedDue,  // ✅ send ISO format
    reminder: !!task.reminder,
    played: false,
  };

  axios.post(`${API}/tasks`, newTask)
    .then(() => axios.get(`${API}/tasks?email=${user.email}`))
    .then((res) => {
      setTasks(res.data);
      setTask(initialTask);
    })
    .catch((err) => console.error("❌ Error adding task:", err.message));
};


  const handleDelete = (id) => {
    axios
      .delete(`${API}/tasks/${id}`)
      .then(() => setTasks((prev) => prev.filter((t) => t.id !== id)))
      .catch((err) => console.error("Error deleting task:", err));
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.played).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const searchLower = search.trim().toLowerCase();
  let visibleTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(searchLower) || t.notes.toLowerCase().includes(searchLower)
  );
  if (sort === "date") {
    visibleTasks.sort((a, b) => new Date(a.dueDateTime) - new Date(b.dueDateTime));
  } else if (sort === "priority") {
    const priorities = { "High Priority": 0, "Medium Priority": 1, "Low Priority": 2 };
    visibleTasks.sort((a, b) => priorities[a.priority] - priorities[b.priority]);
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: 30, paddingBottom: 60, background: "linear-gradient(to right, #6a85b6, #bac8e0)" }}>
      <Container fluid="md">
        <Row>
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
          </Col>
          <Col md={8}>
            <Card className="mb-4 shadow rounded-4">
              <Card.Body>
                <Card.Title className="fw-semibold fs-4">➕ Add New Task</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="task-title">
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
                      <Form.Group className="mb-3" controlId="task-priority">
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
                      <Form.Group className="mb-3" controlId="task-category">
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
                      <Form.Group className="mb-3" controlId="task-due">
                        <Form.Label>Due Date & Time</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={task.dueDateTime}
                          onChange={(e) => setTask({ ...task, dueDateTime: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 mt-4" controlId="task-reminder">
                        <Form.Check
                          type="checkbox"
                          label="Reminder"
                          checked={task.reminder}
                          onChange={(e) => setTask({ ...task, reminder: e.target.checked })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 mt-4" controlId="task-alarmType">
                        <Form.Label>Alarm Type</Form.Label>
                        <Form.Select
                          value={task.alarmType}
                          onChange={(e) => setTask({ ...task, alarmType: e.target.value })}
                        >
                          <option value="aiVoice">AI Voice</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="task-notes">
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
                    <Button variant="secondary" className="me-2" onClick={() => setTask(initialTask)} type="button">
                      Reset
                    </Button>
                    <Button variant="primary" type="submit">
                      + Add Task
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="d-flex mb-4 bg-white p-3 rounded shadow justify-content-between align-items-center">
              <Form.Control
                placeholder="Search tasks..."
                className="me-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Form.Select style={{ width: "200px" }} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="date">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
              </Form.Select>
            </div>

            {visibleTasks.map((t) => (
              <Card key={t.id} className="mb-3 shadow-sm rounded-4">
                <Card.Body>
                  <Card.Title>{t.title}</Card.Title>
                  <Card.Subtitle className="text-muted mb-2">
                    {t.category} | {t.priority}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Due:</strong> {t.dueDateTime ? new Date(t.dueDateTime).toLocaleString() : "No due date"}
                    <br />
                    <strong>Reminder:</strong> {parseInt(t.reminder) === 1 ? "Yes" : "No"}
                    <br />
                    <strong>Notes:</strong> {t.notes}
                  </Card.Text>
                  <Button variant="danger" onClick={() => handleDelete(t.id)}>
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>

        {speechText && <SpeechSynthesis text={speechText} onEnd={onSpeechEnd} />}

        <Modal show={showPopup} onHide={() => setShowPopup(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Task Reminder</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p dangerouslySetInnerHTML={{ __html: popupMessage.replace(/"(.*?)"/g, '<strong>"$1"</strong>') }} />
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowPopup(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>

      </Container>
    </div>
  );
};

export default Todo;
