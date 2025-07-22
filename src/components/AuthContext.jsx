import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const [profile, setProfile] = useState(null);

  // Load profile when user changes
  useEffect(() => {
  if (user) {
    const savedProfile = JSON.parse(localStorage.getItem(`profile_${user.email}`));
    setProfile(savedProfile || null);
  } else {
    setProfile(null);
  }
}, [user]);

  // Persist user session
  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }, [user]);

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const matched = users.find(u => u.username === username && u.password === password);
    if (matched) {
      setUser({ username: matched.username, email: matched.email });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
  };

  const signup = (username, email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const alreadyExists = users.some(u => u.username === username || u.email === email);
    if (alreadyExists) return false;

    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  };

  const updateProfile = (data) => {
    setProfile(data);
    if (user?.email) {
      localStorage.setItem(`profile_${user.email}`, JSON.stringify(data));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, profile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
