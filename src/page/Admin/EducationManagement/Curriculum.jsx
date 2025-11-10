import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Avatar,
  TablePagination,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import academicProgramService from '../../../service/academicProgramService';

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

  const colors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      background: theme.palette.background.default,
      paper: theme.palette.background.paper,
      text: theme.palette.text.primary,
      textSecondary: theme.palette.text.secondary,
    }),
    [theme]
  );

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
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: colors.text, mb: 1 }}
        >
          Quản lý chương trình đào tạo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý các chương trình đào tạo và chương trình khung
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tổng chương trình
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                  }}
                >
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.success, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Đại học
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.undergraduate}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                  }}
                >
                  <MenuBookIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.info, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Sau đại học
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.graduate}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.info, 0.1),
                    color: colors.info,
                  }}
                >
                  <MenuBookIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.warning, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Khoa
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.departments}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.warning, 0.1),
                    color: colors.warning,
                  }}
                >
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm theo tên chương trình..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Bậc đào tạo</InputLabel>
                <Select
                  value={filterDegree}
                  label="Bậc đào tạo"
                  onChange={(e) => setFilterDegree(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {degreeLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Khoa</InputLabel>
                <Select
                  value={filterDepartment}
                  label="Khoa"
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {uniqueDepartments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  height: 56,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Thêm chương trình
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{ backgroundColor: alpha(colors.primary, 0.05) }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>Mã CTĐT</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tên chương trình</TableCell>
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
                          backgroundColor: alpha(colors.primary, 0.02),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colors.primary }}
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
                            backgroundColor: alpha(colors.info, 0.1),
                            color: colors.info,
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
                          label={program.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          size="small"
                          sx={{
                            backgroundColor: program.isActive
                              ? alpha(colors.success, 0.1)
                              : alpha(colors.error, 0.1),
                            color: program.isActive
                              ? colors.success
                              : colors.error,
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
      </Card>
    </Box>
  );
};

export default Curriculum;