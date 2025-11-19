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

const SectionEditModal = ({ open, onCancel, onSave, section }) => {
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
    status: '',
    minEnrollment: '',
    minEnrollmentPercentage: '',
  });
  const [errors, setErrors] = useState({});

  // Load section data when modal opens
  useEffect(() => {
    if (open && section) {
      fetchDropdownData();
      // Populate form with section data
      setFormData({
        curriculumCourseId: section.courseId || '',
        lecturerId: section.lecturerId || '',
        semesterId: section.semesterId || '',
        classId: section.classId || '',
        startDate: section.startDate ? section.startDate.split('T')[0] : '',
        endDate: section.endDate ? section.endDate.split('T')[0] : '',
        capacity: section.capacity || '',
        status: section.status || '',
        minEnrollment: '',
        minEnrollmentPercentage: '',
      });
      setErrors({});
    }
  }, [open, section]);

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

    // Validate dates if both are provided
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    // Validate capacity if provided
    if (formData.capacity && formData.capacity <= 0) {
      newErrors.capacity = 'Sức chứa phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !section) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API - only send fields that have values
      const submitData = {};

      if (formData.curriculumCourseId && formData.curriculumCourseId !== section.courseId) {
        submitData.curriculumCourseId = parseInt(formData.curriculumCourseId);
      }
      if (formData.lecturerId && formData.lecturerId !== section.lecturerId) {
        submitData.lecturerId = parseInt(formData.lecturerId);
      }
      if (formData.semesterId && formData.semesterId !== section.semesterId) {
        submitData.semesterId = parseInt(formData.semesterId);
      }
      if (formData.classId && formData.classId !== section.classId) {
        submitData.classId = parseInt(formData.classId);
      }
      if (formData.startDate) {
        submitData.startDate = formData.startDate;
      }
      if (formData.endDate) {
        submitData.endDate = formData.endDate;
      }
      if (formData.capacity) {
        submitData.capacity = parseInt(formData.capacity);
      }
      if (formData.status && formData.status !== section.status) {
        submitData.status = parseInt(formData.status);
      }
      if (formData.minEnrollment) {
        submitData.minEnrollment = parseInt(formData.minEnrollment);
      }
      if (formData.minEnrollmentPercentage) {
        submitData.minEnrollmentPercentage = parseFloat(formData.minEnrollmentPercentage);
      }

      const result = await sectionService.updateSection(section.sectionId, submitData);
      if (result) {
        onSave(result);
      }
    } catch (error) {
      console.error('Failed to update section:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!section) return null;

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

  const statusOptions = [
    { value: 1, label: 'Chưa bắt đầu' },
    { value: 2, label: 'Đang diễn ra' },
    { value: 3, label: 'Đã kết thúc' },
    { value: 4, label: 'Đã hủy' },
  ];

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chỉnh sửa lớp học phần
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {section.sectionCode}
            </Typography>
          </Box>
          <IconButton onClick={onCancel} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Chỉ các trường được thay đổi sẽ được cập nhật. Để trống nếu không muốn thay đổi.
            </Alert>
          </Grid>

          {/* Môn học */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Môn học</InputLabel>
              <Select
                value={formData.curriculumCourseId}
                label="Môn học"
                onChange={handleChange('curriculumCourseId')}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Giữ nguyên: {section.courseName}</em>
                </MenuItem>
                {dropdownData?.curriculumCourses?.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name} ({course.credits} tín chỉ)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Giảng viên */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={formData.lecturerId}
                label="Giảng viên"
                onChange={handleChange('lecturerId')}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Giữ nguyên: {section.lecturerName || 'Chưa phân công'}</em>
                </MenuItem>
                {dropdownData?.lecturers?.map((lecturer) => (
                  <MenuItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.name} ({lecturer.lecturerCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Học kỳ */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Học kỳ</InputLabel>
              <Select
                value={formData.semesterId}
                label="Học kỳ"
                onChange={handleChange('semesterId')}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Giữ nguyên: {section.semesterName}</em>
                </MenuItem>
                {dropdownData?.semesters?.map((semester) => (
                  <MenuItem key={semester.id} value={semester.id}>
                    {semester.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Lớp */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Lớp</InputLabel>
              <Select
                value={formData.classId}
                label="Lớp"
                onChange={handleChange('classId')}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Giữ nguyên: {section.className}</em>
                </MenuItem>
                {dropdownData?.classes?.map((classItem) => (
                  <MenuItem key={classItem.classId} value={classItem.classId}>
                    {classItem.className} - {classItem.programName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Trạng thái */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={handleChange('status')}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Giữ nguyên: {section.statusName}</em>
                </MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sức chứa */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Sức chứa"
              type="number"
              value={formData.capacity}
              onChange={handleChange('capacity')}
              error={!!errors.capacity}
              helperText={errors.capacity || `Hiện tại: ${section.capacity}`}
              inputProps={{ min: 1 }}
              disabled={loading}
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
              disabled={loading}
            />
          </Grid>

          {/* Số lượng tối thiểu */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số lượng tối thiểu"
              type="number"
              value={formData.minEnrollment}
              onChange={handleChange('minEnrollment')}
              inputProps={{ min: 0 }}
              disabled={loading}
              helperText="Để trống nếu không thay đổi"
            />
          </Grid>

          {/* Tỷ lệ tối thiểu */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tỷ lệ tối thiểu (%)"
              type="number"
              value={formData.minEnrollmentPercentage}
              onChange={handleChange('minEnrollmentPercentage')}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              disabled={loading}
              helperText="Để trống nếu không thay đổi"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SectionEditModal;
