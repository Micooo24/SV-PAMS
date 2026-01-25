import { useState } from "react";
import { Box, Button } from "@mui/material";
import { Sort } from "@mui/icons-material";
import toast from "react-hot-toast"; 
import Sidebar from "../../components/Sidebar";
import DashboardHeader from "../../components/admin_base_document/DashboardHeader";
import DocumentTable from "../../components/admin_base_document/DocumentTable";
import DocumentUploadModal from "../../components/admin_base_document/DocumentUploadModal";
import DocumentEditModal from "../../components/admin_base_document/DocumentEditModal";
import useDocuments from "../../hooks/useDocuments";

export default function AdminDashboard({ onLogout }) {
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    updateDocumentStatus
  } = useDocuments();

  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setOpenEditModal(true);
  };

  // Add toast notifications for delete
  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const deletePromise = deleteDocument(documentId);
      
      toast.promise(deletePromise, {
        loading: 'Deleting document...',
        success: 'Document deleted successfully! 🗑️',
        error: 'Failed to delete document ❌'
      });
    }
  };

  //  Add toast notifications for status toggle
  const handleStatusToggle = async (documentId, newStatus) => {
    const statusText = newStatus ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${statusText} this document?`)) {
      const statusPromise = updateDocumentStatus(documentId, newStatus);
      
      toast.promise(statusPromise, {
        loading: `${statusText === 'activate' ? 'Activating' : 'Deactivating'} document...`,
        success: `Document ${statusText}d successfully! ✅`,
        error: `Failed to ${statusText} document ❌`
      });
    }
  };

  //  Handle upload with toast
  const handleUpload = async (formData) => {
    const uploadPromise = uploadDocument(formData);
    
    toast.promise(uploadPromise, {
      loading: 'Uploading document...',
      success: 'Document uploaded successfully! 📄',
      error: 'Failed to upload document ❌'
    });

    try {
      await uploadPromise;
      setOpenUploadModal(false);
    } catch (error) {
      // Error already handled by toast.promise
    }
  };

  // Handle update with toast
  const handleUpdate = async (documentId, formData) => {
    const updatePromise = updateDocument(documentId, formData);
    
    toast.promise(updatePromise, {
      loading: 'Updating document...',
      success: 'Document updated successfully!',
      error: 'Failed to update document'
    });

    try {
      await updatePromise;
      setOpenEditModal(false);
      setEditingDoc(null);
    } catch (error) {
      // Error already handled by toast.promise
    }
  };

  // Handle sort by date
  const handleSortByDate = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    
    // This will trigger a re-fetch with sorted data
    fetchDocuments();
    setPage(0);
    
    toast.success(`Sorted by ${newOrder === 'desc' ? 'newest' : 'oldest'} first`, {
      duration: 2000
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    }
  };

  return (
    <Box sx={styles.container}>
      <Sidebar role="admin" />
      <main style={styles.main}>
        <DashboardHeader onLogout={onLogout} onUpload={() => setOpenUploadModal(true)} />
        
        {/* Sort Button */}
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
            Sort by Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})
          </Button>
        </Box>

        <DocumentTable
          documents={documents}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusToggle={handleStatusToggle}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <DocumentUploadModal
          open={openUploadModal}
          onClose={() => setOpenUploadModal(false)}
          onUpload={handleUpload}
        />

        <DocumentEditModal
          open={openEditModal}
          document={editingDoc}
          onClose={() => {
            setOpenEditModal(false);
            setEditingDoc(null);
          }}
          onUpdate={handleUpdate}
        />
      </main>
    </Box>
  );
}