import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Todo.css";

const Todo = () => {
  const [task, setTask] = useState({
    title: "",
    priority: "Medium Priority",
    category: "Personal",
    dueDate: "",
    dueTime: "",
    reminder: "No reminder",
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setTask({
      title: "",
      priority: "Medium Priority",
      category: "Personal",
      dueDate: "",
      dueTime: "",
      reminder: "No reminder",
      notes: ""
    });
  };

  return (
    <div className="todo-container bg-gradient text-dark min-vh-100 p-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold text-purple">TaskMaster</h1>
            <p className="text-muted">Organize your life, one task at a time</p>
          </div>
          <button className="btn btn-outline-dark rounded-pill">Profile</button>
        </div>

        <div className="row mb-4">
          <div className="col-md-3">
            <div className="bg-white rounded-4 p-3 mb-4 shadow-sm">
              <h5 className="fw-semibold">📈 Progress Overview</h5>
              <div className="d-flex justify-content-between my-3 text-center">
                <div><h4>0</h4><p>Total</p></div>
                <div><h4>0</h4><p>Done</p></div>
                <div><h4>0</h4><p>Pending</p></div>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <div className="progress-bar bg-primary" style={{ width: "0%" }}></div>
              </div>
              <p className="text-center mt-2">0% Complete</p>
            </div>

            <div className="bg-white rounded-4 p-3 shadow-sm">
              <h5 className="fw-semibold">⚙️ Filters</h5>
              <div className="form-check my-2">
                <input type="radio" className="form-check-input" name="filter" /> All Tasks
              </div>
              <div className="form-check my-2">
                <input type="radio" className="form-check-input" name="filter" /> Active
              </div>
              <div className="form-check my-2">
                <input type="radio" className="form-check-input" name="filter" /> Completed
              </div>
              <div className="form-check my-2">
                <input type="radio" className="form-check-input" name="filter" /> Overdue
              </div>

              <hr />
              <h6>Priority Filter</h6>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" /> <span className="badge bg-danger">High</span>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" /> <span className="badge bg-warning text-dark">Medium</span>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" /> <span className="badge bg-info text-dark">Low</span>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
              <h4 className="fw-semibold mb-3">➕ Add New Task</h4>
              <div className="row g-3">
                <div className="col-md-6">
                  <input type="text" className="form-control" placeholder="Task Title" name="title" value={task.title} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <select className="form-select" name="priority" value={task.priority} onChange={handleChange}>
                    <option>High Priority</option>
                    <option>Medium Priority</option>
                    <option>Low Priority</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-select" name="category" value={task.category} onChange={handleChange}>
                    <option>Personal</option>
                    <option>Work</option>
                    <option>Study</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <input type="date" className="form-control" name="dueDate" value={task.dueDate} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <input type="time" className="form-control" name="dueTime" value={task.dueTime} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <select className="form-select" name="reminder" value={task.reminder} onChange={handleChange}>
                    <option>No reminder</option>
                    <option>5 min before</option>
                    <option>1 hr before</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <textarea className="form-control" name="notes" rows="3" placeholder="Additional notes..." value={task.notes} onChange={handleChange}></textarea>
                </div>

                <div className="col-md-12 text-end">
                  <button className="btn btn-secondary me-2" onClick={resetForm}>Reset</button>
                  <button className="btn btn-primary">+ Add Task</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-4 p-3 shadow-sm d-flex justify-content-between align-items-center">
              <input type="text" className="form-control w-50" placeholder="Search tasks..." />
              <select className="form-select w-auto ms-3">
                <option>Sort by Due Date</option>
                <option>Sort by Priority</option>
              </select>
              <div className="ms-3">
                <button className="btn btn-outline-secondary me-1">🔲</button>
                <button className="btn btn-outline-secondary">🔳</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;
