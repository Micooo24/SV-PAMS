import axios from "axios";
import BASE_URL from "../common/baseurl";

const usersubService = {
  getAll: async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/document-submissions/get-all`);
    return response.data.submissions;
  }
};
export default usersubService