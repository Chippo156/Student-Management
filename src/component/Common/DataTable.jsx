import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

  return (
    <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
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

      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      />
    </Paper>
  );
};

export default DataTable;
