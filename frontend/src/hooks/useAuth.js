import { useState, useEffect } from "react";
import authService from "../services/authService";

export default function useAuth() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const Login =  async (formData) => {
    try {
     await authService.login(formData);
        setError(null);
        setLoading(false);  
        return true;

    } catch (err) { 
        setError("Login failed");
        console.error(err);
    }

  
  }
    return {
    Login,
  };
}

