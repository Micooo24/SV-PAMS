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
  Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { formatDate } from "../../utils/formatters";

export default function DocumentTable({ documents, loading, error, onEdit, onDelete, onStatusToggle }) {
  const styles = {
    contentCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
    },
    idCell: {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#666',
      maxWidth: '120px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    copyButton: {
      padding: '2px',
      marginLeft: '4px'
    },
    statusChip: {
      cursor: 'pointer',
      '&:hover': {
        opacity: 0.8,
        transform: 'scale(1.05)',
        transition: 'all 0.2s ease'
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('ID copied to clipboard:', text);
    });
  };

  const truncateId = (id) => {
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  const handleStatusClick = (doc) => {
    if (onStatusToggle) {
      onStatusToggle(doc._id, !doc.is_active);
    }
  };

  return (
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
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
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
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No documents found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title={`Full ID: ${doc._id}`} placement="top">
                          <Typography variant="body2" sx={styles.idCell}>
                            {truncateId(doc._id)}
                          </Typography>
                        </Tooltip>
                        <Tooltip title="Copy ID">
                          <IconButton 
                            size="small" 
                            sx={styles.copyButton}
                            onClick={() => copyToClipboard(doc._id)}
                          >
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
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
                      <Chip label={doc.category} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {doc.file_type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Click to ${doc.is_active ? 'deactivate' : 'activate'}`}>
                        <Chip
                          label={doc.is_active ? "Active" : "Inactive"}
                          size="small"
                          color={doc.is_active ? "success" : "default"}
                          onClick={() => handleStatusClick(doc)}
                          sx={styles.statusChip}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{formatDate(doc.uploaded_at)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => onEdit(doc)} sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDelete(doc._id)}>
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
  );
}