import { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "../../components/Sidebar";
import DashboardHeader from "../../components/admin/DashboardHeader";
import DocumentTable from "../../components/admin/DocumentTable";
import DocumentUploadModal from "../../components/admin/DocumentUploadModal";
import DocumentEditModal from "../../components/admin/DocumentEditModal";
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

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setOpenEditModal(true);
  };

  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await deleteDocument(documentId);
    }
  };

  const handleStatusToggle = async (documentId, newStatus) => {
    const statusText = newStatus ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${statusText} this document?`)) {
      await updateDocumentStatus(documentId, newStatus);
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
    }
  };

  return (
    <Box sx={styles.container}>
      <Sidebar role="admin" />
      <main style={styles.main}>
        <DashboardHeader onLogout={onLogout} onUpload={() => setOpenUploadModal(true)} />
        
        <DocumentTable
          documents={documents}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusToggle={handleStatusToggle}
        />

        <DocumentUploadModal
          open={openUploadModal}
          onClose={() => setOpenUploadModal(false)}
          onUpload={uploadDocument}
        />

        <DocumentEditModal
          open={openEditModal}
          document={editingDoc}
          onClose={() => {
            setOpenEditModal(false);
            setEditingDoc(null);
          }}
          onUpdate={updateDocument}
        />
      </main>
    </Box>
  );
}