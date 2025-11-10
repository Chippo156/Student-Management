import React, { useState, useMemo, useEffect } from 'react';
// Ant Design - Layout & Container
import {
  Row,
  Col,
  Card as AntCard,
  Input,
  Select as AntSelect,
  Button as AntButton,
  Space,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
// Material-UI - Table & Animations
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Box,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import curriculumCourseService from '../../../service/curriculumCourseService';
import academicProgramService from '../../../service/academicProgramService';
import { facultyService } from '../../../service/facultyService';
import { departmentService } from '../../../service/departmentService';
import { classService } from '../../../service/classService';
import * as XLSX from 'xlsx';
import { StatCardAntd } from '../../../component/Shared/StatCard';

const CourseManagement = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCourseType, setFilterCourseType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Dropdown states
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Fetch programs for filter
  useEffect(() => {
    const fetchPrograms = async () => {
      const result = await academicProgramService.getAllPrograms({
        pageSize: 100,
      });
      if (result) {
        setPrograms(result.items || []);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch faculties for dropdown
  useEffect(() => {
    const fetchFaculties = async () => {
      const data = await facultyService.getFacultiesDropdown();
      if (data) {
        setFaculties(data);
      }
    };
    fetchFaculties();
  }, []);

  // Fetch departments when faculty changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (selectedFaculty) {
        const data =
          await departmentService.getDepartmentsDropdownByFaculty(
            selectedFaculty
          );
        if (data) {
          setDepartments(data);
        }
        setSelectedDepartment('');
        setClasses([]);
        setSelectedClass('');
      } else {
        setDepartments([]);
        setSelectedDepartment('');
        setClasses([]);
        setSelectedClass('');
      }
    };
    fetchDepartments();
  }, [selectedFaculty]);

  // Fetch classes when department changes
  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedDepartment) {
        const data =
          await classService.getClassesDropdownByDepartment(selectedDepartment);
        if (data) {
          setClasses(data);
        }
        setSelectedClass('');
      } else {
        setClasses([]);
        setSelectedClass('');
      }
    };
    fetchClasses();
  }, [selectedDepartment]);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage, searchTerm, filterProgram, filterDepartment]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = await curriculumCourseService.getAllCurriculumCourses({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        courseCode: searchTerm,
        courseName: searchTerm,
        programId: filterProgram || null,
        departmentId: filterDepartment || null,
      });

      if (result) {
        setCourses(result.items || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCourseType =
        !filterCourseType ||
        (filterCourseType === 'required' && course.isRequired) ||
        (filterCourseType === 'elective' && !course.isRequired);
      return matchesCourseType;
    });
  }, [courses, filterCourseType]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Export to Excel

  const handleExportExcel = () => {
    const exportData = filteredCourses.map((course, index) => ({
      STT: index + 1,
      'Mã môn học': course.courseCode,
      'Tên môn học': course.courseName,
      'Chương trình': course.programName,
      'Bậc đào tạo': course.degreeLevel,
      'Chuyên ngành': course.departmentName,
      'Tổng tín chỉ': course.totalCredits,
      'Tín chỉ lý thuyết': course.creditsTheory,
      'Tín chỉ thực hành': course.creditsLab,
      'Học kỳ đề xuất': course.semesterSuggested,
      'Loại môn học': course.courseType,
      'Môn tiên quyết': course.prerequisites
        .map((p) => p.courseCode)
        .join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách môn học');

    // Auto-size columns
    const maxWidth = exportData.reduce((acc, row) => {
      Object.keys(row).forEach((key, index) => {
        const cellLength = String(row[key]).length;
        acc[index] = Math.max(acc[index] || 10, cellLength);
      });
      return acc;
    }, []);

    worksheet['!cols'] = maxWidth.map((w) => ({ width: Math.min(w + 2, 50) }));

    XLSX.writeFile(
      workbook,
      `Danh_sach_mon_hoc_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(courses.map((c) => c.departmentName));
    return Array.from(depts);
  }, [courses]);

  const stats = useMemo(() => {
    return {
      total: totalCount,
      required: courses.filter((c) => c.isRequired).length,
      elective: courses.filter((c) => !c.isRequired).length,
      departments: uniqueDepartments.length,
    };
  }, [courses, totalCount, uniqueDepartments]);

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8, fontSize: 24 }}>
          Quản lý môn học
        </h2>
        <div style={{ color: '#888', fontSize: 14 }}>
          Quản lý thông tin môn học trong chương trình đào tạo
        </div>
      </div>

      {/* Stats Cards - Ant Design */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Tổng môn học"
            value={stats.total}
            icon={MenuBookIcon}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Môn bắt buộc"
            value={stats.required}
            icon={AssignmentIcon}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Môn tự chọn"
            value={stats.elective}
            icon={CategoryIcon}
            color="#1890ff"
            bgColor="#e6f7ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Chuyên ngành"
            value={stats.departments}
            icon={SchoolIcon}
            color="#fa8c16"
            bgColor="#fff7e6"
          />
        </Col>
      </Row>

      {/* Filter, Search and Export - Ant Design */}
      <AntCard style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm theo mã môn, tên môn..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} md={4}>
            <AntSelect
              placeholder="Chương trình"
              value={filterProgram || undefined}
              onChange={(value) => setFilterProgram(value || '')}
              size="large"
              style={{ width: '100%' }}
            >
              <AntSelect.Option value="">Tất cả</AntSelect.Option>
              {programs.map((prog) => (
                <AntSelect.Option
                  key={prog.academicProgramId}
                  value={prog.academicProgramId}
                >
                  {prog.programName}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Col>
          <Col xs={24} md={4}>
            <AntSelect
              placeholder="Chuyên ngành"
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
          <Col xs={24} md={3}>
            <AntSelect
              placeholder="Loại môn học"
              value={filterCourseType || undefined}
              onChange={(value) => setFilterCourseType(value || '')}
              size="large"
              style={{ width: '100%' }}
            >
              <AntSelect.Option value="">Tất cả</AntSelect.Option>
              <AntSelect.Option value="required">Bắt buộc</AntSelect.Option>
              <AntSelect.Option value="elective">Tự chọn</AntSelect.Option>
            </AntSelect>
          </Col>
          <Col xs={24} md={3}>
            <AntButton
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              disabled={filteredCourses.length === 0}
              size="large"
              style={{
                width: '100%',
                background: '#52c41a',
                borderColor: '#52c41a',
              }}
            >
              Xuất Excel
            </AntButton>
          </Col>
          <Col xs={24} md={4}>
            <AntButton
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ width: '100%' }}
            >
              Thêm môn học
            </AntButton>
          </Col>
        </Row>
      </AntCard>

      {/* Courses Table - Material-UI for animations */}
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
                    <TableCell sx={{ fontWeight: 600 }}>Mã môn học</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tên môn học</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Chương trình</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Chuyên Ngành</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tín chỉ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Học kỳ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow
                      key={course.curriculumCourseId}
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
                          {course.courseCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {course.courseName}
                        </Typography>
                        {course.prerequisites.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Tiên quyết:{' '}
                            {course.prerequisites
                              .map((p) => p.courseCode)
                              .join(', ')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {course.programName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.degreeLevel}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={course.departmentName}
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {course.totalCredits}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          LT: {course.creditsTheory} | TH: {course.creditsLab}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          HK {course.semesterSuggested}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={course.courseType}
                          size="small"
                          sx={{
                            backgroundColor: course.isRequired
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.warning.main, 0.1),
                            color: course.isRequired
                              ? theme.palette.success.main
                              : theme.palette.warning.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              sx={{
                                color: '#fa8c16',
                                '&:hover': {
                                  backgroundColor: alpha('#fa8c16', 0.1),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                  backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
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

export default CourseManagement;
