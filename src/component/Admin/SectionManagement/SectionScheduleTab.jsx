import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Table, Tag, Space } from 'antd';
import { useTheme } from '@mui/material/styles';
import scheduleService from '../../../service/scheduleService';
import practiceService from '../../../service/practiceService';
import { lecturerService } from '../../../service/lecturerService';
import dayjs from 'dayjs';

const SCHEDULE_TYPES = [
  { value: 1, label: 'Lý thuyết', color: 'primary' },
  { value: 2, label: 'Thực hành', color: 'success' },
  { value: 3, label: 'Thi', color: 'error' },
];

const DAY_OF_WEEK = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 7, label: 'Chủ nhật' },
];

const SectionScheduleTab = ({ sectionId, section }) => {
  const theme = useTheme();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [lecturers, setLecturers] = useState([]);

  // Debug section prop
  console.log('SectionScheduleTab rendered with section:', section);
  console.log('Section departmentId:', section?.departmentId);

  const [formData, setFormData] = useState({
    scheduleTypeId: 1,
    dayOfWeek: null,
    date: null,
    startTime: '07:00',
    endTime: '09:00',
    room: '',
    onlineLink: null,
    // For practice group
    groupName: '',
    maxCapacity: 30,
    description: '',
    lecturerId: null,
  });

  useEffect(() => {
    if (sectionId) {
      fetchSchedules();
    }
  }, [sectionId]);

  // Fetch lecturers once when section loads
  useEffect(() => {
    if (section && section.departmentId !== null && section.departmentId !== undefined) {
      console.log(
        'Initial fetch of lecturers for section department:',
        section.departmentId
      );
      fetchLecturers(section.departmentId);
    }
  }, [section]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const result =
        await scheduleService.getAllSchedulesBySectionId(sectionId);
      if (result && result.items) {
        setSchedules(result.items);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async (departmentId) => {
    try {
      console.log('Calling API with departmentId:', departmentId);
      const response =
        await lecturerService.getLecturersByDepartment(departmentId);
      console.log('API response:', response);
      console.log('Lecturers data:', response?.data);
      if (response && response.data) {
        setLecturers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch lecturers:', error);
    }
  };

  // Calculate capacity per practice group
  const calculatePracticeGroupCapacity = () => {
    if (!section || !section.capacity || !section.practiceGroupCount) {
      return 30; // Default
    }
    return Math.ceil(section.capacity / section.practiceGroupCount);
  };

  const handleOpenDialog = (schedule = null) => {
    const defaultPracticeCapacity = calculatePracticeGroupCapacity();

    if (schedule) {
      console.log('=== OPENING EDIT DIALOG ===');
      console.log('Edit schedule:', schedule);
      console.log('Schedule lecturerId:', schedule.lecturerId);
      console.log('Schedule Type from API:', schedule.scheduleType);
      console.log('Schedule Type ID from API:', schedule.scheduleTypeId);
      console.log('Section object:', section);
      console.log('Section departmentId:', section?.departmentId);

      // Fix scheduleTypeId if it's 0 or invalid
      let correctScheduleTypeId = schedule.scheduleTypeId;
      if (!correctScheduleTypeId || correctScheduleTypeId === 0) {
        // Map from scheduleType string to ID
        if (schedule.scheduleType === 'Lý thuyết') correctScheduleTypeId = 1;
        else if (schedule.scheduleType === 'Thực hành')
          correctScheduleTypeId = 2;
        else if (schedule.scheduleType === 'Thi') correctScheduleTypeId = 3;
        else correctScheduleTypeId = 1; // Default
      }

      console.log('Corrected Schedule Type ID:', correctScheduleTypeId);

      const newFormData = {
        scheduleTypeId: correctScheduleTypeId,
        dayOfWeek: schedule.dayOfWeek,
        date: schedule.date ? dayjs(schedule.date).format('YYYY-MM-DD') : null,
        startTime: schedule.startTime?.substring(0, 5) || '07:00',
        endTime: schedule.endTime?.substring(0, 5) || '09:00',
        room: schedule.room || '',
        onlineLink: schedule.onlineLink || null,
        groupName: schedule.practiceGroupName || '',
        maxCapacity: schedule.practiceGroupCapacity || defaultPracticeCapacity,
        description: '',
        lecturerId: schedule.lecturerId || null,
      };

      console.log('Setting formData:', newFormData);
      setEditingSchedule(schedule);
      setFormData(newFormData);

      // Always fetch lecturers when opening dialog (will be used if practice schedule)
      if (section && section.departmentId !== null && section.departmentId !== undefined) {
        console.log(
          '✅ Fetching lecturers for departmentId:',
          section.departmentId
        );
        fetchLecturers(section.departmentId);
      } else {
        console.warn('❌ No valid departmentId! Section:', section, 'DepartmentId:', section?.departmentId);
      }
    } else {
      setEditingSchedule(null);
      setFormData({
        scheduleTypeId: 1,
        dayOfWeek: null,
        date: null,
        startTime: '07:00',
        endTime: '09:00',
        room: '',
        onlineLink: null,
        groupName: '',
        maxCapacity: defaultPracticeCapacity,
        description: '',
        lecturerId: null,
      });

      // Fetch lecturers for new schedule too
      if (section && section.departmentId !== null && section.departmentId !== undefined) {
        console.log(
          'Fetching lecturers for new schedule, departmentId:',
          section.departmentId
        );
        fetchLecturers(section.departmentId);
      }
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        sectionId: parseInt(sectionId),
        scheduleTypeId: parseInt(formData.scheduleTypeId),
        dayOfWeek: formData.dayOfWeek ? parseInt(formData.dayOfWeek) : null,
        date: formData.date || null,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00',
        room: formData.room || '',
        onlineLink: formData.onlineLink || null,
      };

      let result;
      if (editingSchedule) {
        // Update existing schedule
        // Include lecturerId for practice schedules
        if (formData.scheduleTypeId === 2) {
          payload.lecturerId = formData.lecturerId || null;
        }
        result = await scheduleService.updateSchedule(
          editingSchedule.scheduleId,
          payload
        );
      } else {
        // Create new schedule
        if (formData.scheduleTypeId === 2) {
          // Create practice group with schedule
          const practicePayload = {
            ...payload,
            groupName:
              formData.groupName ||
              `Nhóm ${schedules.filter((s) => s.scheduleTypeId === 2).length + 1}`,
            maxCapacity: parseInt(formData.maxCapacity),
            description: formData.description || null,
            lecturerId: formData.lecturerId || null,
          };
          result =
            await practiceService.createSchedulePractice(practicePayload);
        } else {
          // Create theory/exam schedule
          result = await scheduleService.createScheduleTheory(payload);
        }
      }

      if (result) {
        await fetchSchedules();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch học này?')) return;

    setLoading(true);
    try {
      const result = await scheduleService.deleteSchedule(scheduleId);
      if (result) {
        await fetchSchedules();
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Loại lịch',
      dataIndex: 'scheduleType',
      key: 'scheduleType',
      width: 130,
      render: (text, record) => {
        const scheduleType = SCHEDULE_TYPES.find(
          (t) => t.value === record.scheduleTypeId
        );
        return <Tag color={scheduleType?.color || 'default'}>{text}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 200,
      render: (_, record) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {record.dayOfWeekText ||
              (record.date ? dayjs(record.date).format('DD/MM/YYYY') : 'N/A')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {record.duration}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Phòng học',
      dataIndex: 'room',
      key: 'room',
      width: 120,
      render: (text) =>
        text || <Typography color="text.secondary">Chưa xếp</Typography>,
    },
    {
      title: 'Link Online',
      dataIndex: 'onlineLink',
      key: 'onlineLink',
      width: 150,
      render: (text) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            Link
          </a>
        ) : (
          <Typography color="text.secondary">-</Typography>
        ),
    },
    {
      title: 'Nhóm TH',
      key: 'practiceGroup',
      width: 150,
      render: (_, record) =>
        record.isPracticeGroup ? (
          <Chip
            label={record.practiceGroupName}
            size="small"
            sx={{
              bgcolor: theme.palette.success.light + '30',
              color: theme.palette.success.main,
            }}
          />
        ) : (
          <Typography color="text.secondary">-</Typography>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: window.innerWidth < 768 ? false : 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenDialog(record)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(record.scheduleId)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonth sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Lịch học trong tuần
          </Typography>
          <Chip
            label={`${schedules.length} lịch`}
            size="small"
            color="primary"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm lịch học
        </Button>
      </Box>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={schedules}
        rowKey="scheduleId"
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: 1000 }}
        locale={{
          emptyText: (
            <Box sx={{ py: 4 }}>
              <ScheduleIcon
                sx={{ fontSize: 60, color: theme.palette.text.disabled, mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Chưa có lịch học nào. Nhấn "Thêm lịch học" để bắt đầu
              </Typography>
            </Box>
          ),
        }}
      />

      {/* Dialog Create/Edit Schedule */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSchedule ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại lịch</InputLabel>
                <Select
                  value={formData.scheduleTypeId}
                  label="Loại lịch"
                  onChange={(e) => {
                    console.log('Changing schedule type to:', e.target.value);
                    setFormData({
                      ...formData,
                      scheduleTypeId: e.target.value,
                    });
                  }}
                  disabled={!!editingSchedule}
                >
                  {SCHEDULE_TYPES.filter((type) => {
                    // Hide practice option if no lab credits
                    if (type.value === 2 && section?.creditsLab === 0) {
                      return false;
                    }
                    return true;
                  }).map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Thứ</InputLabel>
                <Select
                  value={formData.dayOfWeek || ''}
                  label="Thứ"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dayOfWeek: e.target.value,
                      date: null,
                    })
                  }
                >
                  <MenuItem value="">Không chọn</MenuItem>
                  {DAY_OF_WEEK.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giờ bắt đầu"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giờ kết thúc"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phòng học"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                placeholder="VD: H3.2, Lab 1"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Link Online (tùy chọn)"
                value={formData.onlineLink || ''}
                onChange={(e) =>
                  setFormData({ ...formData, onlineLink: e.target.value })
                }
                placeholder="https://meet.google.com/..."
              />
            </Grid>

            {/* Practice Group Fields */}
            {(() => {
              console.log('Current scheduleTypeId:', formData.scheduleTypeId);
              console.log('Is practice?', formData.scheduleTypeId === 2);
              console.log('Lecturers available:', lecturers.length);
              return null;
            })()}
            {formData.scheduleTypeId === 2 && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên nhóm thực hành"
                    value={formData.groupName}
                    onChange={(e) =>
                      setFormData({ ...formData, groupName: e.target.value })
                    }
                    placeholder="VD: Nhóm 1, Nhóm A"
                    disabled={!!editingSchedule}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={lecturers}
                    getOptionLabel={(option) => option.name || ''}
                    value={
                      lecturers.find(
                        (l) => l.id === formData.lecturerId
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      console.log('Selected lecturer:', newValue);
                      setFormData({
                        ...formData,
                        lecturerId: newValue?.id || null,
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Giảng viên (tùy chọn)"
                        placeholder="Tìm kiếm giảng viên..."
                      />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    noOptionsText="Không tìm thấy giảng viên"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Sĩ số tối đa"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxCapacity: e.target.value })
                    }
                    inputProps={{ min: 1, max: 100 }}
                    disabled={!!editingSchedule}
                  />
                </Grid>
                {!editingSchedule && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mô tả (tùy chọn)"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      multiline
                      rows={2}
                      placeholder="Ghi chú thêm về nhóm thực hành..."
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.startTime || !formData.endTime}
          >
            {editingSchedule ? 'Cập nhật' : 'Tạo lịch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SectionScheduleTab;
