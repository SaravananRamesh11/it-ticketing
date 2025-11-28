import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/login_context_hook';
import './employee.css';
//import UserTickets from './ticket.jsx';


const issueHierarchy = {
  "Hardware Issues": {
    "Desktops/Laptops": ["Repair", "Replacement", "Upgrade", "Peripheral Issues"],
    "Printers/Scanners": ["Setup", "Configuration", "Repair", "Replacement"],
  },
  "Software": {
    "Operating Systems": ["Installation", "Upgrade", "Performance Issues"],
    "Applications": ["WPS", "Microsoft Office", "Teams", "Upgrade", "Licensing", "Functionality"],
    "Software Bug Reports": ["Reporting Software Defects"],
  },
  "Connectivity (Network Issues)": {
    "Network Issues": ["Wired/Wireless Access", "VPN", "Network Performance"],
    "Email Issues": ["Account Setup", "Performance", "Connectivity"],
    "LAN/Internet": ["LAN Cable Issues", "Internet I/O Port Damage", "Website Issues"],
  },
  "Accounts and Access (File Sharing)": {
    "User Accounts": ["Creation", "Termination", "Password Resets", "Access Rights"],
    "File/Resource Access": ["Shared Folders", "Permissions", "Network Drives"],
  },
  "Other Services": {
    "Printing Services": ["Print Queues", "Quality", "Access"],
    "Database Services": ["Access", "Performance Tuning", "Backup/Recovery"],
    "Web Services": ["Website Accessibility", "Content Updates", "Domain Names"],
  },
  "Mail Issues": {
    "Mail Operations": ["Mail Password Reset", "Mail ID Creation", "Deletion", "Account Configuration"],
  }
};

// const schema = yup.object().shape({
//   mainIssue: yup.string().required('Main issue is required'),
//   subIssue: yup.string().required('Sub issue is required'),
//   innerSubIssue: yup.string().required('Inner sub-issue is required'),
//   date: yup.date().required('Date is required').typeError('Invalid date'),
//   time: yup
//     .string()
//     .required('Time is required')
//     .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Invalid time (HH:MM format)'),
// });

const schema = yup.object().shape({
  mainIssue: yup.string().required('Main issue is required'),
  subIssue: yup.string().required('Sub issue is required'),
  innerSubIssue: yup.string().required('Inner sub-issue is required'),
  description: yup.string().required('Description is required'),
  // Removed date and time since they're auto-generated
});

const EmployeePage = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({ resolver: yupResolver(schema) });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const selectedMain = watch('mainIssue');
  const selectedSub = watch('subIssue');

  // const onSubmit = async (data) => {
  //   console.log(data)
  //   if (data.date) {
  //     data.date = new Date(data.date).toISOString();
  //   }

  //   setIsLoading(true);
  //   setSubmitted(false);
  //   try {
  //     const id = localStorage.getItem('id');
  //     if (!id) {
  //       alert('User ID not found. Please login again.');
  //       navigate('/login');
  //       return;
  //     }

  //     // Get user details
  //     const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  //     const userResponse = await axios.post(
  //       `${apiUrl}/api/general/details`,
  //       { id },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         }
  //       }
  //     );

  //     const userData = userResponse.data;
  //     console.log("User details fetched:", userData);
      
  //     // const ticketData = { ...data, ...userData };
  //     const ticketData = { ...data, ...userData, id: userData._id };
      
  //     console.log("Submitting ticket with this data:", ticketData);
  //     await axios.post(`${apiUrl}/api/user/ticket`, { ticketData },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         }
  //       }
  //     );

  //     setSubmitted(true);
  //     reset();
  //   } catch (error) {
  //     console.error('Ticket submission failed:', error);
  //     const message = error.response?.data?.message || 'Failed to submit ticket. Please try again.';
  //     alert(message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

//   const onSubmit = async (data) => {
    

//     setIsLoading(true);
//     setSubmitted(false);
//     try {
//       const id = localStorage.getItem('id');
//       if (!id) {
//         alert('HIIIIIIIIIII User ID not found. Please login again.');
//         navigate('/login');
//         return;
//       }

//       const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
//       const userResponse = await axios.post(
//         `${apiUrl}/api/general/details`,
//         { id },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           }
//         }
//       );

//       const userData = userResponse.data;
//       console.log("User details fetched:", userData);

//       // ✅ Map issue structure to match schema
//       const ticketData = {
//         employeeName: userData.employeeName,
//         employeeId: userData.employeeId,
//         email: userData.email,
//         id: userData._id,
//         date: data.date,
//         time: data.time,
//         description: data.description,
//         issue: {
//           main: data.mainIssue,
//           sub: data.subIssue,
//           inner_sub: data.innerSubIssue
//         }
//       };

// // <<<<<<< HEAD
// //       console.log("this is ticket daatattaa",ticketData)

