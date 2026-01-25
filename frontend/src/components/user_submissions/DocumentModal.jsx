import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Chip,
  Paper,
  Button
} from "@mui/material";
import { Close } from "@mui/icons-material";
import MultiPageViewer from "../../helpers/MultiPageViewer";

export default function DocumentModal({ 
  open, 
  onClose, 
  submission, 
  getStatusColor,
  onOpenImage   
}) {
  if (!submission) return null;

  const modalBoxStyle = {
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
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="document-modal-title"
    >
      <Box sx={modalBoxStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography id="document-modal-title" variant="h5" sx={{ fontWeight: 600, color: "#003067" }}>
              Document Comparison
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Array.isArray(submission.filename) 
                ? `${submission.filename.length} files` 
                : submission.filename} - {submission.base_document_title}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />   
          </IconButton>
        </Box>

        {/* Similarity Stats */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">Overall</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#003067" }}>
                {submission.similarity_percentage}%
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">Text</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#10b981" }}>
                {submission.comparison_details?.text_similarity || 0}%
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">Layout</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#f59e0b" }}>
                {submission.comparison_details?.layout_similarity || 0}%
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Chip label={submission.status} color={getStatusColor(submission.status)} size="small" />
            </Grid>
          </Grid>
        </Box>

        {/* FILES DISPLAY SECTION */}
        {Array.isArray(submission.file_url_original) ? (
          // CASE 1: MULTIPLE FILES
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#003067" }}>
              Uploaded Files ({submission.file_url_original.length})
            </Typography>
            <Grid container spacing={2}>
              {submission.file_url_original.map((url, index) => {
                const filename = Array.isArray(submission.filename) 
                  ? submission.filename[index] 
                  : `File ${index + 1}`;

                return (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        {filename}
                      </Typography>
                      
                      <Box sx={{ flex: 1, maxHeight: '500px', overflowY: 'auto', bgcolor: '#f5f5f5', borderRadius: 2, p: 1 }}>
                        <MultiPageViewer url={url} />
                      </Box>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => onOpenImage(url, filename)}
                      >
                        Download Original
                      </Button>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ) : (
          // CASE 2: SINGLE FILE (Comparison View)
          <Grid container spacing={3}>
            {/* Original Document */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#118df0" }}>
                  Original Document
                </Typography>
                
                {submission.file_url_original ? (
                  <Box sx={{ flex: 1, maxHeight: '600px', overflowY: 'auto', backgroundColor: '#f5f5f5', borderRadius: 2, p: 1 }}>
                    <MultiPageViewer url={submission.file_url_original} />
                  </Box>
                ) : (
                  <Typography color="text.secondary">No original file available</Typography>
                )}
                
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => onOpenImage(submission.file_url_original, 'original')}
                  disabled={!submission.file_url_original}
                >
                  Download Original
                </Button>
              </Paper>
            </Grid>

            {/* Processed Image */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#10b981" }}>
                  Processed Image (Bounding Boxes)
                </Typography>
                {submission.file_url_processed ? (
                  <Box
                    component="img"
                    src={submission.file_url_processed}
                    alt="Processed"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '600px',
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
                  onClick={() => onOpenImage(submission.file_url_processed, 'processed')}
                  disabled={!submission.file_url_processed}
                >
                  Open in New Tab
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Detected Elements Info */}
        {submission.spatial_analysis && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: "#f9fafb", borderRadius: "8px" }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: "#000000", fontWeight: 600 }}>
              Detected Elements
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Text Blocks</Typography>
                <Typography variant="body1" sx={{ color: "#000000", fontWeight: 600 }}>
                  {submission.spatial_analysis.user_text_blocks || 0}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Words</Typography>
                <Typography variant="body1" sx={{ color: "#000000", fontWeight: 600 }}>
                  {submission.spatial_analysis.user_words || 0}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Objects</Typography>
                <Typography variant="body1" sx={{ color: "#000000", fontWeight: 600 }}>
                  {submission.spatial_analysis.user_objects || 0}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Modal>
  );
}