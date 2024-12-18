import React, { useState } from 'react';

const DownloadComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // פונקציה להורדת המידע מהשרת
  const handleDownload = async () => {
    setLoading(true);
    setError(null);  // Clear previous errors, if any.

    try {
      const response = await fetch('http://localhost:3000/api/v1/process/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Something went wrong with the download!');
      }
      const result = await response.json();
      setData(result);  // Save the result in state
    } catch (err) {
      setError(err.message);  // Store the error message if there is one
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לשמירת המידע (כאן ניתן להוסיף את הלוגיקה לשמירה במאגר או שליחה לשרת)
  const handleSave = () => {
    // כאן אתה יכול להוסיף את הלוגיקה לשמירת הנתונים (למשל לשלוח לשרת)
    alert('Data saved!');
  };

  // פונקציה לעדכון הערך של ה-input
  const handleChange = (index, event) => {
    const updatedData = [...data];
    updatedData[index].value = event.target.value;
    setData(updatedData);
  };

  return (
    <div>
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
                  onChange={(e) => handleChange(index, e)}  // Update value on change
                  style={{
                    width: '100%',
                    padding: '5px',
                    fontSize: '14px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: '#fff'  // Allow editing by making it white
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
