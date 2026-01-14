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
  TablePagination
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Sort } from "@mui/icons-material"; // ✅ ADD THIS
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
  "Ignored"
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
  const [sortOrder, setSortOrder] = useState('desc'); // ✅ ADD THIS
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    async function fetchGeofencingState() {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/vendor-carts/geofencing-state`);
        setGeofencingEnabled(!!res.data.enabled);
      } catch (err) {
        // fallback: default true
      }
    }
    fetchGeofencingState();
  }, []);

  const handleToggleGeofencing = async () => {
    const newState = !geofencingEnabled;
    const togglePromise = axios.post(`${BASE_URL}/api/admin/vendor-carts/set-geofencing-state`, { enabled: newState });
    
    toast.promise(togglePromise, {
      loading: `${newState ? 'Enabling' : 'Disabling'} geofencing...`,
      success: `Geofencing ${newState ? 'enabled' : 'disabled'} successfully`,
      error: 'Failed to update geofencing state'
    });

    try {
      await togglePromise;
      setGeofencingEnabled(newState);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchScanRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/admin/vendor-carts/get-all`);
        const records = Array.isArray(response.data) ? response.data : [];
        
        // ✅ Sort by created_at descending (newest first)
        const sortedRecords = records.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setScanRecords(sortedRecords);
        
        if (records.length > 0) {
          toast.success(`Loaded ${records.length} scan records`);
        }
        
        const userIds = [...new Set(records.map(r => r.user_id))];
        const userMapTemp = {};
        await Promise.all(userIds.map(async (uid) => {
          try {
            const res = await axios.get(`${BASE_URL}/api/admin/users/${uid}`);
            userMapTemp[uid] = res.data;
          } catch {}
        }));
        setUserMap(userMapTemp);
        
        const addressMapTemp = {};
        await Promise.all(records.map(async (r) => {
          if (r.location && r.location.latitude && r.location.longitude) {
            const key = `${r.location.latitude},${r.location.longitude}`;
            if (!addressMapTemp[key]) {
              try {
                const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${r.location.latitude},${r.location.longitude}&key=AIzaSyClm4V0Td6kLL-T0HJVrZobRltjiIeAUh0`);
                addressMapTemp[key] = res.data.results?.[0]?.formatted_address || 'Unknown location';
              } catch {
                addressMapTemp[key] = 'Unknown location';
              }
            }
          }
        }));
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
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    
    const sorted = [...scanRecords].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return newOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setScanRecords(sorted);
    setPage(0);
    
    toast.success(`Sorted by ${newOrder === 'desc' ? 'newest' : 'oldest'} first`, {
      duration: 2000
    });
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
    const updatePromise = axios.put(`${BASE_URL}/api/admin/vendor-carts/update-status/${recordId}`, { status: newStatus });
    
    toast.promise(updatePromise, {
      loading: 'Updating status...',
      success: `Status updated to ${newStatus}`,
      error: 'Failed to update status'
    });

    try {
      await updatePromise;
      setScanRecords(prev => prev.map(r => r._id === recordId ? { ...r, status: newStatus } : r));
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
    page * rowsPerPage + rowsPerPage
  );

  const styles = {
    container: { 
      display: "flex", 
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#e6eaf0"
    },
    main: {
      flex: 1,
      width: "100%",
      height: "100vh",
      padding: "40px",
      backgroundColor: "#e6eaf0",
      overflowY: "auto"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Geofencing:
            </Typography>
            <Button
              variant={geofencingEnabled ? 'contained' : 'outlined'}
              color={geofencingEnabled ? 'success' : 'error'}
              onClick={handleToggleGeofencing}
              style={{ minWidth: 80 }}
            >
              {geofencingEnabled ? 'ON' : 'OFF'}
            </Button>
            <Typography variant="caption" sx={{ ml: 2, color: '#888' }}>
              (Geofencing Status)
            </Typography>
          </div>
        </div>

        <div style={styles.contentCard}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* ✅ NEW: Sort Button */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Sort />}
              onClick={handleSortByDate}
              sx={{ 
                textTransform: 'none',
                borderColor: '#118df0',
                color: '#118df0',
                '&:hover': {
                  borderColor: '#0d6ebd',
                  backgroundColor: '#f0f8ff'
                }
              }}
            >
              Sort by Date ({sortOrder === 'desc' ?   'Oldest First': 'Newest First'})
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
                      <TableCell sx={{ fontWeight: 600 }}>Report ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>User Info</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Scan Timestamp</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Original Image</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Postprocessed Image</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Classification</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Confidence (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            No scan records found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{record._id}</Typography>
                          </TableCell>
                          <TableCell>
                            {userMap[record.user_id] ? (
                              <>
                                <Typography variant="body2">{userMap[record.user_id].firstname} {userMap[record.user_id].lastname}</Typography>
                                <Typography variant="caption">{userMap[record.user_id].email}</Typography>
                              </>
                            ) : (
                              <Typography variant="caption">{record.user_id}</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{new Date(record.created_at).toLocaleString()}</Typography>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const key = record.location && record.location.latitude && record.location.longitude
                                ? `${record.location.latitude},${record.location.longitude}`
                                : null;
                              if (key && addressMap[key]) {
                                return <Typography variant="body2">{addressMap[key]}</Typography>;
                              } else if (key) {
                                return <Typography variant="body2">Loading address...</Typography>;
                              } else {
                                return <Typography variant="caption">N/A</Typography>;
                              }
                            })()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={record.status || 'Pending'}
                              size="small"
                              onChange={(e) => handleStatusUpdate(record._id, e.target.value)}
                              sx={{ minWidth: 140 }}
                            >
                              {statusOptions.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="outlined" size="small" onClick={() => handleOpenModal(record.original_image_url)}>View Image</Button>
                          </TableCell>
                          <TableCell>
                            <Button variant="outlined" size="small" onClick={() => handleOpenModal(record.postprocessed_image_url)}>View Image</Button>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{record.classification || "N/A"}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{record.confidence ? `${parseFloat(record.confidence).toFixed(1)}%` : "N/A"}</Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
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
                  '.MuiTablePagination-toolbar': {
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    padding: '8px 16px'
                  }
                }}
              />
            </>
          )}
        </div>

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
              <div style={{ position: 'relative' }}>
                <img
                  src={modalImage}
                  alt="Preview"
                  style={styles.modalImage}
                />
                {(() => {
                  const rec = scanRecords.find(r => r.original_image_url === modalImage || r.postprocessed_image_url === modalImage);
                  if (rec && rec.status) {
                    return (
                      <Chip
                        label={rec.status}
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: 12, left: 12, background: '#2563eb', color: '#fff', fontWeight: 700 }}
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