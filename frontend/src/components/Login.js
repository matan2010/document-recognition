import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Declare the navigate function

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage(''); // Clear previous errors

    try {
      // Replace with your actual API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        //const errorData = await response.json();//need to return this
        //setErrorMessage(errorData.message || 'Login failed.');//need to return this
       // return;
      }

      // Successful login, handle redirection
      console.log('Login successful!');
      navigate('/home'); // Redirect to home page after successful login

    } catch (error) {
      setErrorMessage('An error occurred during login.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src="https://www.pond-planet.co.uk/blog/wp-content/uploads/2023/12/Untitled-90.png" className="logo" />
        <h2>Login</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email/Username:</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="show-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
          <div className="form-group">
            <input type="checkbox" id="rememberMe" />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          <a href="#" className="forgot-password">
            Forgot password?
          </a>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign up your company</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
