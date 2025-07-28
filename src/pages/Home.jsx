import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    if (user) {
      const tasks = JSON.parse(localStorage.getItem(`tasks_${user.username}`) || '[]');
      setOpenCount(tasks.filter(task => !task.completed).length);
    }
  }, [user]);

  return (
    <main className="home-hero">
      <section className="hero-content glass text-center">
        <h1 className="display-5 fw-bold">
          Organize Your Day with <span className="brand">TaskMaster</span>
        </h1>
        <p className="lead mt-3">
          Simple, fast, and smart task management with reminders.
          <br />
          {user
            ? `You have ${openCount} open task${openCount !== 1 ? 's' : ''}.`
            : 'Sign in to start tracking your tasks.'}
        </p>
        <div className="actions mt-4 d-flex justify-content-center gap-3 flex-wrap">
          {user ? (
            <Link to="/todo" className="btn btn-primary cta-btn">
              Go to My Tasks
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary cta-btn">
              Get Started
            </Link>
          )}
          <a href="#features" className="btn btn-outline-secondary outline-btn">
            Learn More
          </a>
        </div>
      </section>

      <section id="features" className="features-grid container mt-5">
        <div className="row row-cols-1 row-cols-md-2 g-4">
          <div className="col">
            <div className="feature-card p-4 shadow rounded bg-white h-100">
              <h3>📝 Quick Capture</h3>
              <p>Add tasks instantly and edit inline without losing focus.</p>
            </div>
          </div>
          <div className="col">
            <div className="feature-card p-4 shadow rounded bg-white h-100">
              <h3>⏰ Smart Reminders</h3>
              <p>Get notified exactly when tasks are due (browser + sound).</p>
            </div>
          </div>
          <div className="col">
            <div className="feature-card p-4 shadow rounded bg-white h-100">
              <h3>📦 Persistent</h3>
              <p>Your tasks stay saved locally per user. Refresh safely.</p>
            </div>
          </div>
          <div className="col">
            <div className="feature-card p-4 shadow rounded bg-white h-100">
              <h3>🔐 Simple Auth</h3>
              <p>Lightweight front‑end login system to segment task lists.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer text-center mt-5 py-3">
  <small className="text-muted">
    &copy; {new Date().getFullYear()} TaskMaster. All rights reserved.
  </small>
</footer>

    </main>
  );
}
