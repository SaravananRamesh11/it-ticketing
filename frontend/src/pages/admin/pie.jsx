import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import axios from 'axios';
import {
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';

// Color palette for different ticket statuses
const COLORS = ['#FF9800', '#2196F3', '#4CAF50']; // Open, In Progress, Closed

// Pie chart component for a support member
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
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Main component to fetch and display stats
const TicketStatsPieCharts = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/admin/stats',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

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
      {stats.map((member) => (
        <Paper key={member.name} elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {member.name}'s Ticket Statistics
          </Typography>

          <SupportMemberPieChart
            data={[
              { name: 'Open', value: member.Open || 0 },
              { name: 'In Progress', value: member.InProgress || 0 },
              { name: 'Closed', value: member.Closed || 0 }
            ]}
          />

          <Typography variant="body1" sx={{ mt: 2 }}>
            Total Tickets: <strong>{member.total || 0}</strong> |&nbsp;
            Open: <strong>{member.Open || 0}</strong> |&nbsp;
            In Progress: <strong>{member.InProgress || 0}</strong> |&nbsp;
            Closed: <strong>{member.Closed || 0}</strong>
          </Typography>
        </Paper>
      ))}
    </div>
  );
};

export default TicketStatsPieCharts;
