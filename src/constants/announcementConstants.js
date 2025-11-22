export const ANNOUNCEMENT_PRIORITY = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4,
};

export const ANNOUNCEMENT_TYPE = {
  GENERAL: 1,
  ACADEMIC: 2,
  EVENT: 3,
  TUITION: 4,
  EMERGENCY: 5,
};

export const ANNOUNCEMENT_TARGET_TYPE = {
  ALL: 1,
  STUDENTS: 2,
  LECTURERS: 3,
  ACADEMIC_YEAR: 4,
};

export const PRIORITY_OPTIONS = [
  { value: 1, label: 'Thấp', color: '#6c757d' },
  { value: 2, label: 'Bình thường', color: '#0d6efd' },
  { value: 3, label: 'Cao', color: '#ffc107' },
  { value: 4, label: 'Khẩn cấp', color: '#dc3545' },
];

export const TYPE_OPTIONS = [
  { value: 1, label: 'Thông báo chung', icon: '📢' },
  { value: 2, label: 'Học tập', icon: '📚' },
  { value: 3, label: 'Sự kiện', icon: '📅' },
  { value: 4, label: 'Học phí', icon: '💰' },
  { value: 5, label: 'Khẩn cấp', icon: '🚨' },
];

export const TARGET_TYPE_OPTIONS = [
  { value: 1, label: 'Tất cả' },
  { value: 2, label: 'Sinh viên' },
  { value: 3, label: 'Giảng viên' },
  { value: 4, label: 'Theo năm học' },
];

export const getPriorityColor = (priority) => {
  const option = PRIORITY_OPTIONS.find((opt) => opt.value === priority);
  return option ? option.color : '#6c757d';
};

export const getPriorityLabel = (priority) => {
  const option = PRIORITY_OPTIONS.find((opt) => opt.value === priority);
  return option ? option.label : 'Không xác định';
};

export const getTypeLabel = (type) => {
  const option = TYPE_OPTIONS.find((opt) => opt.value === type);
  return option ? option.label : 'Không xác định';
};

export const getTypeIcon = (type) => {
  const option = TYPE_OPTIONS.find((opt) => opt.value === type);
  return option ? option.icon : '📢';
};

export const getTargetTypeLabel = (targetType) => {
  const option = TARGET_TYPE_OPTIONS.find((opt) => opt.value === targetType);
  return option ? option.label : 'Không xác định';
};
