
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import EmployeePage from './pages/user/EmployeePage.jsx';
import ITSupportPage from './pages/itsupport/ITSupportPage.jsx';
import useAuth from './hooks/login_context_hook.js'; // adjust path if needed
import Detail from "./pages/user/detail"
import AdminPage from './pages/admin/AdminPage.jsx';
import EmployeeRegistrationForm from './pages/admin/addusers.jsx';
import ForgotPassword from './pages/forgot.jsx';
import {ProtectedRoute} from "./protected/pro";
import{} from "./pages/forgot.jsx"

function App() {
  const { dispatch } = useAuth();

  useEffect(() => {
    const handleUnload = () => {
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, [dispatch]);
 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/employee" element={<ProtectedRoute allowedRoles={["Employee"]}>
              <EmployeePage />
            </ProtectedRoute>} />
        <Route path="/itsupport" element={<ProtectedRoute allowedRoles={["IT Support"]}>
              <ITSupportPage />
            </ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin"]}>
              <AdminPage />
            </ProtectedRoute>} />
        {/* <Route path="/superuser" element={<SuperuserPage />} /> */}
        <Route path="/userdetails" element={< Detail/>} />
        <Route path="/changepassword" element={< ForgotPassword/>} />
        <Route path="/forgot" element={< ForgotPassword/>} />
        {/* <Route path="/e" element={< EmployeeRegistrationForm/>} /> */}

         
      </Routes>
    </BrowserRouter>
  );
}

export default App;


// import React from 'react'
// import LoginPage from './pages/LoginPage.jsx'

// function App() {
//   return (
//     <h1>Welcome to IT Ticketing System</h1>
//   )
// }

// export default App

// src/App.jsx
// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/LoginPage.jsx';
// import EmployeePage from './pages/EmployeePage.jsx';
// import ITSupportPage from './pages/ITSupportPage.jsx';
// import AdminPage from './pages/AdminPage.jsx';
// import SuperuserPage from './pages/SuperuserPage.jsx';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/employee" element={<EmployeePage />} />
//         <Route path="/itsupport" element={<ITSupportPage />} />
//         <Route path="/admin" element={<AdminPage />} />
//         <Route path="/superuser" element={<SuperuserPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
