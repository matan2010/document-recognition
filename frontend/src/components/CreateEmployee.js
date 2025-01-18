import React, { useState } from 'react';
import Navbar from './Navbar';
import '../styles/CreateEmployee.css';

const CreateEmployee = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [roleError, setRoleError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!role) {
      setRoleError('Role is required'); // הצגת שגיאה אם לא נבחר תפקיד
      return;
    }

    // אם הכל תקין, להמשיך עם השאר
    setRoleError('');
    console.log('Submitted:', { email, role, password });
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
