import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    const success = signup(form.username, form.email, form.password);
    if (success) {
      navigate('/login');
    } else {
      setError('User already exists. Try a different username/email.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>Username</label>
          <input type="text" required className="form-control" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" required className="form-control" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" required className="form-control" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
}
