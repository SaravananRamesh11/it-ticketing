
import './error.css';
import  useAuth  from "../hooks/login_context_hook";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { state } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check access rights whenever state or allowedRoles change
    const hasAccess = state.id && allowedRoles.includes(state.role);
    setAccessDenied(!hasAccess);
  }, [state, allowedRoles]);

  if (accessDenied) {
    return (
      <div className="access-denied-container">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this resource.</p>
        <div className="button-group">
          <button 
            onClick={() => navigate(-1)} // Go back to previous page
            className="back-button"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/')} // Go to home page
            className="home-button"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};