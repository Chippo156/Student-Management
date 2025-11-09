// Departments
export const departments = [
  'Công nghệ thông tin',
  'Kinh tế',
  'Ngoại ngữ',
  'Khoa học tự nhiên',
  'Kỹ thuật',
  'Y khoa',
];

// Years
export const years = [1, 2, 3, 4, 5];

// Statuses
export const statuses = [
  { value: 'active', label: 'Đang diễn ra' },
  { value: 'inactive', label: 'Tạm dừng' },
  { value: 'completed', label: 'Đã kết thúc' },
];

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'completed':
      return 'default';
    default:
      return 'default';
  }
};

// Get status label
export const getStatusLabel = (status) => {
  const statusObj = statuses.find((s) => s.value === status);
  return statusObj ? statusObj.label : status;
};

// Get capacity color based on ratio
export const getCapacityColor = (current, max) => {
  const ratio = current / max;
  if (ratio >= 0.9) return 'error';
  if (ratio >= 0.7) return 'warning';
  return 'success';
};
