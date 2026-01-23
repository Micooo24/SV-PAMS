import React, { useState, useEffect } from "react";
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
  Button,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  Chip,
  TablePagination,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  CheckCircle,
  Cancel,
  Visibility,
  Email,
  Phone,
  Business,
  Schedule,
  LocalShipping,
  FilterList,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import BASE_URL from "../../common/baseurl";
import Sidebar from "../../components/Sidebar";

const VendorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal states
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalImage, setModalImage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [statusFilter, page, rowsPerPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const statusParam =
        statusFilter !== "all" ? `&status=${statusFilter}` : "";

      const response = await axios.get(
        `${BASE_URL}/api/admin/vendor/applications?skip=${page * rowsPerPage}&limit=${rowsPerPage}${statusParam}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setApplications(response.data.applications || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError("Failed to fetch applications");
      toast.error("Failed to load vendor applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/vendor/applications?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          `${BASE_URL}/api/admin/vendor/applications?status=pending&limit=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get(
          `${BASE_URL}/api/admin/vendor/applications?status=approved&limit=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get(
          `${BASE_URL}/api/admin/vendor/applications?status=rejected&limit=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ]);

      setStats({
        total: allRes.data.total || 0,
        pending: pendingRes.data.total || 0,
        approved: approvedRes.data.total || 0,
        rejected: rejectedRes.data.total || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleApprove = async (appId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/admin/vendor/applications/${appId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Application approved successfully!");
      fetchApplications();
      fetchStats();
      setOpenDetailModal(false);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Failed to approve application",
      );
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/admin/vendor/applications/${selectedApp.id}/reject`,
        { rejection_reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Application rejected");
      setOpenRejectModal(false);
      setRejectionReason("");
      fetchApplications();
      fetchStats();
      setOpenDetailModal(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reject application");
    }
  };

  const openDetails = (app) => {
    setSelectedApp(app);
    setOpenDetailModal(true);
  };

  const openRejectDialog = (app) => {
    setSelectedApp(app);
    setOpenRejectModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      case "pending_review":
        return "info";
      default:
        return "default";
    }
  };

  const getCompletenessColor = (percentage) => {
    if (percentage >= 90) return "#22c55e";
    if (percentage >= 70) return "#f59e0b";
    if (percentage >= 50) return "#f97316";
    return "#ef4444";
  };

  const filteredApplications = applications;

  const styles = {
    container: {
      display: "flex",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#e6eaf0",
    },
    main: {
      flex: 1,
      width: "100%",
      height: "100vh",
      padding: "40px",
      backgroundColor: "#e6eaf0",
      overflowY: "auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "32px",
      fontWeight: 700,
      color: "#003067",
    },
    contentCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
    },
    modalContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      maxWidth: "900px",
      maxHeight: "90vh",
      bgcolor: "background.paper",
      boxShadow: 24,
      borderRadius: "12px",
      overflow: "auto",
    },
  };

  return (
    <Box sx={styles.container}>
      <Sidebar role="admin" />
      <main style={styles.main}>
        <div style={styles.header}>
          <Typography variant="h4" sx={styles.title}>
            Vendor Applications
          </Typography>
        </div>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                cursor: "pointer",
                border: statusFilter === "all" ? "2px solid #2563eb" : "none",
              }}
              onClick={() => setStatusFilter("all")}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                cursor: "pointer",
                border:
                  statusFilter === "pending" ? "2px solid #f59e0b" : "none",
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              }}
              onClick={() => setStatusFilter("pending")}
            >
              <CardContent>
                <Typography variant="h6">Pending</Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#92400e" }}
                >
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                cursor: "pointer",
                border:
                  statusFilter === "approved" ? "2px solid #22c55e" : "none",
                background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
              }}
              onClick={() => setStatusFilter("approved")}
            >
              <CardContent>
                <Typography variant="h6">Approved</Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#166534" }}
                >
                  {stats.approved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                cursor: "pointer",
                border:
                  statusFilter === "rejected" ? "2px solid #ef4444" : "none",
                background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              }}
              onClick={() => setStatusFilter("rejected")}
            >
              <CardContent>
                <Typography variant="h6">Rejected</Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#991b1b" }}
                >
                  {stats.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <div style={styles.contentCard}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Vendor Info
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Business Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Completeness
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            No applications found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Avatar
                                src={app.vendor_photo_url}
                                sx={{ width: 40, height: 40 }}
                              >
                                {app.vendor_firstname?.[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {app.vendor_firstname} {app.vendor_lastname}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {app.vendor_email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {app.business_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {app.goods_type}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {app.cart_type}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={app.completeness_percentage || 0}
                                sx={{
                                  width: 60,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: "#e0e0e0",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: getCompletenessColor(
                                      app.completeness_percentage,
                                    ),
                                  },
                                }}
                              />
                              <Typography variant="body2" fontWeight={600}>
                                {app.completeness_percentage || 0}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={app.status?.toUpperCase()}
                              color={getStatusColor(app.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(app.submitted_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => openDetails(app)}
                              >
                                View
                              </Button>
                              {app.status === "pending" && (
                                <>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleApprove(app.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={() => openRejectDialog(app)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </Box>
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
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </div>

        {/* Detail Modal */}
        <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)}>
          <Box sx={styles.modalContainer}>
            {selectedApp && (
              <Box sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    Application Details
                  </Typography>
                  <IconButton onClick={() => setOpenDetailModal(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={3}>
                  {/* Vendor Info */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          👤 Vendor Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Avatar
                            src={selectedApp.vendor_photo_url}
                            sx={{ width: 60, height: 60 }}
                          />
                          <Box>
                            <Typography variant="h6">
                              {selectedApp.vendor_firstname}{" "}
                              {selectedApp.vendor_lastname}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedApp.vendor_email}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Phone fontSize="small" />
                          <Typography>
                            {selectedApp.vendor_mobile_no}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Email fontSize="small" />
                          <Typography>{selectedApp.vendor_barangay}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Business Info */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          🏪 Business Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          {selectedApp.business_logo_url && (
                            <Avatar
                              src={selectedApp.business_logo_url}
                              variant="rounded"
                              sx={{ width: 60, height: 60 }}
                            />
                          )}
                          <Box>
                            <Typography variant="h6">
                              {selectedApp.business_name}
                            </Typography>
                            <Chip label={selectedApp.goods_type} size="small" />
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Cart Type:</strong> {selectedApp.cart_type}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Operating Hours:</strong>{" "}
                          {selectedApp.operating_hours}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Years in Operation:</strong>{" "}
                          {selectedApp.years_in_operation || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Delivery:</strong>{" "}
                          {selectedApp.delivery_capability
                            ? "✅ Available"
                            : "❌ Not Available"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Completeness & Status */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              Application Status
                            </Typography>
                            <Chip
                              label={selectedApp.status?.toUpperCase()}
                              color={getStatusColor(selectedApp.status)}
                              sx={{ mr: 2 }}
                            />
                            <Typography variant="body2" component="span">
                              Submitted:{" "}
                              {new Date(
                                selectedApp.submitted_at,
                              ).toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="h4"
                              fontWeight={700}
                              color={getCompletenessColor(
                                selectedApp.completeness_percentage,
                              )}
                            >
                              {selectedApp.completeness_percentage}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Completeness
                            </Typography>
                            {selectedApp.completeness_percentage >= 90 ? (
                              <Chip
                                label="✅ Ready for Activation"
                                color="success"
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            ) : (
                              <Chip
                                label="⚠️ Incomplete"
                                color="warning"
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Images */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          📸 Uploaded Images
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          {selectedApp.business_logo_url && (
                            <Grid item xs={4}>
                              <Typography variant="caption">
                                Business Logo
                              </Typography>
                              <img
                                src={selectedApp.business_logo_url}
                                alt="Business Logo"
                                style={{
                                  width: "100%",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setModalImage(selectedApp.business_logo_url);
                                  setOpenImageModal(true);
                                }}
                              />
                            </Grid>
                          )}
                          {selectedApp.cart_image_url && (
                            <Grid item xs={4}>
                              <Typography variant="caption">
                                Cart Image
                              </Typography>
                              <img
                                src={selectedApp.cart_image_url}
                                alt="Cart"
                                style={{
                                  width: "100%",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setModalImage(selectedApp.cart_image_url);
                                  setOpenImageModal(true);
                                }}
                              />
                            </Grid>
                          )}
                          {selectedApp.vendor_photo_url && (
                            <Grid item xs={4}>
                              <Typography variant="caption">
                                Vendor Photo
                              </Typography>
                              <img
                                src={selectedApp.vendor_photo_url}
                                alt="Vendor"
                                style={{
                                  width: "100%",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setModalImage(selectedApp.vendor_photo_url);
                                  setOpenImageModal(true);
                                }}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Products */}
                  {selectedApp.products && selectedApp.products.length > 0 && (
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            🛒 Products ({selectedApp.products.length})
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Grid container spacing={1}>
                            {selectedApp.products.map((product, i) => (
                              <Grid item xs={4} key={i}>
                                <Chip
                                  label={`${product.name} - ₱${product.price}`}
                                  variant="outlined"
                                  sx={{ width: "100%" }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>

                {/* Action Buttons */}
                {selectedApp.status === "pending" && (
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => openRejectDialog(selectedApp)}
                    >
                      Reject Application
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApprove(selectedApp.id)}
                    >
                      Approve Application
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Modal>

        {/* Reject Dialog */}
        <Dialog
          open={openRejectModal}
          onClose={() => setOpenRejectModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reject Application</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Please provide a reason for rejecting this application. The vendor
              will be notified.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Incomplete documents, Invalid business information..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRejectModal(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image Modal */}
        <Modal open={openImageModal} onClose={() => setOpenImageModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <IconButton
              sx={{ position: "absolute", top: -40, right: 0, color: "#fff" }}
              onClick={() => setOpenImageModal(false)}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={modalImage}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 8 }}
            />
          </Box>
        </Modal>
      </main>
    </Box>
  );
};

export default VendorApplications;
