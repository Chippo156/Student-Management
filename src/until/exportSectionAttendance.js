import ExcelJS from 'exceljs';
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
 * Xuất Excel danh sách điểm danh với border và format đẹp (ExcelJS)
 */
export const exportSectionAttendanceExcel = async (
  sectionData,
  isPractice = false
) => {
  try {
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

    // Tạo workbook và worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách điểm danh');

    let currentRow = 1;

    // === Header thông tin - 5 dòng đầu ===
    const row1 = worksheet.getRow(currentRow++);
    row1.getCell(1).value = 'Đợt:';
    row1.getCell(1).font = { bold: true, name: 'Arial', size: 11 };
    row1.getCell(2).value = 'HK1 (2025-2026)';
    worksheet.mergeCells(1, 2, 1, 3);

    const row2 = worksheet.getRow(currentRow++);
    row2.getCell(1).value = 'Cơ sở:';
    row2.getCell(1).font = { bold: true, name: 'Arial', size: 11 };
    row2.getCell(2).value = 'Cơ sở 1 (Thành phố Hồ Chí Minh)';
    worksheet.mergeCells(2, 2, 2, 3);

    const row3 = worksheet.getRow(currentRow++);
    row3.getCell(1).value = 'Mã lớp học phần:';
    row3.getCell(1).font = { bold: true, name: 'Arial', size: 11 };
    row3.getCell(2).value = sectionCode;
    row3.getCell(3).value = classCode || '';
    worksheet.mergeCells(3, 2, 3, 3);

    const row4 = worksheet.getRow(currentRow++);
    row4.getCell(1).value = 'Tên môn học:';
    row4.getCell(1).font = { bold: true, name: 'Arial', size: 11 };
    row4.getCell(2).value = `${courseName} (${sectionCode} - ${className})`;
    worksheet.mergeCells(4, 2, 4, 3);

    const row5 = worksheet.getRow(currentRow++);
    row5.getCell(1).value = 'Lớp học';
    row5.getCell(1).font = { bold: true, name: 'Arial', size: 11 };
    row5.getCell(2).value = className;
    if (isPractice && practiceGroup) {
      row5.getCell(3).value = `Nhóm ${practiceGroup.groupName}`;
    }

    // Set alignment for header rows
    [row1, row2, row3, row4, row5].forEach((row) => {
      for (let c = 1; c <= 3; c++) {
        const cell = row.getCell(c);
        cell.alignment = { horizontal: 'left', vertical: 'center' };
        cell.font = { ...cell.font, name: 'Arial', size: 11 };
      }
    });

    // Dòng trống
    currentRow++;

    // === Tạo danh sách ngày học ===
    const scheduleDates = generateScheduleDates(startDate, endDate, schedules);

    // === Header cột ===
    const tableHeaderRow = worksheet.getRow(currentRow);
    const baseHeaders = [
      'STT',
      'Mã sinh viên',
      'Họ đệm',
      'Tên',
      'Giới tính',
      'Ngày sinh',
      '', // Cột trống
    ];

    let colIndex = 1;
    baseHeaders.forEach((header) => {
      const cell = tableHeaderRow.getCell(colIndex++);
      cell.value = header;
      cell.alignment = {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      };
      cell.font = { bold: true, name: 'Arial', size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }, // Yellow
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Thêm các cột ngày học
    scheduleDates.forEach((dateInfo) => {
      const cell = tableHeaderRow.getCell(colIndex++);
      cell.value = dateInfo.fullText;
      cell.alignment = {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      };
      cell.font = { bold: true, name: 'Arial', size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    tableHeaderRow.height = 30;
    currentRow++;

    // === Dữ liệu sinh viên ===
    students.forEach((student, index) => {
      const row = worksheet.getRow(currentRow++);

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

      const rowData = [
        index + 1,
        student.mssv,
        firstName,
        lastName,
        gender,
        dob,
        '', // Cột trống
      ];

      // Thêm các ô trống cho điểm danh
      scheduleDates.forEach(() => {
        rowData.push('');
      });

      let colIdx = 1;
      rowData.forEach((data, idx) => {
        const cell = row.getCell(colIdx++);
        cell.value = data;
        cell.alignment = {
          horizontal:
            idx === 0 || idx === 4 || idx === 5 ? 'center' : 'left',
          vertical: 'center',
          wrapText: true,
        };
        cell.font = { name: 'Arial', size: 11 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      row.height = 20;
    });

    // === Set độ rộng cột ===
    worksheet.getColumn(1).width = 5; // STT
    worksheet.getColumn(2).width = 12; // MSSV
    worksheet.getColumn(3).width = 20; // Họ đệm
    worksheet.getColumn(4).width = 10; // Tên
    worksheet.getColumn(5).width = 10; // Giới tính
    worksheet.getColumn(6).width = 12; // Ngày sinh
    worksheet.getColumn(7).width = 2; // Cột trống

    // Width cho các cột ngày học
    for (let i = 0; i < scheduleDates.length; i++) {
      worksheet.getColumn(8 + i).width = 28;
    }

    // === Tên file ===
    const fileName = `Diem_danh_${sectionCode}_${className}${isPractice && practiceGroup ? `_${practiceGroup.groupName}` : ''}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;

    // === Xuất file ===
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting attendance Excel:', error);
    return { success: false, error: error.message };
  }
};
