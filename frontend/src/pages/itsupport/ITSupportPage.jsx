import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './it.css';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/login_context_hook';


// Issue hierarchy for time limits
const issueHierarchy = {
  "Hardware Issues": {
    "Desktops/Laptops": {
      "Repair": { timeLimit: 120 },
      "Replacement": { timeLimit: 180 },
      "Upgrade": { timeLimit: 90 },
      "Peripheral Issues": { timeLimit: 60 }
    },
    "Printers/Scanners": {
      "Setup": { timeLimit: 60 },
      "Configuration": { timeLimit: 90 },
      "Repair": { timeLimit: 120 },
      "Replacement": { timeLimit: 180 }
    },
    "Servers": {
      "Hardware Failure": { timeLimit: 240 },
      "Maintenance": { timeLimit: 180 },
      "Upgrade": { timeLimit: 300 }
    }
  },
  "Software": {
    "Operating Systems": {
      "Installation": { timeLimit: 120 },
      "Upgrade": { timeLimit: 100 },
      "Performance Issues": { timeLimit: 90 },
      "Driver Issues": { timeLimit: 60 }
    },
    "Applications": {//put
      "WPS": { timeLimit: 45 },
      "Microsoft Office": { timeLimit: 60 },
      "Teams": { timeLimit: 45 },
      "Upgrade": { timeLimit: 90 },
      "Licensing": { timeLimit: 30 },
      "Functionality": { timeLimit: 60 }
    },
    "Software Bug Reports": {
      "Reporting Software Defects": { timeLimit: 30 }
    }
  },
  "Connectivity (Network Issues)": {
    "Network Issues": {//put
      "Wired/Wireless Access": { timeLimit: 120 },
      "VPN": { timeLimit: 2 },
      "Network Performance": { timeLimit: 180 }
    },
    "Email Issues": {
      "Account Setup": { timeLimit: 1},
      "Performance": { timeLimit: 0.5 },
      "Connectivity": { timeLimit: 90 }
    },
    "LAN/Internet": { //put
      "LAN Cable Issues": { timeLimit: 60 },
      "Internet I/O Port Damage": { timeLimit: 120 },
      "Website Issues": { timeLimit: 90 }
    }
  },
  "Accounts and Access (File Sharing)": {
    "User Accounts": {
      "Creation": { timeLimit: 15 },
      "Termination": { timeLimit: 15 },
      "Password Resets": { timeLimit: 100 },
      "Access Rights": { timeLimit: 30 }
    },
    "File/Resource Access": {//put
      "Shared Folders": { timeLimit: 45 },
      "Permissions": { timeLimit: 60 },
      "Network Drives": { timeLimit: 60 }
    }
  },
  "Other Services": {
    "Printing Services": {//put
      "Print Queues": { timeLimit: 30 },
      "Quality": { timeLimit: 60 },
      "Access": { timeLimit: 45 }
    },
    "Database Services": {
      "Access": { timeLimit: 90 },
      "Performance Tuning": { timeLimit: 200 },
      "Backup/Recovery": { timeLimit: 180 }
    },
    "Web Services": {
      "Website Accessibility": { timeLimit: 120 },
      "Content Updates": { timeLimit: 60 },
      "Domain Names": { timeLimit: 90 }
    }
  },
  "Mail Issues": {
    "Mail Operations": {
      "Mail Password Reset": { timeLimit: 10 },
      "Mail ID Creation": { timeLimit: 15 },
      "Deletion": { timeLimit: 15 },
      "Account Configuration": { timeLimit: 30 }
    },
    "Mail Client Issues": {
      "Configuration": { timeLimit: 30 },
      "Sync Issues": { timeLimit: 60 }
    }
  }
};

// Handle exceeding time limit
const handleExceedTime = async (ticket) => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    await axios.post(`${apiUrl}/api/it_support/exceed`, { ticket }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Error exceeding time:', err);
    alert(err.response?.data?.message || 'Failed to exceed time.');
  }
};

