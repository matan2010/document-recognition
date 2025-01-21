// import React from 'react';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Login from './components/login/Login';
import DownloadComponent from './components/DownloadComponent';
import ClientCard from "./components/ClientCard";
import SignUp from "./components/SignUpCompany";
import SignUpCompany from "./components/SignUpCompany";
import ProcessState from "./components/process-states/process-states";


function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Login/>}/>
                    <Route path="/signup-company" element={<SignUpCompany/>}/>
                    <Route path="/process-state" element={<ProcessState/>}/>
                    {/* Other routes */}
                </Routes>
            </Router>
        </div>
    );
}

export default App;
