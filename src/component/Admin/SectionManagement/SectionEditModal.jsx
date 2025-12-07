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

const statusOptions = [
  { value: 1, label: 'Chưa bắt đầu' },
  { value: 2, label: 'Đang diễn ra' },
  { value: 3, label: 'Đã kết thúc' },
  { value: 4, label: 'Đã hủy' },
];

const SectionEditModal = ({ open, onCancel, onSave, section }) => {
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
    status: null,
    minEnrollment: '',
    minEnrollmentPercentage: '',
  });
  const [errors, setErrors] = useState({});

  // Load section data when modal opens
  useEffect(() => {
    if (open && section && dropdownData) {
      // Find objects from IDs
      const course = dropdownData.curriculumCourses?.find(c => c.id === section.courseId) || null;
      const lecturer = dropdownData.lecturers?.find(l => l.id === section.lecturerId) || null;
      const semester = dropdownData.semesters?.find(s => s.id === section.semesterId) || null;
      const classItem = dropdownData.classes?.find(c => c.classId === section.classId) || null;
      const statusOption = statusOptions.find(s => s.value === section.status) || null;

      setFormData({
        curriculumCourse: course,
        lecturer: lecturer,
        semester: semester,
        classItem: classItem,
        startDate: section.startDate ? section.startDate.split('T')[0] : '',
        endDate: section.endDate ? section.endDate.split('T')[0] : '',
        capacity: section.capacity || '',
        status: statusOption,
        minEnrollment: '',
        minEnrollmentPercentage: '',
      });
      setErrors({});
    }
  }, [open, section, dropdownData]);

  useEffect(() => {
    if (open) {
      fetchDropdownData();
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

      if (formData.curriculumCourse && formData.curriculumCourse.id !== section.courseId) {
        submitData.curriculumCourseId = parseInt(formData.curriculumCourse.id);
      }
      if (formData.lecturer && formData.lecturer.id !== section.lecturerId) {
        submitData.lecturerId = parseInt(formData.lecturer.id);
      }
      if (formData.semester && formData.semester.id !== section.semesterId) {
        submitData.semesterId = parseInt(formData.semester.id);
      }
      if (formData.classItem && formData.classItem.classId !== section.classId) {
        submitData.classId = parseInt(formData.classItem.classId);
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
      if (formData.status && formData.status.value !== section.status) {
        submitData.status = parseInt(formData.status.value);
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
            <SearchableAutocomplete
              options={dropdownData?.curriculumCourses || []}
              value={formData.curriculumCourse}
              onChange={(newValue) => {
                setFormData((prev) => ({ ...prev, curriculumCourse: newValue }));
              }}
              getOptionLabel={(option) => `${option.name} (${option.credits} tín chỉ)`}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              label="Môn học"
              placeholder="Tìm môn học..."
              disabled={loading}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Hiện tại: {section.courseName}
            </Typography>
          </Grid>

          {/* Giảng viên */}
          <Grid item xs={12} md={6}>
            <SearchableAutocomplete
              options={dropdownData?.lecturers || []}
              value={formData.lecturer}
              onChange={(newValue) => {
                setFormData((prev) => ({ ...prev, lecturer: newValue }));
              }}
              getOptionLabel={(option) => `${option.name} (${option.lecturerCode})`}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              label="Giảng viên"
              placeholder="Tìm giảng viên..."
              disabled={loading}
              helperText={`Hiện tại: ${section.lecturerName || 'Chưa phân công'}`}
            />
          </Grid>

          {/* Học kỳ */}
          <Grid item xs={12} md={6}>
            <SearchableAutocomplete
              options={dropdownData?.semesters || []}
              value={formData.semester}
              onChange={(newValue) => {
                setFormData((prev) => ({ ...prev, semester: newValue }));
              }}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              label="Học kỳ"
              placeholder="Tìm học kỳ..."
              disabled={loading}
              helperText={`Hiện tại: ${section.semesterName}`}
            />
          </Grid>

          {/* Lớp */}
          <Grid item xs={12}>
            <SearchableAutocomplete
              options={dropdownData?.classes || []}
              value={formData.classItem}
              onChange={(newValue) => {
                setFormData((prev) => ({ ...prev, classItem: newValue }));
              }}
              getOptionLabel={(option) => `${option.className} - ${option.programName}`}
              isOptionEqualToValue={(option, value) => option?.classId === value?.classId}
              label="Lớp"
              placeholder="Tìm lớp..."
              disabled={loading}
              helperText={`Hiện tại: ${section.className}`}
            />
          </Grid>

          {/* Trạng thái */}
          <Grid item xs={12} md={6}>
            <SearchableAutocomplete
              options={statusOptions}
              value={formData.status}
              onChange={(newValue) => {
                setFormData((prev) => ({ ...prev, status: newValue }));
              }}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option?.value === value?.value}
              label="Trạng thái"
              placeholder="Chọn trạng thái..."
              disabled={loading}
              helperText={`Hiện tại: ${section.statusName}`}
            />
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
