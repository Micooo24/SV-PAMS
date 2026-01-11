import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import BASE_URL from "../../common/baseurl";
import Sidebar from "../../components/Sidebar";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const statusLabels = [
  "Pending",
  "Investigating",
  "Located",
  "Permit Processing",
  "Resolved",
  "Ignored"
];

const ReportStats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/vendor-carts/get-all`);
        const records = Array.isArray(res.data) ? res.data : [];
        const statusCounts = {};
        statusLabels.forEach(label => (statusCounts[label] = 0));
        records.forEach(r => {
          const status = r.status || "Pending";
          if (statusCounts[status] !== undefined) statusCounts[status]++;
        });
        setStats({
          total: records.length,
          ...statusCounts
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const barData = {
    labels: statusLabels,
    datasets: [
      {
        label: "Reports",
        data: statusLabels.map(label => stats[label] || 0),
        backgroundColor: [
          "#fbbf24",
          "#60a5fa",
          "#34d399",
          "#f472b6",
          "#818cf8",
          "#f87171"
        ]
      }
    ]
  };

  const pieData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusLabels.map(label => stats[label] || 0),
        backgroundColor: [
          "#fbbf24",
          "#60a5fa",
          "#34d399",
          "#f472b6",
          "#818cf8",
          "#f87171"
        ]
      }
    ]
  };

  return (
    <Box sx={{ 
      display: "flex", 
      width: "100vw", 
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#e6eaf0"
    }}>
      <Sidebar role="admin" />
      <Box sx={{ 
        flex: 1, 
        width: "100%",
        height: "100vh",
        padding: "40px", 
        backgroundColor: "#e6eaf0",
        overflowY: "auto"
      }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "#003067" }}>
          Report Statistics
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Paper sx={{ p: 4, mb: 4, borderRadius: "12px", boxShadow: "0px 6px 12px rgba(0,0,0,0.1)" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#003067" }}>
                Total Reports: {stats.total}
              </Typography>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true }} />
            </Paper>
            <Paper sx={{ p: 4, borderRadius: "12px", boxShadow: "0px 6px 12px rgba(0,0,0,0.1)", maxWidth: "600px" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#003067" }}>
                Status Distribution
              </Typography>
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: true }} />
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ReportStats;