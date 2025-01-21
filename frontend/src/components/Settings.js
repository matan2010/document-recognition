import React, { useState } from 'react';
import Navbar from './Navbar';
import '../styles/Settings.css';  // Import the relevant CSS for styling
import { Link } from 'react-router-dom'; // Import Link for navigation

const Settings = () => {
  const [activeField, setActiveField] = useState(null);  // שומר את השדה שנבחר
  const [settings, setSettings] = useState({
    id: { birthDate: true, firstName: true, id: true, issueDate: true, lastName: true, validUntil: true },
    passport: { passportNumber: true, issueDate: true, validUntil: true },
    driverLicense: { licenseNumber: true, issueDate: true, validUntil: true },
  });

  // שינוי בחירה של פרמטר
  const handleChange = (column, field) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [column]: {
        ...prevSettings[column],
        [field]: !prevSettings[column][field],
      },
    }));
  };

  // הגדרת התצוגה של הפרמטרים
  const renderField = (field, column) => {
    return (
      <div key={field} className="setting-item">
        <label>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
        <div className="buttons">
          <button
            className={`add-button ${settings[column][field] ? 'active' : ''}`}
            onClick={() => handleChange(column, field)}
          >
            {settings[column][field] ? '✔' : '✘'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-container">
      {/* Navbar with Home, Logout, etc. */}
      <Navbar />
      <h2>Settings</h2>

      {/* כפתור ID */}
      <button
        className="accordion-button"
        onClick={() => setActiveField(activeField === 'id' ? null : 'id')}
      >
        ID
      </button>
      {activeField === 'id' && (
        <div className="accordion-content">
          {Object.keys(settings.id).map((field) => renderField(field, 'id'))}
        </div>
      )}

      {/* כפתור Passport */}
      <button
        className="accordion-button"
        onClick={() => setActiveField(activeField === 'passport' ? null : 'passport')}
      >
        Passport
      </button>
      {activeField === 'passport' && (
        <div className="accordion-content">
          {Object.keys(settings.passport).map((field) => renderField(field, 'passport'))}
        </div>
      )}

      {/* כפתור Driver License */}
      <button
        className="accordion-button"
        onClick={() => setActiveField(activeField === 'driverLicense' ? null : 'driverLicense')}
      >
        Driver License
      </button>
      {activeField === 'driverLicense' && (
        <div className="accordion-content">
          {Object.keys(settings.driverLicense).map((field) => renderField(field, 'driverLicense'))}
        </div>
      )}

      {/* שמירה */}
      <button onClick={() => console.log('Settings saved:', settings)} className="save-button">
        Save Settings
      </button>
    </div>
  );
};

export default Settings;
