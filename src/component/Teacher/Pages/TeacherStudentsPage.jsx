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
  MenuItem,
  TextField,
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
  Download,
  CalendarToday,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { message } from 'antd';
import { studentServices } from '../../../service/studentServices';
import { classService } from '../../../service/classService';
import ExcelJS from 'exceljs';

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
  const [advisedClasses, setAdvisedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Fetch adviser classes on mount
  useEffect(() => {
    const fetchAdvisedClasses = async () => {
      setLoading(true);
      try {
        const classes = await classService.getAdviserClasses();
        if (classes && classes.length > 0) {
          setAdvisedClasses(classes);
          // Auto-select first class
          setSelectedClass(classes[0]);
        } else {
          setAdvisedClasses([]);
          setSelectedClass(null);
          message.warning('Bạn chưa được gán làm chủ nhiệm lớp nào');
        }
      } catch (error) {
        console.error('Error fetching advised classes:', error);
        setAdvisedClasses([]);
        setSelectedClass(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisedClasses();
  }, []);

  // Fetch students when class or search changes
  useEffect(() => {
    if (selectedClass && selectedClass.classId) {
      const timeoutId = setTimeout(() => {
        fetchStudents();
      }, 500); // Debounce 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [selectedClass, searchText, page, rowsPerPage]);

  const fetchStudents = async () => {
    if (!selectedClass || !selectedClass.classId) return;

    setLoading(true);
    try {
      const response = await studentServices.getStudentsWithLecturerClass(
        selectedClass.classId,
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
    if (selectedClass) {
      fetchStudents();
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    const selected = advisedClasses.find((c) => c.classId === classId);
    setSelectedClass(selected);
    setPage(0);
    setSearchText('');
  };

  const handleExportExcel = async () => {
    if (!selectedClass || !selectedClass.classId) {
      message.warning('Vui lòng chọn lớp');
      return;
    }

    setExporting(true);
    try {
      // Fetch all students (without pagination)
      const response = await studentServices.getStudentsWithLecturerClass(
        selectedClass.classId,
        1,
        9999,
        ''
      );

      if (!response || !response.items || response.items.length === 0) {
        message.warning('Không có sinh viên nào để xuất');
        setExporting(false);
        return;
      }

      const allStudents = response.items;

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh sách sinh viên');

      // Add title
      worksheet.mergeCells('A1:I1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `DANH SÁCH SINH VIÊN LỚP ${selectedClass.className}`;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 30;

      // Add class info
      worksheet.mergeCells('A2:I2');
      const infoCell = worksheet.getCell('A2');
      infoCell.value = `Mã lớp: ${selectedClass.classCode} | Chương trình: ${selectedClass.programName}`;
      infoCell.font = { size: 12, italic: true };
      infoCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 25;

      // Add export date
      worksheet.mergeCells('A3:I3');
      const dateCell = worksheet.getCell('A3');
      dateCell.value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
      dateCell.font = { size: 11, italic: true };
      dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(3).height = 20;

      // Add empty row
      worksheet.addRow([]);

      // Add headers
      const headerRow = worksheet.addRow([
        'STT',
        'MSSV',
        'Họ và tên',
        'Giới tính',
        'Ngày sinh',
        'Email',
        'Số điện thoại',
        'Chương trình',
        'Trạng thái',
      ]);

      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;

      // Add data rows
      allStudents.forEach((student, index) => {
        const row = worksheet.addRow([
          index + 1,
          student.mssv || '',
          student.fullName || '',
          student.gender === 'MALE'
            ? 'Nam'
            : student.gender === 'FEMALE'
              ? 'Nữ'
              : '',
          student.dateOfBirth
            ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN')
            : '',
          student.email || '',
          student.phone || '',
          student.programName || '',
          student.accountStatus === 'Active' ? 'Hoạt động' : 'Không hoạt động',
        ]);

        row.alignment = { vertical: 'middle' };
        row.height = 20;

        // Alternate row colors
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        }
      });

      // Set column widths
      worksheet.columns = [
        { width: 8 }, // STT
        { width: 15 }, // MSSV
        { width: 25 }, // Họ và tên
        { width: 12 }, // Giới tính
        { width: 15 }, // Ngày sinh
        { width: 30 }, // Email
        { width: 15 }, // Số điện thoại
        { width: 35 }, // Chương trình
        { width: 15 }, // Trạng thái
      ];

      // Add borders to all cells
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 3) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        }
      });

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Danh_sach_sinh_vien_${selectedClass.classCode}_${new Date().getTime()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      message.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      message.error('Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
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
  const activeCount = students.filter(
    (s) => s.accountStatus === 'Active'
  ).length;

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
          label={
            row.accountStatus === 'Active' ? 'Hoạt động' : 'Không hoạt động'
          }
          size="small"
          color={row.accountStatus === 'Active' ? 'success' : 'error'}
          variant="filled"
        />
      ),
    },
  ];

  // If still loading classes
  if (loading && advisedClasses.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Đang tải thông tin lớp chủ nhiệm...
        </Typography>
      </Box>
    );
  }

  // If no advised classes
  if (advisedClasses.length === 0) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: colors.text, mb: 3 }}
        >
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
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: colors.text, mb: 3 }}
      >
        Quản lý sinh viên lớp chủ nhiệm
      </Typography>

      {/* Statistics Cards */}

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Class Selector */}
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Chọn lớp"
                value={selectedClass?.classId || ''}
                onChange={handleClassChange}
                variant="outlined"
                size="small"
              >
                {advisedClasses.map((cls) => (
                  <MenuItem key={cls.classId} value={cls.classId}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cls.className} ({cls.classCode})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Search */}
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                label="Tìm kiếm sinh viên"
                placeholder="Nhập MSSV hoặc tên sinh viên..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                  ),
                }}
              />
            </Grid>

            {/* Export Button */}
            <Grid item xs={12} md={2}>
              <Tooltip title="Xuất danh sách ra Excel">
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleExportExcel}
                  disabled={loading || exporting || !selectedClass}
                  startIcon={
                    exporting ? <CircularProgress size={20} /> : <Download />
                  }
                  fullWidth
                >
                  {exporting ? 'Đang xuất...' : 'Xuất Excel'}
                </Button>
              </Tooltip>
            </Grid>

            {/* Refresh Button */}
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

          {/* Class Info Chips */}
          {selectedClass && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Chip
                icon={<ClassIcon />}
                label={selectedClass.programName}
                variant="outlined"
                color="primary"
                size="small"
              />
              <Chip
                icon={<CalendarToday />}
                label={`Ngày nhận: ${selectedClass?.assignedDate ? new Date(selectedClass.assignedDate).toLocaleDateString('vi-VN') : '-'}`}
                variant="outlined"
                size="small"
              />
              <Chip
                label={selectedClass?.assignmentStatus || 'Đang chủ nhiệm'}
                variant="filled"
                color="success"
                size="small"
              />
            </Box>
          )}
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
