import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import { Container, Card, Form, Button } from "react-bootstrap";
import "./Profile.css";


const API = process.env.REACT_APP_API_URL;
axios.post(`${API}/signup`, data);

const Profile = () => {
  const { user } = useAuth();
  const email = user?.email || "";

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [currImageURL, setCurrImageURL] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const imageObjectUrlRef = useRef(null);

  // Load name from MySQL
  useEffect(() => {
    if (!email) return;

    axios.get(`http://localhost:5000/user/${email}`)
      .then((res) => {
        const userData = res.data;
        if (userData && (userData.name || userData.Name)) {
          setName(userData.name || userData.Name);
        } else {
          setName("Not found");
        }
      })
      .catch((err) => {
        console.error("Failed to load name from MySQL:", err);
        setName("Error");
      });
  }, [email]);

  // Load profile data from MongoDB
  useEffect(() => {
    if (!email) return;

    setLoading(true);
    axios.get(`http://localhost:5000/profile/${email}`)
      .then((res) => {
        setMobile(res.data.mobile || "");
        setAddress(res.data.address || "");

        if (res.data.profileImageBase64 && res.data.profileImageContentType) {
          setCurrImageURL(`data:${res.data.profileImageContentType};base64,${res.data.profileImageBase64}`);
        } else {
          setCurrImageURL("");
        }
      })
      .catch(() => {
        setMobile("");
        setAddress("");
        setCurrImageURL("");
      })
      .finally(() => setLoading(false));
  }, [email]);

  // Preview selected image
  useEffect(() => {
    if (!profileImage) return;

    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
    }

    const url = URL.createObjectURL(profileImage);
    setCurrImageURL(url);
    imageObjectUrlRef.current = url;

    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
      }
    };
  }, [profileImage]);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("mobile", mobile);
      formData.append("address", address);
      if (profileImage) formData.append("profileImage", profileImage);

      const res = await axios.post("http://localhost:5000/profile", formData);
      setMessage(res.data.message || "Profile saved!");

      const response = await axios.get(`http://localhost:5000/profile/${email}`);
      setMobile(response.data.mobile || "");
      setAddress(response.data.address || "");

      if (response.data.profileImageBase64 && response.data.profileImageContentType) {
        setCurrImageURL(`data:${response.data.profileImageContentType};base64,${response.data.profileImageBase64}`);
      } else {
        setCurrImageURL("");
      }

      setProfileImage(null);
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
            <h3 className="mb-1">{name || "Loading..."}</h3>
            <small className="text-muted">{email}</small>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formMobile" className="mb-3">
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formAddress" className="mb-4">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
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
