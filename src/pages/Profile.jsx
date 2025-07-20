import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email] = useState(user?.email || '');
  const [image, setImage] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem(`profile_${user?.email}`));
    if (storedProfile) {
      setUsername(storedProfile.username);
      setImage(storedProfile.image);
      setProfileSaved(true);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profileData = { username, email, image };
    localStorage.setItem(`profile_${email}`, JSON.stringify(profileData));
    setProfileSaved(true);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h3 className="mb-4 text-center">My Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="text-center mb-3">
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
            ) : (
              <div className="bg-secondary rounded-circle d-inline-block" style={{ width: '100px', height: '100px' }} />
            )}
            <div className="mt-2">
              <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email (readonly)</label>
            <input type="email" className="form-control" value={email} readOnly />
          </div>
          <button type="submit" className="btn btn-primary w-100">Save Profile</button>
          {profileSaved && <div className="alert alert-success mt-3">✅ Profile saved!</div>}
        </form>
      </div>
    </div>
  );
}
