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

  const login = async (email, password) => {
  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok && data.email) {
      const userData = { email: data.email, username: data.username };
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
    setUser(null);
    setProfile(null);
  };

  const signup = async (username, email, password) => {
  try {
    const response = await fetch("http://localhost:5000/signup", {
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
