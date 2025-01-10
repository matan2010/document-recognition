// import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/login/Login';
import DownloadComponent  from './components/DownloadComponent';
import ClientCard from "./components/ClientCard";
import SignUp from "./components/SignUpCompany";
import SignUpCompany from "./components/SignUpCompany";


function App() {
  return (
    <div className="App"><Router>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup-company" element={<SignUpCompany />} />
            {/* Other routes */}
        </Routes>
    </Router>
    </div>
  );
}

export default App;
