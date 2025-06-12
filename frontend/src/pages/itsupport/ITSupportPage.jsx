

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './it.css'; // Make sure this CSS file is in the same directory
// import { useNavigate } from 'react-router-dom';

// function ITSupportPage() {
//   const navigate = useNavigate();
//   const [tickets, setTickets] = useState([]);
//   const [showInput, setShowInput] = useState({});
//   const [resolutions, setResolutions] = useState({});
//   const [loading, setLoading] = useState(true); // Added loading state
//   const [error, setError] = useState(null); // Added error state for fetching tickets

//   const id = localStorage.getItem('id'); // Get ID from localStorage

//   useEffect(() => {
//     const fetchOpenTickets = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         if (!id) {
//             setError("User ID not found. Please log in again.");
//             setLoading(false);
//             // Optionally redirect to login page
//             // navigate('/login');
//             return;
//         }
//         const response = await axios.post('http://localhost:5000/api/it_support/get_open', { id },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           }
//         });
//         setTickets(response.data);
//       } catch (err) {
//         console.error('Error fetching open tickets:', err);
//         setError(err.response?.data?.message || 'Failed to fetch open tickets.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     function userpage() {
//     navigate("/userdetails");
//   }

//     fetchOpenTickets();
//   }, [id]); // Depend on 'id' so it refetches if ID changes

//   function userpage() {
//     navigate("/userdetails");
//   }
//   const handleShowInput = (ticketId) => {
//     setShowInput(prev => ({ ...prev, [ticketId]: true }));
//   };

//   const handleResolutionChange = (ticketId, value) => {
//     setResolutions(prev => ({ ...prev, [ticketId]: value }));
//   };

//   const handleCloseTicket = async (ticketId) => {
//     const resolution = resolutions[ticketId];

//     if (!resolution || resolution.trim() === '') {
//       alert('Please enter a resolution.');
//       return;
//     }

//     try {
//       // Assuming backend expects 'id' as the key for ticket ID
//       await axios.post('http://localhost:5000/api/it_support/close_ticket', {
//         id: ticketId,
//         resolution
//       },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           }
//         });

//       // Filter out the closed ticket from the state
//       setTickets(prev => prev.filter(t => t._id !== ticketId));
//       // Reset input visibility and resolution for the closed ticket
//       setShowInput(prev => ({ ...prev, [ticketId]: false }));
//       setResolutions(prev => {
//         const newResolutions = { ...prev };
//         delete newResolutions[ticketId];
//         return newResolutions;
//       });
//       alert('Ticket closed successfully!'); // User feedback
//     } catch (err) {
//       console.error('Error closing ticket:', err);
//       alert(err.response?.data?.message || 'Failed to close ticket. Please try again.');
//     }
//   };




// return (
//  <div className="it-support-page-container">
//   <div className="it-dashboard-header">
//     <h1 className="it-dashboard-title">IT Support Dashboard</h1>
//     <button className="details-button" onClick={userpage}>
//       My Details
//     </button>
//   </div>

//   {loading && <div className="loading-message">Loading open tickets...</div>}
//   {error && <div className="error-message">{error}</div>}

//   {!loading && !error && (
//     <div className="ticket-list-grid">
//       {tickets.length > 0 ? (
//         tickets.map((ticket) => (
//           <div key={ticket._id} className="ticket-card">
//             <div className="ticket-header">
//               <h3 className="ticket-issue">{ticket.issue}</h3>
//               <span className={`ticket-status status-${ticket.status.toLowerCase().replace(/\s/g, '-')}`}>
//                 {ticket.status}
//               </span>
//             </div>
//             <div className="ticket-info">
//               <p><strong className="info-label">Employee:</strong> {ticket.employeeName}</p>
//               <p><strong className="info-label">ID:</strong> {ticket.employeeId}</p>
//               <p><strong className="info-label">Email:</strong> {ticket.email}</p>
//               <p><strong className="info-label">Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
//               <p><strong className="info-label">Time:</strong> {ticket.time}</p>
//             </div>

//             {/* Action buttons based on ticket status */}
//             {!showInput[ticket._id] ? (
//               <div className="ticket-actions">
//                 {ticket.status === 'Open' ? (
//                   <button 
//                     className="action-button in-progress-btn"
//                     onClick={() => handleUpdateStatus(ticket._id, 'InProgress')}
//                   >
//                     Mark In Progress
//                   </button>
//                 ) : ticket.status === 'InProgress' && (
//                   <button 
//                     className="action-button remove-progress-btn"
//                     onClick={() => handleUpdateStatus(ticket._id, 'Open')}
//                   >
//                     Remove In Progress
//                   </button>
//                 )}
//                 {ticket.status !== 'Closed' && (
//                   <button 
//                     className="action-button close-ticket-btn" 
//                     onClick={() => handleShowInput(ticket._id)}
//                   >
//                     {ticket.status === 'InProgress' ? 'Complete Ticket' : 'Close Ticket'}
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="resolution-section">
//                 <textarea
//                   placeholder="Enter resolution description..."
//                   value={resolutions[ticket._id] || ''}
//                   onChange={(e) => handleResolutionChange(ticket._id, e.target.value)}
//                   className="resolution-textarea"
//                   rows={4}
//                 />
//                 <div className="resolution-actions">
//                   <button 
//                     className="action-button submit-resolution-btn" 
//                     onClick={() => handleCloseTicket(ticket._id)}
//                   >
//                     Submit Resolution
//                   </button>
//                   <button 
//                     className="action-button cancel-resolution-btn" 
//                     onClick={() => setShowInput(prev => ({ ...prev, [ticket._id]: false }))}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))
//       ) : (
//         <div className="no-tickets-message">
//           <p>🎉 No open tickets assigned to you right now. Great job!</p>
//           <p>Check back later or enjoy your break!</p>
//         </div>
//       )}
//     </div>
//   )}
// </div>
// );

// }
// export default ITSupportPage

//  

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
      await axios.post('http://localhost:5000/api/it_support/close_ticket', {
        id: ticketId,
        resolution
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      setTickets(prev => prev.filter(t => t._id !== ticketId));
      setShowInput(prev => ({ ...prev, [ticketId]: false }));
      setResolutions(prev => {
        const newResolutions = { ...prev };
        delete newResolutions[ticketId];
        return newResolutions;
      });
      alert('Ticket closed successfully!');
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert(err.response?.data?.message || 'Failed to close ticket. Please try again.');
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
// const getTicketPriority = (issue) => {
//   // First ensure issue is a string
//   const issueString = typeof issue === 'string' ? issue : String(issue || '');
  
//   // Safely split the string
//   const mainIssue = issueString.split('>')[0].trim();
  
//   // Return the priority from the map or default to 'low'
//   return priorityMap[mainIssue] || 'low';
// };






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