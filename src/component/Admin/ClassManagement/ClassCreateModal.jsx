import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { message } from 'antd';
import { departmentService } from '../../../service/departmentService';
import academicProgramService from '../../../service/academicProgramService';
import { classService } from '../../../service/classService';

const ClassCreateModal = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [formData, setFormData] = useState({
    className: '',
    programId: '',
    lecturerId: null,
  });

  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Load departments khi mở modal
  useEffect(() => {
    if (open) {
      loadDepartments();
      // Reset form
      setFormData({
        className: '',
        programId: '',
        lecturerId: null,
      });
      setSelectedDepartment('');
      setPrograms([]);
    }
  }, [open]);

  // Load programs khi chọn department
  useEffect(() => {
    if (selectedDepartment) {
      loadPrograms(selectedDepartment);
    } else {
      setPrograms([]);
      setFormData((prev) => ({ ...prev, programId: '' }));
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    setLoadingData(true);
    try {
      const response = await departmentService.getDepartmentsDropdown();
      if (response) {
        setDepartments(response);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadPrograms = async (departmentId) => {
    setLoadingData(true);
    try {
      const response = await academicProgramService.getProgramsByDepartment(
        departmentId
      );
      if (response) {
        setPrograms(response);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.className.trim()) {
      message.warning('Vui lòng nhập tên lớp học!');
      return;
    }

    if (!formData.programId) {
      message.warning('Vui lòng chọn chương trình đào tạo!');
      return;
    }

    setLoading(true);
    try {
      const result = await classService.createClass(formData);
      if (result) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <AddIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            Tạo lớp học mới
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
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Tên lớp */}
            <TextField
              label="Tên lớp học"
              fullWidth
              required
              value={formData.className}
              onChange={(e) => handleChange('className', e.target.value)}
              placeholder="VD: DHKTPM17A"
            />

            {/* Chọn chuyên ngành */}
            <FormControl fullWidth required>
              <InputLabel>Chuyên ngành</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                label="Chuyên ngành"
              >
                <MenuItem value="">
                  <em>-- Chọn chuyên ngành --</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName} - {dept.facultyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Chọn chương trình đào tạo */}
            <FormControl fullWidth required disabled={!selectedDepartment}>
              <InputLabel>Chương trình đào tạo</InputLabel>
              <Select
                value={formData.programId}
                onChange={(e) => handleChange('programId', e.target.value)}
                label="Chương trình đào tạo"
              >
                <MenuItem value="">
                  <em>-- Chọn chương trình đào tạo --</em>
                </MenuItem>
                {programs.map((program) => (
                  <MenuItem key={program.academicProgramId} value={program.academicProgramId}>
                    {program.programName} - {program.degreeLevel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Lưu ý: Giảng viên chủ nhiệm có thể được phân công sau khi tạo lớp
              học
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
          disabled={loading || loadingData}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Đang tạo...' : 'Tạo lớp học'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassCreateModal;
