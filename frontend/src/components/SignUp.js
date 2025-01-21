import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../styles/SignUp.css';

const SignUp = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const isEmailValid = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return companyName && email && password && isEmailValid(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      // Simulate user creation
      console.log({ companyName, email, password });
      setFormError('');
      // Redirect to login or other logic
    } else {
      setFormError('Please fill all fields correctly.');
    }
  };

  return (
    <div className="sign-up-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="sign-up-form">
        <div className="input-container">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
          />
        </div>

        <div className="input-container">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="input-container">
          <label htmlFor="password">Password</label>
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>
        </div>

        {formError && <div className="error-message">{formError}</div>}

        <button type="submit" disabled={!isFormValid()} className="create-button">
          Create Account
        </button>
      </form>

      {/* Add Link to Login page */}
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default SignUp;
