// Status helper functions
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'in-progress':
      return 'blue';
    case 'not-started':
      return 'orange';
    case 'upcoming':
      return 'blue';
    case 'overdue':
      return 'red';
    default:
      return 'default';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Hoàn thành';
    case 'in-progress':
      return 'Đang thực hiện';
    case 'not-started':
      return 'Chưa bắt đầu';
    case 'upcoming':
      return 'Sắp tới';
    case 'overdue':
      return 'Quá hạn';
    default:
      return status;
  }
};