// //       await axios.post('http://localhost:5000/api/user/ticket', { ticketData },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem("token")}`,
// //           }
// // =======
//       console.log("Submitting ticket with this data:", ticketData);

//       await axios.post(`${apiUrl}/api/user/ticket`,  ticketData , {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,

//         }
//       });

//       setSubmitted(true);
//       reset();
//     } catch (error) {
//       console.error('Ticket submission failed:', error);
//       const message = error.response?.data?.message || 'Failed to submit ticket. Please try again.';
//       alert(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };


const onSubmit = async (data) => {
  setIsLoading(true);
  setSubmitted(false);
  
  try {
    const id = localStorage.getItem('id');
    if (!id) {
      alert('User ID not found. Please login again.');
      navigate('/login');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const userResponse = await axios.post(
      `${apiUrl}/api/general/details`,
      { id },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
    );

    const userData = userResponse.data;
    console.log("User details fetched:", userData);

    // 🔥 Add current date and time to `data`
    const now = new Date();
    data.date = now.toISOString().split('T')[0]; // format: YYYY-MM-DD
    data.time = now.toTimeString().split(' ')[0]; // format: HH:MM:SS

    // ✅ Map issue structure to match schema
    const ticketData = {
      employeeName: userData.employeeName,
      employeeId: userData.employeeId,
      email: userData.email,
      id: userData._id,
      date: data.date,
      time: data.time,
      description: data.description,
      issue: {
        main: data.mainIssue,
        sub: data.subIssue,
        inner_sub: data.innerSubIssue
      }
    };

    console.log("Submitting ticket with this data:", ticketData);

    await axios.post(`${apiUrl}/api/user/ticket`, ticketData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });

    setSubmitted(true);
    reset();
  } catch (error) {
    console.error('Ticket submission failed:', error);
    const message = error.response?.data?.message || 'Failed to submit ticket. Please try again.';
    alert(message);
  } finally {
    setIsLoading(false);
  }
};

  function userpage() {
    navigate("/userdetails");
  }

  function navigateToTicketInfo() {
    navigate("/employeeticketinfo");
  }

  return (
    <div className="employee-page-container">
      <div className="header-buttons">
        <button className="details-button" onClick={userpage}>
          My Details
        </button>
        <button className="info-button" onClick={navigateToTicketInfo}>
          Ticket Info
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

    <div className="form-card">
      <h2 className="form-title">Submit a New Ticket</h2>
      {submitted ? (
        <div className="success-message-card">
          <p className="success-message-text">
            🎉 Your ticket has been submitted successfully!
          </p>
          <p className="success-message-subtext">
            You will receive a confirmation email shortly.
          </p>
          <button className="new-ticket-button" onClick={() => setSubmitted(false)}>
            Submit another ticket
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="ticket-form">
          <div className="form-group">
            <label htmlFor="mainIssue" className="form-label">Main Issue</label>
            <select
              id="mainIssue"
              className="form-input"
              defaultValue=""
              {...register('mainIssue')}
            >
              <option value="" disabled hidden>Select a main issue</option>
              {Object.keys(issueHierarchy).map((main) => (
                <option key={main} value={main}>{main}</option>
              ))}
            </select>
            {errors.mainIssue && <p className="error-text">{errors.mainIssue.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="subIssue" className="form-label">Sub Issue</label>
            <select
              id="subIssue"
              className="form-input"
              defaultValue=""
              {...register('subIssue')}
              disabled={!selectedMain}
            >
              <option value="" disabled hidden>Select a sub issue</option>
              {selectedMain && Object.keys(issueHierarchy[selectedMain]).map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            {errors.subIssue && <p className="error-text">{errors.subIssue.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="innerSubIssue" className="form-label">Inner Sub Issue</label>
            <select
              id="innerSubIssue"
              className="form-input"
              defaultValue=""
              {...register('innerSubIssue')}
              disabled={!selectedMain || !selectedSub}
            >
              <option value="" disabled hidden>Select an inner sub issue</option>
              {selectedMain && selectedSub &&
                issueHierarchy[selectedMain][selectedSub].map((inner) => (
                  <option key={inner} value={inner}>{inner}</option>
                ))}
            </select>
            {errors.innerSubIssue && <p className="error-text">{errors.innerSubIssue.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              className="form-input"
              rows="4"
              placeholder="Describe the issue in detail"
              {...register('description')}
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          {/* <div className="form-group">
            <label htmlFor="date" className="form-label">Current Date</label>
            <input id="date" className="form-input" type="date" {...register('date')} />
            {errors.date && <p className="error-text">{errors.date.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="time" className="form-label">Current Time</label>
            <input id="time" className="form-input" type="time" {...register('time')} />
            {errors.time && <p className="error-text">{errors.time.message}</p>}
          </div> */}

          <button
            className="submit-ticket-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      )}
    </div>
  </div>
  );
};

export default EmployeePage;
