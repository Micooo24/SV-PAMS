import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DOCUMENT_CATEGORIES } from "../../constants/categories";

export default function DocumentUploadModal({ open, onClose, onUpload }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    file: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.file) {
      alert("Please fill in all required fields");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("file", formData.file);

    const success = await onUpload(formDataToSend);
    if (success) {
      setFormData({ title: "", category: "", description: "", file: null });
      onClose();
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    backgroundColor: "#ffffff",
    boxShadow: 24,
    borderRadius: "12px",
    padding: "30px",
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#003067" }}>
            Upload New Document
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
          />

          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select name="category" value={formData.category} onChange={handleChange} label="Category">
              {DOCUMENT_CATEGORIES.map((cat) => (
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
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
              Select File *
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ textTransform: "none" }}>
              Choose File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {formData.file && (
              <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#10b981" }}>
                ✓ Selected: {formData.file.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
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
              onClick={onClose}
              sx={{ color: "#666", borderColor: "#ccc", textTransform: "none" }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}