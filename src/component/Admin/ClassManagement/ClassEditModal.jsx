import React, { useState, useEffect, useRef } from 'react';
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
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { message } from 'antd';
import { departmentService } from '../../../service/departmentService';
import academicProgramService from '../../../service/academicProgramService';
import { classService } from '../../../service/classService';

const ClassEditModal = ({ open, onClose, onSuccess, classData }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const previousDepartmentRef = useRef(null); // Track previous department

  const [formData, setFormData] = useState({
    className: '',
    programId: '',
    lecturerId: '',
  });

  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Reset khi đóng modal
  useEffect(() => {
    if (!open) {
      setFormData({
        className: '',
        programId: '',
        lecturerId: '',
      });
      setSelectedDepartment('');
      setPrograms([]);
      setDepartments([]);
      setIsInitialLoad(true);
      previousDepartmentRef.current = null; // Reset ref
    }
  }, [open]);

  // Load dữ liệu khi mở modal
  useEffect(() => {
    const initializeModal = async () => {
      if (open && classData) {
        setIsInitialLoad(true);
        setLoadingData(true);

        // Load departments
        const deptResponse = await departmentService.getDepartmentsDropdown();
        if (deptResponse) {
          setDepartments(deptResponse);
        }
        let progResponse = [];
        // Load programs nếu có departmentId
        if (classData.departmentId) {
          progResponse = await academicProgramService.getProgramsByDepartment(
            classData.departmentId
          );
          if (progResponse) {
            setPrograms(progResponse);
          }
        }

        // Set tất cả giá trị cùng lúc sau khi đã load xong
        setSelectedDepartment(classData.departmentId || '');
        setFormData({
          className: classData.className || '',
          programId: classData.programId ?? '', // Dùng ?? thay vì || để tránh mất giá trị 0
          lecturerId: classData.adviserId || '',
        });

        setLoadingData(false);
        setIsInitialLoad(false);
      }
    };

    initializeModal();
  }, [open, classData]);

  // Load programs khi user thay đổi department (chỉ khi không phải initial load)
  useEffect(() => {
    // Chỉ chạy nếu selectedDepartment thực sự thay đổi (khác với giá trị trước)
    const hasChanged =
      previousDepartmentRef.current !== null &&
      previousDepartmentRef.current !== '' &&
      previousDepartmentRef.current !== selectedDepartment;

    if (open && !isInitialLoad && selectedDepartment && hasChanged) {
      // Reset cả programs và programId đồng thời
      setPrograms([]);
      setFormData((prev) => ({
        ...prev,
        programId: '',
      }));
      loadPrograms(selectedDepartment);
    }
    // Update ref
    previousDepartmentRef.current = selectedDepartment;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartment]);

  const loadPrograms = async (departmentId) => {
    setLoadingData(true);
    try {
      const response =
        await academicProgramService.getProgramsByDepartment(departmentId);
      if (response?.data) {
        setPrograms(response.data);
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
      const result = await classService.updateClass(
        classData.classId,
        formData
      );
      if (result) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error updating class:', error);
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
          <EditIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            Chỉnh sửa lớp học
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
                value={selectedDepartment || ''}
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
                value={formData.programId || ''}
                onChange={(e) => handleChange('programId', e.target.value)}
                label="Chương trình đào tạo"
              >
                <MenuItem value="">
                  <em>-- Chọn chương trình đào tạo --</em>
                </MenuItem>
                {programs.map((program) => {
                  return (
                    <MenuItem
                      key={program.academicProgramId}
                      value={program.academicProgramId}
                    >
                      {program.programName} - {program.degreeLevel}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Lưu ý: Để phân công giảng viên chủ nhiệm, vui lòng sử dụng chức
              năng "Phân công chủ nhiệm" trong danh sách lớp học
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
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassEditModal;
