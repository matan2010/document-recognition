import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router components


import './App.css';
import Login from './components/Login'; 
import DownloadComponent  from './components/DownloadComponent'; 
import SignUpCompany  from './components/SignUpCompany';
import SignUp  from './components/SignUp';  
import Settings  from './components/Settings'; 
import Home from './components/Home';
//import ClientCard  from './components/ClientCard'; 
import CreateEmployee  from './components/CreateEmployee';
import CreateClient  from './components/CreateClient';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create-employee" element={<CreateEmployee />} />
          <Route path="/create-client" element={<CreateClient />} />
          <Route path="/home" element={<Home />} /> {/* Add Home route */}
          <Route path="/" element={<Login />} /> {/* Default path redirects to Login */}
          <Route path="/download-component" element={<DownloadComponent />} /> {/* Default path redirects to Login */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
