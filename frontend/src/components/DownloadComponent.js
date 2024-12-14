import React, { useState } from 'react';

const DownloadComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);  // Clear previous errors, if any.
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/download');
      
      if (!response.ok) {
        throw new Error('Something went wrong with the download!');
      }

      const result = await response.json();  // or response.text(), depending on what the server returns
      setData(result);  // Save the result in state
    } catch (err) {
      setError(err.message);  // Store the error message if there is one
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleDownload}>
        Click to Download
      </button>

      {loading && <p>Loading...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div>
          <h3>Results:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre> {/* Display the received data */}
        </div>
      )}
    </div>
  );
};

export default DownloadComponent;
