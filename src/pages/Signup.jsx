import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
       await axios.post('http://localhost:5000/signup', form);
      alert('Signup successful!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Signup failed. Maybe email already exists.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>Name</label>
          <input type="text" className="form-control" required
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" required
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
}