import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';
import { Typography, Paper, CircularProgress } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
//           label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
        const response = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
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
    return <CircularProgress />;
  }

  return (
    <div>
      {stats.map((member) => {
        const chartData = [
          { name: 'Closed Tickets', value: member.Closed || 0 },
          { name: 'Open Tickets', value: member.Open || 0 },
          { name: 'In Progress Tickets', value: member.InProgress || 0 }
        ];

        return (
          <Paper key={member.name} elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {member.name}'s Ticket Statistics
            </Typography>
            <div style={{ width: '100%', height: 300 }}>
              <SupportMemberPieChart data={chartData} />
            </div>
            <Typography variant="body1">
              Total Tickets: {(member.Closed || 0) + (member.Open || 0) + (member.InProgress || 0)} |{' '}
              Closed: {member.Closed || 0} |{' '}
              Open: {member.Open || 0} |{' '}
              In Progress: {member.InProgress || 0}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Avg Turn-Around Time (Closed): {member.avgTurnAroundTime} hrs
            </Typography>
          </Paper>
        );
      })}
    </div>
  );
};

export default TicketStatsPieCharts;

