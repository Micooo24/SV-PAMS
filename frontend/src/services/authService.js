import axios from "axios";
import BASE_URL from "../common/baseurl";

const authService = {

  login: async (formData) => {
    const response = await axios.post(
      `${BASE_URL}/api/users/auth/login`,
      formData
    );
    
    // Store the token after successful login
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  // Add logout function
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  //  Add function to get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Add function to check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }

};

export default authService;