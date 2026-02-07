import axios from "axios";
import BASE_URL from "../common/baseurl";

const usersubService = {
  getAll: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${BASE_URL}/api/admin/document-submissions/get-all`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.submissions;
  },
  
  delete: async (submissionId) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${BASE_URL}/api/admin/document-submissions/delete/${submissionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  updateStatus: async (submissionId, status, adminNotes) => {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${BASE_URL}/api/admin/document-submissions/update-status/${submissionId}`,
      {
        status: status,
        admin_notes: adminNotes
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export default usersubService;