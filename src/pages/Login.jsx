import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext'; // ✅ Import AuthContext hook

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // ✅ Use setUser from context
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting login form:', form);

      const res = await axios.post('http://localhost:5000/login', {
        email: form.email,
        password: form.password
      });

      const userData = res.data;
      console.log('Login response:', userData);

      // ✅ Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // ✅ Set user in AuthContext
      setUser(userData);

      // ✅ Redirect to /todo
      navigate('/todo');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError('Invalid email or password.');
    }
  };
console.log("🧪 Sending login data:", form.email.trim().toLowerCase(), form.password);

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            required
            className="form-control"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            required
            className="form-control"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}
