export const REGULAR_COLS = 5;
export const PRACTICE_COLS = 3;

// Màu điểm chữ
export const getGradeColor = (grade) => {
  switch (grade) {
    case 'A':
      return 'green';
    case 'B+':
    case 'A-':
      return 'blue';
    case 'B':
    case 'B-':
      return 'cyan';
    case 'C+':
    case 'C':
      return 'orange';
    case 'C-':
    case 'D+':
    case 'D':
      return 'gold';
    case 'F':
      return 'red';
    default:
      return '#222';
  }
};

// Màu xếp loại
export const getRankColor = (rank) => {
  if (!rank) return '#aaa';
  if (rank.includes('Xuất sắc')) return '#722ed1';
  if (rank.includes('Giỏi')) return '#1890ff';
  if (rank.includes('Khá')) return '#52c41a';
  if (rank.includes('Trung bình')) return '#faad14';
  if (rank.includes('Yếu')) return '#ff4d4f';
  return '#aaa';
};

// Mapping xếp loại theo điểm tổng kết (10)
export const getRankByScore = (score) => {
  if (score === '' || score === null || score === undefined) return '';
  const s = Number(score);
  if (s >= 8.5) return 'Giỏi';
  if (s >= 7.0) return 'Khá';
  if (s >= 5.5) return 'Trung bình';
  if (s >= 4.0) return 'Yếu';
  return 'Kém';
};

// Hàm kiểm tra ĐẠT: chỉ đạt nếu điểm tổng kết >= 5.5 (Trung bình trở lên)
export const isPassed = (record) => {
  if (
    record.passed !== undefined &&
    record.passed !== null &&
    record.passed !== ''
  ) {
    return (
      record.passed === true || record.passed === 1 || record.passed === '1'
    );
  }
  const score = Number(record.finalScore);
  return !isNaN(score) && score >= 5.5;
};
