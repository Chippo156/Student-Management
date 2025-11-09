import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { getStatusColor, getStatusLabel, getCapacityColor } from './constants';

/**
 * ClassTable - Table hiển thị danh sách lớp học
 */
const ClassTable = ({
  classes,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewClass,
  onEditClass,
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Lớp học</TableCell>
              <TableCell>Khoa/Ngành</TableCell>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Sĩ số</TableCell>
              <TableCell>Lịch học</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((classInfo) => (
                <TableRow key={classInfo.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {classInfo.className}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {classInfo.classCode} • {classInfo.semester}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {classInfo.department}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {classInfo.major} - Năm {classInfo.year}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'secondary.main',
                        }}
                      >
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">{classInfo.instructor}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GroupsIcon color="action" />
                      <Chip
                        label={`${classInfo.studentCount}/${classInfo.maxStudents}`}
                        color={getCapacityColor(
                          classInfo.studentCount,
                          classInfo.maxStudents
                        )}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{classInfo.schedule}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Phòng: {classInfo.room}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(classInfo.status)}
                      color={getStatusColor(classInfo.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => onViewClass(classInfo)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEditClass?.(classInfo)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={classes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Paper>
  );
};

export default ClassTable;
