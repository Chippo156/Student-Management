import React, { useState, useMemo, useEffect } from 'react';
// Ant Design - Layout & Container
import {
  Row,
  Col,
  Card as AntCard,
  Input,
  Select as AntSelect,
  Button as AntButton,
} from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
// Material-UI - Table & Animations
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Box,
  Typography,
} from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import academicProgramService from '../../../service/academicProgramService';
import { StatCardAntd } from '../../../component/Shared/StatCard';

const Curriculum = () => {
  const theme = useTheme();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDegree, setFilterDegree] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchPrograms();
  }, [page, rowsPerPage, searchTerm, filterDegree, filterDepartment]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const result = await academicProgramService.getAllPrograms({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        programName: searchTerm,
        degreeLevel: filterDegree || '',
      });

      if (result) {
        setPrograms(result.items || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(programs.map((p) => p.departmentName));
    return Array.from(depts);
  }, [programs]);

  const degreeLevels = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ'];

  const stats = useMemo(() => {
    return {
      total: totalCount,
      undergraduate: programs.filter((p) => p.degreeLevel === 'Cử nhân').length,
      graduate: programs.filter((p) => p.degreeLevel === 'Thạc sĩ').length,
      departments: uniqueDepartments.length,
    };
  }, [programs, totalCount, uniqueDepartments]);

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8, fontSize: 24 }}>
          Quản lý chương trình đào tạo
        </h2>
        <div style={{ color: '#888', fontSize: 14 }}>
          Quản lý các chương trình đào tạo và chương trình khung
        </div>
      </div>

      {/* Stats Cards - Ant Design */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Tổng chương trình"
            value={stats.total}
            icon={SchoolIcon}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Đại học"
            value={stats.undergraduate}
            icon={MenuBookIcon}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Sau đại học"
            value={stats.graduate}
            icon={MenuBookIcon}
            color="#1890ff"
            bgColor="#e6f7ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Khoa"
            value={stats.departments}
            icon={SchoolIcon}
            color="#fa8c16"
            bgColor="#fff7e6"
          />
        </Col>
      </Row>

      {/* Filter and Search - Ant Design */}
      <AntCard style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo tên chương trình..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} md={5}>
            <AntSelect
              placeholder="Bậc đào tạo"
              value={filterDegree || undefined}
              onChange={(value) => setFilterDegree(value || '')}
              size="large"
              style={{ width: '100%' }}
            >
              <AntSelect.Option value="">Tất cả</AntSelect.Option>
              {degreeLevels.map((level) => (
                <AntSelect.Option key={level} value={level}>
                  {level}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Col>
          <Col xs={24} md={5}>
            <AntSelect
              placeholder="Khoa"
              value={filterDepartment || undefined}
              onChange={(value) => setFilterDepartment(value || '')}
              size="large"
              style={{ width: '100%' }}
            >
              <AntSelect.Option value="">Tất cả</AntSelect.Option>
              {uniqueDepartments.map((dept) => (
                <AntSelect.Option key={dept} value={dept}>
                  {dept}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Col>
          <Col xs={24} md={6}>
            <AntButton
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ width: '100%' }}
            >
              Thêm chương trình
            </AntButton>
          </Col>
        </Row>
      </AntCard>

      {/* Programs Table - Material-UI for animations */}
      <AntCard
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
        styles={{
          body: { padding: 0 },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>Mã CTĐT</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Tên chương trình
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Bậc đào tạo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Khoa</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tín chỉ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow
                      key={program.academicProgramId}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                          transition: 'all 0.3s ease',
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {program.academicProgramId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {program.programName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={program.degreeLevel}
                          size="small"
                          sx={{
                            backgroundColor: alpha(
                              theme.palette.info.main,
                              0.1
                            ),
                            color: theme.palette.info.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {program.departmentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {program.facultyName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {program.creditsRequired}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            program.isActive
                              ? 'Đang hoạt động'
                              : 'Ngừng hoạt động'
                          }
                          size="small"
                          sx={{
                            backgroundColor: program.isActive
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.error.main, 0.1),
                            color: program.isActive
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          </>
        )}
      </AntCard>
    </div>
  );
};

export default Curriculum;
