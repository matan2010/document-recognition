import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../styles/CreateClientModern.css"; // Use a new CSS file for modern styling

const CreateClient = () => {
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      clientReferenceId: id,
      name,
      email,
    };

    const jwtToken = localStorage.getItem("access_token");

    if (!jwtToken) {
      alert("You are not authorized. Redirecting to login.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/clients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Client created successfully:", data);
        alert("Client created successfully!");
        // Reset the form
        setEmail("");
        setId("");
        setName("");
        setFormError("");
      } else {
        console.error("Failed to create client:", response.statusText);
        alert("Failed to create client.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the client.");
    }
  };

  const validateForm = () => {
    if (!email || !id || !name) {
      setFormError("All fields are required.");
      return false;
    }
    setFormError("");
    return true;
  };

  return (
    <div className="create-client-container">
      <Navbar />
      <h1>Create Client</h1>
      <form
        onSubmit={(e) => {
          if (validateForm()) handleSubmit(e);
        }}
        className="create-client-form"
      >
        <div className="form-field">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="id">Client ID:</label>
          <input
            type="text"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {formError && <p className="error-message">{formError}</p>}

        <div className="form-actions">
          <button type="submit">Create Client</button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;
