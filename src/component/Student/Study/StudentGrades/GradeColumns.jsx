import React from 'react';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import {
  REGULAR_COLS,
  PRACTICE_COLS,
  getGradeColor,
  getRankColor,
  getRankByScore,
  isPassed,
} from './constants';

export const getGradeColumns = () => [
  {
    title: 'STT',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    align: 'center',
    fixed: 'left',
  },
  {
    title: 'Mã lớp học phần',
    dataIndex: 'courseCode',
    key: 'courseCode',
    width: 180,
    fixed: 'left',
  },
  {
    title: 'Tên môn học/học phần',
    dataIndex: 'courseName',
    key: 'courseName',
    width: 240,
    fixed: 'left',
  },
  {
    title: 'Số tín chỉ',
    dataIndex: 'credits',
    key: 'credits',
    width: 80,
    align: 'center',
    fixed: 'left',
  },
  {
    title: 'Giữa kỳ',
    dataIndex: 'midterm',
    key: 'midterm',
    width: 80,
    align: 'center',
  },
  ...Array.from({ length: REGULAR_COLS }).map((_, i) => ({
    title: `Thường kỳ ${i + 1}`,
    dataIndex: `regular${i + 1}`,
    key: `regular${i + 1}`,
    width: 80,
    align: 'center',
  })),
  ...Array.from({ length: PRACTICE_COLS }).map((_, i) => ({
    title: `Thực hành ${i + 1}`,
    dataIndex: `practice${i + 1}`,
    key: `practice${i + 1}`,
    width: 80,
    align: 'center',
  })),
  {
    title: 'Cuối kỳ',
    dataIndex: 'final',
    key: 'final',
    width: 80,
    align: 'center',
  },
  {
    title: 'Điểm tổng kết',
    dataIndex: 'finalScore',
    key: 'finalScore',
    width: 100,
    align: 'center',
  },
  {
    title: 'Thang điểm 4',
    dataIndex: 'gpa4',
    key: 'gpa4',
    width: 90,
    align: 'center',
  },
  {
    title: 'Điểm chữ',
    dataIndex: 'gradeLetter',
    key: 'gradeLetter',
    width: 80,
    align: 'center',
    render: (value) => (
      <span
        style={{
          color: getGradeColor(value),
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    ),
  },
  {
    title: 'Xếp loại',
    dataIndex: 'rank',
    key: 'rank',
    width: 90,
    align: 'center',
    render: (value, record) => {
      const rank = value || getRankByScore(record.finalScore);
      return (
        <span
          style={{
            color: getRankColor(rank),
            fontWeight: 600,
          }}
        >
          {rank}
        </span>
      );
    },
  },
  {
    title: 'Ghi chú',
    dataIndex: 'note',
    key: 'note',
    width: 120,
    align: 'center',
  },
  {
    title: 'TBQT',
    dataIndex: 'tbqt',
    key: 'tbqt',
    width: 70,
    align: 'center',
  },
  {
    title: 'Đạt',
    dataIndex: 'passed',
    key: 'passed',
    width: 60,
    align: 'center',
    render: (value, record) =>
      isPassed(record) ? (
        <CheckCircleTwoTone twoToneColor="#52c41a" />
      ) : (
        <CloseCircleTwoTone twoToneColor="#ff4d4f" />
      ),
  },
];
