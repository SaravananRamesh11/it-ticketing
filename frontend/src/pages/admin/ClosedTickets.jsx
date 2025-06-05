import React, { useState } from 'react';
import axios from 'axios';
import './ClosedTickets.css'; // ← Import the CSS file

function ClosedTickets() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleDownload = async () => {
    if (!month || !year) {
      setError('Please select both month and year');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:5000/api/admin/download-csv', {
        params: { month, year },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets-${month.toLowerCase()}-${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('File not found or download failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="closed-tickets-container">
      <h2>Download Closed Tickets</h2>

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

      <button onClick={handleDownload} disabled={loading}>
        {loading ? <span className="spinner" /> : null}
        {loading ? 'Downloading...' : 'Download CSV'}
      </button>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ClosedTickets;
