import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Grow,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import { Table, Space, Tag, Input } from 'antd';
import {
  People,
  School,
  CheckCircle,
  Search as SearchIcon,
  FileDownload,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import sectionService from '../../../service/sectionService';
import { studentServices } from '../../../service/studentServices';
import * as XLSX from 'xlsx';
const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  useEffect(() => {
    const fetchSections = async () => {
      try {
        // Fetch sections for lecturer
        const sectionsResponse = await sectionService.getSectionsByLecturer({
          pageNumber: 1,
          pageSize: 100, // Get all sections
        });
        const sectionsData = sectionsResponse?.items || [];
        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    if (lecturerId) {
      fetchSections();
    }
  }, [lecturerId]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        if (selectedSection === 'all') {
          // Fetch students from all sections
          const allStudents = [];
          for (const section of sections) {
            try {
              const studentsResponse = await studentServices.getStudentsWithSection(
                section.sectionId,
                1,
                100, // Get all students from this section
                searchText
              );
              const studentsData = studentsResponse?.items || [];
              studentsData.forEach((student) => {
                allStudents.push({
                  ...student,
                  sectionId: section.sectionId,
                  sectionCode: section.sectionCode,
                  courseName: section.courseName,
                  courseCode: section.courseCode,
                });
              });
            } catch (error) {
              console.error(
                `Error fetching students for section ${section.sectionId}:`,
                error
              );
            }
          }
          setStudents(allStudents);
          setPagination(prev => ({ ...prev, total: allStudents.length }));
        } else {
          // Fetch students for selected section
          const studentsResponse = await studentServices.getStudentsWithSection(
            selectedSection,
            pagination.current,
            pagination.pageSize,
            searchText
          );
          const studentsData = studentsResponse?.items || [];
          const selectedSectionData = sections.find(s => s.sectionId === selectedSection);

          const enrichedStudents = studentsData.map((student) => ({
            ...student,
            sectionId: selectedSection,
            sectionCode: selectedSectionData?.sectionCode,
            courseName: selectedSectionData?.courseName,
            courseCode: selectedSectionData?.courseCode,
          }));

          setStudents(enrichedStudents);
          setPagination(prev => ({
            ...prev,
            total: studentsResponse?.totalCount || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sections.length > 0) {
      fetchStudents();
    }
  }, [selectedSection, sections, searchText, pagination.current, pagination.pageSize]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const handleExportExcel = () => {
    const dataToExport = students.map((student, index) => ({
      'STT': index + 1,
      'MSSV': student.mssv,
      'Họ và tên': student.fullName,
      'Email': student.email,
      'Số điện thoại': student.phone || '',
      'Lớp': student.className,
      'Mã lớp HP': student.sectionCode,
      'Môn học': student.courseName,
      'Mã môn học': student.courseCode,
      'Nhóm TH': student.practiceGroupName || 'Chưa có nhóm',
      'Trạng thái ĐK': student.enrollmentStatus,
      'Điểm cuối kỳ': student.finalScore || '',
      'Điểm chữ': student.gradeLetter || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên');

    // Set column widths
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 12 }, // MSSV
      { wch: 25 }, // Họ và tên
      { wch: 30 }, // Email
      { wch: 15 }, // SĐT
      { wch: 15 }, // Lớp
      { wch: 15 }, // Mã lớp HP
      { wch: 35 }, // Môn học
      { wch: 12 }, // Mã MH
      { wch: 15 }, // Nhóm TH
      { wch: 15 }, // Trạng thái
      { wch: 12 }, // Điểm
      { wch: 10 }, // Điểm chữ
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_sinh_vien_${new Date().getTime()}.xlsx`);
  };

  const handleRefresh = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    // Trigger refetch by updating dependencies
  };

  // Calculate statistics
  const totalStudents = students.length;
  const uniqueStudents = new Set(students.map((s) => s.studentId)).size;
  const activeSections = sections.filter((s) => s.status === 1).length;

  // Ant Design Table columns
  const columns = [
    {
      title: 'MSSV',
      dataIndex: 'mssv',
      key: 'mssv',
      width: 120,
      // removed fixed: 'left' to avoid sticky stacking issues
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
      // removed onHeaderCell/onCell zIndex tweaks
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar sx={{ width: 32, height: 32 }}>
            {text?.charAt(0).toUpperCase()}
          </Avatar>
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      width: 120,
    },
    {
      title: 'Môn học',
      key: 'course',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.courseName}</div>
          <Tag color="blue">{record.courseCode}</Tag>
          <Tag color="green">{record.sectionCode}</Tag>
        </div>
      ),
    },
    {
      title: 'Nhóm thực hành',
      dataIndex: 'practiceGroupName',
      key: 'practiceGroupName',
      width: 150,
    },
    {
      title: 'Trạng thái ĐK',
      dataIndex: 'enrollmentStatus',
      key: 'enrollmentStatus',
      width: 120,
      render: (status) => {
        const isRegistered = status === 'Đã đăng ký';
        return <Tag color={isRegistered ? 'success' : 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      // removed fixed: 'right'
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Fade in={true} timeout={600}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
            Quản lý Sinh viên
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Làm mới">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#e3f2fd' },
                  boxShadow: 1,
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={students.length === 0}
              sx={{
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' },
                textTransform: 'none',
                px: 3,
                boxShadow: 2,
              }}
            >
              Xuất Excel
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                bgcolor: '#e3f2fd',
                boxShadow: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
                <People sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}>
                    {uniqueStudents}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#424242' }}>
                    Tổng sinh viên
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={1000}>
            <Card
              sx={{
                bgcolor: '#f3e5f5',
                boxShadow: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
                <School sx={{ fontSize: 50, mr: 2, color: '#7b1fa2' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#7b1fa2' }}>
                    {totalStudents}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#424242' }}>
                    Lượt đăng ký
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={1200}>
            <Card
              sx={{
                bgcolor: '#e8f5e9',
                boxShadow: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
                <CheckCircle sx={{ fontSize: 50, mr: 2, color: '#388e3c' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#388e3c' }}>
                    {activeSections}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#424242' }}>
                    Lớp đang dạy
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Filter Section */}
      <Fade in={true} timeout={1000}>
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterList sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Bộ lọc tìm kiếm
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm theo MSSV, tên, email..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lớp học phần</InputLabel>
                  <Select
                    value={selectedSection}
                    label="Lớp học phần"
                    onChange={(e) => {
                      setSelectedSection(e.target.value);
                      setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                  >
                    <MenuItem value="all">Tất cả lớp học phần</MenuItem>
                    {sections.map((section) => (
                      <MenuItem key={section.sectionId} value={section.sectionId}>
                        {section.courseName} ({section.sectionCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchText('');
                    setSelectedSection('all');
                  }}
                  sx={{ height: '40px' }}
                >
                  Đặt lại
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tìm thấy: <strong>{students.length}</strong> sinh viên
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Students Table */}
      <Fade in={true} timeout={1200}>
        <Card>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <div style={{ maxWidth: 1200, padding: 12 }}>
              <Table
                columns={columns}
                dataSource={students}
                loading={loading}
                rowKey={(record) => `${record.studentId}-${record.sectionId}`}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số ${total} sinh viên`,
                  onChange: (page, pageSize) => {
                    setPagination(prev => ({ ...prev, current: page, pageSize }));
                  },
                }}
                scroll={{ x: 'max-content' }}
                // ensure rows render below header/controls
                onRow={(record) => ({ style: { position: 'relative', zIndex: 1 } })}
                style={{ borderCollapse: 'separate' }}
              />
            </div>
          </div>
        </Card>
      </Fade>

      {/* Student Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Thông tin chi tiết sinh viên
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }}>
                  {selectedStudent.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {selectedStudent.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  MSSV: {selectedStudent.mssv}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số điện thoại:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.phone || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Lớp:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.className}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Môn học:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.courseName} ({selectedStudent.courseCode})
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Lớp học phần:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.sectionCode}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nhóm thực hành:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.practiceGroupName || 'Chưa có nhóm'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái đăng ký:
                </Typography>
                <Chip
                  label={selectedStudent.enrollmentStatus}
                  color={
                    selectedStudent.enrollmentStatus === 'Đã đăng ký' ? 'success' : 'default'
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Điểm cuối kỳ:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.finalScore || 'Chưa có'} {selectedStudent.gradeLetter && `(${selectedStudent.gradeLetter})`}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsPage;
