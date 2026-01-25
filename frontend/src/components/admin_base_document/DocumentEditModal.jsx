import { useState, useEffect } from "react";
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
  FormControlLabel,
  Switch,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DOCUMENT_CATEGORIES } from "../../constants/categories";

export default function DocumentEditModal({ open, document, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    is_active: true,
    file: null
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        category: document.category,
        description: document.description,
        is_active: document.is_active,
        file: null
      });
    }
  }, [document]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({ ...prev, is_active: e.target.checked }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("is_active", formData.is_active);

    if (formData.file) {
      formDataToSend.append("file", formData.file);
    }

    const success = await onUpdate(document._id, formDataToSend);
    if (success) {
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
            Edit Document
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

          <FormControlLabel
            control={<Switch checked={formData.is_active} onChange={handleSwitchChange} color="success" />}
            label="Active Status"
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
              Replace File (Optional)
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ textTransform: "none" }}>
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
              sx={{ backgroundColor: "#118df0", textTransform: "none", fontWeight: 600 }}
            >
              Update
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