import { Box, Typography } from "@mui/material";

export default function MultiPageViewer({ url }) {
  if (!url) return null;

  const isPdf = url.toLowerCase().includes('.pdf');

  if (!isPdf) {
    return (
      <Box
        component="img"
        src={url}
        alt="Document"
        sx={{
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          border: '1px solid #ddd',
          mb: 2
        }}
      />
    );
  }

  const cleanUrl = url.split('?')[0];
  const basePngUrl = cleanUrl.replace(/\.pdf$/i, '.png');
  const pagesToCheck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%' }}>
      {pagesToCheck.map((pageNum) => {
        let pageUrl = basePngUrl;
        
        if (pageNum > 1) {
          if (basePngUrl.includes("/upload/")) {
            pageUrl = basePngUrl.replace("/upload/", `/upload/pg_${pageNum}/`);
          }
        }

        return (
          <Box
            key={pageNum}
            component="img"
            src={pageUrl}
            alt={`Page ${pageNum}`}
            onError={(e) => { e.target.style.display = 'none'; }}
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              minHeight: '200px'
            }}
          />
        );
      })}
      <Typography variant="caption" color="text.secondary" sx={{mt: 1}}>
        Displaying document pages (Max 10)
      </Typography>
    </Box>
  );
}