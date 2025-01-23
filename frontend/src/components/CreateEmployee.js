import React, { useState } from 'react';
import Navbar from './Navbar';
import '../styles/CreateEmployee.css';

const CreateEmployee = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState(''); // הוספת שדה companyId
  const [roleError, setRoleError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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


    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to create employee');
      }

      console.log('Submitted:', userData);

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
      </form>
    </div>
  );
};

export default CreateEmployee;
