import React, { useState } from 'react';
import Navbar from './Navbar';
import '../styles/CreateClient.css';

const CreateClient = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // כאן תוכל להוסיף את הלוגיקה לשלוח את המידע לשרת או לעבד את המידע
    console.log('Submitted:', { email, name, phone });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    
    // לוודא שהקלט מכיל רק מספרים
    if (/[^0-9]/.test(value)) {
      setPhoneError('Phone number must only contain digits.');
    } else {
      setPhoneError('');
    }
    
    setPhone(value);
  };

  return (
    <div className="create-client-container">
      <Navbar />
      <h1>Create Client</h1>
      <form onSubmit={handleSubmit} className="create-client-form">
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
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            required
            pattern="[0-9]*"  // מאפשר רק מספרים
          />
          {phoneError && <p className="error-message">{phoneError}</p>}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={phoneError}>Create Client</button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;
