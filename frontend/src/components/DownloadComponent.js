import React, { useState } from 'react';
import '../styles/Download.css';

const DownloadComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDownload = async () => {
    if (!file) {
      setError('Please upload a file before downloading.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (data) {
      data.forEach(item => formData.append(item.key, item.value));
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/process/document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Something went wrong with the download!');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    alert('Data saved!');
  };

  const handleChange = (index, event) => {
    const updatedData = [...data];
    updatedData[index].value = event.target.value;
    setData(updatedData);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label htmlFor="file-upload" className="custom-file-upload">
          Upload Image
        </label>
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <button onClick={handleDownload}>
        Click to Download
      </button>

      {loading && <p>Loading...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div style={{ marginTop: '20px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ flex: 1, paddingRight: '10px' }}>
                <strong>{item.key.replace('_', ' ')}</strong>
              </div>
              <div style={{ flex: 2 }}>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleChange(index, e)}  
                  style={{
                    width: '100%',
                    padding: '5px',
                    fontSize: '14px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: '#fff'  
                  }}
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleSave}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadComponent;