// Timer Component - Updated to stop when status is InProgress
const TicketTimer = ({ ticket }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Get time limit based on issue hierarchy
    const getTimeLimit = (issue) => {
      try {
        if (issue && issue.main && issue.sub && issue.inner_sub) {
          return issueHierarchy[issue.main]?.[issue.sub]?.[issue.inner_sub]?.timeLimit;
        }
        return null;
      } catch (error) {
        console.error("Error getting time limit:", error);
        return null;
      }
    };

    const timeLimitMinutes = getTimeLimit(ticket.issue);
    
    if (!timeLimitMinutes || !ticket.createdAt) {
      setTimeRemaining(null);
      return;
    }

    // If ticket status is InProgress, don't run the timer
    if (ticket.status === 'InProgress') {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const createdAt = new Date(ticket.createdAt);
      const deadline = new Date(createdAt.getTime() + timeLimitMinutes * 60000);
      const now = new Date();
      const remaining = deadline.getTime() - now.getTime();

      if (remaining <= 0) {
        // Only send HR warning if ticket is still Open (not InProgress)
        if (!isExpired && ticket.hr_warning === false && ticket.status === 'Open') {
          console.log(`Time over for ticket ${ticket._id}: ${ticket.issue.main} > ${ticket.issue.sub} > ${ticket.issue.inner_sub}`);
          handleExceedTime(ticket);
          setIsExpired(true);
        }
        setTimeRemaining(0);
        return;
      }

      setTimeRemaining(remaining);
    };

    // Calculate initial time
    calculateTimeRemaining();

    // Set up interval to update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [ticket, isExpired, ticket.status]); // Added ticket.status to dependencies

  const formatTime = (milliseconds) => {
    if (milliseconds === null || milliseconds <= 0) return "00:00:00";
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Don't show timer for InProgress tickets
  if (timeRemaining === null || ticket.status === 'InProgress') {
    return (
      <div className="timer-display paused">
        <span className="timer-label">
          {ticket.status === 'InProgress' ? 'Timer Paused - In Progress' : 'No timer available'}
        </span>
      </div>
    );
  }

  return (
    <div className={`timer-display ${timeRemaining <= 0 ? 'expired' : timeRemaining <= 300000 ? 'warning' : 'normal'}`}>
      <span className="timer-label">Time Remaining:</span>
      <span className="timer-value">{formatTime(timeRemaining)}</span>
      {timeRemaining <= 0 && <span className="expired-text">EXPIRED</span>}
    </div>
  );
};

// Main IT Support Page Component
function ITSupportPage() {
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showInput, setShowInput] = useState({});
  const [resolutions, setResolutions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indicator, setIndicator] = useState(true);
  const [imagePreviews, setImagePreviews] = useState({});
  const [imageFiles, setImageFiles] = useState({});

  const id = localStorage.getItem('id');

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

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
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await axios.post(
          `${apiUrl}/api/it_support/get_open`, 
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

    setImageFiles(prev => ({ ...prev, [ticketId]: file }));
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
  console.log('handleCloseTicket called:', ticketId); // Debug log
  
  const resolution = resolutions[ticketId];
  const imageFile = imageFiles[ticketId];

  if (!resolution || resolution.trim() === '') {
    alert('Please enter a resolution.');
    return;
  }

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const formData = new FormData();
  formData.append('id', ticketId);
  formData.append('resolution', resolution);
  formData.append('proofImage', imageFile);

  try {
    await axios.post(`${apiUrl}/api/it_support/close_ticket`, formData, {
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

const handleUpdateStatus = async (ticketId, currentStatus, sub_issue) => {
  console.log('handleUpdateStatus called:', ticketId, currentStatus, sub_issue); // Debug log

  // List of allowed sub_issues for status update
  const allowedSubIssues = [
    'Applications',
    'Network Issues',
    'LAN/Internet',
    'File/Resource Access',
    'Printing Services'
  ];

  // Check if sub_issue is in allowed list
  if (!allowedSubIssues.includes(sub_issue)) {
    alert('Ticket status cannot be changed. Sub-issue not allowed for status update.');
    return;
  }

  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const newStatus = currentStatus === 'Open' ? 'InProgress' : 'Open';

    await axios.put(
      `${apiUrl}/api/it_support/update_ticket_status`,
      { ticketId, status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
    );

    setIndicator(prev => !prev);
    alert(`Ticket status updated to ${newStatus}!`);
  } catch (err) {
    console.error('Error updating ticket status:', err);
    alert(err.response?.data?.message || 'Failed to update ticket status.');
  }
};

  const priorityMap = {
    "Connectivity (Network Issues)": "high",
    "Software": "medium",
    "Hardware Issues": "high",
    "Accounts and Access (File Sharing)": "medium",
    "Other Services": "low",
    "Mail Issues": "medium"
  };

  const getTicketPriority = (issue) => {
    if (!issue) return 'low';
    
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
        <div className="header-buttons">
          <button className="details-button" onClick={userpage}>
            My Details
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
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
                  <div className={`priority-ribbon priority-${priority}`}>
                    {priority.toUpperCase()}
                  </div>

                  {/* Add Timer Component */}
                  <TicketTimer ticket={ticket} />

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
                            ? `${ticket.issue.main} > ${ticket.issue.sub} > ${ticket.issue.inner_sub || ''}`
                            : JSON.stringify(ticket.issue)
                        }
                      </h3>
                    </div>
                    <span className={`status-badge ${ticket.status.toLowerCase().replace('inprogress', 'in-progress')}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="ticket-info-grid">
                    <div className="info-item">
                      <span className="info-label">Employee:    {ticket.employeeName}</span>
                      {/* <span className="info-value"></span> */}
                    </div>
                    <br />
                    <div className="info-item">
                      <span className="info-label">ID:    {ticket.employeeId}</span>
                      {/* <span className="info-value"></span> */}
                    </div>
                    <br />
                    <div className="info-item">
                      <span className="info-label">Email:    {ticket.email}</span>
                      {/* <span className="info-value"></span> */}
                    </div>
                    <br />
                    <div className="info-item">
                      <span className="info-label">Date:  {new Date(ticket.date).toLocaleDateString()}</span>
                      {/* <span className="info-value"></span> */}
                    </div>
                    <br />
                    <div className="info-item">
                      <span className="info-label">Time: {ticket.time}</span>
                      {/* <span className="info-value"></span> */}
                    </div>
                  </div>

                  {!showInput[ticket._id] && (
                    <div className="ticket-actions">
                      {ticket.status === 'Open' ? (
                        <button
                          className="action-button in-progress-btn"
                          onClick={() => handleUpdateStatus(ticket._id, ticket.status,ticket.issue.sub)}
                        >
                          Mark In Progress
                        </button>
                      ) : (
                        <button
                          className="action-button remove-progress-btn"
                          onClick={() => handleUpdateStatus(ticket._id, ticket.status,ticket.issue.sub)}
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