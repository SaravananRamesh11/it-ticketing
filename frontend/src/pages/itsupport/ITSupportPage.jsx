// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './it.css';

// function ITSupportPage() {
//   const [tickets, setTickets] = useState([]);
//   const [showInput, setShowInput] = useState({});
//   const [resolutions, setResolutions] = useState('');
//   const id = localStorage.getItem('id');

//   useEffect(() => {
//     const fetchOpenTickets = async () => {
//       try {
//         const response = await axios.post('http://localhost:5000/api/it_support/get_open', { id });
//         setTickets(response.data);
//       } catch (error) {
//         console.error('Error fetching open tickets:', error);
//       }
//     };

//     // fetchOpenTickets();
//   }, []);

//   const handleShowInput = (ticketId) => {
//     setShowInput(prev => ({ ...prev, [ticketId]: true }));
//   };

//   const handleResolutionChange = (ticketId, value) => {
//     setResolutions(prev => ({ ...prev, [ticketId]: value }));
//   };

//   const handleCloseTicket = async (ticketId) => {
//     //const resolution = resolutions[ticketId];
//     console.log("before alert")
//     if (!resolutions) return alert('Please enter a resolution.');
//     console.log("after alert")
//     try {
//       await axios.post('http://localhost:5000/api/it_support/close_ticket', {
//         ticketId,
//         resolutions
//       });

//       setTickets(prev => prev.filter(t => t._id !== ticketId)); // remove closed ticket from UI
//     } catch (err) {
//       console.error('Error closing ticket:', err);
//     }
//   };

//   return (
//     <div className="it-support-page">
//       <h1 className="title">IT Support Dashboard</h1>
//       <div className="ticket-list">
//         {tickets.length > 0 ? (
//           tickets.map((ticket) => (
//             <div key={ticket._id} className="ticket-card">
//               <h3>{ticket.issue}</h3>
//               <p><strong>Employee:</strong> {ticket.employeeName}</p>
//               <p><strong>ID:</strong> {ticket.employeeId}</p>
//               <p><strong>Email:</strong> {ticket.email}</p>
//               <p><strong>Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
//               <p><strong>Time:</strong> {ticket.time}</p>
//               <p><strong>Status:</strong> {ticket.status}</p>

//               {!showInput[ticket._id] ? (
//                 <button className="close-btn" onClick={() => handleShowInput(ticket._id)}>Close Ticket</button>
//               ) : (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Add description"
//                     value={resolutions[ticket._id] || ''}
//                     onChange={(e) => handleResolutionChange(ticket._id, e.target.value)}
//                     className="resolution-input"
//                   />
//                   <button className="ok-btn" onClick={()=> handleCloseTicket(ticket._id)}>OK</button>
//                 </>
//               )}
//             </div>
//           ))
//         ) : (
//           <p>No open tickets assigned to you.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ITSupportPage;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './it.css';

// function ITSupportPage() {
//   const [tickets, setTickets] = useState([]);
//   const [resolution, setResolution] = useState('');
//   const [selectedTicketId, setSelectedTicketId] = useState(null);
//   const id = localStorage.getItem('id');

//   useEffect(() => {
//     const fetchOpenTickets = async () => {
//       try {
//         const response = await axios.post('http://localhost:5000/api/it_support/get_open', { id });
//         setTickets(response.data);
//       } catch (error) {
//         console.error('Error fetching open tickets:', error);
//       }
//     };

//     fetchOpenTickets();
//   }, []);

//   const handleShowInput = (ticketId) => {
//     setSelectedTicketId(ticketId);
//     setResolution('');
//   };

//   const handleCloseTicket = async () => {
//     if (!resolution.trim()) return alert('Please enter a resolution.');

//     try {
//       await axios.post('http://localhost:5000/api/it_support/close_ticket', {
//         ticketId: selectedTicketId,
//         resolution
//       });

//       setTickets(prev => prev.filter(t => t._id !== selectedTicketId)); // Remove from UI
//       setSelectedTicketId(null); // Reset UI
//       setResolution('');
//     } catch (err) {
//       console.error('Error closing ticket:', err);
//     }
//   };

