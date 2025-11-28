// import React, { useEffect, useState } from 'react';
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
// import axios from 'axios';
// import { Typography, Paper, CircularProgress } from '@mui/material';

// const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// const SupportMemberPieChart = ({ data }) => {
//   return (
//     <ResponsiveContainer width="100%" height={300}>
//       <PieChart>
//         <Pie
//           data={data}
//           cx="50%"
//           cy="50%"
//           labelLine={false}
//           outerRadius={80}
//           fill="#8884d8"
//           dataKey="value"
//           nameKey="name"
//           label={({ name, percent, value }) => 
//             value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null
//           }
//         >
//           {data.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip />
//         <Legend />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// };

// const TicketStatsPieCharts = () => {
//   const [stats, setStats] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/admin/stats', {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`
//           }
//         });

//         setStats(response.data);
//       } catch (error) {
//         console.error('Error fetching stats:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, []);

//   if (loading) {
//     return <CircularProgress />;
//   }

//   return (
//     <div>
//       {stats.map((member) => {
//         const chartData = [
//           { name: 'Closed Tickets', value: member.Closed || 0 },
//           { name: 'Open Tickets', value: member.Open || 0 },
//           { name: 'In Progress Tickets', value: member.InProgress || 0 }
//         ];
        
        

//         return (
//           <Paper key={member.name} elevation={3} sx={{ p: 3, mb: 3 }}>
           
//             <Typography variant="h6" gutterBottom>
//               {member.name}'s Ticket Statistics
//             </Typography>
//             <div style={{ width: '100%', height: 300 }}>
//               <SupportMemberPieChart data={chartData} />
//             </div>
//             <Typography variant="body1">
//               Total Tickets: {(member.Closed || 0) + (member.Open || 0) + (member.InProgress || 0)} |{' '}
//               Closed: {member.Closed || 0} |{' '}
//               Open: {member.Open || 0} |{' '}
//               In Progress: {member.InProgress || 0}
              
//             </Typography>
//             <Typography variant="body1" sx={{ mt: 1 }}>
//               Avg Turn-Around Time (Closed): {member.avgTurnAroundTime} hrs
//             </Typography>
//           </Paper>
//         );
//       })}
//     </div>
//   );
// };

// export default TicketStatsPieCharts;



import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';
import { Typography, Paper, CircularProgress } from '@mui/material';
import './pie.css';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const SupportMemberPieChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent, value }) =>
            value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const TicketStatsPieCharts = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <CircularProgress size={50} />
        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-base)' }}>
          Loading statistics...
        </p>
      </div>
    );
  }

  return (
    <div className="stats-wrapper">
      <div className="stats-container">
        {stats.map((member) => {
        const chartData = [
          { name: 'Closed Tickets', value: member.Closed || 0 },
          { name: 'Open Tickets', value: member.Open || 0 },
          { name: 'In Progress Tickets', value: member.InProgress || 0 }
        ];

        return (
          <div key={member.name} className="stats-card">
            <h3 className="stats-title">{member.name}'s Statistics</h3>

            <div className="stats-chart-container">
              <SupportMemberPieChart data={chartData} />
            </div>

            <div className="stats-info">
              <div className="stats-info-item">
                <div className="stats-info-label">Total</div>
                <div className="stats-info-value">
                  {(member.Closed || 0) + (member.Open || 0) + (member.InProgress || 0)}
                </div>
              </div>
              <div className="stats-info-item">
                <div className="stats-info-label">Closed</div>
                <div className="stats-info-value" style={{ color: '#10b981' }}>
                  {member.Closed || 0}
                </div>
              </div>
              <div className="stats-info-item">
                <div className="stats-info-label">Open</div>
                <div className="stats-info-value" style={{ color: '#f59e0b' }}>
                  {member.Open || 0}
                </div>
              </div>
              <div className="stats-info-item">
                <div className="stats-info-label">In Progress</div>
                <div className="stats-info-value" style={{ color: '#3b82f6' }}>
                  {member.InProgress || 0}
                </div>
              </div>
            </div>

            <div className="stats-metric">
              ⏱️ Avg Turn-Around Time: <strong>{member.avgTurnAroundTime || 0} hrs</strong>
            </div>

            <div className="stats-metric out-of-time">
              ⚠️ Out of Time Resolutions: <strong>{member.outOfTimeCount || 0}</strong>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default TicketStatsPieCharts;
