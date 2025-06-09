// // import React, { useState } from 'react';
// // import axios from 'axios';

// // function LoginPage({ setUserRole }) {
// //   const [ename, setEName] = useState('');
// //   const [eid, setEID] = useState('');
// //   const [error, setError] = useState('');

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const res = await axios.post('http://localhost:5000/api/users/login', { ename, eid });
// //       const { role } = res.data;
// //       setUserRole(role);
// //       localStorage.setItem('userRole', role);
// //     } catch (err) {
// //       setError('Invalid credentials');
// //     }
// //   };

// //   return (
// //     <div className="login-container">
// //       <h2>Login</h2>
// //       <form onSubmit={handleSubmit}>
// //         <input type="text" placeholder="Employee Name" value={ename} onChange={(e) => setEName(e.target.value)} required />
// //         <input type="text" placeholder="Employee ID" value={eid} onChange={(e) => setEID(e.target.value)} required />
// //         <button type="submit">Login</button>
// //       </form>
// //       {error && <p>{error}</p>}
// //     </div>
// //   );
// // }

// // export default LoginPage; 

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import useAuth  from '../hooks/login_context_hook'; // Import the AuthContext hook

// const LoginPage = () => {
//   const [eid, setEid] = useState('');
//   const [password, setpassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const { state,dispatch } = useAuth(); // Use the AuthContext hook to get the setUser

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post('http://localhost:5000/api/general/login', {
//         eid,
//         password
//       });
//       if(res.data.token){
//       dispatch({type:"LOGIN",payload:{...res.data}});
//     }
//       navigate(`/${res.data.role}`);

//       if (res.data.role==="IT Support"){
//         navigate("/itsupport");
//       }
//       else if(res.data.role==="Employee"){
//         navigate("/employee");
//       }
//       else if (res.data.role==="Admin")
//       {
//         navigate("/admin");
//       }
       
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Login</h2>
//       <form onSubmit={handleLogin}>
//         <div>
//           <label>Employee ID:</label>
//           <input
//             type="text"
//             value={eid}
//             onChange={(e) => setEid(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Password:</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setpassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Login</button>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//       </form>
//     </div>
//   );
// };

// export default LoginPage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/login_context_hook'; // Import the AuthContext hook
import './login.css'; // Import the CSS file
import { useForm } from 'react-hook-form';
import ForgotPassword from "./forgot"

const LoginPage = () => {
  const [eid, setEid] = useState('');
  const [password, setPassword] = useState(''); // Corrected variable name from 'setpassword'
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useAuth(); // Destructure dispatch from useAuth

  //make sure we cannot press return once login page is returned
   useEffect(() => {
  // Dispatch logout when login page mounts
  dispatch({ type: "LOGOUT" });

  // Prevent going back to authenticated pages using browser back button
  navigate('/', { replace: true });
  window.history.pushState(null, '', window.location.href);
  
  const handlePopState = () => {
    window.history.pushState(null, '', window.location.href);
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}, [dispatch, navigate]);



  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const res = await axios.post('http://localhost:5000/api/vista/login', {
        eid,
        password
      });

      if (res.data.token) {
        dispatch({ type: "LOGIN", payload: { ...res.data } });
      }

      // Consolidate navigation logic
      if (res.data.role === "IT Support") {
        navigate("/itsupport");
      } else if (res.data.role === "Employee") {
        navigate("/employee");
      } else if (res.data.role === "Admin") {
        navigate("/admin");
      } else {
        // Fallback or handle unexpected roles
        console.warn("Unknown role:", res.data.role);
        navigate("/"); // Navigate to home or a default page
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page-container">
  <div className="login-card">
    <h2 className="login-title">Welcome Back!</h2>
    <p className="login-subtitle">Please log in to continue.</p>
    <form onSubmit={handleLogin} className="login-form">
      <div className="form-group">
        <label htmlFor="employeeId" className="form-label">Employee ID</label>
        <input
          id="employeeId"
          type="text"
          value={eid}
          onChange={(e) => setEid(e.target.value)}
          className="form-input"
          placeholder="Your Employee ID"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          placeholder="Your Password"
          required
        />
      </div>
      {/* Forgot Password Link */}
      <div className="forgot-password-container">
        <a 
          href="/forgot-password" 
          className="forgot-password-link"
          onClick={(e) => {
            e.preventDefault();
            // Add your forgot password navigation logic here
            navigate('/forgot');
          }}
        >
          Forgot Password?
        </a>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      <button type="submit" className="login-button">Log In</button>
    </form>
  </div>
</div>
   
  );
};

export default LoginPage;
