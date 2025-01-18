import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate(); // עבור ניווט תכנותי
  const location = useLocation(); // קבלת המיקום הנוכחי של העמוד

  const handleLogout = () => {
    console.log("Logging out...");
    navigate('/login'); // מעבר לדף ההתחברות אחרי התנתקות
  };

  // פונקציה לבדיקת אם אנחנו בעמוד הנוכחי
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="navbar">
      <div className="navbar-links">
        {/* הצגת קישורים אם לא נמצאים בעמוד הנוכחי */}
        {location.pathname !== '/home' && (
          <Link className={`navbar-link ${isActive('/home')}`} to="/home">Home</Link>
        )}
        {location.pathname !== '/profile' && (
          <Link className={`navbar-link ${isActive('/profile')}`} to="/profile">Profile</Link>
        )}
        {location.pathname !== '/create-employee' && (
          <Link className={`navbar-link ${isActive('/create-employee')}`} to="/create-employee">Create Employee</Link>
        )}
        {location.pathname !== '/create-client' && (
          <Link className={`navbar-link ${isActive('/create-client')}`} to="/create-client">Create Client</Link>
        )}
        {location.pathname !== '/settings' && (
          <Link className={`navbar-link ${isActive('/settings')}`} to="/settings">Settings</Link>
        )}
        <button className="navbar-link logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
