import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Chip,
  Paper,
  Button,
  Divider,
  Alert
} from "@mui/material";
import { Close, CheckCircle, Cancel, PictureAsPdf, Image as ImageIcon } from "@mui/icons-material";
import ImageViewer from "./ImageViewer";
import GeminiDetailsCard from "./GeminiDetailsCard";
import AIScoreCard from "./AIScoreCard";

export default function SubmissionDetailsModal({ 
  open, 
  onClose, 
  submission, 
  getStatusColor,
  onApprove,
  onReject
}) {
  if (!submission) return null;

  const originalFiles = Array.isArray(submission.file_url_original) 
    ? submission.file_url_original 
    : [submission.file_url_original];
  
  const processedFiles = Array.isArray(submission.file_url_processed) 
    ? submission.file_url_processed 
    : [submission.file_url_processed];

  const geminiDetails = Array.isArray(submission.gemini_details) 
    ? submission.gemini_details 
    : [];

  // Helper function to check if file is PDF
  const isPDF = (url) => {
    return url && (url.toLowerCase().endsWith('.pdf') || url.includes('.pdf'));
  };

  const modalBoxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '95%',
    maxWidth: '1400px',
    maxHeight: '95vh',
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
    overflow: 'auto'
  };

  const renderFilePreview = (url, idx, borderColor) => {
    if (isPDF(url)) {
      return (
        <Box
          key={idx}
          sx={{
            width: '100%',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${borderColor}`,
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#f9fafb',
            '&:hover': { backgroundColor: '#f3f4f6' }
          }}
          onClick={() => window.open(url, "_blank")}
        >
          <PictureAsPdf sx={{ fontSize: 60, color: '#ef4444', mb: 2 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
            PDF Document
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Click to view
          </Typography>
        </Box>
      );
    }

    return (
      <Box 
        key={idx}
        component="img"
        src={url}
        alt={`File ${idx + 1}`}
        sx={{
          width: '100%',
          height: 'auto',
          maxHeight: '300px',
          objectFit: 'contain',
          borderRadius: '8px',
          border: `2px solid ${borderColor}`,
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 }
        }}
        onClick={() => window.open(url, "_blank")}
      />
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalBoxStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#003067" }}>
              Submission Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {submission.base_document_title} - {Array.isArray(submission.filename) 
                ? `${submission.filename.length} files` 
                : submission.filename}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip 
              label={submission.status} 
              color={getStatusColor(submission.status)} 
              size="small" 
            />
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* AI Score Summary */}
        <AIScoreCard submission={submission} />

        <Divider sx={{ my: 3 }} />

        {/* Images Grid */}
        <Grid container spacing={3}>
          {/* Base Document */}
          <Grid item xs={12} md={4}>
            <ImageViewer
              title="Base Document (Template)"
              url={submission.base_document_file_url}
              color="#003067"
            />
          </Grid>

          {/* Original Files */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#118df0" }}>
                Original Files ({originalFiles.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {originalFiles.map((url, idx) => renderFilePreview(url, idx, '#118df0'))}
              </Box>
            </Paper>
          </Grid>

          {/* Processed Files */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#10b981" }}>
                AI Processed ({processedFiles.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {processedFiles.map((url, idx) => renderFilePreview(url, idx, '#10b981'))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Gemini Analysis Details */}
        <GeminiDetailsCard geminiDetails={geminiDetails} />

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        {submission.status === "needs_review" && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={() => onApprove(submission._id)}
              sx={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              Approve Submission
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<Cancel />}
              onClick={() => onReject(submission._id)}
              sx={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': { backgroundColor: '#dc2626' }
              }}
            >
              Reject Submission
            </Button>
          </Box>
        )}

        {submission.status !== "needs_review" && (
          <Alert severity="info" sx={{ mt: 3 }}>
            This submission has already been {submission.status}.
          </Alert>
        )}
      </Box>
    </Modal>
  );
}