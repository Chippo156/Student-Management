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
  useTheme,
  Autocomplete,
  TextField,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from 'antd';
import { message } from 'antd';
import { departmentService } from '../../../service/departmentService';
import sectionService from '../../../service/sectionService';
import registrationPeriodService from '../../../service/registrationPeriodService';
import dayjs from 'dayjs';

const RegistrationPeriodCreateModal = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [formData, setFormData] = useState({
    departmentId: '',
    semesterId: '',
    startDate: null,
    endDate: null,
  });

  // Load departments and semesters when modal opens
  useEffect(() => {
    if (open) {
      loadData();
      // Reset form
      setFormData({
        departmentId: '',
        semesterId: '',
        startDate: null,
        endDate: null,
      });
    }
  }, [open]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [deptResponse, semResponse] = await Promise.all([
        departmentService.getDepartmentsDropdown(),
        sectionService.getSemesterDropdown(),
      ]);

      if (deptResponse) {
        // Transform department data to expected structure
        const transformedDepts = deptResponse.map((dept) => ({
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          facultyName: dept.facultyName,
        }));
        setDepartments(transformedDepts);
      }

      if (semResponse) {
        // API returns {id, name, year, term, isActive} structure
        setSemesters(semResponse);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
    if (!formData.departmentId) {
      message.warning('Vui lòng chọn chuyên ngành!');
      return;
    }

    if (!formData.semesterId) {
      message.warning('Vui lòng chọn học kỳ!');
      return;
    }

    if (!formData.startDate) {
      message.warning('Vui lòng chọn ngày bắt đầu!');
      return;
    }

    if (!formData.endDate) {
      message.warning('Vui lòng chọn ngày kết thúc!');
      return;
    }

    if (formData.endDate.isBefore(formData.startDate)) {
      message.warning('Ngày kết thúc phải sau ngày bắt đầu!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        departmentId: formData.departmentId,
        semesterId: formData.semesterId,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD'),
      };

      const result =
        await registrationPeriodService.createRegistrationPeriod(payload);
      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating registration period:', error);
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
        sx: { borderRadius: 5, overflow: 'unset' },
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
          borderRadius: 5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AddIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            Tạo khung thời gian đăng ký
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
            {/* Department */}
            <Autocomplete
              options={departments}
              getOptionLabel={(option) =>
                option ? `${option.departmentName} - ${option.facultyName}` : ''
              }
              value={
                departments.find(
                  (d) => d.departmentId === formData.departmentId
                ) || null
              }
              onChange={(newValue) => {
                handleChange('departmentId', newValue?.departmentId || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chuyên ngành"
                  required
                  placeholder="Tìm kiếm chuyên ngành..."
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option.departmentId === value.departmentId
              }
              noOptionsText="Không tìm thấy chuyên ngành"
            />

            {/* Semester */}
            <Autocomplete
              options={semesters}
              getOptionLabel={(option) => (option ? option.name : '')}
              value={
                semesters.find((s) => s.id === formData.semesterId) || null
              }
              onChange={(newValue) => {
                handleChange('semesterId', newValue?.id || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Học kỳ"
                  required
                  placeholder="Tìm kiếm học kỳ..."
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="Không tìm thấy học kỳ"
            />

            {/* Start Date */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Ngày bắt đầu <span style={{ color: 'red' }}>*</span>
              </Typography>
              <DatePicker
                style={{ width: '100%', height: '40px' }}
                placeholder="Chọn ngày bắt đầu"
                format="DD/MM/YYYY"
                value={formData.startDate}
                onChange={(date) => handleChange('startDate', date)}
                getPopupContainer={(trigger) => trigger.parentElement}
              />
            </Box>

            {/* End Date */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Ngày kết thúc <span style={{ color: 'red' }}>*</span>
              </Typography>
              <DatePicker
                style={{ width: '100%', height: '40px' }}
                placeholder="Chọn ngày kết thúc"
                format="DD/MM/YYYY"
                value={formData.endDate}
                onChange={(date) => handleChange('endDate', date)}
                getPopupContainer={(trigger) => trigger.parentElement}
                disabledDate={(current) => {
                  return (
                    formData.startDate && current.isBefore(formData.startDate)
                  );
                }}
              />
            </Box>
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
          {loading ? 'Đang tạo...' : 'Tạo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationPeriodCreateModal;
