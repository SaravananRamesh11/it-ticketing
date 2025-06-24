import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ticket.css'

const UserTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const id = localStorage.getItem('id');
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await axios.post(`${apiUrl}/api/user/getusertickets`,{
          id
        });
        if (res.data.success) {
          setTickets(res.data.tickets);
        }
        console.log(res.data.tickets)
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
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
      <h2>My Completed Tickets</h2>
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

      {selectedTicket && (
        <div className="ticket-details-overlay" onClick={closeDetails}>
          <div className="ticket-details-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeDetails}>&times;</button>
            <h3>Ticket Details</h3>
            <p><strong>Issue:</strong> {selectedTicket.issue.main} {selectedTicket.issue.sub}  {selectedTicket.issue.inner_sub}</p>
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
