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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import BASE_URL from "../../common/baseurl";
import Sidebar from "../../components/Sidebar";

const VendorCartMonitoring = () => {
  const [scanRecords, setScanRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalImage, setModalImage] = useState("");

  useEffect(() => {
    const fetchScanRecords = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/vendor-carts/get-all`);
        setScanRecords(Array.isArray(response.data) ? response.data : []);
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
                    <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Scan Timestamp</TableCell>
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
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {record.user_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(record.created_at).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenModal(record.original_image_url)}
                          >
                            View Image
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenModal(record.postprocessed_image_url)}
                          >
                            View Image
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.classification || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.confidence ? `${parseFloat(record.confidence).toFixed(1)}%` : "N/A"}
                          </Typography>
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
              <img
                src={modalImage}
                alt="Preview"
                style={styles.modalImage}
              />
            </Box>
          </Fade>
        </Modal>
      </main>
    </Box>
  );
};

export default VendorCartMonitoring;