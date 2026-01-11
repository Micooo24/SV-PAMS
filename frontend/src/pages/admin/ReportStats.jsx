
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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="admin" />
      <main style={{ flex: 1, padding: 40, background: "#f9f9f9" }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "#003067" }}>
          Report Statistics
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Paper sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Total Reports: {stats.total}
              </Typography>
              <Bar data={barData} />
            </Paper>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Status Distribution
              </Typography>
              <Pie data={pieData} />
            </Paper>
          </>
        )}
      </main>
    </Box>
  );
};

export default ReportStats;
