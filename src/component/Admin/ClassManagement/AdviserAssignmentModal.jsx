import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { message } from 'antd';
import { lecturerService } from '../../../service/lecturerService';
import { adviserAssignmentService } from '../../../service/adviserAssignmentService';

const AdviserAssignmentModal = ({ open, onClose, onSuccess, classData }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');

  useEffect(() => {
    if (open && classData) {
      loadLecturers();
      setSelectedLecturerId('');
    }
  }, [open, classData]);

  const loadLecturers = async () => {
    if (!classData?.departmentId) {
      message.warning('Không tìm thấy thông tin chuyên ngành của lớp học');
      return;
    }

    setLoadingLecturers(true);
    try {
      const response = await lecturerService.getLecturersByDepartment(
        classData.departmentId
      );
      if (response?.data) {
        setLecturers(response.data);
      }
    } catch (error) {
      console.error('Error loading lecturers:', error);
    } finally {
      setLoadingLecturers(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLecturerId) {
      message.warning('Vui lòng chọn giảng viên!');
      return;
    }

    setLoading(true);
    try {
      const result = await adviserAssignmentService.assignLecturerToClass(
        selectedLecturerId,
        classData.classId
      );
      if (result) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error assigning lecturer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!classData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.dark,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonAddIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            Phân công chủ nhiệm
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        {/* Thông tin lớp học */}
        <Alert
          icon={<InfoIcon />}
          severity="info"
          sx={{
            mb: 3,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            '& .MuiAlert-icon': {
              color: theme.palette.info.main,
            },
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Lớp học: {classData.className}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Chuyên ngành: {classData.departmentName}
          </Typography>
          {classData.adviserName && classData.adviserName !== 'Chưa phân công' && (
            <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
              Hiện tại: {classData.adviserName} ({classData.adviserCode})
            </Typography>
          )}
        </Alert>

        {loadingLecturers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Chọn giảng viên */}
            <FormControl fullWidth required>
              <InputLabel>Chọn giảng viên chủ nhiệm</InputLabel>
              <Select
                value={selectedLecturerId}
                onChange={(e) => setSelectedLecturerId(e.target.value)}
                label="Chọn giảng viên chủ nhiệm"
              >
                <MenuItem value="">
                  <em>-- Chọn giảng viên --</em>
                </MenuItem>
                {lecturers.map((lecturer) => (
                  <MenuItem key={lecturer.id} value={lecturer.id}>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {lecturer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Mã GV: {lecturer.lecturerCode}
                        {lecturer.email && ` - ${lecturer.email}`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {lecturers.length === 0 && (
              <Alert severity="warning">
                Không tìm thấy giảng viên thuộc chuyên ngành{' '}
                {classData.departmentName}
              </Alert>
            )}

            <Typography variant="caption" color="text.secondary">
              Lưu ý: Chỉ hiển thị danh sách giảng viên thuộc chuyên ngành{' '}
              <strong>{classData.departmentName}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingLecturers || !selectedLecturerId}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Đang phân công...' : 'Phân công'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdviserAssignmentModal;
