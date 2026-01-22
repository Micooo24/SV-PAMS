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
  Select,
  MenuItem,
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
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Sort,
  Add,
  Edit,
  Delete,
  Settings,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import BASE_URL from "../../common/baseurl";
import Sidebar from "../../components/Sidebar";

const statusOptions = [
  "Pending",
  "Investigating",
  "Located",
  "Permit Processing",
  "Resolved",
  "Ignored",
];

const VendorCartMonitoring = () => {
  const [scanRecords, setScanRecords] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [addressMap, setAddressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [geofencingEnabled, setGeofencingEnabled] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Slot Configuration State
  const [slotConfig, setSlotConfig] = useState({
    max_slots: 100,
    reserved_slots: 10,
    area_slots: { Market: 50, School: 30, Streets: 40, Mall: 20 },
    is_accepting_applications: true,
  });
  const [slotAvailability, setSlotAvailability] = useState(null);
  const [slotStats, setSlotStats] = useState(null);

  // CRUD Modal State
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);

  // Form State for Create/Edit
  const [cartForm, setCartForm] = useState({
    user_id: "",
    cart_registry_no: "",
    sanitary_email: "",
    is_pasig_cart: false,
    classification: "",
    confidence: 0,
    status: "Pending",
    notes: "",
  });

  useEffect(() => {
    async function fetchGeofencingState() {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/admin/vendor-carts/geofencing-state`,
        );
        setGeofencingEnabled(!!res.data.enabled);
      } catch (err) {
        // fallback: default true
      }
    }
    fetchGeofencingState();
    fetchSlotData();
  }, []);

  // Fetch Slot Configuration and Availability
  const fetchSlotData = async () => {
    try {
      const [configRes, availRes, statsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/vendor-carts/slots/config`),
        axios.get(`${BASE_URL}/api/admin/vendor-carts/slots/availability`),
        axios.get(`${BASE_URL}/api/admin/vendor-carts/stats`),
      ]);
      setSlotConfig(configRes.data);
      setSlotAvailability(availRes.data);
      setSlotStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch slot data:", err);
    }
  };

  const handleToggleGeofencing = async () => {
    const newState = !geofencingEnabled;
    const togglePromise = axios.post(
      `${BASE_URL}/api/admin/vendor-carts/set-geofencing-state`,
      { enabled: newState },
    );

    toast.promise(togglePromise, {
      loading: `${newState ? "Enabling" : "Disabling"} geofencing...`,
      success: `Geofencing ${newState ? "enabled" : "disabled"} successfully`,
      error: "Failed to update geofencing state",
    });

    try {
      await togglePromise;
      setGeofencingEnabled(newState);
    } catch (err) {
      console.error(err);
    }
  };

  // ==================== CRUD HANDLERS ====================

  const handleCreateCart = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/vendor-carts/create`,
        cartForm,
      );
      toast.success("Cart record created successfully");
      setOpenCreateModal(false);
      resetCartForm();
      // Refresh data
      const response = await axios.get(
        `${BASE_URL}/api/admin/vendor-carts/get-all`,
      );
      setScanRecords(Array.isArray(response.data) ? response.data : []);
      fetchSlotData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create cart record");
    }
  };

  const handleEditCart = async () => {
    if (!selectedCart) return;
    try {
      await axios.put(
        `${BASE_URL}/api/admin/vendor-carts/${selectedCart._id}`,
        cartForm,
      );
      toast.success("Cart record updated successfully");
      setOpenEditModal(false);
      setSelectedCart(null);
      resetCartForm();
      // Refresh data
      const response = await axios.get(
        `${BASE_URL}/api/admin/vendor-carts/get-all`,
      );
      setScanRecords(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update cart record");
    }
  };

  const handleDeleteCart = async () => {
    if (!selectedCart) return;
    try {
      await axios.delete(
        `${BASE_URL}/api/admin/vendor-carts/${selectedCart._id}`,
      );
      toast.success("Cart record deleted successfully");
      setOpenDeleteModal(false);
      setSelectedCart(null);
      // Refresh data
      const response = await axios.get(
        `${BASE_URL}/api/admin/vendor-carts/get-all`,
      );
      setScanRecords(Array.isArray(response.data) ? response.data : []);
      fetchSlotData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete cart record");
    }
  };

  const handleSaveSlotConfig = async () => {
    try {
      await axios.put(
        `${BASE_URL}/api/admin/vendor-carts/slots/config`,
        slotConfig,
      );
      toast.success("Slot configuration saved successfully");
      setOpenConfigModal(false);
      fetchSlotData();
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Failed to save slot configuration",
      );
    }
  };

  const openEditDialog = (cart) => {
    setSelectedCart(cart);
    setCartForm({
      user_id: cart.user_id || "",
      cart_registry_no: cart.cart_registry_no || "",
      sanitary_email: cart.sanitary_email || "",
      is_pasig_cart: cart.is_pasig_cart || false,
      classification: cart.classification || "",
      confidence: cart.confidence || 0,
      status: cart.status || "Pending",
      notes: cart.notes || "",
    });
    setOpenEditModal(true);
  };

  const openDeleteDialog = (cart) => {
    setSelectedCart(cart);
    setOpenDeleteModal(true);
  };

  const resetCartForm = () => {
    setCartForm({
      user_id: "",
      cart_registry_no: "",
      sanitary_email: "",
      is_pasig_cart: false,
      classification: "",
      confidence: 0,
      status: "Pending",
      notes: "",
    });
  };

  useEffect(() => {
    const fetchScanRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BASE_URL}/api/admin/vendor-carts/get-all`,
        );
        const records = Array.isArray(response.data) ? response.data : [];

        // ✅ Sort by created_at descending (newest first)
        const sortedRecords = records.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        setScanRecords(sortedRecords);

        if (records.length > 0) {
          toast.success(`Loaded ${records.length} scan records`);
        }

        const userIds = [...new Set(records.map((r) => r.user_id))];
        const userMapTemp = {};
        await Promise.all(
          userIds.map(async (uid) => {
            try {
              const res = await axios.get(`${BASE_URL}/api/admin/users/${uid}`);
              userMapTemp[uid] = res.data;
            } catch {}
          }),
        );
        setUserMap(userMapTemp);

        const addressMapTemp = {};
        await Promise.all(
          records.map(async (r) => {
            if (r.location && r.location.latitude && r.location.longitude) {
              const key = `${r.location.latitude},${r.location.longitude}`;
              if (!addressMapTemp[key]) {
                try {
                  const res = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${r.location.latitude},${r.location.longitude}&key=AIzaSyClm4V0Td6kLL-T0HJVrZobRltjiIeAUh0`,
                  );
                  addressMapTemp[key] =
                    res.data.results?.[0]?.formatted_address ||
                    "Unknown location";
                } catch {
                  addressMapTemp[key] = "Unknown location";
                }
              }
            }
          }),
        );
        setAddressMap(addressMapTemp);
      } catch (err) {
        setError("Failed to fetch scan records.");
        toast.error("Failed to load scan records");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScanRecords();
  }, []);

  // ✅ NEW: Handle sort by date
  const handleSortByDate = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);

    const sorted = [...scanRecords].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return newOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setScanRecords(sorted);
    setPage(0);

    toast.success(
      `Sorted by ${newOrder === "desc" ? "newest" : "oldest"} first`,
      {
        duration: 2000,
      },
    );
  };

  const handleOpenModal = (imageUrl) => {
    setModalImage(imageUrl);
    setOpenModal(true);
    toast.success("Opening image preview", { duration: 2000 });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalImage("");
  };

  const handleStatusUpdate = async (recordId, newStatus) => {
    const updatePromise = axios.put(
      `${BASE_URL}/api/admin/vendor-carts/update-status/${recordId}`,
      { status: newStatus },
    );

    toast.promise(updatePromise, {
      loading: "Updating status...",
      success: `Status updated to ${newStatus}`,
      error: "Failed to update status",
    });

    try {
      await updatePromise;
      setScanRecords((prev) =>
        prev.map((r) => (r._id === recordId ? { ...r, status: newStatus } : r)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated records
  const paginatedRecords = scanRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

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
      marginBottom: "40px",
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
    modalImage: {
      width: "100%",
      borderRadius: "8px",
      maxHeight: "80vh",
      objectFit: "contain",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    modalContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "50%",
      bgcolor: "background.paper",
      boxShadow: 24,
      borderRadius: "12px",
      p: 4,
    },
  };

  return (
    <Box sx={styles.container}>
      <Sidebar role="admin" />
      <main style={styles.main}>
        <div style={styles.header}>
          <Typography variant="h4" sx={styles.title}>
            Vendor Cart Monitoring
          </Typography>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setOpenConfigModal(true)}
              sx={{ mr: 2 }}
            >
              Slot Config
            </Button>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Geofencing:
            </Typography>
            <Button
              variant={geofencingEnabled ? "contained" : "outlined"}
              color={geofencingEnabled ? "success" : "error"}
              onClick={handleToggleGeofencing}
              style={{ minWidth: 80 }}
            >
              {geofencingEnabled ? "ON" : "OFF"}
            </Button>
            <Typography variant="caption" sx={{ ml: 2, color: "#888" }}>
              (Geofencing Status)
            </Typography>
          </div>
        </div>

        {/* Slot Availability Cards */}
        {slotAvailability && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Total Slots</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {slotAvailability.total_slots}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "#fff",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Used Slots</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {slotAvailability.used_slots}
                  </Typography>
                  <Typography variant="caption">
                    ({slotAvailability.approved_vendors} approved,{" "}
                    {slotAvailability.pending_applications} pending)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  color: "#fff",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Available Slots</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {slotAvailability.available_slots}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background: slotAvailability.is_accepting
                    ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                    : "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
                  color: "#fff",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Accepting Applications</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {slotAvailability.is_accepting ? "YES" : "NO"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs for Cart Records and Stats */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Cart Records" />
          <Tab label="Statistics" />
          <Tab label="Area Availability" />
        </Tabs>

        <div style={styles.contentCard}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {activeTab === 0 && (
            <>
              {/* Action Buttons */}
              <Box
                sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    resetCartForm();
                    setOpenCreateModal(true);
                  }}
                  sx={{ backgroundColor: "#118df0" }}
                >
                  Add Cart Record
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  onClick={handleSortByDate}
                  sx={{
                    textTransform: "none",
                    borderColor: "#118df0",
                    color: "#118df0",
                    "&:hover": {
                      borderColor: "#0d6ebd",
                      backgroundColor: "#f0f8ff",
                    },
                  }}
                >
                  Sort by Date (
                  {sortOrder === "desc" ? "Oldest First" : "Newest First"})
                </Button>
              </Box>

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
                            Report ID
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            User Info
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Cart Registry
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Pasig Cart
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Scan Timestamp
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Images</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Classification
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedRecords.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              align="center"
                              sx={{ py: 3 }}
                            >
                              <Typography color="text.secondary">
                                No scan records found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedRecords.map((record) => (
                            <TableRow key={record._id} hover>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                                >
                                  {record._id?.substring(0, 8)}...
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {userMap[record.user_id] ? (
                                  <>
                                    <Typography variant="body2">
                                      {userMap[record.user_id].firstname}{" "}
                                      {userMap[record.user_id].lastname}
                                    </Typography>
                                    <Typography variant="caption">
                                      {userMap[record.user_id].email}
                                    </Typography>
                                  </>
                                ) : (
                                  <Typography variant="caption">
                                    {record.user_id?.substring(0, 8)}...
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {record.cart_registry_no || "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={record.is_pasig_cart ? "Yes" : "No"}
                                  color={
                                    record.is_pasig_cart ? "success" : "default"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(record.created_at).toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={record.status || "Pending"}
                                  size="small"
                                  onChange={(e) =>
                                    handleStatusUpdate(
                                      record._id,
                                      e.target.value,
                                    )
                                  }
                                  sx={{ minWidth: 120 }}
                                >
                                  {statusOptions.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                      {opt}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  {record.original_image_url && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() =>
                                        handleOpenModal(
                                          record.original_image_url,
                                        )
                                      }
                                    >
                                      Original
                                    </Button>
                                  )}
                                  {record.postprocessed_image_url && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() =>
                                        handleOpenModal(
                                          record.postprocessed_image_url,
                                        )
                                      }
                                    >
                                      Processed
                                    </Button>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {record.classification || "N/A"}
                                </Typography>
                                <Typography variant="caption">
                                  {record.confidence
                                    ? `${parseFloat(record.confidence).toFixed(1)}%`
                                    : ""}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => openEditDialog(record)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => openDeleteDialog(record)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
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
                    count={scanRecords.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    sx={{
                      mt: 2,
                      ".MuiTablePagination-toolbar": {
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        padding: "8px 16px",
                      },
                    }}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 1 && slotStats && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cart Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Carts
                      </Typography>
                      <Typography variant="h4">{slotStats.total}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Pasig Carts
                      </Typography>
                      <Typography variant="h4">
                        {slotStats.pasig_carts}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        With Registry #
                      </Typography>
                      <Typography variant="h4">
                        {slotStats.with_registry_number}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Complete Info
                      </Typography>
                      <Typography variant="h4">
                        {slotStats.with_required_info}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Status Breakdown
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(slotStats.status_breakdown || {}).map(
                  ([status, count]) => (
                    <Grid item xs={6} md={2} key={status}>
                      <Card>
                        <CardContent>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            {status}
                          </Typography>
                          <Typography variant="h5">{count}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ),
                )}
              </Grid>
            </Box>
          )}

          {activeTab === 2 && slotAvailability && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Area Slot Availability
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(slotAvailability.area_availability || {}).map(
                  ([area, data]) => (
                    <Grid item xs={12} md={3} key={area}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{area}</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 1,
                            }}
                          >
                            <Typography variant="body2">Total:</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {data.total}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">Used:</Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="error.main"
                            >
                              {data.used}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">Available:</Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="success.main"
                            >
                              {data.available}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              mt: 2,
                              height: 8,
                              backgroundColor: "#e0e0e0",
                              borderRadius: 4,
                            }}
                          >
                            <Box
                              sx={{
                                height: "100%",
                                width: `${(data.used / data.total) * 100}%`,
                                backgroundColor:
                                  data.available > 0 ? "#4caf50" : "#f44336",
                                borderRadius: 4,
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ),
                )}
              </Grid>
            </Box>
          )}
        </div>

        {/* Create Cart Modal */}
        <Dialog
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Cart Record</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="User ID"
                  value={cartForm.user_id}
                  onChange={(e) =>
                    setCartForm({ ...cartForm, user_id: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Cart Registry No."
                  value={cartForm.cart_registry_no}
                  onChange={(e) =>
                    setCartForm({
                      ...cartForm,
                      cart_registry_no: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Sanitary Email"
                  value={cartForm.sanitary_email}
                  onChange={(e) =>
                    setCartForm({ ...cartForm, sanitary_email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cartForm.is_pasig_cart}
                      onChange={(e) =>
                        setCartForm({
                          ...cartForm,
                          is_pasig_cart: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Is Pasig Cart"
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  fullWidth
                  value={cartForm.status}
                  onChange={(e) =>
                    setCartForm({ ...cartForm, status: e.target.value })
                  }
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={cartForm.notes}
                  onChange={(e) =>
                    setCartForm({ ...cartForm, notes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateCart}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Cart Modal */}
        <Dialog
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Cart Record</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Cart Registry No."
                  value={cartForm.cart_registry_no}
                  onChange={(e) =>
                    setCartForm({
                      ...cartForm,
                      cart_registry_no: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Sanitary Email"
                  value={cartForm.sanitary_email}
                  onChange={(e) =>
                    setCartForm({ ...cartForm, sanitary_email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cartForm.is_pasig_cart}
                      onChange={(e) =>
                        setCartForm({
                          ...cartForm,
                          is_pasig_cart: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Is Pasig Cart"
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  fullWidth
                  value={cartForm.status}
                  onChange={(e) =>
                    setCartForm({ ...cartForm, status: e.target.value })
                  }
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={cartForm.notes}
                  onChange={(e) =>
                    setCartForm({ ...cartForm, notes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditCart}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
        >
          <DialogTitle>Delete Cart Record</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this cart record? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteCart}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Slot Configuration Modal */}
        <Dialog
          open={openConfigModal}
          onClose={() => setOpenConfigModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Slot Configuration</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Total Slots"
                  value={slotConfig.max_slots}
                  onChange={(e) =>
                    setSlotConfig({
                      ...slotConfig,
                      max_slots: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Reserved Slots"
                  value={slotConfig.reserved_slots}
                  onChange={(e) =>
                    setSlotConfig({
                      ...slotConfig,
                      reserved_slots: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={slotConfig.is_accepting_applications}
                      onChange={(e) =>
                        setSlotConfig({
                          ...slotConfig,
                          is_accepting_applications: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Accepting Applications"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Area Slots
                </Typography>
              </Grid>
              {Object.entries(slotConfig.area_slots || {}).map(
                ([area, slots]) => (
                  <Grid item xs={6} key={area}>
                    <TextField
                      fullWidth
                      type="number"
                      label={area}
                      value={slots}
                      onChange={(e) =>
                        setSlotConfig({
                          ...slotConfig,
                          area_slots: {
                            ...slotConfig.area_slots,
                            [area]: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </Grid>
                ),
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfigModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveSlotConfig}>
              Save Configuration
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image Preview Modal */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={openModal}>
            <Box sx={styles.modalContainer}>
              <div style={styles.modalHeader}>
                <Typography variant="h6">Image Preview</Typography>
                <IconButton onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </div>
              <div style={{ position: "relative" }}>
                <img src={modalImage} alt="Preview" style={styles.modalImage} />
                {(() => {
                  const rec = scanRecords.find(
                    (r) =>
                      r.original_image_url === modalImage ||
                      r.postprocessed_image_url === modalImage,
                  );
                  if (rec && rec.status) {
                    return (
                      <Chip
                        label={rec.status}
                        color="primary"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          background: "#2563eb",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            </Box>
          </Fade>
        </Modal>
      </main>
    </Box>
  );
};

export default VendorCartMonitoring;
