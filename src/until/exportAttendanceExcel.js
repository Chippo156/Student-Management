import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

/**
 * Chuyển đổi giờ học sang Tiết theo bảng quy định
 */
const convertTimeToTiet = (timeSlot) => {
  if (!timeSlot) return '';

  // Bảng quy đổi giờ sang tiết
  const timeToTietMap = {
    '6:30 - 7:20': 'Tiết 1',
    '06:30 - 07:20': 'Tiết 1',
    '7:20 - 8:10': 'Tiết 2',
    '07:20 - 08:10': 'Tiết 2',
    '8:10 - 9:00': 'Tiết 3',
    '08:10 - 09:00': 'Tiết 3',
    '9:10 - 10:00': 'Tiết 4',
    '09:10 - 10:00': 'Tiết 4',
    '10:00 - 10:50': 'Tiết 5',
    '10:50 - 11:40': 'Tiết 6',
    '12:30 - 13:20': 'Tiết 7',
    '13:20 - 14:10': 'Tiết 8',
    '14:10 - 15:00': 'Tiết 9',
    '15:10 - 16:00': 'Tiết 10',
    '16:00 - 16:50': 'Tiết 11',
    '16:50 - 17:40': 'Tiết 12',
    '18:00 - 18:50': 'Tiết 13',
    '18:50 - 19:40': 'Tiết 14',
    '19:50 - 20:40': 'Tiết 15',
    '20:40 - 21:30': 'Tiết 16',
  };

  // Loại bỏ khoảng trắng và chuẩn hóa
  const normalized = timeSlot.trim().replace(/\s+/g, ' ');

  // Nếu có trong bảng map
  if (timeToTietMap[normalized]) {
    return timeToTietMap[normalized];
  }

  // Nếu là khoảng giờ nhiều tiết (ví dụ: 15:00 - 18:00)
  const parts = normalized.split(' - ');
  if (parts.length === 2) {
    const startTime = parts[0].trim();
    const endTime = parts[1].trim();

    // Tìm tiết bắt đầu và kết thúc
    let startTiet = null;
    let endTiet = null;

    for (const [time, tiet] of Object.entries(timeToTietMap)) {
      const timeStart = time.split(' - ')[0];
      const timeEnd = time.split(' - ')[1];

      if (timeStart === startTime || timeStart === startTime.padStart(5, '0')) {
        startTiet = tiet;
      }
      if (timeEnd === endTime || timeEnd === endTime.padStart(5, '0')) {
        endTiet = tiet;
      }
    }

    if (startTiet && endTiet) {
      return `${startTiet} - ${endTiet}`;
    }
  }

  // Nếu không tìm thấy, trả về giờ gốc
  return timeSlot;
};

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
      const tietText = convertTimeToTiet(schedule.timeSlot || '');

      dates.push({
        date: current.format('DD/MM/YYYY'),
        dayText:
          schedule.dayOfWeekText ||
          `Thứ ${dayOfWeek === 0 ? 'CN' : dayOfWeek + 1}`,
        timeSlot: tietText,
        fullText: `[${schedule.dayOfWeekText || `Thứ ${dayOfWeek === 0 ? 'CN' : dayOfWeek + 1}`}] - [${tietText}] - ${current.format('DD/MM/YYYY')}`,
      });
    }

    current = current.add(1, 'day');
  }

  return dates;
};

/**
 * Export attendance to Excel with school format
 * @param {Object} sectionData - Section and course data with startDate, endDate, schedules
 * @param {Array} students - Student attendance data
 */
