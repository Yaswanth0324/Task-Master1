import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    const success = login(form.username, form.password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>Username</label>
          <input type="text" required className="form-control" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" required className="form-control" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}
