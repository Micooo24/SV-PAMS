import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { formatDate } from "../../utils/formatters";

export default function SubmissionsTable({ 
  submissions, 
  onViewImages, 
  getStatusColor 
}) {
  return (
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
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">No submissions found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((sub) => (
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
                    {Array.isArray(sub.filename) ? `${sub.filename.length} files` : sub.filename}
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
                  <Tooltip title="View Documents">
                    <IconButton
                      color="primary"
                      onClick={() => onViewImages(sub)}
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
  );
}