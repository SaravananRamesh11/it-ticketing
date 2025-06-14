import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import './employee.css';

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

const schema = yup.object().shape({
  mainIssue: yup.string().required('Main issue is required'),
  subIssue: yup.string().required('Sub issue is required'),
  innerSubIssue: yup.string().required('Inner sub-issue is required'),
  date: yup.date().required('Date is required').typeError('Invalid date'),
  time: yup
    .string()
    .required('Time is required')
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Invalid time (HH:MM format)'),
});

const EmployeePage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({ resolver: yupResolver(schema) });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedMain = watch('mainIssue');
  const selectedSub = watch('subIssue');

  const onSubmit = async (data) => {
    console.log(data)
    if (data.date) {
      data.date = new Date(data.date).toISOString();
    }

    setIsLoading(true);
    setSubmitted(false);
    try {
      const id = localStorage.getItem('id');
      if (!id) {
        alert('User ID not found. Please login again.');
        navigate('/login');
        return;
      }

      const userResponse = await axios.post(
        "http://localhost:5000/api/general/details",
        { id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );

      const userData = userResponse.data;

      const ticketData = {
        issue: {
          main: data.mainIssue,
          sub: data.subIssue,
          inner_sub: data.innerSubIssue
        },
        date: data.date,
        time: data.time,
        employeeName: userData.employeeName,
        email: userData.email,
        employeeId: userData.employeeId,
        id: userData._id
      };

      await axios.post('http://localhost:5000/api/user/ticket', { ticketData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );

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

  return (
    <div className="employee-page-container">
      <button className="details-button" onClick={userpage}>
        My Details
      </button>

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
              <select id="mainIssue" className="form-input" {...register('mainIssue')}>
                <option value="" disabled hidden selected>Select a main issue</option>
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
                {...register('subIssue')}
                disabled={!selectedMain}
              >
                <option value="" disabled hidden selected>Select a sub issue</option>
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
                {...register('innerSubIssue')}
                disabled={!selectedMain || !selectedSub}
              >
                <option value="" disabled hidden selected>Select an inner sub issue</option>
                {selectedMain && selectedSub &&
                  issueHierarchy[selectedMain][selectedSub].map((inner) => (
                    <option key={inner} value={inner}>{inner}</option>
                  ))}
              </select>
              {errors.innerSubIssue && <p className="error-text">{errors.innerSubIssue.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="date" className="form-label">Current Date</label>
              <input id="date" className="form-input" type="date" {...register('date')} />
              {errors.date && <p className="error-text">{errors.date.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="time" className="form-label">Current Time</label>
              <input id="time" className="form-input" type="time" {...register('time')} />
              {errors.time && <p className="error-text">{errors.time.message}</p>}
            </div>

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


// import React, { useState } from 'react';
// import axios from 'axios';
// import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';
// import { useNavigate } from 'react-router-dom';
// import './employee.css'; // Import the CSS file

// const schema = yup.object().shape({
//   issue: yup.string().required('Issue is required'),
//   date: yup.date().required('Date is required').typeError('Invalid date'),
//   time: yup
//     .string()
//     .required('Time is required')
//     .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Invalid time (HH:MM format)'),
// });

// const EmployeePage = () => {
//   const navigate = useNavigate();
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors }
//   } = useForm({ resolver: yupResolver(schema) });

//   const [submitted, setSubmitted] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const onSubmit = async (data) => {
//     if (data.date) {
//       // Ensure date is in ISO string format for backend
//       data.date = new Date(data.date).toISOString();
//     }
//     setIsLoading(true);
//     setSubmitted(false); // Reset submitted state on new submission
//     try {
//       console.log("Form data before submission:", data);
//       const id = localStorage.getItem('id');
//       if (!id) {
//         alert('User ID not found. Please login again.');
//         navigate('/login'); // Redirect to login
//         return;
//       }

//       // Get user details
//       const userResponse = await axios.post(
//         "http://localhost:5000/api/general/details",
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

//       // Prepare ticket data with necessary employee details
//       const ticketData = {
//         ...data,
//         employeeName: userData.employeeName,
//         email: userData.email,
//         employeeId: userData.employeeId,
//         id: userData._id // Use the user ID from the response
//       };
//       console.log("Ticket data being sent:", ticketData);

//       // Submit ticket
//       await axios.post('http://localhost:5000/api/user/ticket', { ticketData },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           }
//         }

//       );

//       setSubmitted(true);
//       reset(); // Clear form fields
//     } catch (error) {
//       console.error('Ticket submission failed:', error);
//       const message = error.response?.data?.message || 'Failed to submit ticket. Please try again.';
//       alert(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   function userpage() {
//     navigate("/userdetails");
//   }

//   return (
//     <div className="employee-page-container">
//       <button className="details-button" onClick={userpage}>
//         My Details
//       </button>

//       <div className="form-card">
//         <h2 className="form-title">Submit a New Ticket</h2>
//         {submitted ? (
//           <div className="success-message-card">
//             <p className="success-message-text">
//               🎉 Your ticket has been submitted successfully!
//             </p>
//             <p className="success-message-subtext">
//               You will receive a confirmation email shortly.
//             </p>
//             <button className="new-ticket-button" onClick={() => setSubmitted(false)}>
//               Submit another ticket
//             </button>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit(onSubmit)} className="ticket-form">
//             <div className="form-group">
//               <label htmlFor="issue" className="form-label">Issue Description</label>
//               <input
//                 id="issue"
//                 className="form-input"
//                 placeholder="Briefly describe your issue..."
//                 {...register('issue')}
//               />
//               {errors.issue && <p className="error-text">{errors.issue.message}</p>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="date" className="form-label">Preferred Date</label>
//               <input id="date" className="form-input" type="date" {...register('date')} />
//               {errors.date && <p className="error-text">{errors.date.message}</p>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="time" className="form-label">Preferred Time</label>
//               <input id="time" className="form-input" type="time" {...register('time')} />
//               {errors.time && <p className="error-text">{errors.time.message}</p>}
//             </div>

//             <button
//               className="submit-ticket-button"
//               type="submit"
//               disabled={isLoading}
//             >
//               {isLoading ? 'Submitting...' : 'Submit Ticket'}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EmployeePage;