export const exportAttendanceExcel = (sectionData, students) => {
  try {
    // Create new workbook
    const wb = XLSX.utils.book_new();

    // Prepare header info
    const schoolName = 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM';
    const courseName = sectionData?.courseName || 'Tên môn học';
    const sectionCode = sectionData?.sectionCode || 'Mã lớp';
    const semester = sectionData?.semester || 'HK1';
    const academicYear = sectionData?.academicYear || '2025-2026';
    const className = sectionData?.className || 'DHHTTT19DTT';

    // Create worksheet data array
    const wsData = [];

    // Row 1: School name (left) and motto (right)
    const row1 = ['BỘ CÔNG THƯƠNG'];
    for (let i = 1; i < 5; i++) row1.push('');
    row1.push('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM');
    wsData.push(row1);

    // Row 2: School full name and motto continuation
    const row2 = [schoolName];
    for (let i = 1; i < 5; i++) row2.push('');
    row2.push('Độc lập - Tự do - Hạnh phúc');
    wsData.push(row2);

    // Row 3: Separator line
    const row3 = ['_______________'];
    for (let i = 1; i < 5; i++) row3.push('');
    row3.push('_______________');
    wsData.push(row3);

    // Row 4: Empty
    wsData.push([]);

    // Row 5: Title
    wsData.push(['DANH SÁCH IMPORT ĐIỂM DANH LỚP HỌC PHẦN']);

    // Row 6: Empty
    wsData.push([]);

    // Row 7-10: Course info
    const row7 = [
      'Đvt:',
      `${semester} (${academicYear})`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ];
    wsData.push(row7);

    const row8 = [
      'Cơ sở:',
      `Cơ sở 1 (Thành phố Hồ Chí Minh)`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ];
    wsData.push(row8);

    const row9 = [
      'Mã lớp học phần:',
      sectionCode,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ];
    wsData.push(row9);

    const row10 = ['Tên môn học:', courseName, '', '', '', '', '', '', '', ''];
    wsData.push(row10);

    const row11 = ['Lớp học', className, 'Nhóm', '', '', '', '', '', '', ''];
    wsData.push(row11);

    // Row 12: Empty
    wsData.push([]);

    // Generate sessions from start/end dates and schedules
    const sessions = generateScheduleDates(
      sectionData.startDate,
      sectionData.endDate,
      sectionData.schedules || []
    );

    // Row 13: Table header row 1 - Main headers with session info
    const header1 = [
      'STT',
      'Mã sinh viên',
      'Họ đệm',
      'Tên',
      'Giới tính',
      'Ngày sinh',
    ];

    // Add session headers (each session gets 1 column with day/time info)
    sessions.forEach((session) => {
      header1.push(`[${session.dayText}] - [${session.timeSlot}]`);
    });

    // Add final columns
    header1.push('Tổng cộng');
    header1.push('');
    header1.push('');
    header1.push('');

    wsData.push(header1);

    // Row 14: Table header row 2 - Session dates
    const header2 = ['', '', '', '', '', ''];

    sessions.forEach((session) => {
      header2.push(session.date);
    });

    header2.push('Vắng có');
    header2.push('Vắng');
    header2.push('Tổng số');
    header2.push('(%) Vắng');

    wsData.push(header2);

    // Row 15: Table header row 3 - C/P/K columns
    const header3 = ['', '', '', '', '', ''];

    sessions.forEach(() => {
      header3.push('C/P/K'); // Có mặt / Phép / Không phép
    });

    header3.push('nhận');
    header3.push('không');
    header3.push('tiết');
    header3.push('');

    wsData.push(header3);

    // Add student rows
    students.forEach((student, index) => {
      const row = [
        index + 1,
        student.studentCode || '',
        student.lastName || '',
        student.firstName || student.fullName?.split(' ').pop() || '',
        student.gender || 'Nam',
        student.dateOfBirth
          ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN')
          : '',
      ];

      // Add attendance status for each session (single C/P/K column)
      sessions.forEach((session) => {
        const attendance = student.attendances?.find(
          (a) =>
            a.sessionDate === session.date ||
            new Date(a.sessionDate).toLocaleDateString('vi-VN') === session.date
        );

        // Single column: C (Có mặt), P (Phép), K (Không phép)
        let status = '';
        if (attendance) {
          if (
            attendance.status === 'Present' ||
            attendance.status === 'Có mặt'
          ) {
            status = 'C';
          } else if (
            attendance.status === 'Absent' ||
            attendance.status === 'Vắng'
          ) {
            status = attendance.isExcused ? 'P' : 'K';
          }
        }
        row.push(status);
      });

      // Calculate totals
      const totalExcused = student.totalExcusedAbsences || 0;
      const totalUnexcused = student.totalUnexcusedAbsences || 0;
      const totalSessions = sessions.length;
      const absencePercentage = totalSessions
        ? (((totalExcused + totalUnexcused) / totalSessions) * 100).toFixed(0)
        : 0;

      row.push(totalExcused); // Vắng có nhận
      row.push(totalUnexcused); // Vắng không
      row.push(totalSessions * 2); // Tổng số tiết (assuming 2 periods per session)
      row.push(absencePercentage); // % vắng

      wsData.push(row);
    });

    // Create worksheet from array
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
      { wch: 5 }, // STT
      { wch: 12 }, // Mã sinh viên
      { wch: 15 }, // Họ đệm
      { wch: 10 }, // Tên
      { wch: 10 }, // Giới tính
      { wch: 12 }, // Ngày sinh
    ];

    // Add widths for each session (1 column per session)
    sessions.forEach(() => {
      colWidths.push({ wch: 12 }); // C/P/K (increased width for date display)
    });

    // Add widths for summary columns
    colWidths.push({ wch: 10 }); // Vắng có nhận
    colWidths.push({ wch: 10 }); // Vắng không
    colWidths.push({ wch: 10 }); // Tổng số tiết
    colWidths.push({ wch: 10 }); // (%) Vắng

    ws['!cols'] = colWidths;

    // Calculate total columns for proper merging
    const totalColumns = 6 + sessions.length + 4;
    const lastCol = totalColumns - 1;

    // Merge cells for headers
    const merges = [
      // Row 1: BỘ CÔNG THƯƠNG
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      // Row 1: CỘNG HÒA XÃ HỘI...
      { s: { r: 0, c: 5 }, e: { r: 0, c: lastCol } },

      // Row 2: School name
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      // Row 2: Độc lập...
      { s: { r: 1, c: 5 }, e: { r: 1, c: lastCol } },

      // Row 3: Separator lines
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 2, c: lastCol } },

      // Row 5: Title
      { s: { r: 4, c: 0 }, e: { r: 4, c: lastCol } },

      // Row 7-11: Course info merges
      { s: { r: 6, c: 1 }, e: { r: 6, c: lastCol } }, // Đvt value
      { s: { r: 7, c: 1 }, e: { r: 7, c: lastCol } }, // Cơ sở value
      { s: { r: 8, c: 1 }, e: { r: 8, c: lastCol } }, // Mã lớp value
      { s: { r: 9, c: 1 }, e: { r: 9, c: lastCol } }, // Tên môn value
      { s: { r: 10, c: 1 }, e: { r: 10, c: 2 } }, // Lớp học value
      { s: { r: 10, c: 3 }, e: { r: 10, c: lastCol } }, // Nhóm value

      // Table header merges (rows 12, 13, 14 - 3 header rows)
      { s: { r: 12, c: 0 }, e: { r: 14, c: 0 } }, // STT
      { s: { r: 12, c: 1 }, e: { r: 14, c: 1 } }, // Mã sinh viên
      { s: { r: 12, c: 2 }, e: { r: 14, c: 2 } }, // Họ đệm
      { s: { r: 12, c: 3 }, e: { r: 14, c: 3 } }, // Tên
      { s: { r: 12, c: 4 }, e: { r: 14, c: 4 } }, // Giới tính
      { s: { r: 12, c: 5 }, e: { r: 14, c: 5 } }, // Ngày sinh
    ];

    let currentCol = 6; // Start after Ngày sinh

    // No merges needed for session columns (single column per session)
    currentCol += sessions.length;

    // Merge Tổng cộng header (row 12, 4 columns)
    merges.push({
      s: { r: 12, c: currentCol },
      e: { r: 12, c: currentCol + 3 },
    });

    // Individual merges for summary columns in row 13
    // Vắng có nhận
    merges.push({
      s: { r: 13, c: currentCol },
      e: { r: 14, c: currentCol },
    });
    currentCol++;

    // Vắng không
    merges.push({
      s: { r: 13, c: currentCol },
      e: { r: 14, c: currentCol },
    });
    currentCol++;

    // Tổng số tiết
    merges.push({
      s: { r: 13, c: currentCol },
      e: { r: 14, c: currentCol },
    });
    currentCol++;

    // (%) Vắng
    merges.push({
      s: { r: 13, c: currentCol },
      e: { r: 14, c: currentCol },
    });

    ws['!merges'] = merges;

    // Add styling
    const range = XLSX.utils.decode_range(ws['!ref']);

    const thinBorder = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    };

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }

        const cell = ws[cellAddress];

        // Header section (rows 0-11)
        if (R <= 11) {
          cell.s = {
            alignment: {
              horizontal:
                R === 0 || R === 1 || R === 2 || R === 4 ? 'center' : 'left',
              vertical: 'center',
              wrapText: true,
            },
            font: {
              bold: R === 0 || R === 1 || R === 4,
              size: R === 4 ? 14 : 11,
            },
          };
        }

        // Table header rows (12-14) - 3 rows of headers
        if (R >= 12 && R <= 14) {
          cell.s = {
            alignment: {
              horizontal: 'center',
              vertical: 'center',
              wrapText: true,
            },
            font: { bold: true, size: 11, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4472C4' } },
            border: thinBorder,
          };
        }

        // Data rows (15+)
        if (R > 14) {
          cell.s = {
            alignment: {
              horizontal: C === 0 || C === 1 || C >= 6 ? 'center' : 'left',
              vertical: 'center',
            },
            border: thinBorder,
          };
        }
      }
    }

    // Set row heights
    const rowHeights = [];
    for (let i = 0; i < 12; i++) {
      rowHeights.push({ hpt: 18 });
    }
    // Header rows (3 rows)
    rowHeights.push({ hpt: 25 }); // Row 12
    rowHeights.push({ hpt: 20 }); // Row 13
    rowHeights.push({ hpt: 20 }); // Row 14

    ws['!rows'] = rowHeights;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm danh');

    // Generate file name
    const fileName = `diem-danh-${sectionCode}-${new Date().getTime()}.xlsx`;

    // Export file
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting attendance Excel:', error);
    return { success: false, error: error.message };
  }
};
