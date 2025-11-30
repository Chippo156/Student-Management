import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  TextField,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';

/**
 * DataTable - Component table chung với style thống nhất
 * @param {Array} columns - Mảng column definitions [{field, headerName, width, renderCell}]
 * @param {Array} rows - Dữ liệu rows
 * @param {number} page - Trang hiện tại (0-indexed)
 * @param {number} rowsPerPage - Số dòng mỗi trang
 * @param {number} totalCount - Tổng số records
 * @param {function} onPageChange - Callback khi đổi trang
 * @param {function} onRowsPerPageChange - Callback khi đổi số dòng/trang
 * @param {ReactNode} emptyState - Component hiển thị khi không có dữ liệu
 */
const DataTable = ({
  columns,
  rows,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  emptyState,
}) => {
  const theme = useTheme();
  const [jumpToPage, setJumpToPage] = useState('');
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.mode === 'light'
                  ? theme.palette.primary.main
                  : theme.palette.background.paper,
              }}
            >
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.mode === 'light'
                      ? 'white'
                      : theme.palette.text.primary,
                    width: column.width,
                    ...column.headerStyle,
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                hover
                sx={{
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.04)'
                      : 'rgba(255, 255, 255, 0.08)',
                  },
                  transition: 'background-color 0.2s',
                }}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    align={column.align || 'left'}
                    sx={column.cellStyle}
                  >
                    {column.renderCell
                      ? column.renderCell(row, rowIndex)
                      : row[column.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.length === 0 && emptyState && (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          {emptyState}
        </Box>
      )}

      {/* Custom Pagination like Ant Design */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left side: Rows per page */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Số dòng mỗi trang:
          </Typography>
          <FormControl size="small">
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                onRowsPerPageChange(e);
              }}
              sx={{
                fontSize: '0.875rem',
                height: '32px',
                '& .MuiSelect-select': {
                  padding: '4px 32px 4px 12px',
                },
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, totalCount)} của ${totalCount}`}
          </Typography>
        </Box>

        {/* Right side: Pagination + Jump to page */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Jump to page */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Đến trang
            </Typography>
            <TextField
              size="small"
              value={jumpToPage}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  setJumpToPage(value);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const pageNum = parseInt(jumpToPage);
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    onPageChange(null, pageNum - 1);
                    setJumpToPage('');
                  }
                }
              }}
              placeholder={`1-${totalPages}`}
              sx={{
                width: '70px',
                '& input': {
                  textAlign: 'center',
                  padding: '4px 8px',
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-root': {
                  height: '32px',
                },
              }}
            />
            <IconButton
              size="small"
              onClick={() => {
                const pageNum = parseInt(jumpToPage);
                if (pageNum >= 1 && pageNum <= totalPages) {
                  onPageChange(null, pageNum - 1);
                  setJumpToPage('');
                }
              }}
              disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
              color="primary"
              sx={{ padding: '4px' }}
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </Box>

          {/* Page numbers */}
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(event, value) => onPageChange(event, value - 1)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default DataTable;
