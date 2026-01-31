import { Paper, Typography, Grid, Box, LinearProgress } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

export default function AIScoreCard({ submission }) {
  const score = submission.ai_confidence_score || 0;
  const label = submission.ai_prediction_label;
  const percentage = (score * 100).toFixed(1);

  const getScoreColor = () => {
    if (score >= 0.90) return "#10b981";
    if (score >= 0.70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Paper sx={{ p: 3, backgroundColor: "#f9fafb" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#003067" }}>
        AI Verification Summary
      </Typography>
      
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {label === 1 ? (
              <CheckCircle sx={{ fontSize: 40, color: '#10b981' }} />
            ) : (
              <Cancel sx={{ fontSize: 40, color: '#ef4444' }} />
            )}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: getScoreColor() }}>
                {percentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confidence Score
              </Typography>
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={score * 100} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getScoreColor()
              }
            }} 
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, backgroundColor: label === 1 ? '#d1fae5' : '#fee2e2', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Prediction Label
            </Typography>
            <Typography variant="h6" sx={{ color: label === 1 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
              {label === 1 ? '✓ VALID DOCUMENT' : '✗ INVALID DOCUMENT'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}