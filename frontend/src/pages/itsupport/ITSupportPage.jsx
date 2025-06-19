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
  const [indicator,setIndicator]=useState(true);
  const [imagePreviews, setImagePreviews] = useState({});
  const [imageFiles, setImageFiles] = useState({});


  const id = localStorage.getItem('id');

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          setError("User ID not found. Please log in again.");
          setLoading(false);
          return;
        }
        const response = await axios.post(
          'http://localhost:5000/api/it_support/get_open', 
          { id }, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          }
        );
        setTickets(response.data);
        console.log(response.data)
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.response?.data?.message || 'Failed to fetch tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTickets();
  }, [id, indicator]); 

  function userpage() {
    navigate("/userdetails");
  }
  const handleImageChange = (ticketId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store the file
    setImageFiles(prev => ({ ...prev, [ticketId]: file }));

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => ({ ...prev, [ticketId]: previewUrl }));
  };

  const handleShowInput = (ticketId) => {
    setShowInput(prev => ({ ...prev, [ticketId]: true }));
  };

  const handleResolutionChange = (ticketId, value) => {
    setResolutions(prev => ({ ...prev, [ticketId]: value }));
  };
  const handleCloseTicket = async (ticketId) => {
  const resolution = resolutions[ticketId];
  const imageFile = imageFiles[ticketId];

  if (!resolution || resolution.trim() === '') {
    alert('Please enter a resolution.');
    return;
  }



  // if (!imageFile) {
  //   alert('Please upload an image proof.');
  //   return;
  // }

  const formData = new FormData();
  formData.append('id', ticketId);
  formData.append('resolution', resolution);
  formData.append('proofImage', imageFile);

  try {
    await axios.post('http://localhost:5000/api/it_support/close_ticket', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });

    setTickets(prev => prev.filter(t => t._id !== ticketId));
    setShowInput(prev => ({ ...prev, [ticketId]: false }));
    setResolutions(prev => {
      const newRes = { ...prev };
      delete newRes[ticketId];
      return newRes;
    });
    alert('Ticket closed successfully!');
  } catch (err) {
    console.error('Error closing ticket:', err);
    alert(err.response?.data?.message || 'Failed to close ticket.');
  }
};


 const handleUpdateStatus = async (ticketId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Open' ? 'InProgress' : 'Open';
      
      await axios.put(
        'http://localhost:5000/api/it_support/update_ticket_status', 
        { ticketId, status: newStatus }, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );

      // Refresh tickets after status change
      setIndicator(prev => !prev);
      alert(`Ticket status updated to ${newStatus}!`);
    } catch (err) {
      console.error('Error updating ticket status:', err);
      alert(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const priorityMap = {
  "Connectivity (Network Issues)": "high",
  "Software":"medium",
  "Hardware Issues":"high",
  "Accounts and Access (File Sharing)":"medium",
  "Other Services":"low",
  "Mail Issues":"medium"

  // Add other main issues and their priorities
};

const getTicketPriority = (issue) => {
  if (!issue) return 'low';
  
  // Handle both string and object cases
  const issueText = typeof issue === 'string' 
    ? issue 
    : issue.main || issue.text || JSON.stringify(issue);
  
  const mainIssue = issueText.split('>')[0].trim();
  return priorityMap[mainIssue] || 'low';
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
            tickets.map((ticket) => {
              const priority = getTicketPriority(ticket.issue);
              
              return (
                <div key={ticket._id} className={`ticket-card priority-${priority}`}>
                  {/* Priority ribbon */}
                  <div className={`priority-ribbon priority-${priority}`}>
                    {priority.toUpperCase()}
                  </div>

                  <div className="ticket-header">
                    <div className="ticket-issue">
                      <h3 className="issue-full">
  {typeof ticket.issue === 'string' 
    ? ticket.issue.split('>').map((part, i, arr) => (
        <span key={i} className={i === 0 ? "main-issue" : "sub-issue"}>
          {part.trim()}
          {i < arr.length - 1 && ' > '}
        </span>
      ))
    : ticket.issue.main && ticket.issue.sub 
      ? `${ticket.issue.main} > ${ticket.issue.sub} > ${ticket.issue.details || ''}`
      : JSON.stringify(ticket.issue) // Fallback for debugging
  }
</h3>

                    </div>
                    <span className={`status-badge ${ticket.status.toLowerCase().replace('inprogress', 'in-progress')}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="ticket-info-grid">
                    <div className="info-item">
                      <span className="info-label">Employee:</span>
                      <span className="info-value">{ticket.employeeName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">ID:</span>
                      <span className="info-value">{ticket.employeeId}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{ticket.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{new Date(ticket.date).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Time:</span>
                      <span className="info-value">{ticket.time}</span>
                    </div>
                  </div>

                  {!showInput[ticket._id] && (
                    <div className="ticket-actions">
                      {ticket.status === 'Open' ? (
                        <button
                          className="action-button in-progress-btn"
                          onClick={() => handleUpdateStatus(ticket._id, ticket.status)}
                        >
                          Mark In Progress
                        </button>
                      ) : (
                        <button
                          className="action-button remove-progress-btn"
                          onClick={() => handleUpdateStatus(ticket._id, ticket.status)}
                        >
                          Remove In Progress
                        </button>
                      )}
                      <button
                        className="action-button close-ticket-btn"
                        onClick={() => handleShowInput(ticket._id)}
                      >
                        {ticket.status === 'InProgress' ? 'Complete Ticket' : 'Close Ticket'}
                      </button>
                    </div>
                  )}

                 {showInput[ticket._id] && (
  <div className="resolution-section">
    <textarea
      placeholder="Enter resolution description..."
      value={resolutions[ticket._id] || ''}
      onChange={(e) => handleResolutionChange(ticket._id, e.target.value)}
      className="resolution-textarea"
      rows={4}
    />
    
    {/* Image upload section */}
    <div className="image-upload-section">
      <label htmlFor={`image-upload-${ticket._id}`} className="image-upload-label">
        Upload Work Image (Required)
      </label>
      <input
        id={`image-upload-${ticket._id}`}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(ticket._id, e)}
        className="image-upload-input"
        required
      />
      {imagePreviews[ticket._id] && (
        <div className="image-preview-container">
          <img 
            src={imagePreviews[ticket._id]} 
            alt="Work preview" 
            className="image-preview"
          />
        </div>
      )}
    </div>

    <div className="resolution-actions">
      <button
        className="action-button submit-resolution-btn"
        onClick={() => handleCloseTicket(ticket._id)}
      >
        Submit Resolution
      </button>
      <button
        className="action-button cancel-resolution-btn"
        onClick={() => {
          setShowInput(prev => ({ ...prev, [ticket._id]: false }));
          if (imagePreviews[ticket._id]) {
            URL.revokeObjectURL(imagePreviews[ticket._id]);
          }
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
                </div>
              );
            })
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