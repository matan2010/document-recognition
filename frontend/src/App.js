import React from 'react';

import './App.css';
import Login from './components/Login'; 
import DownloadComponent  from './components/DownloadComponent';
import ClientCard from "./components/ClientCard";
import SignUp from "./components/SignUpCompany";


function App() {
  return (
    <div className="App">
      {/*<DownloadComponent  />*/}
      {/*<Login  />*/}
      <SignUp  />
    </div>
  );
}

export default App;
