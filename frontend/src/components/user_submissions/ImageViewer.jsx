import { Paper, Typography, Box, Button } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

export default function ImageViewer({ title, url, color = "#003067" }) {
  if (!url) {
    return (
      <Paper sx={{ p: 2, height: '100%', textAlign: 'center' }}>
        <Typography color="text.secondary">No image available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color }}>
        {title}
      </Typography>
      
      <Box
        component="img"
        src={url}
        alt={title}
        sx={{
          width: '100%',
          height: 'auto',
          maxHeight: '400px',
          objectFit: 'contain',
          borderRadius: '8px',
          border: `2px solid ${color}`,
          cursor: 'pointer',
          marginBottom: 2,
          '&:hover': { opacity: 0.8 }
        }}
        onClick={() => window.open(url, "_blank")}
      />

      <Button
        variant="outlined"
        size="small"
        fullWidth
        startIcon={<OpenInNew />}
        onClick={() => window.open(url, "_blank")}
        sx={{ borderColor: color, color }}
      >
        Open Full Size
      </Button>
    </Paper>
  );
}