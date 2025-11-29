import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ticket.css';

const UserTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('id'); // ✅ Renamed to match backend
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        console.log("➡️ ID:", userId);
        console.log("🛡️ Token:", token);
        console.log("🌐 API URL:", apiUrl);

        const res = await axios.post(
          `${apiUrl}/api/user/getusertickets`,
          { userId }, // ✅ Send userId, not id
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setTickets(res.data.tickets);
        } else {
          console.warn('⚠️ Ticket fetch unsuccessful:', res.data.message);
        }

        console.log('✅ Tickets:', res.data.tickets);
      } catch (err) {
        console.error('❌ Failed to fetch tickets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  const closeDetails = () => {
    setSelectedTicket(null);
  };

  return (
    <div className="user-tickets-container">
      <button className="back-button" onClick={() => window.history.back()}>&larr; Back</button>
      <h2>My Completed Tickets</h2>

      {isLoading ? (
        <p>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="ticket-card" onClick={() => openDetails(ticket)}>
              <div className="ticket-header">
                <span className="ticket-date">
                  {new Date(ticket.date).getDate()} <br />
                  {new Date(ticket.date).toLocaleString('default', { month: 'short' })}
                </span>
                <div className="ticket-route">
                  <h4>{ticket.issue.main}</h4>
                  <small>{ticket.itSupport} | {ticket.status}</small>
                </div>
              </div>
              Click on the ticket to view details!
              <div className="ticket-id">Ticket ID: {ticket._id}</div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="ticket-details-overlay" onClick={closeDetails}>
          <div className="ticket-details-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeDetails}>&times;</button>
            <h3>Ticket Details</h3>
            <p><strong>Issue:</strong> {selectedTicket.issue.main} {selectedTicket.issue.sub} {selectedTicket.issue.inner_sub}</p>
            <p><strong>Date:</strong> {new Date(selectedTicket.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedTicket.time}</p>
            <p><strong>Resolution:</strong> {selectedTicket.resolution}</p>
            <p><strong>Support:</strong> {selectedTicket.itSupport}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTickets;

