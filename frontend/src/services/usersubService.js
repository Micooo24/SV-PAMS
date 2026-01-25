import axios from "axios";
import BASE_URL from "../common/baseurl";

const usersubService = {
  getAll: async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/document-submissions/get-all`);
    return response.data.submissions;
  },
  
  delete: async (submissionId) => {
    const response = await axios.delete(`${BASE_URL}/api/admin/document-submissions/delete/${submissionId}`);
    return response.data;
  }
};

export default usersubService;