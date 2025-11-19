import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import sectionService from '../../../service/sectionService';

const SectionCreateModal = ({ open, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState(null);
  const [formData, setFormData] = useState({
    curriculumCourseId: '',
    lecturerId: '',
    semesterId: '',
    classId: '',
    startDate: '',
    endDate: '',
    capacity: '',
    minEnrollment: '',
    minEnrollmentPercentage: '',
  });
  const [errors, setErrors] = useState({});

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (open) {
      fetchDropdownData();
      // Reset form
      setFormData({
        curriculumCourseId: '',
        lecturerId: '',
        semesterId: '',
        classId: '',
        startDate: '',
        endDate: '',
        capacity: '',
        minEnrollment: '',
        minEnrollmentPercentage: '',
      });
      setErrors({});
    }
  }, [open]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const data = await sectionService.getSectionDropdownAll();
      if (data) {
        setDropdownData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.curriculumCourseId) {
      newErrors.curriculumCourseId = 'Vui lòng chọn môn học';
    }
    if (!formData.lecturerId) {
      newErrors.lecturerId = 'Vui lòng chọn giảng viên';
    }
    if (!formData.semesterId) {
      newErrors.semesterId = 'Vui lòng chọn học kỳ';
    }
    if (!formData.classId) {
      newErrors.classId = 'Vui lòng chọn lớp';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Vui lòng nhập sức chứa hợp lệ';
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const submitData = {
        curriculumCourseId: parseInt(formData.curriculumCourseId),
        lecturerId: parseInt(formData.lecturerId),
        semesterId: parseInt(formData.semesterId),
        classId: parseInt(formData.classId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        capacity: parseInt(formData.capacity),
        minEnrollment: formData.minEnrollment ? parseInt(formData.minEnrollment) : null,
        minEnrollmentPercentage: formData.minEnrollmentPercentage
          ? parseFloat(formData.minEnrollmentPercentage)
          : null,
      };

      const result = await sectionService.createSection(submitData);
      if (result) {
        onSave(result);
      }
    } catch (error) {
      console.error('Failed to create section:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!dropdownData && loading) {
    return (
      <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tạo lớp học phần mới
          </Typography>
          <IconButton onClick={onCancel} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Môn học */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.curriculumCourseId} required>
              <InputLabel>Môn học</InputLabel>
              <Select
                value={formData.curriculumCourseId}
                label="Môn học"
                onChange={handleChange('curriculumCourseId')}
                disabled={loading}
              >
                {dropdownData?.curriculumCourses?.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name} ({course.credits} tín chỉ)
                  </MenuItem>
                ))}
              </Select>
              {errors.curriculumCourseId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.curriculumCourseId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Giảng viên */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.lecturerId} required>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={formData.lecturerId}
                label="Giảng viên"
                onChange={handleChange('lecturerId')}
                disabled={loading}
              >
                {dropdownData?.lecturers?.map((lecturer) => (
                  <MenuItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.name} ({lecturer.lecturerCode})
                  </MenuItem>
                ))}
              </Select>
              {errors.lecturerId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.lecturerId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Học kỳ */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.semesterId} required>
              <InputLabel>Học kỳ</InputLabel>
              <Select
                value={formData.semesterId}
                label="Học kỳ"
                onChange={handleChange('semesterId')}
                disabled={loading}
              >
                {dropdownData?.semesters?.map((semester) => (
                  <MenuItem key={semester.id} value={semester.id}>
                    {semester.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.semesterId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.semesterId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Lớp */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.classId} required>
              <InputLabel>Lớp</InputLabel>
              <Select
                value={formData.classId}
                label="Lớp"
                onChange={handleChange('classId')}
                disabled={loading}
              >
                {dropdownData?.classes?.map((classItem) => (
                  <MenuItem key={classItem.classId} value={classItem.classId}>
                    {classItem.className} - {classItem.programName}
                  </MenuItem>
                ))}
              </Select>
              {errors.classId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.classId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Ngày bắt đầu */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={handleChange('startDate')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.startDate}
              helperText={errors.startDate}
              required
              disabled={loading}
            />
          </Grid>

          {/* Ngày kết thúc */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={handleChange('endDate')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.endDate}
              helperText={errors.endDate}
              required
              disabled={loading}
            />
          </Grid>

          {/* Sức chứa */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Sức chứa"
              type="number"
              value={formData.capacity}
              onChange={handleChange('capacity')}
              error={!!errors.capacity}
              helperText={errors.capacity}
              inputProps={{ min: 1 }}
              required
              disabled={loading}
            />
          </Grid>

          {/* Số lượng tối thiểu */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Số lượng tối thiểu"
              type="number"
              value={formData.minEnrollment}
              onChange={handleChange('minEnrollment')}
              inputProps={{ min: 0 }}
              disabled={loading}
              helperText="Tùy chọn"
            />
          </Grid>

          {/* Tỷ lệ tối thiểu */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tỷ lệ tối thiểu (%)"
              type="number"
              value={formData.minEnrollmentPercentage}
              onChange={handleChange('minEnrollmentPercentage')}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              disabled={loading}
              helperText="Tùy chọn"
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              Lưu ý: Ngày bắt đầu và ngày kết thúc phải nằm trong khoảng thời gian của học kỳ đã chọn.
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Tạo lớp học phần'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SectionCreateModal;
