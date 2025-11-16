import  { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Modal,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import BASE_URL from "../common/baseurl.js";

export default function AdminDashboard({ onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    is_active: true,
    file: null
  });
  const [uploadData, setUploadData] = useState({
    title: "",
    category: "",
    description: "",
    file: null
  });

  const categories = [
    "permits",
    "clearances", 
    "certificates",
    "requirements",
    "ids",
    "licenses", 
    "general",
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/admin/base-documents/get-all`);
      setDocuments(response.data.documents);
      setError(null);
    } catch (err) {
      setError("Failed to fetch documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      category: doc.category,
      description: doc.description,
      is_active: doc.is_active,
      file: null
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingDoc(null);
    setFormData({
      title: "",
      category: "",
      description: "",
      is_active: true,
      file: null
    });
  };

  const handleOpenUploadModal = () => {
    setOpenUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setOpenUploadModal(false);
    setUploadData({
      title: "",
      category: "",
      description: "",
      file: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({
      ...prev,
      is_active: e.target.checked
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleUploadFileChange = (e) => {
    setUploadData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("is_active", formData.is_active);
      
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      await axios.put(
        `${BASE_URL}/api/admin/base-documents/update/${editingDoc._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Document updated successfully!");
      handleCloseModal();
      fetchDocuments();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update document");
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadData.title || !uploadData.category || !uploadData.file) {
      alert("Please fill in all required fields and select a file");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", uploadData.title);
      formDataToSend.append("category", uploadData.category);
      formDataToSend.append("description", uploadData.description);
      formDataToSend.append("file", uploadData.file);

      await axios.post(
        `${BASE_URL}/api/admin/base-documents/upload`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Document uploaded successfully!");
      handleCloseUploadModal();
      fetchDocuments();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload document");
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await axios.delete(
          `${BASE_URL}/api/admin/base-documents/delete/${documentId}`
        );
        
        alert("Document deleted successfully!");
        fetchDocuments();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete document. Please try again.");
      }
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
    main: {
      flex: 1,
      padding: "40px",
      backgroundColor: "#e6eaf0",
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
      color: "#002248",
    },
    modalBox: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 500,
      backgroundColor: "#ffffff",
      boxShadow: 24,
      borderRadius: "12px",
      padding: "30px",
    },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="admin" />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <button style={styles.logoutButton} onClick={onLogout}>
            Logout
          </button>
        </div>

        <div style={styles.contentCard}>
          <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#003067", mb: 1 }}>
                Base Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage document templates and base files
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenUploadModal}
              sx={{ 
                backgroundColor: "#118df0", 
                "&:hover": { backgroundColor: "#0d6fc4" },
                textTransform: "none",
                fontWeight: 600
              }}
            >
              Upload Document
            </Button>
          </Box>

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
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Filename</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>File Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No documents found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {doc.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doc.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{doc.filename}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={doc.category} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {doc.file_type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doc.is_active ? "Active" : "Inactive"}
                            size="small"
                            color={doc.is_active ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(doc.uploaded_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(doc)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(doc._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      <Modal open={openUploadModal} onClose={handleCloseUploadModal}>
        <Box sx={styles.modalBox}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#003067" }}>
              Upload New Document
            </Typography>
            <IconButton onClick={handleCloseUploadModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={uploadData.title}
              onChange={handleUploadInputChange}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={uploadData.category}
                onChange={handleUploadInputChange}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              name="description"
              value={uploadData.description}
              onChange={handleUploadInputChange}
              fullWidth
              multiline
              rows={3}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
                Select File *
              </Typography>
              <Button 
                variant="outlined" 
                component="label" 
                fullWidth
                sx={{ textTransform: "none" }}
              >
                Choose File
                <input type="file" hidden onChange={handleUploadFileChange} />
              </Button>
              {uploadData.file && (
                <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#10b981" }}>
                  ✓ Selected: {uploadData.file.name}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleUploadSubmit}
                sx={{ 
                  backgroundColor: "#10b981", 
                  "&:hover": { backgroundColor: "#059669" },
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                Upload
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCloseUploadModal}
                sx={{ 
                  color: "#666", 
                  borderColor: "#ccc",
                  textTransform: "none"
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Edit Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={styles.modalBox}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#003067" }}>
              Edit Document
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleSwitchChange}
                  color="success"
                />
              }
              label="Active Status"
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
                Replace File (Optional)
              </Typography>
              <Button 
                variant="outlined" 
                component="label" 
                fullWidth
                sx={{ textTransform: "none" }}
              >
                Choose File
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
              {formData.file && (
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  Selected: {formData.file.name}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                sx={{ 
                  backgroundColor: "#118df0",
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                Update
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCloseModal}
                sx={{ 
                  color: "#666", 
                  borderColor: "#ccc",
                  textTransform: "none"
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}