import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function DashboardHeader({ onLogout, onUpload }) {
  const styles = {
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
  };

  return (
    <>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <button style={styles.logoutButton} onClick={onLogout}>
          Logout
        </button>
      </div>

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
          onClick={onUpload}
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
    </>
  );
}