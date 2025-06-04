// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// import { BrowserRouter } from 'react-router-dom';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import App from './App.jsx';
// import LoginPage from './pages/LoginPage.jsx';
// import EmployeePage from './pages/EmployeePage.jsx';
// import ITSupportPage from './pages/ITSupportPage.jsx';
// import AdminPage from './pages/AdminPage.jsx';
// import SuperuserPage from './pages/SuperuserPage.jsx';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<LoginPage />} />
//       <Route path="/employee" element={<EmployeePage />} />
//       <Route path="/itsupport" element={<ITSupportPage />} />
//       <Route path="/admin" element={<AdminPage />} />
//       <Route path="/superuser" element={<SuperuserPage />} />
//     </Routes>
//   </BrowserRouter>
// );

// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/login_context';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
