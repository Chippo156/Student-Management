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
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from 'antd';
import { message } from 'antd';
import { departmentService } from '../../../service/departmentService';
import sectionService from '../../../service/sectionService';
import registrationPeriodService from '../../../service/registrationPeriodService';
import dayjs from 'dayjs';

const RegistrationPeriodEditModal = ({ open, onClose, onSuccess, period }) => {
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

  // Load data and populate form when modal opens
  useEffect(() => {
    if (open && period) {
      loadData();
      setFormData({
        departmentId: period.departmentId || '',
        semesterId: period.semesterId || '',
        startDate: period.startDate ? dayjs(period.startDate) : null,
        endDate: period.endDate ? dayjs(period.endDate) : null,
      });
    }
  }, [open, period]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [deptResponse, semResponse] = await Promise.all([
        departmentService.getDepartmentsDropdown(),
        sectionService.getSemesterDropdown(),
      ]);

      if (deptResponse) {
        // Transform department data to expected structure
        const transformedDepts = deptResponse.map(dept => ({
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          facultyName: dept.facultyName
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
    // Validation - only for dates as per API spec
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
      // API only accepts startDate and endDate for update
      const payload = {
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD'),
      };

      const result = await registrationPeriodService.updateRegistrationPeriod(
        period.registrationPeriodId,
        payload
      );
      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating registration period:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!period) return null;

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
            Chỉnh sửa khung thời gian đăng ký
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
            {/* Department - Read only */}
            <FormControl fullWidth disabled>
              <InputLabel>Chuyên ngành</InputLabel>
              <Select
                value={formData.departmentId}
                label="Chuyên ngành"
              >
                <MenuItem value={formData.departmentId}>
                  {period.departmentName} - {period.facultyName}
                </MenuItem>
              </Select>
            </FormControl>

            {/* Semester - Read only */}
            <FormControl fullWidth disabled>
              <InputLabel>Học kỳ</InputLabel>
              <Select
                value={formData.semesterId}
                label="Học kỳ"
              >
                <MenuItem value={formData.semesterId}>
                  {period.semesterName}
                </MenuItem>
              </Select>
            </FormControl>

            {/* Start Date */}
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
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
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationPeriodEditModal;
