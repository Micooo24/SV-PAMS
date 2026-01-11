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
  Chip
} from "@mui/material";
const statusOptions = [
  "Pending",
  "Investigating",
  "Located",
  "Permit Processing",
  "Resolved",
  "Ignored"
];

import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import BASE_URL from "../../common/baseurl";
import Sidebar from "../../components/Sidebar";


const VendorCartMonitoring = () => {
  const [scanRecords, setScanRecords] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [addressMap, setAddressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  // Geofencing toggle state (default: true)
  const [geofencingEnabled, setGeofencingEnabled] = useState(true);
  // Fetch geofencing state from backend on mount
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

  // Toggle geofencing state in backend
  const handleToggleGeofencing = async () => {
    try {
      const newState = !geofencingEnabled;
      await axios.post(`${BASE_URL}/api/admin/vendor-carts/set-geofencing-state`, { enabled: newState });
      setGeofencingEnabled(newState);
    } catch (err) {
      alert('Failed to update geofencing state.');
    }
  };

  useEffect(() => {
    const fetchScanRecords = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/vendor-carts/get-all`);
        const records = Array.isArray(response.data) ? response.data : [];
        setScanRecords(records);
        // Fetch user info for each unique user_id
        const userIds = [...new Set(records.map(r => r.user_id))];
        const userMapTemp = {};
        await Promise.all(userIds.map(async (uid) => {
          try {
            const res = await axios.get(`${BASE_URL}/api/admin/users/${uid}`);
            userMapTemp[uid] = res.data;
          } catch {}
        }));
        setUserMap(userMapTemp);
        // Fetch address for each unique location
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScanRecords();
  }, []);

  const handleOpenModal = (imageUrl) => {
    setModalImage(imageUrl);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalImage("");
  };

  const styles = {
    container: { display: "flex", minHeight: "100vh" },
    main: {
      flex: 1,
      padding: "40px",
      backgroundColor: "#f9f9f9",
      width: "80vw",
      minHeight: "100vh",
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

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                  {scanRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No scan records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    scanRecords.map((record) => (
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
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                await axios.put(`${BASE_URL}/api/admin/vendor-carts/update-status/${record._id}`, { status: newStatus });
                                setScanRecords(prev => prev.map(r => r._id === record._id ? { ...r, status: newStatus } : r));
                              } catch {
                                alert('Failed to update status. Please check backend connectivity and try again.');
                              }
                            }}
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
                {/* Show status badge on image */}
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