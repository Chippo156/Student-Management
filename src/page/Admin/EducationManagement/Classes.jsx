import React, { useState } from 'react';
import { Box, Typography, Avatar, Fab } from '@mui/material';
import { Class as ClassIcon, Add as AddIcon } from '@mui/icons-material';
import ClassFilterBar from '../../../component/Admin/ClassesPage/ClassFilterBar';
import ClassTable from '../../../component/Admin/ClassesPage/ClassTable';
import ClassDetailDialog from '../../../component/Admin/ClassesPage/ClassDetailDialog';

const Classes = () => {
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

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <ClassIcon />
          </Avatar>
          <Typography variant="h4" component="h1">
            Quản lý lớp học
          </Typography>
        </Box>
        <Fab color="primary" aria-label="add" size="medium">
          <AddIcon />
        </Fab>
      </Box>

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
    </Box>
  );
};

export default Classes;
