import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchableAutocomplete from '../../Common/SearchableAutocomplete';
import DataTable from '../../Common/DataTable';
import {
  People,
  School,
  Male,
  Female,
  Email,
  Phone,
  Refresh,
  Class as ClassIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { message } from 'antd';
import { studentServices } from '../../../service/studentServices';
import { lecturerService } from '../../../service/lecturerService';

const TeacherStudentsPage = () => {
  const theme = useTheme();
  const colors = useMemo(
    () => ({
      bgCard: theme.palette.background.paper,
      bgPage: theme.palette.background.default,
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      text: theme.palette.text.primary,
      textSecondary: theme.palette.text.secondary,
      border: theme.palette.divider,
      bgPrimarySoft: alpha(theme.palette.primary.main, 0.12),
      bgSuccessSoft: alpha(theme.palette.success.main, 0.12),
      bgWarningSoft: alpha(theme.palette.warning.main, 0.12),
      bgErrorSoft: alpha(theme.palette.error.main, 0.12),
    }),
    [theme]
  );

  const [students, setStudents] = useState([]);
  const [advisedClass, setAdvisedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch advised class on mount
  useEffect(() => {
    const fetchAdvisedClass = async () => {
      setLoading(true);
      try {
        const classData = await lecturerService.getMyAdvisedClass();
        if (classData) {
          setAdvisedClass(classData);
        } else {
          setAdvisedClass(null);
          message.warning('Bạn chưa được gán làm chủ nhiệm lớp nào');
        }
      } catch (error) {
        console.error('Error fetching advised class:', error);
        setAdvisedClass(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisedClass();
  }, []);

  // Fetch students when class or search changes
  useEffect(() => {
    if (advisedClass && advisedClass.classId) {
      const timeoutId = setTimeout(() => {
        fetchStudents();
      }, 500); // Debounce 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [advisedClass, searchText, page, rowsPerPage]);

  const fetchStudents = async () => {
    if (!advisedClass || !advisedClass.classId) return;

    setLoading(true);
    try {
      const response = await studentServices.getStudentsWithClass(
        advisedClass.classId,
        page + 1,
        rowsPerPage,
        searchText
      );

      if (response && response.items) {
        setStudents(response.items);
        setTotalCount(response.totalCount || 0);
      } else {
        setStudents([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Lỗi khi tải danh sách sinh viên');
      setStudents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (advisedClass) {
      fetchStudents();
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Statistics
  const maleCount = students.filter((s) => s.gender === 'MALE').length;
  const femaleCount = students.filter((s) => s.gender === 'FEMALE').length;
  const activeCount = students.filter((s) => s.accountStatus === 'Active').length;

  // Table columns
  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      align: 'center',
      renderCell: (row) => (
        <Avatar
          src={row.avatarUrl}
          sx={{
            width: 40,
            height: 40,
            bgcolor: row.gender === 'MALE' ? colors.primary : colors.error,
          }}
        >
          {row.fullName?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: 'mssv',
      headerName: 'Mã sinh viên',
      width: 120,
      renderCell: (row) => (
        <Typography sx={{ fontWeight: 600, color: colors.primary }}>
          {row.mssv}
        </Typography>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Họ và tên',
      width: 200,
      renderCell: (row) => (
        <Typography sx={{ fontWeight: 500 }}>{row.fullName}</Typography>
      ),
    },
    {
      field: 'gender',
      headerName: 'Giới tính',
      width: 100,
      align: 'center',
      renderCell: (row) => (
        <Chip
          icon={row.gender === 'MALE' ? <Male /> : <Female />}
          label={row.gender === 'MALE' ? 'Nam' : 'Nữ'}
          size="small"
          color={row.gender === 'MALE' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Email sx={{ fontSize: 16, color: colors.textSecondary }} />
          <Typography variant="body2">{row.email}</Typography>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Số điện thoại',
      width: 130,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Phone sx={{ fontSize: 16, color: colors.textSecondary }} />
          <Typography variant="body2">{row.phone || '-'}</Typography>
        </Box>
      ),
    },
    {
      field: 'dateOfBirth',
      headerName: 'Ngày sinh',
      width: 120,
      renderCell: (row) => (
        <Typography variant="body2">
          {row.dateOfBirth
            ? new Date(row.dateOfBirth).toLocaleDateString('vi-VN')
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'programName',
      headerName: 'Chương trình',
      width: 250,
      renderCell: (row) => (
        <Tooltip title={row.programName || '-'}>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.programName || '-'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'accountStatus',
      headerName: 'Trạng thái',
      width: 120,
      align: 'center',
      renderCell: (row) => (
        <Chip
          label={row.accountStatus === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
          size="small"
          color={row.accountStatus === 'Active' ? 'success' : 'error'}
          variant="filled"
        />
      ),
    },
  ];

  // If still loading advised class
  if (loading && !advisedClass) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải thông tin lớp chủ nhiệm...</Typography>
      </Box>
    );
  }

  // If no advised class
  if (!advisedClass) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 3 }}>
          Quản lý sinh viên lớp chủ nhiệm
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bạn chưa được gán làm chủ nhiệm lớp nào
          </Typography>
          <Typography variant="body2">
            Vui lòng liên hệ phòng Đào tạo để được gán làm chủ nhiệm lớp.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: colors.text, mb: 1 }}
        >
          Quản lý sinh viên lớp chủ nhiệm
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ClassIcon sx={{ color: colors.primary }} />
          <Typography variant="h6" color={colors.primary} sx={{ fontWeight: 600 }}>
            {advisedClass.className} ({advisedClass.classCode})
          </Typography>
          <Chip label="Lớp chủ nhiệm" size="small" color="primary" variant="outlined" />
        </Box>
      </Box>

      {/* Statistics Cards */}
      {students.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                bgcolor: colors.bgPrimarySoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
                <People sx={{ fontSize: 50, mr: 2, color: colors.primary }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', mb: 0.5, color: colors.primary }}
                  >
                    {totalCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Tổng sinh viên
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                bgcolor: colors.bgSuccessSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
                <Male sx={{ fontSize: 50, mr: 2, color: colors.success }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', mb: 0.5, color: colors.success }}
                  >
                    {maleCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Nam
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                bgcolor: colors.bgErrorSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
                <Female sx={{ fontSize: 50, mr: 2, color: colors.error }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', mb: 0.5, color: colors.error }}
                  >
                    {femaleCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Nữ
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                bgcolor: colors.bgWarningSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
                <School sx={{ fontSize: 50, mr: 2, color: colors.warning }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', mb: 0.5, color: colors.warning }}
                  >
                    {activeCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Đang học
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={10}>
              <SearchableAutocomplete
                freeSolo
                options={[]}
                value={searchText}
                onInputChange={(event, newValue) => {
                  setSearchText(newValue);
                  setPage(0);
                }}
                getOptionLabel={(option) => option}
                label="Tìm kiếm sinh viên"
                placeholder="Nhập MSSV hoặc tên sinh viên..."
                showSearchIcon={true}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Tooltip title="Làm mới danh sách">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleRefresh}
                  disabled={loading}
                  startIcon={<Refresh />}
                  fullWidth
                >
                  Làm mới
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Students Table */}
      <DataTable
        columns={columns}
        rows={students}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyState={
          <>
            <People
              sx={{ fontSize: 80, color: alpha(colors.text, 0.2), mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy sinh viên nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchText
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Lớp này chưa có sinh viên'}
            </Typography>
          </>
        }
      />
    </Box>
  );
};

export default TeacherStudentsPage;
