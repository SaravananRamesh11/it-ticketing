import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import './employee.css'; // Import the CSS file

const schema = yup.object().shape({
  issue: yup.string().required('Issue is required'),
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
    formState: { errors }
  } = useForm({ resolver: yupResolver(schema) });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    if (data.date) {
      // Ensure date is in ISO string format for backend
      data.date = new Date(data.date).toISOString();
    }
    setIsLoading(true);
    setSubmitted(false); // Reset submitted state on new submission
    try {
      console.log("Form data before submission:", data);
      const id = localStorage.getItem('id');
      if (!id) {
        alert('User ID not found. Please login again.');
        navigate('/login'); // Redirect to login
        return;
      }

      // Get user details
      const userResponse = await axios.post(
        "http://localhost:5000/api/general/details",
        { id },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const userData = userResponse.data;
      console.log("User details fetched:", userData);

      // Prepare ticket data with necessary employee details
      const ticketData = {
        ...data,
        employeeName: userData.employeeName,
        email: userData.email,
        employeeId: userData.employeeId,
        id: userData._id // Use the user ID from the response
      };
      console.log("Ticket data being sent:", ticketData);

      // Submit ticket
      await axios.post('http://localhost:5000/api/user/ticket', { ticketData });

      setSubmitted(true);
      reset(); // Clear form fields
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
              <label htmlFor="issue" className="form-label">Issue Description</label>
              <input
                id="issue"
                className="form-input"
                placeholder="Briefly describe your issue..."
                {...register('issue')}
              />
              {errors.issue && <p className="error-text">{errors.issue.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="date" className="form-label">Preferred Date</label>
              <input id="date" className="form-input" type="date" {...register('date')} />
              {errors.date && <p className="error-text">{errors.date.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="time" className="form-label">Preferred Time</label>
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
// // ✅ Yup validation schema
// const schema = yup.object().shape({
  
//   issue: yup.string().required('Issue is required'),
//   date: yup.date().required('Date is required').typeError('Invalid date'),
//   time: yup
//     .string()
//     .required('Time is required')
//     .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Invalid time'),
 
// });

// const EmployeePage = () => {
//   const navigate=useNavigate();
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors }
//   } = useForm({ resolver: yupResolver(schema) });

//   const [submitted, setSubmitted] = useState(false);

//   const onSubmit = async (data) => {
//     try {
//       console.log(data)
//       const id=localStorage.getItem('id');
//       data.id=id;
//       console.log(id)
//       const res1=await axios.post("http://localhost:5000/api/general/details",{
//       data
//       }, // Request body
//       {
//         headers: {
//           'Content-Type': 'application/json' // Explicitly set content type
//         }
//       })
//       console.log(res1)
//       data.name=res1.name
//       data.email=res1.email
//       data.employeeId=res1.employeeId
//       const res = await axios.post('http://localhost:5000/api/user/ticket', data);
//       setSubmitted(true);
//       reset();
//     } 
//     catch (error) {
//   console.error('Password update failed:', error);
//   const message = error.response?.data?.message || 'Failed to update password';
//   alert(message);
// }

//   };

//   function userpage()
//   {
//     navigate("/userdetails")
//   }

//   return (
//     <div style={styles.container}>
//       <button style={styles.detailsButton} onClick={userpage} >Employee Details</button>
//       <div style={styles.formContainer}>
//         <h2 style={styles.title}>Submit a Ticket</h2>
//         {submitted ? (
//           <p style={styles.success}>
//             🎉 Ticket submitted successfully! You’ll receive a confirmation email.
//           </p>
//         ) : (
//           <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
//             {/* <input style={styles.input} placeholder="Full Name" {...register('employeeName')} />
//             {errors.employeeName && <p style={styles.error}>{errors.employeeName.message}</p>}

//             <input style={styles.input} placeholder="Employee ID" {...register('employeeId')} />
//             {errors.employeeId && <p style={styles.error}>{errors.employeeId.message}</p>} */}

//             <input style={styles.input} placeholder="Issue" {...register('issue')} />
//             {errors.issue && <p style={styles.error}>{errors.issue.message}</p>}

//             <input style={styles.input} type="date" {...register('date')} />
//             {errors.date && <p style={styles.error}>{errors.date.message}</p>}

//             <input style={styles.input} type="time" {...register('time')} />
//             {errors.time && <p style={styles.error}>{errors.time.message}</p>}

//             {/* <input style={styles.input} placeholder="Email" type="email" {...register('email')} />
//             {errors.email && <p style={styles.error}>{errors.email.message}</p>} */}

//             <button style={styles.submitButton} type="submit">
//               Submit Ticket
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };
