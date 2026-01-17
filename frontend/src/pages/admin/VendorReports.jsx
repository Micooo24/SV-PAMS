import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  Search,
  Download,
  FilterList,
  Refresh,
  Business,
  LocationOn,
  Person,
  Store,
  AutoAwesome,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ExpandMore,
  ExpandLess,
  Analytics,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Assessment,
  Warning,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import BASE_URL from "../../common/baseurl";

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  ChartTooltip,
  Legend
);

// AI Analysis Generator Function
const generateAIInsights = (summary, vendors) => {
  if (!summary || !summary.by_vendor_type) return null;

  const insights = {
    vendorTypeAnalysis: [],
    areaAnalysis: [],
    recommendations: [],
    alerts: [],
  };

  const totalVendors = summary.total_vendors || 0;
  const vendorTypes = summary.by_vendor_type || [];
  const areas = summary.by_area || [];
  const cartTypes = summary.by_cart_type || [];

  // Vendor Type Analysis
  if (vendorTypes.length > 0) {
    const topType = vendorTypes[0];
    const topTypePercentage =
      totalVendors > 0 ? ((topType.count / totalVendors) * 100).toFixed(1) : 0;
    insights.vendorTypeAnalysis.push({
      type: "highlight",
      icon: "trending_up",
      text: `"${topType.type}" is the dominant vendor category with ${topType.count} vendors (${topTypePercentage}% of total).`,
    });

    if (vendorTypes.length > 1) {
      const bottomTypes = vendorTypes.filter((v) => v.count <= 2);
      if (bottomTypes.length > 0) {
        insights.vendorTypeAnalysis.push({
          type: "info",
          icon: "info",
          text: `${bottomTypes.length} vendor type(s) have low representation (≤2 vendors each), indicating potential market gaps.`,
        });
      }
    }

    // Diversity score
    const diversityScore = vendorTypes.length;
    if (diversityScore >= 5) {
      insights.vendorTypeAnalysis.push({
        type: "success",
        icon: "check",
        text: `Good vendor diversity with ${diversityScore} different business types serving the community.`,
      });
    } else if (diversityScore < 3) {
      insights.vendorTypeAnalysis.push({
        type: "warning",
        icon: "warning",
        text: `Limited vendor diversity (only ${diversityScore} types). Consider initiatives to attract diverse businesses.`,
      });
    }
  }

  // Area Analysis
  if (areas.length > 0) {
    const topArea = areas[0];
    const bottomArea = areas[areas.length - 1];

    insights.areaAnalysis.push({
      type: "highlight",
      icon: "location",
      text: `"${topArea.area}" is the most active operating area with ${topArea.count} vendor(s).`,
    });

    if (areas.length > 3) {
      const avgVendorsPerArea = (totalVendors / areas.length).toFixed(1);
      insights.areaAnalysis.push({
        type: "info",
        icon: "analytics",
        text: `Average of ${avgVendorsPerArea} vendors per operating area across ${areas.length} locations.`,
      });

      // Find underserved areas
      const underservedAreas = areas.filter((a) => a.count === 1);
      if (underservedAreas.length > 0) {
        insights.areaAnalysis.push({
          type: "warning",
          icon: "warning",
          text: `${underservedAreas.length} area(s) have only 1 vendor - potential underserved locations.`,
        });
      }
    }

    // Area concentration
    const topAreasCount = areas
      .slice(0, 3)
      .reduce((sum, a) => sum + a.count, 0);
    const concentrationPercentage =
      totalVendors > 0 ? ((topAreasCount / totalVendors) * 100).toFixed(1) : 0;
    if (concentrationPercentage > 70) {
      insights.areaAnalysis.push({
        type: "info",
        icon: "info",
        text: `High concentration: Top 3 areas contain ${concentrationPercentage}% of all vendors.`,
      });
    }
  }

  // Recommendations
  if (totalVendors < 10) {
    insights.recommendations.push({
      priority: "high",
      text: "Consider launching vendor recruitment campaigns to increase market participation.",
    });
  }

  if (vendorTypes.length > 0) {
    const foodRelated = vendorTypes.filter(
      (v) =>
        v.type?.toLowerCase().includes("food") ||
        v.type?.toLowerCase().includes("snack") ||
        v.type?.toLowerCase().includes("drink")
    );
    if (foodRelated.length === 0) {
      insights.recommendations.push({
        priority: "medium",
        text: "No food-related vendors detected. Consider attracting food vendors to diversify offerings.",
      });
    }
  }

  if (areas.length > 0 && areas.length < 5) {
    insights.recommendations.push({
      priority: "medium",
      text: "Expand vendor coverage to more areas for better community service distribution.",
    });
  }

  if (cartTypes.length === 1) {
    insights.recommendations.push({
      priority: "low",
      text: "All vendors use the same cart type. Consider supporting diverse vending setups.",
    });
  }

  // Alerts
  if (totalVendors === 0) {
    insights.alerts.push({
      severity: "error",
      text: "No approved vendors in the system. Immediate action required to onboard vendors.",
    });
  }

  return insights;
};

export default function VendorReports({ onLogout }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorTypeFilter, setVendorTypeFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  // Filter options
  const [vendorTypes, setVendorTypes] = useState([]);
  const [operatingAreas, setOperatingAreas] = useState([]);

  // Summary stats
  const [summary, setSummary] = useState(null);

  // AI Insights panel
  const [showInsights, setShowInsights] = useState(true);

  // Generate AI insights based on summary data
  const aiInsights = useMemo(() => {
    return generateAIInsights(summary, vendors);
  }, [summary, vendors]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchVendorReport();
  }, [page, rowsPerPage, vendorTypeFilter, areaFilter]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [typesRes, areasRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/vendor/reports/vendor-types`, {
          headers,
        }),
        axios.get(`${BASE_URL}/api/admin/vendor/reports/operating-areas`, {
          headers,
        }),
      ]);

      setVendorTypes(typesRes.data || []);
      setOperatingAreas(areasRes.data || []);
    } catch (err) {
      console.error("Failed to fetch filter options:", err);
    }
  };

  const fetchVendorReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(vendorTypeFilter && { vendor_type: vendorTypeFilter }),
        ...(areaFilter && { area_of_operation: areaFilter }),
      };

      const response = await axios.get(`${BASE_URL}/api/admin/vendor/reports`, {
        headers,
        params,
      });

      setVendors(response.data.vendors || []);
      setTotal(response.data.total || 0);
      setSummary(response.data.summary || null);
      setError(null);
    } catch (err) {
      setError("Failed to fetch vendor report");
      toast.error("Failed to fetch vendor report");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchVendorReport();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const params = {
        ...(vendorTypeFilter && { vendor_type: vendorTypeFilter }),
        ...(areaFilter && { area_of_operation: areaFilter }),
      };

      const response = await axios.get(
        `${BASE_URL}/api/admin/vendor/reports/export`,
        {
          headers,
          params,
        }
      );

      const exportData = response.data.data;

      // Convert to CSV
      if (exportData && exportData.length > 0) {
        const csvHeaders = Object.keys(exportData[0]).join(",");
        const csvRows = exportData.map((row) =>
          Object.values(row)
            .map((val) =>
              typeof val === "string" && val.includes(",") ? `"${val}"` : val
            )
            .join(",")
        );
        const csvContent = [csvHeaders, ...csvRows].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `vendor_report_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Report exported successfully!");
      } else {
        toast.error("No data to export");
      }
    } catch (err) {
      toast.error("Failed to export report");
      console.error(err);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setVendorTypeFilter("");
    setAreaFilter("");
    setPage(0);
  };

  // Chart colors
  const chartColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6366f1",
  ];

  // Chart data for vendor types
  const vendorTypeChartData = {
    labels: summary?.by_vendor_type?.map((v) => v.type) || [],
    datasets: [
      {
        data: summary?.by_vendor_type?.map((v) => v.count) || [],
        backgroundColor: chartColors,
        borderWidth: 1,
      },
    ],
  };

  // Chart data for operating areas
  const areaChartData = {
    labels: summary?.by_area?.slice(0, 8).map((a) => a.area) || [],
    datasets: [
      {
        label: "Vendors",
        data: summary?.by_area?.slice(0, 8).map((a) => a.count) || [],
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 11 } },
      },
      title: {
        display: true,
        text: "Vendor Type Distribution Analysis",
        font: { size: 14, weight: "bold" },
        color: "#003067",
        padding: { bottom: 10 },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Vendors by Operating Area",
        font: { size: 14, weight: "bold" },
        color: "#003067",
        padding: { bottom: 10 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Vendors",
          font: { size: 11 },
        },
      },
      x: {
        title: {
          display: true,
          text: "Operating Area / Barangay",
          font: { size: 11 },
        },
      },
    },
  };

  // Cart type chart data
  const cartTypeChartData = {
    labels: summary?.by_cart_type?.map((c) => c.type) || [],
    datasets: [
      {
        data: summary?.by_cart_type?.map((c) => c.count) || [],
        backgroundColor: [
          "#8b5cf6",
          "#06b6d4",
          "#f97316",
          "#84cc16",
          "#ec4899",
        ],
        borderWidth: 1,
      },
    ],
  };

  const cartChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 11 } },
      },
      title: {
        display: true,
        text: "Cart Type Distribution",
        font: { size: 14, weight: "bold" },
        color: "#003067",
        padding: { bottom: 10 },
      },
    },
  };

  // Helper function to get insight icon
  const getInsightIcon = (iconType, type) => {
    const color =
      type === "success"
        ? "#10b981"
        : type === "warning"
          ? "#f59e0b"
          : type === "highlight"
            ? "#3b82f6"
            : "#6b7280";
    switch (iconType) {
      case "trending_up":
        return <TrendingUp sx={{ color }} />;
      case "trending_down":
        return <TrendingDown sx={{ color }} />;
      case "warning":
        return <Warning sx={{ color }} />;
      case "check":
        return <CheckCircle sx={{ color }} />;
      case "location":
        return <LocationOn sx={{ color }} />;
      case "analytics":
        return <Analytics sx={{ color }} />;
      default:
        return <Info sx={{ color }} />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#e6eaf0",
      }}
    >
      <Sidebar role="admin" />
      <Box
        sx={{
          flex: 1,
          width: "100%",
          height: "100vh",
          padding: "40px",
          backgroundColor: "#e6eaf0",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 1, fontWeight: 700, color: "#003067" }}
        >
          Vendor Reports
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: "#666" }}>
          Track registered vendors, their types, and designated operating areas
        </Typography>

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Person sx={{ fontSize: 40, color: "#3b82f6", mb: 1 }} />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#003067" }}
                  >
                    {summary.total_vendors}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Registered Vendors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Store sx={{ fontSize: 40, color: "#10b981", mb: 1 }} />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#003067" }}
                  >
                    {summary.by_vendor_type?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vendor Types
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <LocationOn sx={{ fontSize: 40, color: "#f59e0b", mb: 1 }} />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#003067" }}
                  >
                    {summary.by_area?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Operating Areas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Business sx={{ fontSize: 40, color: "#8b5cf6", mb: 1 }} />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#003067" }}
                  >
                    {summary.by_cart_type?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cart Types
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Charts */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                  height: "100%",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <PieChartIcon sx={{ color: "#3b82f6" }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#003067" }}
                  >
                    Vendor Type Distribution
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Breakdown of registered vendors by their business category
                </Typography>
                <Box sx={{ height: 220 }}>
                  {summary.by_vendor_type?.length > 0 ? (
                    <Doughnut
                      data={vendorTypeChartData}
                      options={chartOptions}
                    />
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{ textAlign: "center", pt: 10 }}
                    >
                      No data available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                  height: "100%",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <BarChartIcon sx={{ color: "#10b981" }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#003067" }}
                  >
                    Top Operating Areas
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Geographic distribution of vendor operations by area
                </Typography>
                <Box sx={{ height: 220 }}>
                  {summary.by_area?.length > 0 ? (
                    <Bar data={areaChartData} options={barChartOptions} />
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{ textAlign: "center", pt: 10 }}
                    >
                      No data available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                  height: "100%",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Business sx={{ color: "#8b5cf6" }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#003067" }}
                  >
                    Cart Type Analysis
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Types of vending carts/setups used by vendors
                </Typography>
                <Box sx={{ height: 220 }}>
                  {summary.by_cart_type?.length > 0 ? (
                    <Pie data={cartTypeChartData} options={cartChartOptions} />
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{ textAlign: "center", pt: 10 }}
                    >
                      No data available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* AI Insights Panel */}
        {aiInsights && (
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: "12px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => setShowInsights(!showInsights)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AutoAwesome sx={{ color: "#fff", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#003067" }}
                  >
                    AI-Powered Analysis & Insights
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Intelligent analysis of your vendor data to help inform
                    decisions
                  </Typography>
                </Box>
              </Box>
              <IconButton>
                {showInsights ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={showInsights}>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Vendor Type Insights */}
                {aiInsights.vendorTypeAnalysis?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Store sx={{ color: "#3b82f6" }} />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#003067" }}
                        >
                          Vendor Type Analysis
                        </Typography>
                      </Box>
                      <List dense sx={{ py: 0 }}>
                        {aiInsights.vendorTypeAnalysis.map((insight, idx) => (
                          <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {getInsightIcon(insight.icon, insight.type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={insight.text}
                              primaryTypographyProps={{
                                variant: "body2",
                                color: "text.secondary",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>
                )}

                {/* Area Insights */}
                {aiInsights.areaAnalysis?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <LocationOn sx={{ color: "#f59e0b" }} />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#003067" }}
                        >
                          Operating Area Analysis
                        </Typography>
                      </Box>
                      <List dense sx={{ py: 0 }}>
                        {aiInsights.areaAnalysis.map((insight, idx) => (
                          <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {getInsightIcon(insight.icon, insight.type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={insight.text}
                              primaryTypographyProps={{
                                variant: "body2",
                                color: "text.secondary",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>
                )}

                {/* Recommendations */}
                {aiInsights.recommendations?.length > 0 && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Lightbulb sx={{ color: "#10b981" }} />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#003067" }}
                        >
                          AI Recommendations
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {aiInsights.recommendations.map((rec, idx) => (
                          <Grid item xs={12} md={4} key={idx}>
                            <Box
                              sx={{
                                p: 2,
                                bgcolor:
                                  rec.priority === "high"
                                    ? "#fef2f2"
                                    : rec.priority === "medium"
                                      ? "#fffbeb"
                                      : "#f0fdf4",
                                borderRadius: "8px",
                                borderLeft: `4px solid ${rec.priority === "high" ? "#ef4444" : rec.priority === "medium" ? "#f59e0b" : "#10b981"}`,
                              }}
                            >
                              <Chip
                                label={rec.priority.toUpperCase()}
                                size="small"
                                sx={{
                                  mb: 1,
                                  bgcolor:
                                    rec.priority === "high"
                                      ? "#fee2e2"
                                      : rec.priority === "medium"
                                        ? "#fef3c7"
                                        : "#dcfce7",
                                  color:
                                    rec.priority === "high"
                                      ? "#dc2626"
                                      : rec.priority === "medium"
                                        ? "#d97706"
                                        : "#16a34a",
                                  fontWeight: 600,
                                  fontSize: "0.65rem",
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {rec.text}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>
                )}

                {/* Alerts */}
                {aiInsights.alerts?.length > 0 && (
                  <Grid item xs={12}>
                    {aiInsights.alerts.map((alert, idx) => (
                      <Alert
                        key={idx}
                        severity={alert.severity}
                        sx={{ mb: 1, borderRadius: "8px" }}
                        icon={<Warning />}
                      >
                        {alert.text}
                      </Alert>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </Paper>
        )}

        {/* Filters */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FilterList sx={{ color: "#003067" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#003067" }}>
              Filter & Search
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search vendor or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#999" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Vendor Type</InputLabel>
                <Select
                  value={vendorTypeFilter}
                  label="Vendor Type"
                  onChange={(e) => setVendorTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {vendorTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Operating Area</InputLabel>
                <Select
                  value={areaFilter}
                  label="Operating Area"
                  onChange={(e) => setAreaFilter(e.target.value)}
                >
                  <MenuItem value="">All Areas</MenuItem>
                  {operatingAreas.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    bgcolor: "#003067",
                    "&:hover": { bgcolor: "#002248" },
                    textTransform: "none",
                  }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{
                    borderColor: "#003067",
                    color: "#003067",
                    textTransform: "none",
                  }}
                >
                  Clear
                </Button>
                <Tooltip title="Refresh data">
                  <IconButton
                    onClick={fetchVendorReport}
                    sx={{ color: "#003067" }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExport}
                  sx={{
                    ml: "auto",
                    bgcolor: "#10b981",
                    "&:hover": { bgcolor: "#059669" },
                    textTransform: "none",
                  }}
                >
                  Export CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Vendors Table */}
        <Paper
          sx={{
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                        Vendor Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                        Business Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                        Vendor Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                        Cart Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                        Operating Areas
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                        Contact
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">
                            No vendors found matching your criteria
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendors.map((vendor) => (
                        <TableRow key={vendor.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {vendor.vendor_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {vendor.vendor_email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{vendor.business_name}</TableCell>
                          <TableCell>
                            <Chip
                              label={vendor.vendor_type}
                              size="small"
                              sx={{
                                bgcolor: "#e0f2fe",
                                color: "#0369a1",
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell>{vendor.cart_type}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {(vendor.area_of_operation || [])
                                .slice(0, 2)
                                .map((area, idx) => (
                                  <Chip
                                    key={idx}
                                    label={area}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.7rem" }}
                                  />
                                ))}
                              {(vendor.area_of_operation || []).length > 2 && (
                                <Tooltip
                                  title={(vendor.area_of_operation || [])
                                    .slice(2)
                                    .join(", ")}
                                >
                                  <Chip
                                    label={`+${vendor.area_of_operation.length - 2}`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.7rem",
                                      bgcolor: "#f1f5f9",
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {vendor.vendor_mobile || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={vendor.status}
                              size="small"
                              sx={{
                                bgcolor:
                                  vendor.status === "approved"
                                    ? "#dcfce7"
                                    : "#fef3c7",
                                color:
                                  vendor.status === "approved"
                                    ? "#166534"
                                    : "#92400e",
                                fontWeight: 500,
                                textTransform: "capitalize",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
