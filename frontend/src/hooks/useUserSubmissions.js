import { useState, useEffect } from "react";
import usersubService from "../services/usersubService";

export default function useUserSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const data = await usersubService.getAll();
            // Sort by newest first by default
            const sortedData = data.sort((a, b) => 
                new Date(b.submitted_at) - new Date(a.submitted_at)
            );
            setSubmissions(sortedData);
            setError(null);
        }
        catch (err) {
            setError("Failed to fetch user submissions");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);
    
    return {
        submissions,
        setSubmissions, // Export setter for sorting
        loading,    
        error,
        fetchSubmissions
    };
}