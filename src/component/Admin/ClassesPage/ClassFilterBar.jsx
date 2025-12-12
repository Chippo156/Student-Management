import React from 'react';
import {
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { departments, years, statuses } from './constants';

/**
 * ClassFilterBar - Thanh filter cho Classes
 */
const ClassFilterBar = ({
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  yearFilter,
  setYearFilter,
  statusFilter,
  setStatusFilter,
  onClearFilters,
  onExportExcel,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid
        container
        // className="equal-height-cards"
        spacing={2}
        alignItems="center"
      >
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm lớp học, mã lớp, giảng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Khoa</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Khoa"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Năm học</InputLabel>
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              label="Năm học"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year.toString()}>
                  Năm {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={onClearFilters}
          >
            Xóa bộ lọc
          </Button>
        </Grid>
        <Grid item xs={12} md={1.5}>
          <Button
            fullWidth
            variant="outlined"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={onExportExcel}
          >
            Xuất Excel
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ClassFilterBar;
