import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Header() {
  const { user, logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">TaskMaster</Link>

      <div className="ms-auto d-flex align-items-center gap-3">
        <Link to="/" className="btn btn-outline-light btn-sm">Home</Link>

        {user ? (
          <>
            {profile?.profileImage ? (
              <Link to="/profile">
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                />
              </Link>
            ) : (
              <Link to="/profile" className="btn btn-outline-light btn-sm">Profile</Link>
            )}
            <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-outline-light btn-sm ms-2">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