//   return (
//     <div className="it-support-page">
//       <h1 className="title">IT Support Dashboard</h1>
//       <div className="ticket-list">
//         {tickets.length > 0 ? (
//           tickets.map((ticket) => (
//             <div key={ticket._id} className="ticket-card">
//               <h3>{ticket.issue}</h3>
//               <p><strong>Employee:</strong> {ticket.employeeName}</p>
//               <p><strong>ID:</strong> {ticket.employeeId}</p>
//               <p><strong>Email:</strong> {ticket.email}</p>
//               <p><strong>Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
//               <p><strong>Time:</strong> {ticket.time}</p>
//               <p><strong>Status:</strong> {ticket.status}</p>

//               {selectedTicketId !== ticket._id ? (
//                 <button className="close-btn" onClick={() => handleShowInput(ticket._id)}>Close Ticket</button>
//               ) : (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Add description"
//                     value={resolution}
//                     onChange={(e) => setResolution(e.target.value)}
//                     className="resolution-input"
//                   />
//                   <button className="ok-btn" onClick={handleCloseTicket}>OK</button>
//                 </>
//               )}
//             </div>
//           ))
//         ) : (
//           <p>No open tickets assigned to you.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ITSupportPage;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './it.css';

// function ITSupportPage() {
//   const [tickets, setTickets] = useState([]);
//   const [showInput, setShowInput] = useState({});
//   const [resolutions, setResolutions] = useState({}); // Changed to object
//   const id = localStorage.getItem('id');

//   useEffect(() => {
//     const fetchOpenTickets = async () => {
//       try {
//         const response = await axios.post('http://localhost:5000/api/it_support/get_open', { id });
//         setTickets(response.data);
//       } catch (error) {
//         console.error('Error fetching open tickets:', error);
//       }
//     };

//     fetchOpenTickets(); // Uncommented this important line
//   }, [id]); // Added id as dependency

//   const handleShowInput = (ticketId) => {
//     setShowInput(prev => ({ ...prev, [ticketId]: true }));
//   };

//   const handleResolutionChange = (ticketId, value) => {
//     setResolutions(prev => ({ ...prev, [ticketId]: value }));
//   };

//   // const handleCloseTicket = async (ticketId) => {
//   //   const resolution = resolutions[ticketId];
    
//   //   if (!resolution || resolution.trim() === '') {
//   //     alert('Please enter a resolution.');
//   //     return;
//   //   }

//   //   try {
//   //     await axios.post('http://localhost:5000/api/it_support/close_ticket', {
//   //       ticketId,
//   //       resolution // Changed from resolutions to resolution
//   //     });

//   //     setTickets(prev => prev.filter(t => t._id !== ticketId));
//   //     setShowInput(prev => ({ ...prev, [ticketId]: false }));
//   //     setResolutions(prev => {
//   //       const newResolutions = { ...prev };
//   //       delete newResolutions[ticketId];
//   //       return newResolutions;
//   //     });
//   //   } catch (err) {
//   //     console.error('Error closing ticket:', err);
//   //     alert('Failed to close ticket. Please try again.');
//   //   }
//   // };
//   const handleCloseTicket = async (ticketId) => {
//   const resolution = resolutions[ticketId];
  
//   if (!resolution || resolution.trim() === '') {
//     alert('Please enter a resolution.');
//     return;
//   }

//   try {
//     await axios.post('http://localhost:5000/api/it_support/close_ticket', {
//       id: ticketId, // ✅ Must match backend expected key
//       resolution
//     });

//     setTickets(prev => prev.filter(t => t._id !== ticketId));
//     setShowInput(prev => ({ ...prev, [ticketId]: false }));
//     setResolutions(prev => {
//       const newResolutions = { ...prev };
//       delete newResolutions[ticketId];
//       return newResolutions;
//     });
//   } catch (err) {
//     console.error('Error closing ticket:', err);
//     alert('Failed to close ticket. Please try again.');
//   }
// };



//   return (
//     <div className="it-support-page">
//       <h1 className="title">IT Support Dashboard</h1>
//       <div className="ticket-list">
//         {tickets.length > 0 ? (
//           tickets.map((ticket) => (
//             <div key={ticket._id} className="ticket-card">
//               <h3>{ticket.issue}</h3>
//               <p><strong>Employee:</strong> {ticket.employeeName}</p>
//               <p><strong>ID:</strong> {ticket.employeeId}</p>
//               <p><strong>Email:</strong> {ticket.email}</p>
//               <p><strong>Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
//               <p><strong>Time:</strong> {ticket.time}</p>
//               <p><strong>Status:</strong> {ticket.status}</p>

