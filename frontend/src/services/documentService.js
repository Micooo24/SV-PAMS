import axios from "axios";
import BASE_URL from "../common/baseurl";

const documentService = {
  getAll: async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/base-documents/get-all`);
    return response.data.documents;
  },

  upload: async (formData) => {
    return await axios.post(
      `${BASE_URL}/api/admin/base-documents/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  update: async (id, formData) => {
    return await axios.put(
      `${BASE_URL}/api/admin/base-documents/update/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  delete: async (id) => {
    return await axios.delete(`${BASE_URL}/api/admin/base-documents/delete/${id}`);
  },
  
  updateStatus: async (id, isActive) => {
    return await axios.patch(`${BASE_URL}/api/admin/base-documents/status/${id}?is_active=${isActive}`);
  }


};

export default documentService;