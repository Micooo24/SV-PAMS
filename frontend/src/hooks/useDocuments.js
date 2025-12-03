import { useState, useEffect } from "react";
import documentService from "../services/documentService";

export default function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (formData) => {
    try {
      await documentService.upload(formData);
      alert("Document uploaded successfully!");
      await fetchDocuments();
      return true;
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload document");
      return false;
    }
  };

  const updateDocument = async (id, formData) => {
    try {
      await documentService.update(id, formData);
      alert("Document updated successfully!");
      await fetchDocuments();
      return true;
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update document");
      return false;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await documentService.delete(id);
      alert("Document deleted successfully!");
      await fetchDocuments();
      return true;
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete document");
      return false;
    }
  };

  const updateDocumentStatus = async (id, isActive) => {
    try {
      await documentService.updateStatus(id, isActive);
      const statusText = isActive ? "activated" : "deactivated";
      alert(`Document ${statusText} successfully!`);
      await fetchDocuments();
      return true;
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update document status");
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    updateDocumentStatus
  };
}