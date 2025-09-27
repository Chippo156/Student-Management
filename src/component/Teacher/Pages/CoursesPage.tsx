import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { School, People, Schedule } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { teacherService, courseService } from '../../../service';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const user = useSelector((state: any) => state.user.account);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await teacherService.getTeacherCourses(user.userId);
        const coursesData = response.data || [];
        
        // Lấy thêm thông tin số lượng sinh viên cho mỗi môn học
        const coursesWithStudentCount = await Promise.all(
          coursesData.map(async (course: any) => {
            try {
              const studentsResponse = await courseService.getCourseStudents(course.id);
              return {
                ...course,
                studentCount: studentsResponse.data?.length || 0
              };
            } catch {
              return {
                ...course,
                studentCount: 0
              };
            }
          })
        );
        
        setCourses(coursesWithStudentCount);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.userId) {
      fetchCourses();
    }
  }, [user.userId]);

  const getStatusChip = (status: string) => {
    const statusConfig = {
      active: { label: 'Đang diễn ra', color: 'success' as const },
      upcoming: { label: 'Sắp bắt đầu', color: 'warning' as const },
      completed: { label: 'Đã kết thúc', color: 'default' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Môn học của tôi
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <School sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {courses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng môn học
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#e8f5e8' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <People sx={{ fontSize: 40, color: '#388e3c', mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {courses.reduce((total: number, course: any) => total + course.studentCount, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng sinh viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#fff3e0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: '#f57c00', mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {courses.filter((course: any) => course.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang diễn ra
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Courses Table */}
      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Mã môn học</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên môn học</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Số tín chỉ</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Số sinh viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course: any) => (
                <TableRow key={course.id} hover>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.studentCount}</TableCell>
                  <TableCell>{getStatusChip(course.status)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mr: 1 }}
                      onClick={() => {/* Navigate to course detail */}}
                    >
                      Xem chi tiết
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => {/* Navigate to gradebook */}}
                    >
                      Chấm điểm
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {courses.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Bạn chưa có môn học nào được phân công
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CoursesPage;