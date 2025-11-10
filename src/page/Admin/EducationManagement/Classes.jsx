import React, { useState, useMemo } from 'react';
// Ant Design - Layout & Container
import { Row, Col, Button as AntButton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
// Material-UI - Kept for existing components
import { useTheme } from '@mui/material';
import {
  Class as ClassIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import ClassFilterBar from '../../../component/Admin/ClassesPage/ClassFilterBar';
import ClassTable from '../../../component/Admin/ClassesPage/ClassTable';
import ClassDetailDialog from '../../../component/Admin/ClassesPage/ClassDetailDialog';
import { StatCardAntd } from '../../../component/Shared/StatCard';

const Classes = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Sample data
  const classes = [
    {
      id: '1',
      classCode: 'IT101',
      className: 'Lập trình cơ bản',
      department: 'Công nghệ thông tin',
      major: 'Kỹ thuật phần mềm',
      year: 1,
      semester: 'HK1 2024-2025',
      instructor: 'TS. Nguyễn Văn A',
      studentCount: 35,
      maxStudents: 40,
      schedule: 'Thứ 2, 4, 6 - 7:30-9:30',
      room: 'A101',
      status: 'active',
      startDate: '2024-09-01',
      endDate: '2024-12-20',
    },
    {
      id: '2',
      classCode: 'BUS201',
      className: 'Quản trị học đại cương',
      department: 'Kinh tế',
      major: 'Quản trị kinh doanh',
      year: 2,
      semester: 'HK1 2024-2025',
      instructor: 'PGS. Trần Thị B',
      studentCount: 42,
      maxStudents: 45,
      schedule: 'Thứ 3, 5, 7 - 9:30-11:30',
      room: 'B203',
      status: 'active',
      startDate: '2024-09-01',
      endDate: '2024-12-20',
    },
    {
      id: '3',
      classCode: 'ENG301',
      className: 'Tiếng Anh chuyên ngành',
      department: 'Ngoại ngữ',
      major: 'Tiếng Anh',
      year: 3,
      semester: 'HK1 2024-2025',
      instructor: 'ThS. Lê Văn C',
      studentCount: 28,
      maxStudents: 30,
      schedule: 'Thứ 2, 4 - 13:30-16:30',
      room: 'C105',
      status: 'active',
      startDate: '2024-09-01',
      endDate: '2024-12-20',
    },
    {
      id: '4',
      classCode: 'MATH101',
      className: 'Toán cao cấp 1',
      department: 'Khoa học tự nhiên',
      major: 'Toán học',
      year: 1,
      semester: 'HK2 2023-2024',
      instructor: 'TS. Phạm Thị D',
      studentCount: 38,
      maxStudents: 40,
      schedule: 'Thứ 3, 6 - 7:30-10:30',
      room: 'D201',
      status: 'completed',
      startDate: '2024-02-01',
      endDate: '2024-05-30',
    },
  ];

  const filteredClasses = classes.filter((classInfo) => {
    const matchesSearch =
      classInfo.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classInfo.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classInfo.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !departmentFilter || classInfo.department === departmentFilter;
    const matchesStatus = !statusFilter || classInfo.status === statusFilter;
    const matchesYear = !yearFilter || classInfo.year.toString() === yearFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesYear;
  });

  // Statistics
  const stats = useMemo(() => {
    const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
    const activeClasses = classes.filter((c) => c.status === 'active').length;
    const uniqueDepartments = new Set(classes.map((c) => c.department));
    return {
      total: classes.length,
      active: activeClasses,
      totalStudents: totalStudents,
      departments: uniqueDepartments.size,
    };
  }, [classes]);

  const handleViewClass = (classInfo) => {
    setSelectedClass(classInfo);
    setViewDialogOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setStatusFilter('');
    setYearFilter('');
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setPage(0);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredClasses.map((classInfo, index) => ({
      STT: index + 1,
      'Mã lớp': classInfo.classCode,
      'Tên lớp': classInfo.className,
      Khoa: classInfo.department,
      'Chuyên ngành': classInfo.major,
      Năm: classInfo.year,
      'Học kỳ': classInfo.semester,
      'Giảng viên': classInfo.instructor,
      'Sĩ số': `${classInfo.studentCount}/${classInfo.maxStudents}`,
      'Lịch học': classInfo.schedule,
      Phòng: classInfo.room,
      'Trạng thái':
        classInfo.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách lớp học');

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
      `Danh_sach_lop_hoc_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: 8, fontSize: 24 }}>
            Quản lý lớp học phần
          </h2>
          <div style={{ color: '#888', fontSize: 14 }}>
            Quản lý thông tin các lớp học phần và sinh viên
          </div>
        </div>
        <AntButton type="primary" icon={<PlusOutlined />} size="large">
          Thêm lớp học
        </AntButton>
      </div>

      {/* Stats Cards - Ant Design */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Tổng lớp học"
            value={stats.total}
            icon={ClassIcon}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Lớp đang hoạt động"
            value={stats.active}
            icon={CheckCircleIcon}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Tổng sinh viên"
            value={stats.totalStudents}
            icon={PeopleIcon}
            color="#1890ff"
            bgColor="#e6f7ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Khoa/Phòng ban"
            value={stats.departments}
            icon={SchoolIcon}
            color="#fa8c16"
            bgColor="#fff7e6"
          />
        </Col>
      </Row>

      <ClassFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={handleClearFilters}
        onExportExcel={handleExportExcel}
      />

      <ClassTable
        classes={filteredClasses}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        onViewClass={handleViewClass}
      />

      <ClassDetailDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        classData={selectedClass}
      />
    </div>
  );
};

export default Classes;
