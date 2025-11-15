import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

/**
 * Tạo danh sách các ngày học dựa vào lịch học
 */
const generateScheduleDates = (startDate, endDate, schedules) => {
  const dates = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  // Lấy danh sách các ngày trong tuần có lịch học
  const scheduleDays = schedules.map((s) => s.dayOfWeek);

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const dayOfWeek = current.day(); // 0 = CN, 1 = T2, ..., 6 = T7

    if (scheduleDays.includes(dayOfWeek)) {
      const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
      dates.push({
        date: current.format('DD/MM/YYYY'),
        dayText: schedule.dayOfWeekText,
        timeSlot: schedule.timeSlot,
        fullText: `[${schedule.dayOfWeekText}] - [${schedule.timeSlot}] - ${current.format('DD/MM/YYYY')}`,
      });
    }

    current = current.add(1, 'day');
  }

  return dates;
};

/**
 * Xuất Excel danh sách điểm danh với border và format đẹp
 */
export const exportSectionAttendanceExcel = (
  sectionData,
  isPractice = false
) => {
  if (!sectionData) {
    throw new Error('Không có dữ liệu để xuất');
  }

  const {
    sectionCode,
    courseName,
    courseCode,
    className,
    classCode,
    startDate,
    endDate,
    schedules,
    students,
    practiceGroup,
  } = sectionData;

  // Tạo workbook
  const workbook = XLSX.utils.book_new();

  // Tạo array data
  const wsData = [];

  // Header thông tin - 4 dòng đầu
  wsData.push(['Đợt:', `HK1 (2025-2026)`]);
  wsData.push(['Cơ sở:', `Cơ sở 1 (Thành phố Hồ Chí Minh)`]);
  wsData.push(['Mã lớp học phần:', sectionCode, classCode || '']);

  if (isPractice && practiceGroup) {
    wsData.push([
      'Tên môn học:',
      `${courseName} (${sectionCode} - ${className})`,
    ]);
    wsData.push(['Lớp học', className, `Nhóm ${practiceGroup.groupName}`]);
  } else {
    wsData.push([
      'Tên môn học:',
      `${courseName} (${sectionCode} - ${className})`,
    ]);
    wsData.push(['Lớp học', className]);
  }

  // Dòng trống
  wsData.push([]);

  // Tạo danh sách ngày học
  const scheduleDates = generateScheduleDates(startDate, endDate, schedules);

  // Header cột - dòng 7
  const headerRow = [
    'STT',
    'Mã sinh viên',
    'Họ đệm',
    'Tên',
    'Giới tính',
    'Ngày sinh',
  ];

  // Thêm các cột ngày học
  scheduleDates.forEach((dateInfo) => {
    headerRow.push(dateInfo.fullText);
  });

  wsData.push(headerRow);

  // Dữ liệu sinh viên
  students.forEach((student, index) => {
    const nameParts = student.fullName.trim().split(' ');
    const lastName = nameParts[nameParts.length - 1]; // Tên
    const firstName = nameParts.slice(0, -1).join(' '); // Họ đệm

    const gender =
      student.gender === 'MALE'
        ? 'Nam'
        : student.gender === 'FEMALE'
          ? 'Nữ'
          : 'Khác';
    const dob = student.dateOfBirth
      ? dayjs(student.dateOfBirth).format('DD/MM/YYYY')
      : '';

    const row = [
      index + 1,
      student.mssv,
      firstName,
      lastName,
      gender,
      dob,
      '', // Cột trống giữa thông tin SV và điểm danh
    ];

    // Thêm các ô trống cho điểm danh
    scheduleDates.forEach(() => {
      row.push('');
    });

    wsData.push(row);
  });

  // Tạo worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set độ rộng cột
  const colWidths = [
    { wch: 5 }, // STT
    { wch: 12 }, // MSSV
    { wch: 20 }, // Họ đệm
    { wch: 10 }, // Tên
    { wch: 10 }, // Giới tính
    { wch: 12 }, // Ngày sinh
    { wch: 2 }, // Cột trống
  ];

  // Thêm width cho các cột ngày học
  scheduleDates.forEach(() => {
    colWidths.push({ wch: 28 });
  });

  ws['!cols'] = colWidths;

  // Merge cells cho header
  ws['!merges'] = [
    { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }, // Đợt
    { s: { r: 1, c: 1 }, e: { r: 1, c: 2 } }, // Cơ sở
    { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } }, // Mã lớp HP
    { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } }, // Tên môn học
  ];

  // Thêm borders cho toàn bộ bảng
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Dòng bắt đầu bảng sinh viên (dòng 7 - index 6)
  const tableStartRow = 6;

  for (let R = tableStartRow; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[cellAddress]) {
        ws[cellAddress] = { t: 's', v: '' };
      }

      // Tạo style với border
      ws[cellAddress].s = {
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
        alignment: {
          horizontal:
            R === tableStartRow
              ? 'center'
              : C === 2 || C === 3
                ? 'left'
                : 'center',
          vertical: 'center',
          wrapText: true,
        },
        font: {
          name: 'Arial',
          sz: 11,
          bold: R === tableStartRow,
        },
        fill: {
          fgColor: { rgb: R === tableStartRow ? 'FFFF00' : 'FFFFFF' },
        },
      };
    }
  }

  // Style cho header thông tin (4 dòng đầu)
  for (let R = 0; R <= 4; ++R) {
    for (let C = 0; C <= 2; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        font: {
          name: 'Arial',
          sz: 11,
          bold: C === 0,
        },
        alignment: {
          horizontal: 'left',
          vertical: 'center',
        },
      };
    }
  }

  // Thêm worksheet vào workbook
  XLSX.utils.book_append_sheet(workbook, ws, 'Danh sách điểm danh');

  // Tên file
  const fileName = `Diem_danh_${sectionCode}_${className}${isPractice && practiceGroup ? `_${practiceGroup.groupName}` : ''}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;

  // Xuất file
  XLSX.writeFile(workbook, fileName);
};
