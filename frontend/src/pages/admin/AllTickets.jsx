import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllTickets.css';

function AllTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/admin/current-tickets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        setTickets(response.data.tickets);
      } else {
        setError('Failed to fetch tickets');
      }
    } catch (err) {
      console.error('❌ Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatIssue = (issue) => {
    if (!issue) return 'N/A';
    const parts = [];
    if (issue.main) parts.push(issue.main);
    if (issue.sub) parts.push(issue.sub);
    if (issue.inner_sub) parts.push(issue.inner_sub);
    return parts.join(' > ') || 'N/A';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'InProgress':
        return 'status-inprogress';
      case 'Closed':
        return 'status-closed';
      default:
        return '';
    }
  };

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  const closeDetails = () => {
    setSelectedTicket(null);
  };

  if (loading) {
    return (
      <div className="all-tickets-container">
        <div className="card">
          <p className="loading-message">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-tickets-container">
      <div className="card">
        <div className="tickets-header">
          <h3>All Current Tickets</h3>
          <button onClick={fetchTickets} className="refresh-button">
            🔄 Refresh
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {tickets.length === 0 ? (
          <p className="no-tickets">No current tickets found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Issue</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>IT Support</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td className="ticket-id-cell">{ticket._id.slice(-8)}</td>
                    <td>{ticket.employeeName || 'N/A'}</td>
                    <td>{ticket.employeeId || 'N/A'}</td>
                    <td className="issue-cell">{formatIssue(ticket.issue)}</td>
                    <td className="description-cell" title={ticket.description}>
                      {ticket.description ? (ticket.description.length > 50 
                        ? `${ticket.description.substring(0, 50)}...` 
                        : ticket.description) : 'N/A'}
                    </td>
                    <td>{formatDate(ticket.date)}</td>
                    <td>{ticket.time || 'N/A'}</td>
                    <td>{ticket.itSupport || 'Unassigned'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => openDetails(ticket)} 
                        className="view-details-button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ticket Details</h3>
              <button className="modal-close" onClick={closeDetails}>x</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Ticket ID:</span>
                  <span className="detail-value">{selectedTicket._id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Employee Name:</span>
                  <span className="detail-value">{selectedTicket.employeeName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Employee ID:</span>
                  <span className="detail-value">{selectedTicket.employeeId || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedTicket.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Issue:</span>
                  <span className="detail-value">{formatIssue(selectedTicket.issue)}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedTicket.description || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedTicket.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{selectedTicket.time || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">IT Support:</span>
                  <span className="detail-value">{selectedTicket.itSupport || 'Unassigned'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-badge ${getStatusClass(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">HR Warning:</span>
                  <span className="detail-value">
                    {selectedTicket.hr_warning ? '⚠️ Yes' : 'No'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-value">
                    {formatDate(selectedTicket.createdAt)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Updated At:</span>
                  <span className="detail-value">
                    {formatDate(selectedTicket.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeDetails} className="close-button"></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllTickets;

