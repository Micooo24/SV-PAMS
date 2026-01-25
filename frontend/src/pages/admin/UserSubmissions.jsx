import { useState } from "react";
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button,
  TablePagination
} from "@mui/material";
import { Sort } from "@mui/icons-material";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import useUserSubmissions from "../../hooks/useUserSubmissions";
import SubmissionsTable from "../../components/user_submissions/SubmissionsTable";
import DocumentModal from "../../components/user_submissions/DocumentModal";

export default function UserSubmissions({ onLogout }) {
  const { submissions, loading, error, setSubmissions } = useUserSubmissions();

  const [openModal, setOpenModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSortByDate = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    
    const sorted = [...submissions].sort((a, b) => {
      const dateA = new Date(a.submitted_at);
      const dateB = new Date(b.submitted_at);
      return newOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setSubmissions(sorted);
    toast.success(`Sorted by ${newOrder === 'desc' ? 'newest' : 'oldest'} first`, {
      duration: 2000
    });
  };

  const handleViewImages = (submission) => {
    setSelectedSubmission(submission);
    setOpenModal(true);
    toast.success(`Viewing comparison for ${Array.isArray(submission.filename) ? submission.filename.join(', ') : submission.filename}`, {
      duration: 2000
    });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSubmission(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  const handleOpenImage = (url, type) => {
    if (url) {
      window.open(url, '_blank');
      toast.success(`Opening ${type} in new tab`, {
        duration: 2000
      });
    } else {
      toast.error(`No ${type} available`);
    }
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

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Sort />}
              onClick={handleSortByDate}
              sx={{ 
                textTransform: 'none',
                borderColor: '#118df0',
                color: '#118df0',
                '&:hover': {
                  borderColor: '#0d6ebd',
                  backgroundColor: '#f0f8ff'
                }
              }}
            >
              Sort by Date ({sortOrder === 'desc' ? 'Oldest First' : 'Newest First'})
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <SubmissionsTable
                submissions={paginatedSubmissions}
                onViewImages={handleViewImages}
                getStatusColor={getStatusColor}
              />

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

      <DocumentModal
        open={openModal}
        onClose={handleCloseModal}
        submission={selectedSubmission}
        getStatusColor={getStatusColor}
        onOpenImage={handleOpenImage}
      />
    </Box>
  );
}