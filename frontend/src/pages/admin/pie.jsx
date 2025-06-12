import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';
import { Typography, Paper, CircularProgress } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
         const token = localStorage.getItem("token");
         console.log(token)
        const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}` // ⬅️ Attach token to request
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
      {stats.map((member) => (
        <Paper key={member.name} elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {member.name}'s Ticket Statistics
          </Typography>
          <SupportMemberPieChart 
            data={[
              { name: 'Closed Tickets', value: member.closed },
              { name: 'Open Tickets', value: member.open }
            ]} 
          />
          <Typography variant="body1">
            Total Tickets: {member.closed + member.open} | 
            Closed: {member.closed} | 
            Open: {member.open}
          </Typography>
        </Paper>
      ))}
    </div>
  );
};

export default TicketStatsPieCharts;