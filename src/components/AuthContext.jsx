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
  const API = process.env.REACT_APP_API_URL;

  // Persist user session
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.email) {
        const userData = {
          id: data.id,
          name: data.name,
          email: data.email,
        };
        setUser(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        return true;
      }

      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    if (user?.email) {
      localStorage.removeItem(`profile_${user.email}`);
    }
    localStorage.removeItem("currentUser");
    setUser(null);
    setProfile(null);
  };

  const signup = async (username, email, password) => {
    try {
      const response = await fetch(`${API}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      await response.json();
      return response.ok;
    } catch (err) {
      console.error("Signup failed:", err);
      return false;
    }
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
