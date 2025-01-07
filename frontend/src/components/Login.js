import React, { useState } from 'react';
import '../styles/Login.css'; // Import your CSS file

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Login failed.');
        return;
      }

      // Successful login, handle redirection or state management here
      console.log('Login successful!');
      // Redirect to the dashboard or other intended page
    } catch (error) {
      setErrorMessage('An error occurred during login.');
    }
  };

  return (
      <div className="login-container">
        {/*<img src={"https://www.pond-planet.co.uk/blog/wp-content/uploads/2023/12/Untitled-90.png"}/>*/}
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
            Don't have an account? <a href="#">Sign up your company</a>
          </p>
          {/* Add OAuth options here if applicable */}
        </div>
      </div>
  );
};

export default Login;