import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [alarmSong, setAlarmSong] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }

    if (profile) {
      setMobile(profile.mobile || '');
      setAddress(profile.address || '');
      setProfileImage(profile.profileImage || null);
      setAlarmSong(profile.alarmSong || null); // kept only in memory
    }
  }, [user, profile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAlarmSongChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file); // Don't store in localStorage
    setAlarmSong(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      username,
      email,
      mobile,
      address,
      profileImage,
      // ❗ DO NOT include alarmSong in localStorage
    };

    localStorage.setItem(`profile_${email}`, JSON.stringify(data));
    updateProfile({ ...data, alarmSong }); // alarmSong in memory only
    setProfileSaved(true);
  };

  return (
    <div className="container mt-4">
      <h2>My Profile</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Profile Image</label>
          <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input type="text" className="form-control" value={username} readOnly />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} readOnly />
        </div>

        <div className="mb-3">
          <label className="form-label">Mobile Number</label>
          <input type="tel" className="form-control" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Address (Optional)</label>
          <textarea className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Alarm Song (MP3)</label>
          <input type="file" accept="audio/*" className="form-control" onChange={handleAlarmSongChange} />
        </div>

        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form>

      {profileSaved && (
        <div className="alert alert-success mt-3">✅ Profile saved successfully!</div>
      )}
    </div>
  );
};

export default Profile;
