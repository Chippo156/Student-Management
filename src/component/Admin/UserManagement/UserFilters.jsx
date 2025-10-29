import React from 'react';
import { Card, CardContent, Grid, Button } from '@mui/material';
import { Input, Select } from 'antd';
import { Add as AddIcon } from '@mui/icons-material';

const { Option } = Select;

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  onAddClick,
}) => (
  <Card sx={{ mb: 3, borderRadius: 2 }}>
    <CardContent sx={{ p: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Input.Search
            allowClear
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Select
            value={filterRole}
            onChange={(value) => setFilterRole(value)}
            style={{ width: '100%' }}
          >
            <Option value="all">Tất cả vai trò</Option>
            <Option value="admin">Quản trị viên</Option>
            <Option value="giảng viên">Giảng viên</Option>
            <Option value="sinh viên">Sinh viên</Option>
          </Select>
        </Grid>
        <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Thêm mới
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default UserFilters;
