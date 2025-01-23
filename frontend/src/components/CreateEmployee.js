import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useNavigate } from "react-router-dom";
import '../styles/CreateEmployee.css';

const CreateEmployee = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState(''); 
  const [roleError, setRoleError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // אפס את השדות כאשר הדף נטען מחדש
  useEffect(() => {
    setEmail('');
    setPassword('');
    setRole('');
  }, []); // [] גורם לכך שזה יקרה רק פעם אחת כשדף ייטען מחדש

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!role) {
      setRoleError('Role is required'); 
      return;
    }

    setRoleError('');
    
    const userData = {
      email,
      password,
      role,
    };

    const jwtToken = localStorage.getItem("access_token");
    if (!jwtToken) {
      alert("You are not authorized. Redirecting to login.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to create employee');
      }

      console.log('Submitted:', userData);
      alert('User registered successfully'); 

      
      setEmail('');
      setPassword('');
      setRole('');
      setErrorMessage('');  
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="create-employee-container">
      <Navbar />
      <h1>Create Employee</h1>
      <form onSubmit={handleSubmit} className="create-employee-form">
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
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Role:</label>
          <div className="roles-container">
            <div>
              <input
                type="radio"
                id="admin"
                name="role"
                value="admin"
                checked={role === 'admin'}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="admin">Admin</label>
            </div>
            <div>
              <input
                type="radio"
                id="employee"
                name="role"
                value="employee"
                checked={role === 'employee'}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="employee">Employee</label>
            </div>
          </div>
          {roleError && <p className="error-message">{roleError}</p>} {/* הודעת שגיאה */}
        </div>

        <div className="form-actions">
          <button type="submit">Create Employee</button>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default CreateEmployee;
