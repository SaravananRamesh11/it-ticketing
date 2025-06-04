// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Detail = () => {
//   const [employee, setEmployee] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showPasswordFields, setShowPasswordFields] = useState(false);
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [dumb, setdumb] = useState(false);
//   useEffect(() => {
//     const fetchDetails = async () => {
//       try {
//         const id = localStorage.getItem('id');
//         const res = await axios.post(
//           'http://localhost:5000/api/user/detail',
//           { id },
//           {
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           }
//         );
//         setEmployee(res.data);
//       } catch (error) {
//         console.error('Error fetching employee details:', error);
//         alert('Failed to load employee details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDetails();
//   }, [showPasswordFields]);

//   const handlePasswordChange = async () => {
//     if (newPassword !== confirmPassword) {
//       alert('Passwords do not match!');
//       return;
//     }

//     try {
//       const res = await axios.put('http://localhost:5000/api/user/password', {
//         id: employee._id,
//         newPassword,
//       });

//       alert('Password updated successfully!');
//       setShowPasswordFields(false);
//       setNewPassword('');
//       setConfirmPassword('');
//     } catch (error) {
//       console.error('Password update failed:', error);
//       alert('Failed to update password');
//     }
//   };

//   if (loading) {
//     return <div style={styles.loading}>Loading employee details...</div>;
//   }

//   if (!employee) {
//     return <div style={styles.error}>No employee data available.</div>;
//   }

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.header}>Employee Profile</h2>
//       <div style={styles.card}>
//         <p><strong>Name:</strong> {employee.employeeName}</p>
//         <p><strong>Employee ID:</strong> {employee.employeeId}</p>
//         <p><strong>Role:</strong> {employee.role}</p>
       

//         <button style={styles.button} onClick={() => setShowPasswordFields(!showPasswordFields)}>
//           Change Password
//         </button>

//         {showPasswordFields && (
//           <div style={styles.passwordSection}>
//             <input
//               style={styles.input}
//               type="password"
//               placeholder="New Password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//             />
//             <input
//               style={styles.input}
//               type="password"
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//             />
//             <button style={styles.okButton} onClick={handlePasswordChange}>
//               OK
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     padding: '2rem',
//     fontFamily: 'Arial, sans-serif',
//     backgroundColor: '#f4f4f4',
//     minHeight: '100vh',
//   },
//   header: {
//     textAlign: 'center',
//     color: '#333',
//     marginBottom: '1.5rem',
//   },
//   card: {
//     maxWidth: '400px',
//     margin: '0 auto',
//     backgroundColor: '#fff',
//     padding: '1.5rem',
//     borderRadius: '10px',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//     lineHeight: '1.8',
//   },
//   button: {
//     marginTop: '20px',
//     padding: '10px 20px',
//     backgroundColor: '#007bff',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     fontWeight: 'bold',
//     transition: 'background-color 0.3s ease-in-out',
//   },
//   input: {
//     display: 'block',
//     width: '100%',
//     marginTop: '10px',
//     padding: '10px',
//     fontSize: '1rem',
//     borderRadius: '6px',
//     border: '1px solid #ccc',
//   },
//   okButton: {
//     marginTop: '10px',
//     padding: '10px 20px',
//     backgroundColor: '#28a745',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     fontWeight: 'bold',
//   },
//   passwordSection: {
//     marginTop: '15px',
//   },
//   loading: {
//     textAlign: 'center',
//     marginTop: '2rem',
//     fontSize: '1.2rem',
//   },
//   error: {
//     textAlign: 'center',
//     color: 'red',
//     marginTop: '2rem',
//   },
// };

// export default Detail;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './detail.css'; // Import the CSS file

const Detail = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState(''); // For success/error messages

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const id = localStorage.getItem('id');
        if (!id) {
            // Redirect to login if no ID is found
            alert('User ID not found. Please login again.');
            window.location.href = '/login'; // Or use navigate from react-router-dom
            return;
        }
        const res = await axios.post(
          'http://localhost:5000/api/general/details',
          { id },
          {
            headers: {
              'Content-Type': 'application/json',
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
      const id = localStorage.getItem('id'); // Ensure ID is still available
      if (!id) {
          alert('User ID not found for password change. Please login again.');
          window.location.href = '/login';
          return;
      }
      await axios.post('http://localhost:5000/api/general/password', {
        id: id, // Use the ID from localStorage
        newPassword,
      });

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