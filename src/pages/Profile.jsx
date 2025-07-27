import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import { Container, Card, Form, Button } from "react-bootstrap";

import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState("");
  const [profileImage, setProfileImage] = useState(null); // raw image file
  const [currImageURL, setCurrImageURL] = useState("");   // image preview URL

  const [alarmSong, setAlarmSong] = useState(null);       // raw audio file
  const [currSongURL, setCurrSongURL] = useState("");     // audio preview URL

  const [savedAlarmSongName, setSavedAlarmSongName] = useState(null); // saved filename from backend

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs for tracking object URLs for cleanup
  const imageObjectUrlRef = useRef(null);
  const songObjectUrlRef = useRef(null);

  // Fetch profile data on mount or email change
  useEffect(() => {
    if (!email) return;

    setLoading(true);
    axios.get(`http://localhost:5000/profile/${email}`)
      .then((res) => {
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setMobile(res.data.mobile || "");

        setSavedAlarmSongName(res.data.alarmSongName || null);

        // Setup profile image preview from backend base64 data
        if (res.data.profileImageBase64 && res.data.profileImageContentType) {
          setCurrImageURL(`data:${res.data.profileImageContentType};base64,${res.data.profileImageBase64}`);
        } else {
          setCurrImageURL("");
        }

        // Setup alarm song preview from backend base64 data
        if (res.data.alarmSongBase64 && res.data.alarmSongContentType) {
          const binary = atob(res.data.alarmSongBase64);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          const audioBlob = new Blob([array], { type: res.data.alarmSongContentType || "audio/mpeg" });
          const url = URL.createObjectURL(audioBlob);

          // Revoke previous URL before setting new one
          if (songObjectUrlRef.current) {
            URL.revokeObjectURL(songObjectUrlRef.current);
          }

          setCurrSongURL(url);
          songObjectUrlRef.current = url;
        } else {
          setCurrSongURL("");
        }
      })
      .catch(() => {
        // Clear all on error
        setName("");
        setMobile("");
        setCurrImageURL("");
        setCurrSongURL("");
        setSavedAlarmSongName(null);
      })
      .finally(() => setLoading(false));

    // Cleanup URLs on unmount
    return () => {
      if (imageObjectUrlRef.current) URL.revokeObjectURL(imageObjectUrlRef.current);
      if (songObjectUrlRef.current) URL.revokeObjectURL(songObjectUrlRef.current);
    };
  }, [email]);

  // Update profile image preview when a new image file is selected
  useEffect(() => {
    if (!profileImage) return;

    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
    }

    const url = URL.createObjectURL(profileImage);
    setCurrImageURL(url);
    imageObjectUrlRef.current = url;

    // Cleanup on unmount or file change
    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
      }
    };
  }, [profileImage]);

  // Update alarm song preview when a new audio file is selected
  useEffect(() => {
    if (!alarmSong) {
      // When removed, fallback preview is handled by backend URL (already in currSongURL)
      setCurrSongURL("");
      return;
    }

    if (songObjectUrlRef.current) {
      URL.revokeObjectURL(songObjectUrlRef.current);
    }

    const url = URL.createObjectURL(alarmSong);
    setCurrSongURL(url);
    songObjectUrlRef.current = url;

    // Clear saved filename preview since user selected a new file
    setSavedAlarmSongName(null);

    return () => {
      if (songObjectUrlRef.current) {
        URL.revokeObjectURL(songObjectUrlRef.current);
      }
    };
  }, [alarmSong]);

  // File input handlers
  const handleImageChange = (e) => {
    if (e.target.files.length > 0) setProfileImage(e.target.files[0]);
  };

  const handleSongChange = (e) => {
    if (e.target.files.length > 0) setAlarmSong(e.target.files[0]);
  };

  // Submit profile with uploaded files
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("mobile", mobile);

      if (profileImage) formData.append("profileImage", profileImage);
      if (alarmSong) formData.append("alarmSong", alarmSong);

      const res = await axios.post("http://localhost:5000/save-profile", formData);

      setMessage(res.data.message || "Profile saved!");

      // Refresh profile data to update preview and filename
      const response = await axios.get(`http://localhost:5000/profile/${email}`);

      setName(response.data.name || "");
      setEmail(response.data.email || "");
      setMobile(response.data.mobile || "");
      setSavedAlarmSongName(response.data.alarmSongName || null);

      if (response.data.profileImageBase64 && response.data.profileImageContentType) {
        setCurrImageURL(`data:${response.data.profileImageContentType};base64,${response.data.profileImageBase64}`);
      } else {
        setCurrImageURL("");
      }

      if (response.data.alarmSongBase64 && response.data.alarmSongContentType) {
        const binary = atob(response.data.alarmSongBase64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        const audioBlob = new Blob([array], { type: response.data.alarmSongContentType || "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);

        if (songObjectUrlRef.current) {
          URL.revokeObjectURL(songObjectUrlRef.current);
        }
        setCurrSongURL(url);
        songObjectUrlRef.current = url;
      } else {
        setCurrSongURL("");
      }

      // Clear local file inputs
      setProfileImage(null);
      setAlarmSong(null);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="mx-auto p-4 shadow rounded" style={{ maxWidth: 480 }}>
        <div className="d-flex flex-column align-items-center mb-4">
          <div className="position-relative mb-2">
            <img
              src={currImageURL || "/default-avatar.png"}
              alt="Profile"
              className="rounded-circle border"
              style={{ width: 120, height: 120, objectFit: "cover" }}
            />
            <Form.Label
              htmlFor="profileImageUpload"
              className="position-absolute"
              style={{
                bottom: 0,
                right: 0,
                background: "#fff",
                borderRadius: "50%",
                padding: 7,
                cursor: "pointer",
                border: "1px solid #bbb",
              }}
              title="Change profile image"
            >
              <i className="bi bi-camera"></i>
            </Form.Label>
            <Form.Control
              id="profileImageUpload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>
          <div className="text-center">
            <h3 className="mb-1">{name}</h3>
            <small className="text-muted">{email}</small>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formMobile" className="mb-4">
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formSong" className="mb-3">
            <Form.Label>Alarm Song</Form.Label>
            <Form.Control type="file" accept="audio/*" onChange={handleSongChange} />
            {/* Show selected file name */}
            {alarmSong && <p>Selected file: {alarmSong.name}</p>}
            {/* Show saved filename only if no new file is selected */}
            {!alarmSong && savedAlarmSongName && (
              <p>Uploaded file: {savedAlarmSongName}</p>
            )}

            {currSongURL && (
              <audio controls className="mt-2" style={{ width: "100%" }}>
                <source src={currSongURL} />
                Your browser does not support the audio element.
              </audio>
            )}
          </Form.Group>

          <div className="d-flex justify-content-center gap-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </Form>

        {message && <p className="mt-3 text-success text-center">{message}</p>}
      </Card>
    </Container>
  );
};

export default Profile;