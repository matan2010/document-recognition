import React, { useState } from 'react';
import Navbar from './Navbar'; 
import '../styles/Home.css';

const Home = () => {
  
  const generateRandomBoolean = () => Math.random() > 0.5;
  
  const [clients, setClients] = useState([
    { serial: 1, name: 'John Doe',id:generateRandomBoolean(), passport: generateRandomBoolean(), driverLicense: generateRandomBoolean() },
    { serial: 2, name: 'Jane Smith',id:generateRandomBoolean(), passport: generateRandomBoolean(), driverLicense: generateRandomBoolean() },
    { serial: 3, name: 'Sam Brown',id:generateRandomBoolean(), passport: generateRandomBoolean(), driverLicense: generateRandomBoolean() },
    { serial: 4, name: 'Alice Johnson',id:generateRandomBoolean(), passport: generateRandomBoolean(), driverLicense: generateRandomBoolean() },
    { serial: 5, name: 'Bob White',id:generateRandomBoolean(), passport: generateRandomBoolean(), driverLicense: generateRandomBoolean() },
  ]);

  const renderStatus = (status) => status ? '✔️' : '❌'; 

  return (
    <div className="home-page">
      <Navbar />
      <h1>Welcome to Home Page</h1>

      <div className="table-container">
        <h2>Clients List</h2>
        <table className="clients-table">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Name</th>
              <th>Id</th>
              <th>Passport</th>
              <th>Driver License</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.serial}>
                <td>{client.serial}</td>
                <td>{client.name}</td>
                <td>{renderStatus(client.id)}</td>
                <td>{renderStatus(client.passport)}</td>
                <td>{renderStatus(client.driverLicense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
