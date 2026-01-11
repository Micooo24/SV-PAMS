import { useState, useEffect } from "react";
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
  IconButton,
  Tooltip,
  Modal,
  Grid,
  Button,
  TablePagination
} from "@mui/material";
import { Visibility, Close } from "@mui/icons-material";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import BASE_URL from "../../common/baseurl";

export default function UserSubmissions({ onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/admin/document-submissions/get-all`);
      setSubmissions(response.data.submissions);
      setError(null);
    } catch (err) {
      setError("Failed to fetch submissions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewImages = (submission) => {
    setSelectedSubmission(submission);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSubmission(null);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated submissions
  const paginatedSubmissions = submissions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "needs_review":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
    logoutButton: {
      padding: "10px 20px",
      backgroundColor: "#118df0",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 600,
    },
    contentCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
    },
    modalBox: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      bgcolor: 'background.paper',
      borderRadius: '12px',
      boxShadow: 24,
      p: 4,
      overflow: 'auto'
    }
  };

  return (
    <Box sx={styles.container}>
      <Sidebar role="admin" />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>User Submissions</h1>
            <Typography variant="body2" color="text.secondary">
              All document submissions from users ({submissions.length} total)
            </Typography>
          </div>
          <button style={styles.logoutButton} onClick={onLogout}>
            Logout
          </button>
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
            <>
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Filename</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Similarity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No submissions found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSubmissions.map((sub) => (
                        <TableRow key={sub._id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {sub.user_id.substring(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{sub.base_document_title}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sub.base_document_category || "general"}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {sub.filename}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color:
                                  sub.similarity_percentage >= 90
                                    ? "#10b981"
                                    : sub.similarity_percentage >= 70
                                    ? "#f59e0b"
                                    : "#ef4444"
                              }}
                            >
                              {sub.similarity_percentage}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Text: {sub.comparison_details?.text_similarity || 0}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={sub.status} size="small" color={getStatusColor(sub.status)} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">{formatDate(sub.submitted_at)}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Images">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewImages(sub)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
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
                count={submissions.length}
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
      </main>

      {/* Modal for Viewing Images */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="image-modal-title"
      >
        <Box sx={styles.modalBox}>
          {selectedSubmission && (
            <>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography id="image-modal-title" variant="h5" sx={{ fontWeight: 600, color: "#003067" }}>
                    Document Comparison
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSubmission.filename} - {selectedSubmission.base_document_title}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseModal}>
                  <Close />
                </IconButton>
              </Box>

              {/* Similarity Stats */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Overall</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#003067" }}>
                      {selectedSubmission.similarity_percentage}%
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Text</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#10b981" }}>
                      {selectedSubmission.comparison_details?.text_similarity || 0}%
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Layout</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#f59e0b" }}>
                      {selectedSubmission.comparison_details?.layout_similarity || 0}%
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip label={selectedSubmission.status} color={getStatusColor(selectedSubmission.status)} size="small" />
                  </Grid>
                </Grid>
              </Box>

              {/* Images Side by Side */}
              <Grid container spacing={3}>
                {/* Original Image */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#118df0" }}>
                      📄 Original Image Submitted
                    </Typography>
                    {selectedSubmission.file_url_original ? (
                      <Box
                        component="img"
                        src={selectedSubmission.file_url_original}
                        alt="Original"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '500px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '2px solid #118df0'
                        }}
                      />
                    ) : (
                      <Typography color="text.secondary">No original image available</Typography>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => window.open(selectedSubmission.file_url_original, '_blank')}
                      disabled={!selectedSubmission.file_url_original}
                    >
                      Open in New Tab
                    </Button>
                  </Paper>
                </Grid>

                {/* Processed Image */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#10b981" }}>
                      🔍 Processed Image (Bounding Boxes)
                    </Typography>
                    {selectedSubmission.file_url_processed ? (
                      <Box
                        component="img"
                        src={selectedSubmission.file_url_processed}
                        alt="Processed"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '500px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '2px solid #10b981',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ) : (
                      <Typography color="text.secondary">No processed image available</Typography>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => window.open(selectedSubmission.file_url_processed, '_blank')}
                      disabled={!selectedSubmission.file_url_processed}
                    >
                      Open in New Tab
                    </Button>
                  </Paper>
                </Grid>
              </Grid>

              {/* Detected Elements Info */}
              {selectedSubmission.spatial_analysis && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: "#000000", fontWeight: 600 }}>
                    🔎 Detected Elements
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Text Blocks</Typography>
                      <Typography variant="body1" sx={{ color: "#000000", fontWeight: 600 }}>
                        {selectedSubmission.spatial_analysis.user_text_blocks || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Words</Typography>
                      <Typography variant="body1" sx={{ color: "#000000", fontWeight: 600 }}>
                        {selectedSubmission.spatial_analysis.user_words || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Objects</Typography>
                      <Typography variant="body1" sx={{ color: "#000000", fontWeight: 600 }}>
                        {selectedSubmission.spatial_analysis.user_objects || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}