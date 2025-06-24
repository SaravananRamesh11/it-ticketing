import React, { useState } from 'react';
import axios from 'axios';
import './ClosedTickets.css'; // ← Style your table here

function ClosedTickets() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handlePreview = async () => {
    if (!month || !year) {
      setError('Please select both month and year');
      return;
    }

    setLoading(true);
    setError('');
    setCsvData([]);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/admin/preview-csv`, {
        params: { month, year },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      console.log('📥 Preview data:', response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        setCsvData(response.data);
      } else {
        setError('No data found in file.');
      }

    } catch (err) {
      console.error('❌ Error fetching preview:', err);
      setError('File not found or preview failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!month || !year) {
      setError('Please select both month and year');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/admin/download-csv`, {
        params: { month, year },
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets-${month.toLowerCase()}-${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('❌ Download error:', err);
      setError('File not found or download failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="closed-tickets-container">
      <div className="card">
        <h3>Download or Preview Closed Tickets</h3>

        <label>Select Month</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">-- Select Month --</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <label>Select Year</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">-- Select Year --</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <div className="button-group">
          <button onClick={handlePreview} disabled={loading}>
            {loading ? 'Loading Preview...' : 'Preview CSV'}
          </button>

          <button onClick={handleDownload} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Downloading...' : 'Download CSV'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>

      {csvData.length > 0 && (
        <div className="csv-preview">
          <h3>CSV Preview</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(csvData[0])
                  .filter((key) => key !== 'proofImageKey') // Skip the column
                  .map((key) => (
                    <th key={key}>{key}</th>
                ))}
              </tr>

            </thead>
            <tbody>
           
              {csvData.map((row, idx) => (
  <tr key={idx}>
    {Object.entries(row)
      .filter(([key]) => key !== 'proofImageKey') // Skip this column
      .map(([key, val], i) => (
        <td key={i}>
          {key === 'date' ? new Date(val).toLocaleDateString() :
            key === 'proofImageUrl' && val ? (
              <a href={val} target="_blank" rel="noopener noreferrer">
                <img
                  src={val}
                  alt="Proof"
                  style={{ width: '100px', borderRadius: '6px', cursor: 'pointer' }}
                />
              </a>
            ) : (
              val
            )}
        </td>
      ))}
  </tr>
))}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ClosedTickets;


