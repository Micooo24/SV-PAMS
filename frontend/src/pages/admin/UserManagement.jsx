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
  Switch,
  Select,
  MenuItem,
  TablePagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import BASE_URL from "../../common/baseurl";

export default function UserManagement({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter })
      };

      const response = await axios.get(`${BASE_URL}/api/admin/users/get-all`, { params });
      setUsers(response.data.users);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      toast.error("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/users/${userId}/role`, { role: newRole });
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/users/${userId}/status`, { is_active: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleVerificationToggle = async (userId, currentStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/users/${userId}/verification`, { is_verified: !currentStatus });
      toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update verification");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${BASE_URL}/api/admin/users/${userId}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "vendor":
        return "warning";
      default:
        return "primary";
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
    contentCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
    },
    filterBar: {
      display: "flex",
      gap: 16,
      marginBottom: 24
    }
  };

  return (
    <Box sx={styles.container}>
      <Sidebar role="admin" />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>User Management</h1>
            <Typography variant="body2" color="text.secondary">
              Manage all users ({total} total)
            </Typography>
          </div>
        </div>

        <div style={styles.contentCard}>
          {/* Filters */}
          <div style={styles.filterBar}>
            <TextField
              label="Search by name or email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="vendor">Vendor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </div>

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
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Verified</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No users found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user._id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Avatar src={user.img} alt={user.firstname} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {user.firstname} {user.lastname}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{user.mobile_no}</Typography>
                            {user.landline_no && (
                              <Typography variant="caption" color="text.secondary">
                                {user.landline_no}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{user.barangay}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.address}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              size="small"
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              sx={{ minWidth: 100 }}
                            >
                              <MenuItem value="user">User</MenuItem>
                              <MenuItem value="vendor">Vendor</MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.is_active}
                              onChange={() => handleStatusToggle(user._id, user.is_active)}
                              color="success"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.is_verified}
                              onChange={() => handleVerificationToggle(user._id, user.is_verified)}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">{formatDate(user.created_at)}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Delete">
                              <IconButton color="error" onClick={() => handleDelete(user._id)} size="small">
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
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
    </Box>
  );
}