//               {!showInput[ticket._id] ? (
//                 <button className="close-btn" onClick={() => handleShowInput(ticket._id)}>Close Ticket</button>
//               ) : (
//                 <>
//                   <textarea
//                     placeholder="Enter resolution description"
//                     value={resolutions[ticket._id] || ''}
//                     onChange={(e) => handleResolutionChange(ticket._id, e.target.value)}
//                     className="resolution-input"
//                     rows={3}
//                   />
//                   <div className="action-buttons">
//                     <button className="ok-btn" onClick={() => handleCloseTicket(ticket._id)}>Submit</button>
//                     <button className="cancel-btn" onClick={() => setShowInput(prev => ({ ...prev, [ticket._id]: false }))}>
//                       Cancel
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           ))
//         ) : (
//           <p>No open tickets assigned to you.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ITSupportPage;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './it.css'; // Make sure this CSS file is in the same directory
import { useNavigate } from 'react-router-dom';

function ITSupportPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [showInput, setShowInput] = useState({});
  const [resolutions, setResolutions] = useState({});
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state for fetching tickets

  const id = localStorage.getItem('id'); // Get ID from localStorage

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
        const response = await axios.post('http://localhost:5000/api/it_support/get_open', { id });
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

//   return (
//     <div className="it-support-page-container">
//       <h1 className="it-dashboard-title">IT Support Dashboard</h1>

//       {loading && <div className="loading-message">Loading open tickets...</div>}
//       {error && <div className="error-message">{error}</div>}

//       {!loading && !error && (
//         <div className="ticket-list-grid">
//           {tickets.length > 0 ? (
//             tickets.map((ticket) => (
//               <div key={ticket._id} className="ticket-card">
//                 <div className="ticket-header">
//                   <h3 className="ticket-issue">{ticket.issue}</h3>
//                   <span className={`ticket-status status-${ticket.status.toLowerCase().replace(/\s/g, '-')}`}>
//                     {ticket.status}
//                   </span>
//                 </div>
//                 <div className="ticket-info">
//                   <p><strong className="info-label">Employee:</strong> {ticket.employeeName}</p>
//                   <p><strong className="info-label">ID:</strong> {ticket.employeeId}</p>
//                   <p><strong className="info-label">Email:</strong> {ticket.email}</p>
//                   <p><strong className="info-label">Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
//                   <p><strong className="info-label">Time:</strong> {ticket.time}</p>
//                 </div>

//                 {!showInput[ticket._id] ? (
//                   <button className="action-button close-ticket-btn" onClick={() => handleShowInput(ticket._id)}>
//                     Close Ticket
//                   </button>
//                 ) : (
//                   <div className="resolution-section">
//                     <textarea
//                       placeholder="Enter resolution description..."
//                       value={resolutions[ticket._id] || ''}
//                       onChange={(e) => handleResolutionChange(ticket._id, e.target.value)}
//                       className="resolution-textarea"
//                       rows={4}
//                     />
//                     <div className="resolution-actions">
//                       <button className="action-button submit-resolution-btn" onClick={() => handleCloseTicket(ticket._id)}>
//                         Submit Resolution
//                       </button>
//                       <button className="action-button cancel-resolution-btn" onClick={() => setShowInput(prev => ({ ...prev, [ticket._id]: false }))}>
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))
//           ) : (
//             <div className="no-tickets-message">
//               <p>🎉 No open tickets assigned to you right now. Great job!</p>
//               <p>Check back later or enjoy your break!</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


return (
  <div className="it-support-page-container">
    <div className="it-dashboard-header"> {/* Added a div for header elements */}
      <h1 className="it-dashboard-title">IT Support Dashboard</h1>
      {/* My Details Button */}
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

              {!showInput[ticket._id] ? (
                <button className="action-button close-ticket-btn" onClick={() => handleShowInput(ticket._id)}>
                  Close Ticket
                </button>
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
                    <button className="action-button submit-resolution-btn" onClick={() => handleCloseTicket(ticket._id)}>
                      Submit Resolution
                    </button>
                    <button className="action-button cancel-resolution-btn" onClick={() => setShowInput(prev => ({ ...prev, [ticket._id]: false }))}>
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