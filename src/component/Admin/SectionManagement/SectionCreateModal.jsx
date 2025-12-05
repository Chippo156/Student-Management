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
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import sectionService from '../../../service/sectionService';
import SearchableAutocomplete from '../../Common/SearchableAutocomplete';

const SectionCreateModal = ({ open, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState(null);
  const [formData, setFormData] = useState({
    curriculumCourse: null,
    lecturer: null,
    semester: null,
    classItem: null,
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
        curriculumCourse: null,
        lecturer: null,
        semester: null,
        classItem: null,
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

    if (!formData.curriculumCourse) {
      newErrors.curriculumCourse = 'Vui lòng chọn môn học';
    }
    if (!formData.lecturer) {
      newErrors.lecturer = 'Vui lòng chọn giảng viên';
    }
    if (!formData.semester) {
      newErrors.semester = 'Vui lòng chọn học kỳ';
    }
    if (!formData.classItem) {
      newErrors.classItem = 'Vui lòng chọn lớp';
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
        curriculumCourseId: parseInt(formData.curriculumCourse.id),
        lecturerId: parseInt(formData.lecturer.id),
        semesterId: parseInt(formData.semester.id),
        classId: parseInt(formData.classItem.classId),
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
            <SearchableAutocomplete
              options={dropdownData?.curriculumCourses || []}
              value={formData.curriculumCourse}
              onChange={(event, newValue) => {
                setFormData((prev) => ({ ...prev, curriculumCourse: newValue }));
                if (errors.curriculumCourse) {
                  setErrors((prev) => ({ ...prev, curriculumCourse: '' }));
                }
              }}
              getOptionLabel={(option) => `${option.name} (${option.credits} tín chỉ)`}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              label="Môn học"
              placeholder="Tìm môn học..."
              required
              disabled={loading}
              error={!!errors.curriculumCourse}
              helperText={errors.curriculumCourse}
            />
          </Grid>

          {/* Giảng viên */}
          <Grid item xs={12} md={6}>
            <SearchableAutocomplete
              options={dropdownData?.lecturers || []}
              value={formData.lecturer}
              onChange={(event, newValue) => {
                setFormData((prev) => ({ ...prev, lecturer: newValue }));
                if (errors.lecturer) {
                  setErrors((prev) => ({ ...prev, lecturer: '' }));
                }
              }}
              getOptionLabel={(option) => `${option.name} (${option.lecturerCode})`}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              label="Giảng viên"
              placeholder="Tìm giảng viên..."
              required
              disabled={loading}
              error={!!errors.lecturer}
              helperText={errors.lecturer}
            />
          </Grid>

          {/* Học kỳ */}
          <Grid item xs={12} md={6}>
            <SearchableAutocomplete
              options={dropdownData?.semesters || []}
              value={formData.semester}
              onChange={(event, newValue) => {
                setFormData((prev) => ({ ...prev, semester: newValue }));
                if (errors.semester) {
                  setErrors((prev) => ({ ...prev, semester: '' }));
                }
              }}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              label="Học kỳ"
              placeholder="Tìm học kỳ..."
              required
              disabled={loading}
              error={!!errors.semester}
              helperText={errors.semester}
            />
          </Grid>

          {/* Lớp */}
          <Grid item xs={12}>
            <SearchableAutocomplete
              options={dropdownData?.classes || []}
              value={formData.classItem}
              onChange={(event, newValue) => {
                setFormData((prev) => ({ ...prev, classItem: newValue }));
                if (errors.classItem) {
                  setErrors((prev) => ({ ...prev, classItem: '' }));
                }
              }}
              getOptionLabel={(option) => `${option.className} - ${option.programName}`}
              isOptionEqualToValue={(option, value) => option?.classId === value?.classId}
              label="Lớp"
              placeholder="Tìm lớp..."
              required
              disabled={loading}
              error={!!errors.classItem}
              helperText={errors.classItem}
            />
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
