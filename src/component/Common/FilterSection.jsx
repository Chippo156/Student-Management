import React from 'react';
import { Card, CardContent, Box, Typography, Grid } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * FilterSection - Component section filter chung
 * @param {ReactNode} children - Các filter controls
 * @param {string} title - Tiêu đề section (mặc định: "Bộ lọc tìm kiếm")
 * @param {number|string} resultCount - Số lượng kết quả tìm được
 */
const FilterSection = ({
  children,
  title = 'Bộ lọc tìm kiếm',
  resultCount,
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ mb: 3, boxShadow: 1 }}>
      <CardContent sx={{ py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            {title}
          </Typography>
        </Box>
        <Grid container className="equal-height-cards" spacing={2}>
          {children}
        </Grid>
        {resultCount !== undefined && resultCount !== null && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy: <strong>{resultCount}</strong> kết quả
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterSection;
