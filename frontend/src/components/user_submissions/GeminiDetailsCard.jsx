import { Paper, Typography, Box, Chip, Grid } from "@mui/material";
import { Description, TrendingUp, Info } from "@mui/icons-material";

export default function GeminiDetailsCard({ geminiDetails }) {
  if (!geminiDetails || geminiDetails.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f9fafb' }}>
        <Typography color="text.secondary">No Gemini analysis details available</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#003067" }}>
        Gemini AI Analysis Details
      </Typography>
      
      <Grid container spacing={2}>
        {geminiDetails.map((detail, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Paper sx={{ p: 3, height: '100%', border: '2px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Description sx={{ color: '#118df0' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {detail.filename || `File ${idx + 1}`}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip 
                  label={detail.label === 1 ? 'Valid' : 'Invalid'}
                  color={detail.label === 1 ? 'success' : 'error'}
                  size="small"
                  icon={detail.label === 1 ? <TrendingUp /> : <Info />}
                />
                <Chip 
                  label={`Score: ${(detail.score * 100).toFixed(1)}%`}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: detail.score >= 0.7 ? '#10b981' : '#ef4444',
                    color: detail.score >= 0.7 ? '#10b981' : '#ef4444'
                  }}
                />
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', display: 'block', mb: 1 }}>
                  AI Reasoning:
                </Typography>
                <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6 }}>
                  {detail.reason || 'No reason provided'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}