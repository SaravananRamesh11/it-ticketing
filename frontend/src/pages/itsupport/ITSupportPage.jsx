import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './it.css';
import { useNavigate } from 'react-router-dom';

function ITSupportPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [showInput, setShowInput] = useState({});
  const [resolutions, setResolutions] = useState({});
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const id = localStorage.getItem('id'); 

  useEffect(() => {
    const fetchOpenTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
            setError("User ID not found. Please log in again.");
            setLoading(false);
            // Optionally redirect to login page
            // navigate('/login');
            return;
        }
        const response = await axios.post('http://localhost:5000/api/it_support/get_open', { id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        setTickets(response.data);
      } catch (err) {
        console.error('Error fetching open tickets:', err);
        setError(err.response?.data?.message || 'Failed to fetch open tickets.');
      } finally {
        setLoading(false);
      }
    };
    function userpage() {
    navigate("/userdetails");
  }

    fetchOpenTickets();
  }, [id]); // Depend on 'id' so it refetches if ID changes

  function userpage() {
    navigate("/userdetails");
  }
  const handleShowInput = (ticketId) => {
    setShowInput(prev => ({ ...prev, [ticketId]: true }));
  };

  const handleResolutionChange = (ticketId, value) => {
    setResolutions(prev => ({ ...prev, [ticketId]: value }));
  };

  const handleCloseTicket = async (ticketId) => {
    const resolution = resolutions[ticketId];

    if (!resolution || resolution.trim() === '') {
      alert('Please enter a resolution.');
      return;
    }

    try {
      // Assuming backend expects 'id' as the key for ticket ID
      await axios.post('http://localhost:5000/api/it_support/close_ticket', {
        id: ticketId,
        resolution
      },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });

      // Filter out the closed ticket from the state
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      // Reset input visibility and resolution for the closed ticket
      setShowInput(prev => ({ ...prev, [ticketId]: false }));
      setResolutions(prev => {
        const newResolutions = { ...prev };
        delete newResolutions[ticketId];
        return newResolutions;
      });
      alert('Ticket closed successfully!'); // User feedback
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert(err.response?.data?.message || 'Failed to close ticket. Please try again.');
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
  try {
    await axios.put('http://localhost:5000/api/it_support/update_ticket_status', {
      ticketId,  // Using ticketId to match your existing pattern
      status: newStatus
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });

    // Update local state
    setTickets(prev => prev.map(ticket => 
      ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
    
    alert(`Ticket status updated to ${newStatus}!`);
  } catch (err) {
    console.error('Error updating ticket status:', err);
    alert(err.response?.data?.message || 'Failed to update ticket status. Please try again.');
  }
};

return (
  <div className="it-support-page-container">
  <div className="it-dashboard-header">
    <h1 className="it-dashboard-title">IT Support Dashboard</h1>
    <button className="details-button" onClick={userpage}>
      My Details
    </button>
  </div>

  {loading && <div className="loading-message">Loading open tickets...</div>}
  {error && <div className="error-message">{error}</div>}

  {!loading && !error && (
    <div className="ticket-list-grid">
      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <div key={ticket._id} className="ticket-card">
            <div className="ticket-header">
              <h3 className="ticket-issue">{ticket.issue}</h3>
              <span className={`ticket-status status-${ticket.status.toLowerCase().replace(/\s/g, '-')}`}>
                {ticket.status}
              </span>
            </div>
            <div className="ticket-info">
              <p><strong className="info-label">Employee:</strong> {ticket.employeeName}</p>
              <p><strong className="info-label">ID:</strong> {ticket.employeeId}</p>
              <p><strong className="info-label">Email:</strong> {ticket.email}</p>
              <p><strong className="info-label">Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
              <p><strong className="info-label">Time:</strong> {ticket.time}</p>
            </div>

            {/* Action buttons based on ticket status */}
            {!showInput[ticket._id] ? (
              <div className="ticket-actions">
                {ticket.status === 'Open' ? (
                  <button 
                    className="action-button in-progress-btn"
                    onClick={() => handleUpdateStatus(ticket._id, 'InProgress')}
                  >
                    Mark In Progress
                  </button>
                ) : ticket.status === 'InProgress' && (
                  <button 
                    className="action-button remove-progress-btn"
                    onClick={() => handleUpdateStatus(ticket._id, 'Open')}
                  >
                    Remove In Progress
                  </button>
                )}
                {ticket.status !== 'Closed' && (
                  <button 
                    className="action-button close-ticket-btn" 
                    onClick={() => handleShowInput(ticket._id)}
                  >
                    {ticket.status === 'InProgress' ? 'Complete Ticket' : 'Close Ticket'}
                  </button>
                )}
              </div>
            ) : (
              <div className="resolution-section">
                <textarea
                  placeholder="Enter resolution description..."
                  value={resolutions[ticket._id] || ''}
                  onChange={(e) => handleResolutionChange(ticket._id, e.target.value)}
                  className="resolution-textarea"
                  rows={4}
                />
                <div className="resolution-actions">
                  <button 
                    className="action-button submit-resolution-btn" 
                    onClick={() => handleCloseTicket(ticket._id)}
                  >
                    Submit Resolution
                  </button>
                  <button 
                    className="action-button cancel-resolution-btn" 
                    onClick={() => setShowInput(prev => ({ ...prev, [ticket._id]: false }))}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="no-tickets-message">
          <p>🎉 No open tickets assigned to you right now. Great job!</p>
          <p>Check back later or enjoy your break!</p>
        </div>
      )}
    </div>
  )}
</div>
);

}
export default ITSupportPage;