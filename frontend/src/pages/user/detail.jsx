import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './detail.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';
//import { FaArrowLeft } from 'react-icons/fa';

const Detail = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState(''); // For success/error messages

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const id = localStorage.getItem('id');
        if (!id) {
            // Redirect to login if no ID is found
            alert('User ID not found. Please login again.');
            window.location.href = '/'; // Or use navigate from react-router-dom
            return;
        }
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await axios.post(
          `${apiUrl}/api/general/details`,
          { id },
          {
            headers: {
              'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setEmployee(res.data);
      } catch (error) {
        console.error('Error fetching employee details:', error);
        alert('Failed to load employee details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []); // Empty dependency array means this runs once on mount

  const handlePasswordChange = async () => {
    setPasswordChangeMessage(''); // Clear previous messages
    if (newPassword.length < 2) { // Basic validation
        setPasswordChangeMessage('New password must be at least 6 characters long.');
        return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage('Passwords do not match!');
      return;
    }

    try {
      const id = localStorage.getItem('id');
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      if (!id) {
          alert('User ID not found for password change. Please login again.');
          window.location.href = '/login';
          return;
      }
      await axios.post(`${apiUrl}/api/general/password`, {
        id: id, // Use the ID from localStorage
        newPassword,
      },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
);

      setPasswordChangeMessage('Password updated successfully!');
      setShowPasswordFields(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update failed:', error);
      setPasswordChangeMessage(error.response?.data?.message || 'Failed to update password. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="detail-loading-container">
        <div className="spinner"></div>
        <p>Loading employee details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="detail-error-container">
        <p>No employee data available.</p>
        <button className="go-back-button" onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="detail-page-container">
      <button className="back-button" onClick={() => navigate(-1)}>&larr; Back</button>
      {/* <div className="detail-header"> */}
      {/* </div> */}
     
      <div className="profile-card">
        <h2 className="profile-header">Employee Profile</h2>
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{employee.employeeName}</span>
          </div>
          <div className="profile-info-item">
            <span className="info-label">Employee ID:</span>
            <span className="info-value">{employee.employeeId}</span>
          </div>
          <div className="profile-info-item">
            <span className="info-label">Role:</span>
            <span className="info-value">{employee.role}</span>
          </div>
          <div className="profile-info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{employee.email || 'N/A'}</span> {/* Assuming email might be available */}
          </div>
        </div>

        <button className="change-password-button" onClick={() => setShowPasswordFields(!showPasswordFields)}>
          {showPasswordFields ? 'Cancel Change Password' : 'Change Password'}
        </button>

        {showPasswordFields && (
          <div className="password-section">
            <h3 className="password-section-title">Update Password</h3>
            <div className="form-group">
                <input
                    className="password-input"
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <div className="form-group">
                <input
                    className="password-input"
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            {passwordChangeMessage && (
                <p className={`password-message ${passwordChangeMessage.includes('successfully') ? 'success' : 'error'}`}>
                    {passwordChangeMessage}
                </p>
            )}
            <button className="password-ok-button" onClick={handlePasswordChange}>
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Detail;
