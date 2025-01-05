import React, { useState, useEffect } from 'react';
import '../styles/ClientCard.css'; // Import your CSS file

const ClientCard = ({ client }) => {
    const [isActive, setIsActive] = useState(true); // Initial status

    // Fetch client data and update status (replace with your actual API call)
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const response = await fetch(`/api/clients/${client.id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setIsActive(data.isActive);
            } catch (error) {
                console.error('Error fetching client data:', error);
            }
        };

        // Fetch data initially and then every 5 minutes (adjust interval as needed)
        fetchClientData();
        const intervalId = setInterval(fetchClientData, 300000); // 5 minutes

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [client.id]);

    return (
        <div className={`client-card ${isActive ? 'active' : 'inactive'}`}>
            <div className="logo-container">
                {/* Replace with actual logo/avatar rendering */}
                {client.logoUrl && <img src={client.logoUrl} alt={client.name} />}
            </div>
            <div className="client-info">
                <h3>{client.name}</h3>
                <span className="unique-id">`{client.id}`</span>
                <p>
          <span className="document-count">
            <i className="fas fa-file-alt"></i> {client.documentCount}
          </span>
                </p>
                <p>Last Activity: {new Date(client.lastActivity).toLocaleString()}</p>
            </div>
        </div>
    );
};

export default ClientCard;